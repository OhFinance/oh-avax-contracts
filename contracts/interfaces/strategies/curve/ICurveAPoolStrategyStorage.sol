// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface ICurveAPoolStrategyStorage {
    function secondaryReward() external view returns (address);

    function pool() external view returns (address);

    function gauge() external view returns (address);

    function index() external view returns (uint256);
}
