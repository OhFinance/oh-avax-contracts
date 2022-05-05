// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {ICurveYusdPool} from "./interfaces/ICurveYusdPool.sol";
import {IYetiLpFarmPool} from "./interfaces/IYetiLpFarmPool.sol";

import "hardhat/console.sol";

/// @title Oh! Finance YETI Helper
/// @notice Helper functions for YETI Strategies
abstract contract OhYetiHelper {}
