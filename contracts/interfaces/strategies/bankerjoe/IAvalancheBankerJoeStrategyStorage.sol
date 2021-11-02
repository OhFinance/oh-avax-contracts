// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheBankerJoeStrategyStorage {
    function joetroller() external view returns (address);
    function extraReward() external view returns (address);
}
