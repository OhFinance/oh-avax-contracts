// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {ICurveAPool} from "./interfaces/ICurveAPool.sol";
import {IGauge} from "./interfaces/IGauge.sol";

/// @title Oh! Finance Curve APool Helper
/// @notice Helper functions for Curve APool Strategies
abstract contract OhCurveAPoolHelper {
    using SafeERC20 for IERC20;

    /// @notice Add liquidity to Curve's APool, receiving 3CRV in return
    /// @param pool The address of Curve APool
    /// @param underlying The underlying we want to deposit
    /// @param index The index of the underlying
    /// @param amount The amount of underlying to deposit
    /// @param minMint The min LP tokens to mint before tx reverts (slippage)
    function addLiquidity(
        address pool,
        address underlying,
        uint256 index,
        uint256 amount,
        uint256 minMint
    ) internal {
        if (amount == 0) {
            return;
        }
        
        uint256[3] memory amounts = [uint256(0), uint256(0), uint256(0)];
        amounts[index] = amount;
        IERC20(underlying).safeIncreaseAllowance(pool, amount);
        ICurveAPool(pool).add_liquidity(amounts, minMint, true);
    }

    /// @notice Remove liquidity from Curve APool, receiving a single underlying
    /// @param pool The Curve APool
    /// @param index The index of underlying we want to withdraw
    /// @param amount The amount to withdraw
    /// @param maxBurn The max LP tokens to burn before the tx reverts (slippage)
    function removeLiquidity(
        address pool,
        uint256 index,
        uint256 amount,
        uint256 maxBurn
    ) internal {
        if (amount == 0) {
            return;
        }

        uint256[3] memory amounts = [uint256(0), uint256(0), uint256(0)];
        amounts[index] = amount;
        ICurveAPool(pool).remove_liquidity_imbalance(amounts, maxBurn, true);
    }

    /// @notice Claim CRV rewards from the given RewardsOnlyGauge
    /// @param gauge The Gauge (Staking Contract) to claim from
    function claim(address gauge) internal {
        IGauge(gauge).claim_rewards(address(this), address(this));
    }

    /// @notice Calculate the max withdrawal amount to a single underlying
    /// @param pool The Curve LP Pool
    /// @param amount The amount of underlying to deposit
    /// @param index The index of the underlying in the LP Pool
    function calcWithdraw(
        address pool,
        uint256 amount,
        int128 index
    ) internal view returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        return ICurveAPool(pool).calc_withdraw_one_coin(amount, index);
    }

    /// @notice Get the balance of staked tokens in a given Gauge
    /// @param gauge The Curve Gauge to check
    function staked(address gauge) internal view returns (uint256) {
        return IGauge(gauge).balanceOf(address(this));
    }

    /// @notice Stake crvUnderlying into the Gauge to earn CRV
    /// @param gauge The Curve Gauge to stake into
    /// @param crvUnderlying The Curve LP Token to stake
    /// @param amount The amount of LP Tokens to stake
    function stake(
        address gauge,
        address crvUnderlying,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(crvUnderlying).safeIncreaseAllowance(gauge, amount);
        IGauge(gauge).deposit(amount);
    }

    /// @notice Unstake crvUnderlying funds from the Curve Gauge
    /// @param gauge The Curve Gauge to unstake from
    /// @param amount The amount of LP Tokens to withdraw
    function unstake(address gauge, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        IGauge(gauge).withdraw(amount);
    }
}
