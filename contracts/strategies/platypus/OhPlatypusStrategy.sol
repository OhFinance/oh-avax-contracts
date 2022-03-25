// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhPlatypusHelper} from "./OhPlatypusHelper.sol";
import {OhPlatypusStrategyStorage} from "./OhPlatypusStrategyStorage.sol";

/// @title Oh! Finance Platypus Strategy
/// @notice Standard Platypus Single Underlying Strategy
contract OhPlatypusStrategy is OhStrategy, OhPlatypusStrategyStorage, OhPlatypusHelper, IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Initialize the Platypus Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initialize the Platypus Strategy Proxy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of the Bank
    /// @param underlying_ Underlying (USDCe, USDTe, Daie, USDC, USDT)
    /// @param derivative_ USDC LP Token
    /// @param reward_ PTP token
    /// @param pool_ Address of the PTP pool contract
    /// @param vePtp_ The untradeable token used for boosting yield on PTP pools (farmed by staking PTP)
    /// @param masterPlatypusV2_ The MasterPlatypusV2 PTP contract used to staking/unstaking/claiming 
    /// @param index_ Underlying index
    function initializePlatypusStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address pool_,
        address vePtp_,
        address masterPlatypusV2_,
        uint256 index_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializePlatypusStorage(pool_, masterPlatypusV2_, vePtp_, index_);
    }

    // returns the total underlying balance
    function investedBalance() public view override returns (uint256) {
        return derivativeBalance();
    }

    function vePTPBalance() public view returns (uint256) {
        return IERC20(vePtp()).balanceOf(address(this));
    }

    /// @notice Execute the Platypus Strategy
    /// @dev Compound PTP Yield, Add Liquidity, Stake into pool
    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    /// @notice Deposits underlying
    /// @dev Deposits underlying into pool and stake into MasterPlatypusV2 contract to receive PTP rewards
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            // add liquidity to PTP pool
            _addLiquidity(pool(), underlying(), address(this), amount);
            // stake all received in the PTP MasterPlatypusV2 contract
            _stake(masterPlatypusV2(), derivative(), derivativeBalance(), index());
        }
    }

    /// @notice Withdraw an amount of underlying from Platypus Strategy
    /// @param amount Amount of Underlying tokens to withdraw
    /// @dev Unstake from pool, Remove Liquidity
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    /// @notice Withdraw all underlying from Platypus Strategy
    /// @dev Unstake from pool, Remove Liquidity
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    /// @dev Compound rewards into underlying through liquidation
    /// @dev Claim Rewards from Mintr, sell PTP for USDCe
    function _compound() internal {
        // claim available PTP rewards
        _claimPtp(masterPlatypusV2(), index());

        uint256 rewardAmount = rewardBalance();
        if (rewardAmount > 0) {
            //TODO: have code that decides how to split the PTP rewards (underlying/boost/repayments)
            liquidate(reward(), underlying(), rewardAmount);
        }
    }

    // Deposit PTP to boost PTP yield when staking underlying into PTP pools
    function depositBoostPtp(uint256 amount) external onlyBank {
        if (amount > 0) {
            _depositPtpForBoost(amount, vePtp());
        }
    }

    // Claim vePTP mined from staking PTP. Holding vePTP boosts APR on staking stablecoins
    function claimVePtpRewards() external onlyBank {
        _claimVePtp(vePtp());
    }

    // Withdraw underlying tokens from the protocol
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        uint256 invested = investedBalance();
        if (invested == 0) {
            return 0;
        }

        // calculate % of supply ownership
        uint256 supplyShare = amount.mul(1e18).div(invested);

        // find amount to redeem in underlying, 1e6
        uint256 redeemAmount = Math.min(invested, supplyShare.mul(invested).div(1e18));
        uint256 minAmount = redeemAmount.mul(9999).div(10000);

        // unstake from PTP LP Pool and remove liquidity from Pool
        _unstake(masterPlatypusV2(), redeemAmount, index());
        _removeLiquidity(pool(), derivative(), underlying(), address(this), redeemAmount, minAmount);

        // withdraw to bank
        uint256 withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), amount);

        return withdrawn;
    }
}