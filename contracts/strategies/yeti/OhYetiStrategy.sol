// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhYetiHelper} from "./OhYetiHelper.sol";
import {OhYetiStrategyStorage} from "./OhYetiStrategyStorage.sol";
import {IYetiCompounder} from "../../interfaces/strategies/yeti/IYetiCompounder.sol";

import "hardhat/console.sol";

/// @title Oh! Finance YETI Strategy
/// @notice Curve YETI Underlying, in order: (YUSD, USDC, USDT)
contract OhYetiStrategy is OhStrategy, OhYetiStrategyStorage, OhYetiHelper, IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Initialize the YETI Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initialize the YETI Strategy Proxy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of the Bank
    /// @param underlying_ Underlying (USDC, USDT)
    /// @param derivative_ YUSD Curve LP Token
    /// @param reward_ YETI Token
    /// @param yetiCompounder_ The YETI Compounder used by all the YETI strategies
    /// @param joetroller_ The BankerJoe contract
    /// @param index_ Underlying Curve YUSD Pool Index
    function initializeYetiStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address yetiCompounder_,
        address joetroller_,
        uint256 index_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializeYetiStorage(yetiCompounder_, joetroller_, index_);

        IERC20(underlying_).approve(yetiCompounder_, type(uint256).max);
    }

    // calculate the total underlying balance
    function investedBalance() public view override returns (uint256) {
        return calcWithdraw(derivative(), stakedBalance(), index());
    }

    // amount of Curve LP Tokens staked in the YETI LP Farm Pool
    function stakedBalance() public view returns (uint256) {
        return IYetiCompounder(yetiCompounder()).staked(index());
    }

    /// @notice Execute the YETI Strategy
    /// @dev Compound YETI Yield, Add Liquidity, Stake into YETI LP Farm Pool
    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    /// @notice Withdraw an amount of underlying from YETI Strategy
    /// @param amount Amount of Underlying tokens to withdraw
    /// @dev Unstake from YETI LP Farm Pool, Remove Liquidity
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    /// @notice Withdraw all underlying from YETI Strategy
    /// @dev Unstake from YETI LP Farm Pool, Remove Liquidity
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    /// @dev Compound rewards into underlying through liquidation
    /// @dev Claim Rewards, sell YETI for YUSD
    function _compound() internal {
        // claim available YETI rewards
        address compounder = yetiCompounder();
        IYetiCompounder(compounder).claim();

        uint256 rewardAmount = rewardBalance();
        if (rewardAmount > 0) {
            // Deposit accrued YETI on Compounder, then liquidate profits
            IYetiCompounder(compounder).depositYetiForBoost();
            liquidate(reward(), underlying(), rewardAmount);
        }
    }

    /// @dev Deposit underlying into APool to get av3CRV and stake into Gauge
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            address compounder = yetiCompounder();
            // add liquidity to receive Curve LP Tokens
            IYetiCompounder(compounder).addLiquidity(derivative(), underlying(), index(), amount, 1);
            // stake all received in the YETI LP Farm Pool
            IYetiCompounder(compounder).stake(derivative(), index());
        }
    }

    /// @dev Withdraw underlying tokens from the protocol
    function _withdraw(address recipient, uint256 amount) internal returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        uint256 invested = investedBalance();
        if (invested == 0) {
            return 0;
        }

        uint256 staked = stakedBalance();

        // calculate % of supply ownership
        uint256 supplyShare = amount.mul(1e18).div(invested);

        // find amount to unstake in av3crv, 1e18
        uint256 unstakeAmount = Math.min(staked, supplyShare.mul(staked).div(1e18));

        // find amount to redeem in underlying, 1e6
        uint256 redeemAmount = Math.min(invested, supplyShare.mul(invested).div(1e18));
        uint256 minAmount = redeemAmount.mul(999).div(1000);

        address compounder = yetiCompounder();
        // unstake from Gauge and remove liquidity from Pool
        IYetiCompounder(compounder).unstake(unstakeAmount);
        IYetiCompounder(compounder).removeLiquidity(
            underlying(),
            recipient,
            index(),
            redeemAmount,
            minAmount
        );

        return withdrawn;
    }
}
