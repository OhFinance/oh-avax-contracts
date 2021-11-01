// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheAaveV2StrategyStorage {
    function lendingPool() external view returns (address);

    function incentivesController() external view returns (address);
}
