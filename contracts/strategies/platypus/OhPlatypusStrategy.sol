// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";
import {OhPlatypusHelper} from "./OhPlatypusHelper.sol";
import {OhPlatypusStrategyStorage} from "./OhPlatypusStrategyStorage.sol";
import {IPlatypusCompounder} from "../../interfaces/strategies/platypus/IPlatypusCompounder.sol";

/// @title Oh! Finance Platypus Strategy
/// @notice Standard Platypus Single Underlying Strategy
contract OhPlatypusStrategy is OhStrategy, OhPlatypusStrategyStorage, OhPlatypusHelper, IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @notice Initialize the Platypus Strategy Logic
    constructor() initializer {
        assert(registry() == address(0));
        assert(bank() == address(0));
        assert(underlying() == address(0));
        assert(reward() == address(0));
    }

    /// @notice Initialize the Platypus Strategy Proxy
    /// @param registry_ Address of the Registry
    /// @param bank_ Address of the Bank
    /// @param underlying_ Underlying (USDCe, USDTe, Daie, USDC, USDT)
    /// @param derivative_ LP Token
    /// @param reward_ PTP token
    /// @param platypusCompounder_ The Platypus Compounder used by all the Platypus Strategies
    /// @param index_ Underlying index
    function initializePlatypusStrategy(
        address registry_,
        address bank_,
        address underlying_,
        address derivative_,
        address reward_,
        address platypusCompounder_,
        uint256 index_
    ) public initializer {
        initializeStrategy(registry_, bank_, underlying_, derivative_, reward_);
        initializePlatypusStorage(platypusCompounder_, index_);

        IERC20(underlying_).approve(platypusCompounder_, type(uint256).max);
    }

    // returns the total underlying balance
    function investedBalance() public view override returns (uint256) {
        address _derivative = derivative();
        uint256 exchangeRate = getExchangeRate(_derivative);
        return exchangeRate.mul(stakedBalance()).div(1e18);
    }

    // amount of lp tokens staked in Master Platypus
    function stakedBalance() public view returns (uint256) {
        return IPlatypusCompounder(platypusCompounder()).investedBalance(index(), derivative());
    }

    /// @notice Execute the Platypus Strategy
    /// @dev Compound PTP Yield, Add Liquidity, Stake into pool
    function invest() external override onlyBank {
        _compound();
        _deposit();
    }

    /// @notice Deposits underlying
    /// @dev Deposits underlying into pool and stake into MasterPlatypusV2 contract to receive PTP rewards
    function _deposit() internal {
        uint256 amount = underlyingBalance();
        if (amount > 0) {
            address compounder = platypusCompounder();

            // add liquidity to PTP pool
            IPlatypusCompounder(compounder).addLiquidity(underlying(), amount);
            // stake all received in the PTP MasterPlatypusV2 contract
            IPlatypusCompounder(compounder).stake(derivative(), index());
        }
    }

    /// @notice Withdraw an amount of underlying from Platypus Strategy
    /// @param amount Amount of Underlying tokens to withdraw
    /// @dev Unstake from pool, Remove Liquidity
    function withdraw(uint256 amount) external override onlyBank returns (uint256) {
        uint256 withdrawn = _withdraw(msg.sender, amount);
        return withdrawn;
    }

    /// @notice Withdraw all underlying from Platypus Strategy
    /// @dev Unstake from pool, Remove Liquidity
    function withdrawAll() external override onlyBank {
        uint256 invested = investedBalance();
        _withdraw(msg.sender, invested);
    }

    /// @dev Compound rewards into underlying through liquidation
    /// @dev Claim Rewards, sell PTP for underlying
    function _compound() internal {
        // claim available PTP rewards
        address platypusCompounder = platypusCompounder(); 
        IPlatypusCompounder(platypusCompounder).claimPtp(index());

        uint256 rewardAmount = rewardBalance();
        if (rewardAmount > 0) {
            // Deposit accrued PTP on Compounder, then liquidate profits
            IPlatypusCompounder(platypusCompounder).depositPtpForBoost();
            liquidate(reward(), underlying(), rewardAmount);
        }
    }

    // Withdraw underlying tokens from the protocol
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

        // find amount of lp tokens to withdraw
        uint256 unstakeAmount = Math.min(staked, supplyShare.mul(staked).div(1e18));

        // find amount to redeem in underlying, 1e6
        uint256 redeemAmount = Math.min(invested, supplyShare.mul(invested).div(1e18));
        uint256 minAmount = redeemAmount.mul(999).div(1000);

        address compounder = platypusCompounder();

        // unstake from PTP LP Pool and remove liquidity from Pool
        IPlatypusCompounder(compounder).unstake(unstakeAmount, index());

        // withdraw LP to Bank
        uint256 withdrawn = IPlatypusCompounder(compounder).removeLiquidity(
            derivative(),
            underlying(),
            recipient,
            redeemAmount,
            minAmount
        );

        return withdrawn;
    }
}