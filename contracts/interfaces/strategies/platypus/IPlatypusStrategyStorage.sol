// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusStrategyStorage {
    function platypusCompounder() external view returns (address);

    function index() external view returns (uint256);
}
