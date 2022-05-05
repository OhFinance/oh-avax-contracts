// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IYetiCompounderStorage {
    function yeti() external view returns (address);

    function crvYusdPool() external view returns (address);

    function lpFarmPool() external view returns (address);
    
    function veYeti() external view returns (address);

    function veYetiEmissions() external view returns (address);

    function boostPercentage() external view returns (uint256);

    function usdcBalance() external view returns (uint256);

    function usdtBalance() external view returns (uint256);
}