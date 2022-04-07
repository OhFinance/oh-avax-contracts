// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {OhSubscriber} from "@ohfinance/oh-contracts/contracts/registry/OhSubscriber.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {IPtpAsset} from "./interfaces/IPtpAsset.sol";
import {IPtpMasterPlatypusV2} from "./interfaces/IPtpMasterPlatypusV2.sol";
import {IPtpPool} from "./interfaces/IPtpPool.sol";
import {IVePtp} from "./interfaces/IVePtp.sol";
import {IPlatypusCompounder} from "../../interfaces/strategies/platypus/IPlatypusCompounder.sol";
import {OhPlatypusGuard} from "./OhPlatypusGuard.sol";

contract OhPlatypusCompounder is OhSubscriber, OhPlatypusGuard, IPlatypusCompounder {
    using SafeERC20 for IERC20;

    constructor(address registry_) OhSubscriber(registry_) {}

    function lpTokenBalance(address lpToken) public override view returns (uint256) {
        if (lpToken == address(0)) {
            return 0;
        }
        return IERC20(lpToken).balanceOf(address(this));
    }

    /// @notice Add liquidity to PTP's pool, receiving LP tokens in return
    /// @param pool The address of the PTP pool
    /// @param underlying The token bridge corresponding to the underlying we are depositing
    /// @param amount The amount of underlying to deposit
    function addLiquidity(
        address pool,
        address underlying,
        address sender,
        uint256 amount
    ) external override onlyPtpStrategy {
        if (amount == 0) {
            return;
        }
        
        IERC20(underlying).safeTransferFrom(sender, address(this), amount);
        IERC20(underlying).safeIncreaseAllowance(pool, amount);
        uint256 minted = IPtpPool(pool).deposit(underlying, amount, address(this), block.timestamp);
        require(minted > 0, "Platypus: Add liquidity failed");
    }

    /// @notice Remove liquidity from PTP pool, receiving a single underlying
    /// @param pool The PTP pool
    /// @param lpToken The LP Token corresponding to the pool
    /// @param amount The amount of LP tokens to withdraw
    /// @param minAmount The min underlying tokens to receive before the tx reverts
    function removeLiquidity(
        address pool,
        address lpToken,
        address underlying,
        address recipient,
        uint256 amount,
        uint256 minAmount
    ) external override onlyPtpStrategy returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        IERC20(lpToken).safeIncreaseAllowance(pool, amount);
        uint256 withdrawn = IPtpPool(pool).withdraw(underlying, amount, minAmount, address(this), block.timestamp);
        require(withdrawn >= minAmount, "Platypus: Withdraw failed");
        
        return TransferHelper.safeTokenTransfer(recipient, underlying, withdrawn);
    }

    /// @notice Stake PTP LP Tokens into the PTP pool to earn PTP
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    /// @param lpToken The PTP LP Token to stake (This address is also the pool we are staking into)
    /// @param index The index of the underlying (USDC.e, USDT.e, Dai.e, etc...)
    function stake(
        address masterPlatypus,
        address lpToken,
        uint256 index
    ) external override onlyPtpStrategy {
        uint256 amount = lpTokenBalance(lpToken);
        if (amount == 0) {
            return;
        }

        IERC20(lpToken).safeIncreaseAllowance(masterPlatypus, amount);
        IPtpMasterPlatypusV2(masterPlatypus).deposit(index, amount);
    }

    /// @notice Unstake PTP LP tokens funds from the PTP pool
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    /// @param amount The amount of LP Tokens to withdraw
    /// @param index The index of the underlying token we are unstaking
    function unstake(
        address masterPlatypus,
        uint256 amount,
        uint256 index
    ) external override onlyPtpStrategy {
        if (amount == 0) {
            return;
        }

        IPtpMasterPlatypusV2(masterPlatypus).withdraw(index, amount);
    }

    /// @notice Claim PTP token rewards from the PTP MasterPlatypusV2 contract
    /// @param masterPlatypus The PTP MasterPlatypusV2 contract to unstake from
    function claimPtp(address masterPlatypus, uint256 index) external override onlyPtpStrategy {
        uint256[1] memory tickets = [uint256(index)];
        IPtpMasterPlatypusV2(masterPlatypus).multiClaim(tickets);
    }

    /// @notice Deposit PTP to vePTP contract
    /// @param amount The amount of PTP to deposit
    /// @param vePtp The Platypus vePTP contract
    function depositPtpForBoost(
        uint256 amount,
        address vePtp
    ) external override onlyPtpStrategy {
        if (amount > 0) {
            IVePtp(vePtp).deposit(amount);
        }
    }

    /// @notice Withdraw PTP from vePTP contract
    /// @param amount The amount of PTP to withdraw
    /// @param vePtp The Platypus vePTP contract
    function withdrawPtpForBoost(
        uint256 amount,
        address vePtp
    ) external override onlyPtpStrategy {
        if (amount > 0) {
            IVePtp(vePtp).withdraw(amount);
        }
    }

    /// @notice Claim PTP rewards from pool for this address
    /// @param vePtp The Platypus vePTP contract
    function claimVePtp(address vePtp) external override onlyPtpStrategy {
        IVePtp(vePtp).claim();
    }
}