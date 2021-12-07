// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IWAVAX} from "../../interfaces/IWAVAX.sol"; 
import {IcrUSDCToken} from "./interfaces/IcrUSDCToken.sol";
import {ISafeBox} from "./interfaces/ISafeBox.sol";


/// @title Oh! Finance Benqi Helper
/// @notice Helper functions to interact with the Benqi Protocol
/// @dev https://compound.finance
abstract contract OhAlphaHomoraV2Helper {
    using SafeERC20 for IERC20;

    /// @notice Get the exchange rate of jTokens => underlying
    /// @param crUSDCeToken The crUSDCeToken address rate to get
    /// @return The exchange rate scaled by 1e18
    function getExchangeRate(address crUSDCeToken) internal view returns (uint256) {
        return IcrUSDCToken(crUSDCeToken).exchangeRateStored();
    }

    /// @notice Mint ibUSDCv2 tokens by providing/lending underlying as collateral
    /// @param ibUSDCv2Token The ibUSDCv2 token
    /// @param amount The amount of underlying to lend
    function deposit(
        address ibUSDCv2Token,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        ISafeBox(ibUSDCv2Token).deposit(amount);
    }

    /// @notice Redeem ibUSDCv2Token for underlying
    /// @param ibUSDCv2Token The ibUSDCv2Token to redeem
    /// @param amount The amount of underlying tokens to receive
    function redeemUnderlying(address ibUSDCv2Token, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        ISafeBox(ibUSDCv2Token).withdraw(amount);
    }

    /// @notice Claim rewards from SafeBox for this address
    /// @param safeBox The Alpha Homora SafeBox contract
    /// @param totalAmount Total Amount of underlying reward to claim
    function claim(address safeBox, uint totalAmount) internal {
        bytes32[] memory proof = new bytes32[](10);
        ISafeBox(safeBox).claim(totalAmount, proof);
    }

    /// @notice Wrap AVAX to WAVAX
    /// @param wavax Address of WAVAX
    /// @param amount Amount of AVAX to wrap
    function wrap(address wavax, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        IWAVAX(wavax).deposit{value: amount}();
    }
}
