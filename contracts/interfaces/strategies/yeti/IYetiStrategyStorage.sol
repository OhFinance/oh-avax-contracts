// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IYetiStrategyStorage {
    function yetiCompounder() external view returns (address);

    function joetroller() external view returns (address);

    function index() external view returns (uint256);
}
