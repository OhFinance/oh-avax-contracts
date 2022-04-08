// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusCompounderStorage {
    function ptp() external view returns (address);

    function vePtp() external view returns (address);

    function pool() external view returns (address);

    function masterPlatypusV2() external view returns (address);

    function boostPercentage() external view returns (uint256);

}