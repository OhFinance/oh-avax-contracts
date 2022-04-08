// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

interface IPtpMasterPlatypusV2 {
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 factor;
    }

    function deposit(uint256 pid, uint256 amount) external;

    function withdraw(uint256 pid, uint256 amount) external;

    function multiClaim(uint256[1] calldata tickets) external;

    function userInfo(uint256 pid, address user) external view returns (UserInfo memory info);
}