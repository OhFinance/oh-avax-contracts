// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhAvalancheBenqiHelper} from "./OhAvalancheBenqiHelper.sol";
import {OhAvalancheBenqiStrategyStorage} from "./OhAvalancheBenqiStrategyStorage.sol";

/// @title Oh! Finance Benqi Strategy
/// @notice Standard, unleveraged strategy. Invest underlying tokens into derivative cTokens
/// @dev https://compound.finance/docs/ctokens
contract OhAvalancheBenqiStrategy is IStrategy, OhAvalancheBenqiHelper, OhStrategy, OhAvalancheBenqiStrategyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @notice Initialize the Benqi Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initializes the Benqi Strategy Proxy
    /// @param registry_ the registry contract
    /// @param bank_ the bank associated with the strategy
    /// @param underlying_ the underlying token that is deposited
    /// @param derivative_ the qiToken address received from Benqi
    /// @param reward_ the address of the reward token QI
    /// @param secondaryReward_ the address of the reward token WAVAX
    /// @param comptroller_ the Benqi rewards contract
    /// @dev The function should be called at time of deployment
    function initializeBenqiStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address secondaryReward_,
        address comptroller_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeBenqiStorage(secondaryReward_, comptroller_);

        IERC20(derivative_).safeApprove(underlying_, type(uint256).max);
    }

    /// @notice Get the balance of underlying invested by the Strategy
    /// @dev Get the exchange rate (which is scaled up by 1e18) and multiply by amount of qiTokens
    /// @return The amount of underlying the strategy has invested
    function investedBalance() public view override returns (uint256) {
        uint256 exchangeRate = getExchangeRate(derivative());
        return exchangeRate.mul(derivativeBalance()).div(1e18);
    }

    // Get the balance of extra rewards received by the Strategy
    function secondaryRewardBalance() public view returns (uint256) {
        address secondaryReward = secondaryReward();
        if (secondaryReward == address(0)) {
            return 0;
        }
    
        return IERC20(secondaryReward).balanceOf(address(this));
    }

    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    function _compound() internal {
        _claimAll();

        uint256 amount = rewardBalance();
        if (amount > 0) {
            liquidate(reward(), underlying(), amount);
        }

        uint256 secondaryAmount = secondaryRewardBalance();
        if (secondaryAmount > 0) {
            liquidate(secondaryReward(), underlying(), secondaryAmount);
        }
    }

    function _claimAll() internal {
        // Claim QI
        claim(comptroller(), 0);

        // Claim and wrap AVAX
        claim(comptroller(), 1);
        wrap(secondaryReward(), address(this).balance);
    }

    // deposit underlying tokens into Benqi, minting qiTokens
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            mint(underlying(), derivative(), amount);
        }
    }

    // withdraw all underlying by redeem all qiTokens
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    // withdraw an amount of underlying tokens
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw underlying tokens from the protocol after redeeming them from Benqi
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        uint256 invested = investedBalance();
        if (invested == 0) {
            return 0;
        }

        // calculate amount to redeem by supply ownership
        uint256 supplyShare = amount.mul(1e18).div(invested);
        uint256 redeemAmount = supplyShare.mul(invested).div(1e18);

        // safely redeem from Benqi
        if (redeemAmount > invested) {
            redeemUnderlying(derivative(), invested);
        } else {
            redeemUnderlying(derivative(), redeemAmount);
        }

        // withdraw to bank
        uint256 withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), amount);
        return withdrawn;
    }

    receive() external payable {}
}
