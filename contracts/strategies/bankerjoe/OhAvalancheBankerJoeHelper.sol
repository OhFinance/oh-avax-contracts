// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IWAVAX} from "../../interfaces/IWAVAX.sol";
import {IJToken} from "./interfaces/IJToken.sol";
import {IJoetroller} from "./interfaces/IJoetroller.sol";
import {IJAvax} from "./interfaces/IJAvax.sol";

import "hardhat/console.sol";

/// @title Oh! Finance BankerJoe Helper
/// @notice Helper functions to interact with the BankerJoe Protocol
/// @dev https://docs.traderjoexyz.com/
abstract contract OhAvalancheBankerJoeHelper {
    using SafeERC20 for IERC20;

    /// @notice Get the exchange rate of jTokens => underlying
    /// @dev https://compound.finance/docs/ctokens#exchange-rate No equivalent in Trader Joe docs
    /// @param jToken The jToken address rate to get
    /// @return The exchange rate scaled by 1e18
    function getExchangeRate(address jToken) internal view returns (uint256) {
        return IJToken(jToken).exchangeRateStored();
    }

    /// @notice Enter the market (approve), required before calling borrow
    /// @param joetroller The BankerJoe Joetroller (rewards contract)
    /// @param jToken The jToken market to enter
    function enter(address joetroller, address jToken) internal {
        address[] memory jTokens = new address[](1);
        jTokens[0] = jToken;
        IJoetroller(joetroller).enterMarkets(jTokens);
    }

    /// @notice Mint jTokens by providing/lending underlying as collateral
    /// @param underlying The underlying to lend to BankerJoe
    /// @param jToken The BankerJoe jToken
    /// @param amount The amount of underlying to lend
    function mint(
        address underlying,
        address jToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeIncreaseAllowance(jToken, amount);
        uint256 result = IJToken(jToken).mint(amount);
        require(result == 0, "BankerJoe: Borrow failed");
    }

    /// @notice Borrow underlying tokens from a given jToken against collateral
    /// @param jToken The jToken corresponding the underlying we want to borrow
    /// @param amount The amount of underlying to borrow
    function borrow(address jToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        console.log("Borrowing %s from BankerJoe", amount);
        uint256 result = IJToken(jToken).borrow(amount);
        require(result == 0, "BankerJoe: Borrow failed");
    }

    /// @notice Repay loan with a given amount of underlying
    /// @param underlying The underlying to repay
    /// @param jToken The jToken for the underlying
    /// @param amount The amount of underlying to repay
    function repay(
        address underlying,
        address jToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }

        IERC20(underlying).safeIncreaseAllowance(jToken, amount);
        uint256 result = IJToken(jToken).repayBorrow(amount);
        require(result == 0, "BankerJoe: Repay failed");
    }

    /// @notice Redeem jTokens for underlying
    /// @param jToken The jToken to redeem
    /// @param amount The amount of jTokens to redeem
    function redeem(address jToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IJToken(jToken).redeem(amount);
        require(result == 0, "BankerJoe: Redeem jToken");
    }

    /// @notice Redeem jTokens for underlying
    /// @param jToken The jToken to redeem
    /// @param amount The amount of underlying tokens to receive
    function redeemUnderlying(address jToken, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        uint256 result = IJToken(jToken).redeemUnderlying(amount);
        require(result == 0, "BankerJoe: Redeem underlying");
    }

    /// @notice Redeem jTokens for wavax
    /// @param wavax WAVAX Address
    /// @param jToken The jToken to redeem
    /// @param amount The amount of underlying to receive
    /// @dev Redeem in AVAX, then convert to wavax
    function redeemUnderlyingInWeth(
        address wavax,
        address jToken,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }

        redeemUnderlying(jToken, amount);
        IWAVAX(wavax).deposit{value: address(this).balance}();
    }

    /// @notice Claim JOE rewards from Joetroller for this address
    /// @param joetroller The BankerJoe Joetroller, Reward Contract
    /// @param rewardType Reward type: 0 = JOE, 1 = AVAX
    function claim(address joetroller, uint8 rewardType) internal {
        IJoetroller(joetroller).claimReward(rewardType, address(this));
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

    // Returns the cash balance of this jToken in the underlying asset
    function getCash(address jToken) internal view returns (uint256) {
        return IJToken(jToken).getCash();
    }

    // Returns the owner's jToken balance
    function balanceOfUnderlying(address jToken, address owner) internal returns (uint256) {
        return IJToken(jToken).balanceOfUnderlying(owner);
    }

    // Returns the owner's borrow balance
    function borrowBalanceCurrent(address jToken, address owner) internal returns (uint256) {
        return IJToken(jToken).borrowBalanceCurrent(owner);
    }
}
