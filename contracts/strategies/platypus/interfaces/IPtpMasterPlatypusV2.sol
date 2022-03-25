// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IPtpMasterPlatypusV2 {
    function deposit(uint256 pid, uint256 amount) external;

    function withdraw(uint256 pid, uint256 amount) external;

    function multiClaim(uint256[1] calldata tickets) external;
}