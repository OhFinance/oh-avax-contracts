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
import {IPtpAsset} from "./interfaces/IPtpAsset.sol";
import {IPtpMasterPlatypusV2} from "./interfaces/IPtpMasterPlatypusV2.sol";
import {IPtpPool} from "./interfaces/IPtpPool.sol";
import {IVePtp} from "./interfaces/IVePtp.sol";
import {OhPlatypusCompounderStorage} from "./OhPlatypusCompounderStorage.sol";
import {IPlatypusCompounder} from "../../interfaces/strategies/platypus/IPlatypusCompounder.sol";

contract OhPlatypusCompounder is OhSubscriberUpgradeable, OhPlatypusCompounderStorage, IPlatypusCompounder {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Only allow Strategies or Governance to call function
    modifier onlyAllowed {
        address bank = IStrategy(msg.sender).bank();
        require(
            IManager(manager()).whitelisted(msg.sender) || msg.sender == governance(), 
            "OhPlatypusCompounder: Only Strategy or Governance"
        );
        _;
    }

    constructor() initializer {
        assert(ptp() == address(0));
        assert(vePtp() == address(0));
        assert(pool() == address(0));
    }

    /// @notice Initialize the Platypus Compounder Proxy
    /// @param pool_ Address of the PTP pool contract
    /// @param vePtp_ The untradeable token used for boosting yield on PTP pools (farmed by staking PTP)
    /// @param masterPlatypusV2_ The MasterPlatypusV2 PTP contract used to staking/unstaking/claiming
    function initializePlatypusCompounder(
        address registry_,
        address ptp_,
        address vePtp_,
        address pool_,
        address masterPlatypusV2_,
        uint256 boostPercentage
    ) public initializer {
        initializeSubscriber(registry_);
        initializePlatypusCompounderStorage(ptp_, vePtp_, pool_, masterPlatypusV2_, boostPercentage);
    }

    function investedBalance(uint256 pid, address lpToken) public override view returns (uint256) {
        if (lpToken == address(0)) {
            return 0;
        }

        return IPtpMasterPlatypusV2(lpToken).userInfo(pid, address(this)).amount;
    }

    /// @notice Add liquidity to PTP's pool, receiving LP tokens in return
    /// @param underlying The token bridge corresponding to the underlying we are depositing
    /// @param amount The amount of underlying to deposit
    function addLiquidity(
        address underlying,
        uint256 amount
    ) external override onlyAllowed {
        if (amount == 0) {
            return;
        }
        address _pool = pool();
        IERC20(underlying).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(underlying).safeIncreaseAllowance(_pool, amount);
        uint256 minted = IPtpPool(_pool).deposit(underlying, amount, address(this), block.timestamp);
        require(minted > 0, "Platypus: Add liquidity failed");
    }

    /// @notice Remove liquidity from PTP pool, receiving a single underlying
    /// @param lpToken The LP Token corresponding to the pool
    /// @param underlying The underlying token we withdraw
    /// @param recipient The receiver of the withdrawn underlying
    /// @param amount The amount of LP tokens to withdraw
    /// @param minAmount The min underlying tokens to receive before the tx reverts
    function removeLiquidity(
        address lpToken,
        address underlying,
        address recipient,
        uint256 amount,
        uint256 minAmount
    ) external override onlyAllowed returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        address pool = pool();
        IERC20(lpToken).safeIncreaseAllowance(pool, amount);
        uint256 withdrawn = IPtpPool(pool).withdraw(underlying, amount, minAmount, address(this), block.timestamp);
        require(withdrawn >= minAmount, "Platypus: Withdraw failed");
        
        return TransferHelper.safeTokenTransfer(recipient, underlying, withdrawn);
    }

    /// @notice Stake PTP LP Tokens into the PTP pool to earn PTP
    /// @param lpToken The PTP LP Token to stake (This address is also the pool we are staking into)
    /// @param index The index of the underlying (USDC.e, USDT.e, Dai.e, etc...)
    function stake(
        address lpToken,
        uint256 index
    ) external override onlyAllowed {
        uint256 amount = IERC20(lpToken).balanceOf(lpToken);
        if (amount == 0) {
            return;
        }
        address masterPlatypus = masterPlatypusV2();
        IERC20(lpToken).safeIncreaseAllowance(masterPlatypus, amount);
        IPtpMasterPlatypusV2(masterPlatypus).deposit(index, amount);
    }

    /// @notice Unstake PTP LP tokens funds from the PTP pool
    /// @param amount The amount of LP Tokens to withdraw
    /// @param index The index of the underlying token we are unstaking
    function unstake(
        uint256 amount,
        uint256 index
    ) external override onlyAllowed {
        if (amount == 0) {
            return;
        }

        IPtpMasterPlatypusV2(masterPlatypusV2()).withdraw(index, amount);
    }

    /// @notice Claim PTP token rewards from MasterPlatypusV2, Only Allowed
    /// @param index The pool pid to claim from
    function claimPtp(uint256 index) external override onlyAllowed {
        address _ptp = ptp();
        uint256[1] memory tickets = [uint256(index)];
        IPtpMasterPlatypusV2(masterPlatypusV2()).multiClaim(tickets);
        uint256 rewardAmount = IERC20(_ptp).balanceOf(address(this));

        if (rewardAmount > 0) {
            uint256 boostAmount = rewardAmount.mul(boostPercentage()).div(100);
            TransferHelper.safeTokenTransfer(msg.sender, _ptp, rewardAmount.sub(boostAmount));
        }
    }

    /// @notice Deposit PTP to vePTP contract
    function depositPtpForBoost() external override {
        address _ptp = ptp();
        address _vePtp = vePtp();
        uint256 amount = IERC20(_ptp).balanceOf(address(this));
        if (amount > 0) {
            IERC20(_ptp).safeIncreaseAllowance(_vePtp, amount);
            IVePtp(_vePtp).deposit(amount);
        }
    }

    /// @notice Claim vePTP rewards from pool for this address
    function claimVePtp() external override {
        IVePtp(vePtp()).claim();
    }

    /// @notice Withdraw PTP from vePTP contract, only Governance
    /// @param amount The amount of PTP to withdraw
    function withdrawPtpForBoost(uint256 amount) external override onlyGovernance {
        if (amount > 0) {
            IVePtp(vePtp()).withdraw(amount);
        }
    }

    /// @notice Set the Boost Percentage, only Governance
    /// @dev Percentage of PTP rewards retained by Compounder 
    function setBoostPercentage(uint256 newBoostPercentage) external onlyGovernance {
        require(newBoostPercentage >= 0 && newBoostPercentage < 100, "Invalid Boost Percentage");
        _setBoostPercentage(newBoostPercentage);
    }

    /// @notice Reclaim PTP to Governance after Withdrawal, only Governance
    /// @param amount The amount of PTP to withdraw
    function reclaimPtp(uint256 amount) external onlyGovernance {
        IERC20(ptp()).transfer(governance(), amount);
    }
}