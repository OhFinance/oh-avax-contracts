// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhCurveAPoolHelper} from "./OhCurveAPoolHelper.sol";
import {OhCurveAPoolStrategyStorage} from "./OhCurveAPoolStrategyStorage.sol";

/// @title Oh! Finance Curve APool Strategy
/// @notice Standard Curve APool LP + Gauge Single Underlying Strategy
/// @notice APool Underlying, in order: (aDAI, aUSDC, aUSDT)
contract OhCurveAPoolStrategy is OhStrategy, OhCurveAPoolStrategyStorage, OhCurveAPoolHelper, IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Initialize the Curve APool Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initialize the Curve APool Strategy Proxy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of the Bank
    /// @param underlying_ Underlying (DAI, USDC, USDT)
    /// @param derivative_ 3CRV LP Token
    /// @param reward_ CRV Gov Token
    /// @param pool_ Address of the Curve APool
    /// @param gauge_ Curve Gauge, Staking Contract
    /// @param index_ Underlying APool Index
    function initializeCurveAPoolStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address secondaryReward_,
        address pool_,
        address gauge_,
        uint256 index_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeCurveAPoolStorage(secondaryReward_, pool_, gauge_, index_);
    }

    // calculate the total underlying balance
    function investedBalance() public view override returns (uint256) {
        return calcWithdraw(pool(), stakedBalance(), index());
    }

    // Get the balance of secondary rewards received by the Strategy
    function secondaryRewardBalance() public view returns (uint256) {
        return IERC20(secondaryReward()).balanceOf(address(this));
    }

    // amount of av3CRV staked in the Gauge
    function stakedBalance() public view returns (uint256) {
        return staked(gauge());
    }

    /// @notice Execute the Curve APool Strategy
    /// @dev Compound CRV Yield, Add Liquidity, Stake into Gauge
    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    /// @notice Withdraw an amount of underlying from Curve APool Strategy
    /// @param amount Amount of Underlying tokens to withdraw
    /// @dev Unstake from Gauge, Remove Liquidity
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    /// @notice Withdraw all underlying from Curve APool Strategy
    /// @dev Unstake from Gauge, Remove Liquidity
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    /// @dev Compound rewards into underlying through liquidation
    /// @dev Claim Rewards from Mintr, sell CRV and WAVAX for USDC
    function _compound() internal {
        // claim available CRV and WAVAX rewards
        claim(gauge());

        uint256 rewardAmount = rewardBalance();
        if (rewardAmount > 0) {
            liquidate(reward(), underlying(), rewardAmount);
        }

        uint256 secondaryRewardAmount = secondaryRewardBalance();
        if (secondaryRewardAmount > 0) {
            liquidate(secondaryReward(), underlying(), secondaryRewardAmount);
        }
    }

    // deposit underlying into APool to get av3CRV and stake into Gauge
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            // add liquidity to APool to receive CRV and WAVAX
            addLiquidity(pool(), underlying(), index(), amount, 1);
            // stake all received in the AAVE gauge
            stake(gauge(), derivative(), derivativeBalance());
        }
    }

    // withdraw underlying tokens from the protocol
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        uint256 invested = investedBalance();
        uint256 staked = stakedBalance();

        // calculate % of supply ownership
        uint256 supplyShare = amount.mul(1e18).div(invested);

        // find amount to unstake in av3crv, 1e18
        uint256 unstakeAmount = Math.min(staked, supplyShare.mul(staked).div(1e18));

        // find amount to redeem in underlying, 1e6
        uint256 redeemAmount = Math.min(invested, supplyShare.mul(invested).div(1e18));

        // unstake from Gauge and remove liquidity from Pool
        unstake(gauge(), unstakeAmount);
        removeLiquidity(pool(), index(), unstakeAmount, redeemAmount);

        // withdraw to bank-
        uint256 withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), amount);
        return withdrawn;
    }
}
