// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IWAVAX} from "../../interfaces/IWAVAX.sol"; 
import {IQiToken} from "./interfaces/IQiToken.sol";
import {IBenqiComptroller} from "./interfaces/IBenqiComptroller.sol";


/// @title Oh! Finance Benqi Helper
/// @notice Helper functions to interact with the Benqi Protocol
/// @dev https://compound.finance
abstract contract OhAvalancheBenqiHelper {
    using SafeERC20 for IERC20;

    /// @notice Get the exchange rate of cTokens => underlying
    /// @dev https://compound.finance/docs/ctokens#exchange-rate
    /// @param cToken The cToken address rate to get
    /// @return The exchange rate scaled by 1e18
    function getExchangeRate(address cToken) internal view returns (uint256) {
        return IQiToken(cToken).exchangeRateStored();
    }

    /// @notice Enter the market (approve), required before calling borrow
    /// @param comptroller The Compound Comptroller (rewards contract)
    /// @param cToken The cToken market to enter
    function enter(address comptroller, address cToken) internal {
        address[] memory cTokens = new address[](1);
        cTokens[0] = cToken;
        IBenqiComptroller(comptroller).enterMarkets(cTokens);
    }

    /// @notice Mint cTokens by providing/lending underlying as collateral
    /// @param underlying The underlying to lend to Compound
    /// @param cToken The Compound cToken
    /// @param amount The amount of underlying to lend
    function mint(
        address underlying,
        address cToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeIncreaseAllowance(cToken, amount);
        uint256 result = IQiToken(cToken).mint(amount);
        require(result == 0, "Compound: Borrow failed");
    }

    /// @notice Borrow underlying tokens from a given cToken against collateral
    /// @param cToken The cToken corresponding the underlying we want to borrow
    /// @param amount The amount of underlying to borrow
    function borrow(address cToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(cToken).borrow(amount);
        require(result == 0, "Compound: Borrow failed");
    }

    /// @notice Repay loan with a given amount of underlying
    /// @param underlying The underlying to repay
    /// @param cToken The cToken for the underlying
    /// @param amount The amount of underlying to repay
    function repay(
        address underlying,
        address cToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(underlying).safeIncreaseAllowance(cToken, amount);
        uint256 result = IQiToken(cToken).repayBorrow(amount);
        require(result == 0, "Compound: Repay failed");
    }

    /// @notice Redeem cTokens for underlying
    /// @param cToken The cToken to redeem
    /// @param amount The amount of cTokens to redeem
    function redeem(address cToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(cToken).redeem(amount);
        require(result == 0, "Compound: Redeem cToken");
    }

    /// @notice Redeem cTokens for underlying
    /// @param cToken The cToken to redeem
    /// @param amount The amount of underlying tokens to receive
    function redeemUnderlying(address cToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(cToken).redeemUnderlying(amount);
        require(result == 0, "Compound: Redeem underlying");
    }

    /// @notice Claim COMP rewards from Comptroller for this address
    /// @param comptroller The Compound Comptroller, Reward Contract
    function claim(address comptroller, uint rewardType) internal {
        IBenqiComptroller(comptroller).claimReward(uint8(rewardType), address(this));
    }

    function wrap(address wavax, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        IWAVAX(wavax).deposit{value: amount}();
    }
}
