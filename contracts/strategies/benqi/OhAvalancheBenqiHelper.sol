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

    /// @notice Get the exchange rate of QiTokens => underlying
    /// @dev https://compound.finance/docs/ctokens#exchange-rate
    /// @param qiToken The qiToken address rate to get
    /// @return The exchange rate scaled by 1e18
    function getExchangeRate(address qiToken) internal view returns (uint256) {
        return IQiToken(qiToken).exchangeRateStored();
    }

    /// @notice Enter the market (approve), required before calling borrow
    /// @param comptroller The Benqi Comptroller (rewards contract)
    /// @param qiToken The qiToken market to enter
    function enter(address comptroller, address qiToken) internal {
        address[] memory qiTokens = new address[](1);
        qiTokens[0] = qiToken;
        IBenqiComptroller(comptroller).enterMarkets(qiTokens);
    }

    /// @notice Mint qiTokens by providing/lending underlying as collateral
    /// @param underlying The underlying to lend to Compound
    /// @param qiToken The Compound qiToken
    /// @param amount The amount of underlying to lend
    function mint(
        address underlying,
        address qiToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeIncreaseAllowance(qiToken, amount);
        uint256 result = IQiToken(qiToken).mint(amount);
        require(result == 0, "Benqi: Borrow failed");
    }

    /// @notice Borrow underlying tokens from a given qiToken against collateral
    /// @param qiToken The qiToken corresponding the underlying we want to borrow
    /// @param amount The amount of underlying to borrow
    function borrow(address qiToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(qiToken).borrow(amount);
        require(result == 0, "Benqi: Borrow failed");
    }

    /// @notice Repay loan with a given amount of underlying
    /// @param underlying The underlying to repay
    /// @param qiToken The qiToken for the underlying
    /// @param amount The amount of underlying to repay
    function repay(
        address underlying,
        address qiToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(underlying).safeIncreaseAllowance(qiToken, amount);
        uint256 result = IQiToken(qiToken).repayBorrow(amount);
        require(result == 0, "Benqi: Repay failed");
    }

    /// @notice Redeem qiTokens for underlying
    /// @param qiToken The qiToken to redeem
    /// @param amount The amount of qiTokens to redeem
    function redeem(address qiToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(qiToken).redeem(amount);
        require(result == 0, "Benqi: Redeem qiToken");
    }

    /// @notice Redeem qiTokens for underlying
    /// @param qiToken The qiToken to redeem
    /// @param amount The amount of underlying tokens to receive
    function redeemUnderlying(address qiToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IQiToken(qiToken).redeemUnderlying(amount);
        require(result == 0, "Benqi: Redeem underlying");
    }

    /// @notice Claim QI rewards from Comptroller for this address
    /// @param comptroller The Benqi Comptroller, Reward Contract
    /// @param rewardType Reward type: 0 = QI, 1 = AVAX
    function claim(address comptroller, uint rewardType) internal {
        IBenqiComptroller(comptroller).claimReward(uint8(rewardType), address(this));
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
