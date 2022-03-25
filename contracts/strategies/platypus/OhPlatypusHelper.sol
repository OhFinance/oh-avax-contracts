// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IPtpPool} from "./interfaces/IPtpPool.sol";
import {IPtpMasterPlatypusV2} from "./interfaces/IPtpMasterPlatypusV2.sol";
import {IVePtp} from "./interfaces/IVePtp.sol";
import {IPtpAsset} from "./interfaces/IPtpAsset.sol";

/// @title Oh! Finance Platypus Helper
/// @notice Helper functions to interact with the Platypus Protocol
/// @dev https://docs.traderjoexyz.com/
abstract contract OhPlatypusHelper {
    using SafeERC20 for IERC20;

    /// @notice Add liquidity to PTP's pool, receiving LP tokens in return
    /// @param pool The address of the PTP pool
    /// @param underlying The token bridge corresponding to the underlying we are depositing
    /// @param amount The amount of underlying to deposit
    /// @param to The address which will receive the LP tokens
    function _addLiquidity(
        address pool,
        address underlying,
        address to,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeIncreaseAllowance(pool, amount);
        uint256 minted = IPtpPool(pool).deposit(underlying, amount, to, block.timestamp);
        require(minted > 0, "Platypus: Add liquidity failed");
    }

    /// @notice Remove liquidity from PTP pool, receiving a single underlying
    /// @param pool The PTP pool
    /// @param lpToken The LP Token corresponding to the pool
    /// @param amount The amount of LP tokens to withdraw
    /// @param minAmount The min underlying tokens to receive before the tx reverts
    function _removeLiquidity(
        address pool,
        address lpToken,
        address underlying,
        address to,
        uint256 amount,
        uint256 minAmount
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(lpToken).safeIncreaseAllowance(pool, amount);
        uint256 withdrawn = IPtpPool(pool).withdraw(underlying, amount, minAmount, to, block.timestamp);
        require(withdrawn >= minAmount, "Platypus: Withdraw failed");
    }

    /// @notice Stake PTP LP Tokens into the PTP pool to earn PTP
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    /// @param lpToken The PTP LP Token to stake (This address is also the pool we are staking into)
    /// @param amount The amount of LP Tokens to stake
    /// @param index The index of the underlying (USDC.e, USDT.e, Dai.e, etc...)
    function _stake(
        address masterPlatypus,
        address lpToken,
        uint256 amount,
        uint256 index
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(lpToken).safeIncreaseAllowance(masterPlatypus, amount);
        IPtpMasterPlatypusV2(masterPlatypus).deposit(index, amount);
    }

    /// @notice Unstake PTP LP tokens funds from the PTP pool
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    /// @param amount The amount of LP Tokens to withdraw
    /// @param index The index of the underlying token we are unstaking
    function _unstake(
        address masterPlatypus,
        uint256 amount,
        uint256 index
    ) internal {
        if (amount == 0) {
            return;
        }

        IPtpMasterPlatypusV2(masterPlatypus).withdraw(index, amount);
    }

    /// @notice Claim PTP token rewards from the PTP MasterPlatypusV2 contract
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    function _claimPtp(address masterPlatypus, uint256 index) internal {
        uint256[1] memory tickets = [uint256(index)];
        IPtpMasterPlatypusV2(masterPlatypus).multiClaim(tickets);
    }

    /// @notice Deposit PTP to vePTP contract
    /// @param amount The amount of PTP to deposit
    /// @param vePtp The Platypus vePTP contract
    function _depositPtpForBoost(
        uint256 amount,
        address vePtp
    ) internal {
        if (amount > 0) {
            IVePtp(vePtp).deposit(amount);
        }
    }

    /// @notice Withdraw PTP from vePTP contract
    /// @param amount The amount of PTP to withdraw
    /// @param vePtp The Platypus vePTP contract
    function _withdrawPtpForBoost(
        uint256 amount,
        address vePtp
    ) internal {
        if (amount > 0) {
            IVePtp(vePtp).withdraw(amount);
        }
    }

    /// @notice Claim PTP rewards from pool for this address
    /// @param vePtp The Platypus vePTP contract
    function _claimVePtp(address vePtp) internal {
        IVePtp(vePtp).claim();
    }

    /// @notice Swaps underlying for underlying (stable to stable)
    /// @param pool The PTP pool contract
    /// @param fromToken The underlying token we want to swap (USDT, USDC, USDC.e, USDT.e, DAI.e)
    /// @param toToken The underlying token we will receive (USDT, USDC, USDC.e, USDT.e, DAI.e)
    /// @param fromAmount The amount of tokens we want to swap
    /// @param minimumToAmount The minimum amount of underlying we are willing to receive
    /// @param to The address of the receiver of the swap transaction
    function _swapPtpForUnderlying(
        address pool,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 minimumToAmount,
        address to
    ) internal {
        if (fromAmount == 0 || minimumToAmount == 0) {
            return;
        }

        (uint256 actualAmount, uint256 haircut) = IPtpPool(pool).swap(
            fromToken,
            toToken,
            fromAmount,
            minimumToAmount,
            to,
            block.timestamp);

        require(actualAmount > 0, "Platypus: swap failed");
    }
}
