// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IVePtp {
    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function claim() external;
}