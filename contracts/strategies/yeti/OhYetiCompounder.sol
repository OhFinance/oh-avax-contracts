// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IManager} from "@ohfinance/oh-contracts/contracts/interfaces/IManager.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {OhSubscriberUpgradeable} from "@ohfinance/oh-contracts/contracts/registry/OhSubscriberUpgradeable.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {ICurveYusdPool} from "./interfaces/ICurveYusdPool.sol";
import {IYetiLpFarmPool} from "./interfaces/IYetiLpFarmPool.sol";
import {IVeYeti} from "./interfaces/IVeYeti.sol";
import {IVeYetiEmissions} from "./interfaces/IVeYetiEmissions.sol";
import {OhYetiCompounderStorage} from "./OhYetiCompounderStorage.sol";
import {IYetiCompounder} from "../../interfaces/strategies/yeti/IYetiCompounder.sol";

contract OhYetiCompounder is OhSubscriberUpgradeable, OhYetiCompounderStorage, IYetiCompounder {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Only allow Strategies or Governance to call function
    modifier onlyAllowed {
        address bank = IStrategy(msg.sender).bank();
        require(
            IManager(manager()).whitelisted(msg.sender) || msg.sender == governance(), 
            "OhYetiCompounder: Only Strategy or Governance"
        );
        _;
    }

    constructor() initializer {
        assert(yeti() == address(0));
        assert(crvYusdPool() == address(0));
        assert(lpFarmPool() == address(0));
        assert(veYeti() == address(0));
        assert(veYetiEmissions() == address(0));
        assert(boostPercentage() == address(0));
    }

    /// @notice Initialize the Yeti Compounder Proxy
    /// @param registry_ Address of the Registry contract
    /// @param yeti_ The YETI token
    /// @param crvYusdPool_ The Curve YUSD/USDC/USDT pool used to stake underlying and get Curve LP Tokens back
    /// @param lpFarmPool_ YETI Curve LP Farm Staking Contract
    /// @param veYeti_ The untradeable token used for boosting yield on YETI pools (farmed by staking YETI into veYETI pool)
    /// @param veYetiEmissions_ The YETI contract used to claim YETI rewards when satking into the veYETI pool
    function initializeYetiCompounder(
        address registry_,
        address yeti_,
        address crvYusdPool_,
        address lpFarmPool_,
        address veYeti_,
        address veYetiEmissions_,
        uint256 boostPercentage
    ) public initializer {
        initializeSubscriber(registry_);
        initializeYetiCompounderStorage(yeti_, crvYusdPool, lpFarmPool_, veYeti_, veYetiEmissions, boostPercentage);
    }

    function investedBalance(uint256 pid, address lpToken) public override view returns (uint256) {
        if (lpToken == address(0)) {
            return 0;
        }

        return IYetiMasterYetiV2(lpToken).userInfo(pid, address(this)).amount;
    }

    /// @notice Add liquidity to Curve's YUSD Pool, receiving Curve LP Tokens in return
    /// @param underlying The underlying we want to deposit
    /// @param index The index of the underlying
    /// @param amount The amount of underlying to deposit
    /// @param minMint The min LP tokens to mint before tx reverts (slippage)
    function addLiquidity(
        address underlying,
        uint256 index,
        uint256 amount,
        uint256 minMint
    ) internal onlyAllowed{
        if (amount == 0) {
            return;
        }

        address _pool = crvYusdPool();
        
        uint256[3] memory amounts = [uint256(0), uint256(0), uint256(0)];
        amounts[index] = amount;
        IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(underlying).safeIncreaseAllowance(_pool, amount);
        uint256 minted = ICurveYusdPool(_pool).add_liquidity(amounts, minMint);
        require(minted >= minMint, "YETI: Add Liquidity failed");

        increaseBalance(minted, index);
    }

    /// @notice Remove liquidity from Curve YUSD Pool, receiving a single underlying
    /// @param index The index of underlying we want to withdraw
    /// @param amount The amount of LP tokens to withdraw
    /// @param minAmount The min underlying tokens to receive before the tx reverts (slippage)
    function removeLiquidity(
        address underlying,
        address recipient,
        uint256 index,
        uint256 amount,
        uint256 minAmount
    ) internal onlyAllowed {
        if (amount == 0) {
            return;
        }

        address _pool = crvYusdPool();
        IERC20(_pool).safeIncreaseAllowance(_pool, amount);
        uint256 withdrawn = ICurveYusdPool(_pool).remove_liquidity_one_coin(amount, int128(index), minAmount);
        require(withdrawn >= minAmount, "YETI: Withdraw failed");
        
        return TransferHelper.safeTokenTransfer(recipient, underlying, withdrawn);

        decreaseBalance(withdrawn, index);
    }

    /// @notice Stake Curve LP Tokens into the YETI LP Farm Pool to earn YETI
    /// @param amount The amount of LP Tokens to stake
    function stake(uint256 amount) external override onlyAllowed {
        if (amount == 0) {
            return;
        }

        address pool_ = lpFarmPool();
        IERC20(crvYusdPool()).safeIncreaseAllowance(pool_, amount);
        IYetiLpFarmPool(pool_).stake(amount);
    }

    /// @notice Unstake Curve LP Tokens funds from the YETI LP Farm Pool
    /// @param amount The amount of LP Tokens to withdraw
    function unstake(uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        IYetiLpFarmPool(lpFarmPool()).withdraw(amount);
    }

    /// @notice Get the balance of staked tokens in the YETI LP Farm Pool
    function staked(uint256 index) external view onlyAllowed returns (uint256) {
        uint256 _stakedBalance;
        if (index == 1) {
            _stakedBalance = usdcBalance();
        } else if (index == 2) {
            _stakedBalance = usdtBalance();
        }

        return _stakedBalance;
    }

    /// @notice Claim YETI rewards from the given pool
    function claim() external override onlyAllowed {
        address _yeti = yeti();
        IYetiLpFarmPool(lpFarmPool()).getReward();
        IVeYetiEmissions(veYetiEmissions()).getReward();
        uint256 rewardAmount = IERC20(_yeti).balanceOf(address(this));

        if (rewardAmount > 0) {
            uint256 boostAMount = rewardAmount.mul(boostPercentage()).div(100);
            // Calculate the balance ratio of all the underlying strategies and transfer accordingly

        }
    }

    /// @notice Calculate the max withdrawal amount to a single underlying
    /// @param amount The amount of LP tokens to withdraw
    /// @param index The index of the underlying in the LP Pool
    function calcWithdraw(
        uint256 amount,
        uint256 index
    ) external view onlyAllowed returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        return ICurveYusdPool(crvYusdPool()).calc_withdraw_one_coin(amount, int128(index));
    }

    /// @notice Add to the underlying balance of the calling strategy
    function increaseBalance(uint256 minted, uint256 index) internal {
        if (index == 1) {
            uint256 newBalance = usdcBalance() + minted;
            _setUsdcBalance(newBalance);
        } else if (index == 2) {
            uint256 newBalance = usdtBalance() + minted;
            _setUsdtBalance(minted);
        }
    }

    /// @notice Substract to the underlying balance of the calling strategy
    function decreaseBalance(uint256 withdrawn, uint256 index) internal {
        if (index == 1) {
            uint256 _usdcBalance = usdcBalance();
            require(withdrawn > _usdcBalance, "YETI: Not enough USDC liquity for withdrawal");
            uint256 newBalance = _usdcBalance - withdrawn;
            _setUsdcBalance(newBalance);
        } else if (index == 2) {
            uint256 _usdtBalance = usdtBalance();
            require(withdrawn > _usdtBalance, "YETI: Not enough USDT liquity for withdrawal");
            uint256 newBalance = _usdtBalance - withdrawn;
            _setUsdcBalance(newBalance);
        }
    }

    /// @notice Returns the ratio 
    function getBalanceRatio() internal {
        uint256 _usdcBalance = usdcBalance();
        uint256 _usdtBalance = usdtBalance();
        uint256 totalBalance = _usdcBalance + _usdtBalance;

        uint256 usdcSupplyShare = _usdcBalance.mul(1e18).div(totalBalance);
        uint256 usdtSupplyShare = _usdtBalance.mul(1e18).div(totalBalance);


        
    }

    /// @notice Deposit YETI to veYETI contract
    function depositYetiForBoost() external override {
        address _yeti = yeti();
        address _veYeti = veYeti();
        uint256 amount = IERC20(_yeti).balanceOf(address(this));
        if (amount > 0) {
            IERC20(_yeti).safeIncreaseAllowance(_veYeti, amount);
            IVeYeti(_veYeti).deposit(amount);
        }
    }

    /// @notice Withdraw YETI from veYETI contract, only Governance. WARNING: Will lose all accumulated veYETI!!!
    /// @param amount The amount of YETI to withdraw
    function withdrawYetiForBoost(uint256 amount) external override onlyGovernance {
        if (amount > 0) {
            IVeYeti(veYeti()).withdraw(amount);
        }
    }

    /// @notice Set the Boost Percentage, only Governance
    /// @dev Percentage of YETI rewards retained by Compounder 
    function setBoostPercentage(uint256 newBoostPercentage) external onlyGovernance {
        require(newBoostPercentage >= 0 && newBoostPercentage < 100, "Invalid Boost Percentage");
        _setBoostPercentage(newBoostPercentage);
    }

        /// @notice Reclaim YETI to Governance after Withdrawal, only Governance
    /// @param amount The amount of YETI to withdraw
    function reclaimYeti(uint256 amount) external onlyGovernance {
        IERC20(yeti()).transfer(governance(), amount);
    }
}