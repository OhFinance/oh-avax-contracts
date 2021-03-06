// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {OhManager} from "@ohfinance/oh-contracts/contracts/manager/OhManager.sol";
import {OhSubscriber} from "@ohfinance/oh-contracts/contracts/registry/OhSubscriber.sol";
import {TransferHelper} from "@ohfinance/oh-contracts/contracts/libraries/TransferHelper.sol";
import {ILiquidator} from "@ohfinance/oh-contracts/contracts/interfaces/ILiquidator.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAvalancheManager} from "../interfaces/manager/IAvalancheManager.sol";

contract OhAvalancheManager is OhManager, IAvalancheManager {
    address public override burner;

    /// @notice Deploy the Manager with the Registry reference
    /// @dev Sets initial buyback and management fee parameters
    /// @param registry_ The address of the registry
    /// @param token_ The address of the Oh! Token
    constructor(address registry_, address token_) OhManager(registry_, token_) {}

    /// @notice Perform a token buyback with accrued revenue
    /// @dev Burns all proceeds
    /// @param from The address of the token to liquidate for Oh! Tokens
    function buyback(address from) external override defense {
        // get token, liquidator, and liquidation amount
        address _token = token;
        address liquidator = liquidators[from][_token];
        uint256 amount = IERC20(from).balanceOf(address(this));

        // send to liquidator, buyback and burn
        TransferHelper.safeTokenTransfer(liquidator, from, amount);
        uint256 received = ILiquidator(liquidator).liquidate(address(this), from, _token, amount, 1);

        emit Buyback(from, amount, received);
    }

    function burn() external override defense {
        require(burner != address(0), "Manager: No Burner");
        uint256 amount = IERC20(token).balanceOf(address(this));
        TransferHelper.safeTokenTransfer(burner, token, amount);
    }

    function setBurner(address _burner) external override onlyGovernance {
        burner = _burner;
    }
}