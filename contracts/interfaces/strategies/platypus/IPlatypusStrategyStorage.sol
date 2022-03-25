// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusStrategyStorage {

    function pool() external view returns (address);

    function masterPlatypusV2() external view returns(address);

    function vePtp() external view returns (address);

    function index() external view returns (uint256);

    function invested() external view returns (uint256);

    function setInvested(uint256 invested_) external;
}
