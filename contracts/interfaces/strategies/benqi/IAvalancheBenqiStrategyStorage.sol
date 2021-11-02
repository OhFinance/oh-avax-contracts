// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheBenqiStrategyStorage {
    function extraReward() external view returns (address);
    
    function comptroller() external view returns (address);
}
