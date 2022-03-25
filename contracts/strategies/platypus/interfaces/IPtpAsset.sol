// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IPtpAsset {
    function balanceOf(address token) external view returns(uint256);
}