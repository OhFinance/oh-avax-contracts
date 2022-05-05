// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;


interface IYetiLpFarmPool {
    function balanceOf(address account) external view returns (uint256);

    function getReward() external;

    function stake(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function exit() external;
}