// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusCompounderStorage {
    function boostPercentage() external view returns (uint256);

    function loanPercentage() external view returns (uint256);

    function setBoostPercentage(uint256 boostPercentage_) external;

    function setLoanPercentage(uint256 loanPercentage_) external;
}