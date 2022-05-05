// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

interface IVeYeti {
    struct RewarderUpdate {
        address rewarder;
        uint256 amount;
        bool isIncrease;
    }

    function update(RewarderUpdate[] memory _yetiAdjustments) external;
}