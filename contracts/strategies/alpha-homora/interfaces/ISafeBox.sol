// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface ISafeBox {
    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function claim(uint256 totalAmount, bytes32[] memory proof) external;

    function claimAndWithdraw(uint256 totalAmount, bytes32[] memory proof, uint256 withdrawAmount) external;
}