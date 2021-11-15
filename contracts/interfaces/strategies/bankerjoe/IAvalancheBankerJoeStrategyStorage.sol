// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheBankerJoeStrategyStorage {
    function secondaryReward() external view returns (address);

    function joetroller() external view returns (address);
}
