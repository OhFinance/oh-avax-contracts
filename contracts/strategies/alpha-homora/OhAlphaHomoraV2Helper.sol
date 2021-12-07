// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IWAVAX} from "../../interfaces/IWAVAX.sol"; 
import {IibUSDCv2Token} from "./interfaces/IibUSDCv2Token.sol";
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
    /// @param underlying The underlying to lend to Compound
    /// @param ibUSDCv2Token The ibUSDCv2 token
    /// @param amount The amount of underlying to lend
    function deposit(
        address underlying,
        address ibUSDCv2Token,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeIncreaseAllowance(ibUSDCv2Token, amount);
        uint256 result = ISafeBox(ibUSDCv2Token).deposit(amount);
        require(result == 0, "Alpha Homora V2: Borrow failed");
    }

    /// @notice Redeem ibUSDCv2Token for underlying
    /// @param ibUSDCv2Token The ibUSDCv2Token to redeem
    /// @param amount The amount of ibUSDCv2Token to redeem
    function redeem(address ibUSDCv2Token, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IibUSDCv2Token(ibUSDCv2Token).redeem(amount);
        require(result == 0, "Alpha Homora V2: Redeem ibUSDCv2");
    }

    /// @notice Redeem ibUSDCv2Token for underlying
    /// @param ibUSDCv2Token The ibUSDCv2Token to redeem
    /// @param amount The amount of underlying tokens to receive
    function redeemUnderlying(address ibUSDCv2Token, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IibUSDCv2Token(ibUSDCv2Token).redeemUnderlying(amount);
        require(result == 0, "Alpha Homora V2: Redeem underlying");
    }

    /// @notice Claim rewards from SafeBox for this address
    /// @param safeBox The Alpha Homora SafeBox contract
    /// @param totalAmount Total Amount of underlying reward to claim
    function claim(address safeBox, uint totalAmount) internal {
        bytes32[] memory proof = new bytes32[](10); // TODO: figure out how to calculate the proof
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
