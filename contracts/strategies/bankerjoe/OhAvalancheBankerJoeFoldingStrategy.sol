// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhAvalancheBankerJoeHelper} from "./OhAvalancheBankerJoeHelper.sol";
import {OhAvalancheBankerJoeFoldingStrategyStorage} from "./OhAvalancheBankerJoeFoldingStrategyStorage.sol";

/// @title Oh! Finance Banker Joe Strategy
/// @notice Standard, unleveraged strategy. Invest underlying tokens into derivative JTokens
/// @dev https://docs.traderjoexyz.com/
contract OhAvalancheBankerJoeFoldingStrategy is IStrategy, OhAvalancheBankerJoeHelper, OhStrategy, OhAvalancheBankerJoeFoldingStrategyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @notice Initialize the BankerJoe Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initializes the BankerJoe Folding Strategy Proxy
    /// @param registry_ the registry contract
    /// @param bank_ the bank associated with the strategy
    /// @param underlying_ the underlying token that is deposited
    /// @param derivative_ the JToken address received from BankerJoe
    /// @param reward_ the address of the reward token JOE
    /// @param joetroller_ the BankerJoe rewards contract
    /// @dev The function should be called at time of deployment
    function initializeBankerJoeFoldingStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address joetroller_,
        uint256 folds_,
        uint256 collateralFactorNumerator_,
        uint256 collateralFactorDenominator_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeBankerJoeFoldingStorage(joetroller_, folds_,
            collateralFactorNumerator_, collateralFactorDenominator_);

        IERC20(derivative_).safeApprove(underlying_, type(uint256).max);
    }

    /// @notice Get the balance of underlying invested by the Strategy
    /// @dev Get the exchange rate (which is scaled up by 1e18) and multiply by amount of JTokens
    /// @return The amount of underlying the strategy has invested
    function investedBalance() public view override returns (uint256) {
        return suppliedUnderlying().sub(borrowedUnderlying());
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
    }

    function _claimAll() internal {
        // Claim JOE
        claim(joetroller(), 0);
    }

    // deposit underlying tokens into BankerJoe as collateral and borrow against it, minting JTokens
    function _deposit() internal {
        uint256 balance = underlyingBalance();

        if (balance > 0) {
            mint(underlying(), derivative(), balance);

            uint256 folds = folds();
            for (uint256 i = 0; i < folds; i++) {
                uint256 borrowAmount = balance.mul(collateralFactorNumerator()).div(collateralFactorDenominator());
                borrow(derivative(), borrowAmount);
                balance = underlyingBalance();
                mint(underlying(), derivative(), balance);
            }
        }

        updateSupply();
    }

    // withdraw all underlying by redeem all JTokens
    function withdrawAll() external override onlyBank {
        updateSupply();
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    // withdraw an amount of underlying tokens
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        updateSupply();
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    // withdraw underlying tokens from the protocol after redeeming them from trader joe
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        uint256 invested = investedBalance();
        if (invested == 0) {
            return 0;
        }

        // calculate amount to redeem by supply ownership
        uint256 withdrawn;
        uint256 supplyShare = amount.mul(1e18).div(invested);
        uint256 redeemAmount = supplyShare.mul(invested).div(1e18);

        if (redeemAmount <= underlyingBalance()) {
            withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), amount);
            return withdrawn;
        }

        // safely redeem from BankerJoe
        if (redeemAmount > invested) {
            mustRedeemPartial(invested);
        } else {
            mustRedeemPartial(redeemAmount);
        }

        // withdraw to bank
        withdrawn = TransferHelper.safeTokenTransfer(recipient, underlying(), amount);
        
        // re-invest whatever is left over if any
        if (underlyingBalance() > 10) {
            _compound();
            _deposit();
        } else {
            updateSupply();
        }

        return withdrawn;
    }

    // Redeems `amountUnderlying` or fails.
    function mustRedeemPartial(uint256 amountUnderlying) internal {
        require(
            getCash(derivative()) >= amountUnderlying,
            "market cash cannot cover liquidity"
        );
        redeemMaximumUnderlyingWithLoan();
        require(underlyingBalance() >= amountUnderlying, "Unable to withdraw the entire amountUnderlying");
    }

    function redeemMaximumUnderlyingWithLoan() internal {
        // amount of liquidity
        uint256 available = getCash(derivative());
        // amount of MIM we supplied
        uint256 supplied = balanceOfUnderlying(derivative(), address(this));
        // amount of MIM we borrowed
        uint256 borrowed = borrowBalanceCurrent(derivative(), address(this));

        while (borrowed > 0) {
            uint256 requiredCollateral = borrowed
                .mul(collateralFactorDenominator())
                .add(collateralFactorNumerator().div(2))           
                .div(collateralFactorNumerator());

            // redeem just as much as needed to repay the loan
            uint256 wantToRedeem = supplied.sub(requiredCollateral);
            redeemUnderlying(derivative(), Math.min(wantToRedeem, available));
            // now we can repay our borrowed amount
            uint256 balance = underlyingBalance();
            repay(underlying(), derivative(), Math.min(borrowed, balance));

            // update the parameters
            available = getCash(derivative());
            supplied = balanceOfUnderlying(derivative(), address(this));
            borrowed = borrowBalanceCurrent(derivative(), address(this));
        }

        // redeem the most we can redeem
        redeemUnderlying(derivative(), Math.min(available, supplied));
    }

    function updateSupply() internal {
        setSuppliedUnderlying(balanceOfUnderlying(derivative(), address(this)));
        setBorrowedUnderlying(borrowBalanceCurrent(derivative(), address(this)));
    }

    receive() external payable {}
}
