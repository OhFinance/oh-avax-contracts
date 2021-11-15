// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheBenqiStrategyStorage {
    function secondaryReward() external view returns (address);
    
    function comptroller() external view returns (address);
}
