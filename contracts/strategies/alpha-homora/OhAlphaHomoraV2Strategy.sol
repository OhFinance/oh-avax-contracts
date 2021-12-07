// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhAlphaHomoraV2Helper} from "./OhAlphaHomoraV2Helper.sol";
import {OhAlphaHomoraV2StrategyStorage} from "./OhAlphaHomoraV2StrategyStorage.sol";

/// @title Oh! Finance Benqi Strategy
/// @notice Standard, unleveraged strategy. Invest underlying tokens into derivative cTokens
/// @dev https://compound.finance/docs/ctokens
contract OhAlphaHomoraV2Strategy is IStrategy, OhAlphaHomoraV2Helper, OhStrategy, OhAlphaHomoraV2StrategyStorage {
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
    /// @param derivative_ the ibUSDCv2Token address
    /// @param creamUSDCToken_ the ibUSDCv2Token address
    /// @param reward_ the address of the reward token QI
    /// @param secondaryReward_ the address of the reward token WAVAX
    /// @param safeBox_ the Alpha Homora V2 SafeBox contract
    /// @dev The function should be called at time of deployment
    function initializeAlphaHomoraV2Strategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address creamUSDCToken_,
        address secondaryReward_,
        address safeBox_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeAlphaHomoraV2Storage(secondaryReward_, creamUSDCToken_, safeBox_);

        IERC20(underlying_).safeApprove(underlying_, type(uint256).max);
    }

    /// @notice Get the balance of underlying invested by the Strategy
    /// @dev Get the exchange rate (which is scaled up by 1e18) and multiply by amount of qiTokens
    /// @return The amount of underlying the strategy has invested
    function investedBalance() public view override returns (uint256) {
        uint256 exchangeRate = getExchangeRate(creamUSDCeToken());
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
        //_compound(); TODO: uncomment when rewards are claimable December 22nd
        _deposit();
    }

    function _compound() internal {
        _claimAll();

        // TODO: Rewards are not claimable yet, they should be activated on december 22nd
        // uint256 amount = rewardBalance();
        // if (amount > 0) {
        //     liquidate(reward(), underlying(), amount);
        // }

        // uint256 secondaryAmount = secondaryRewardBalance();
        // if (secondaryAmount > 0) {
        //     liquidate(secondaryReward(), underlying(), secondaryAmount);
        // }
    }

    function _claimAll() internal {
        claim(safeBox(), derivativeBalance());

        // // Claim and wrap AVAX
        // claim(safeBox());
        // wrap(secondaryReward(), address(this).balance);

        //TODO: claim ALPHA
    }

    // deposit underlying tokens into Alpha Homora V2 USDC lending pool, minting ibUSDCv2
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            deposit(underlying(), derivative(), amount);
        }
    }

    // withdraw all underlying by redeem all ibUSDCv2Tokens
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    // withdraw an amount of underlying tokens
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw underlying tokens from the protocol after redeeming them from Alpha Homora V2
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

        // safely redeem from Alpha Homora V2
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
