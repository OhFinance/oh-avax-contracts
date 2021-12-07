// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheAlphaHomoraV2StrategyStorage {
    function secondaryReward() external view returns (address);

    function creamUSDCeToken() external view returns (address);

    function safeBox() external view returns (address);
}