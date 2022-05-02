// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IPtpAsset} from "./interfaces/IPtpAsset.sol";
import {IPtpPool} from "./interfaces/IPtpPool.sol";

/// @title Oh! Finance Platypus Helper
/// @notice Helper functions to interact with the Platypus Protocol
/// @dev https://docs.traderjoexyz.com/
abstract contract OhPlatypusHelper {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Get the exchange rate of lpToken => underlying
    /// @dev https://compound.finance/docs/ctokens#exchange-rate
    /// @param lpToken The lpToken address rate to get
    /// @dev (cash + liability - underlyingBalance) / totalSupply
    function getExchangeRate(address lpToken) internal view returns (uint256) {
        return IPtpAsset(lpToken).cash()
            .add(IPtpAsset(lpToken).liability())
            .sub(IPtpAsset(lpToken).underlyingTokenBalance())
            .div(IPtpAsset(lpToken).totalSupply());
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
