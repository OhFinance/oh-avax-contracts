// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IcrUSDCToken {
    function exchangeRateStored() external view returns (uint256);
}