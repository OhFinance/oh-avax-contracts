// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IYetiCompounder {
    function investedBalance(uint256 index) external view returns (uint256);

    function addLiquidity(address underlying, uint256 index, uint256 amount, uint256 minMint) external;

    function removeLiquidity(address underlying, address recipient, uint256 index, uint256 amount, uint256 minAmount) external;

    function stake(uint256 index) external;

    function unstake(uint256 amount, uint256 index) external;

    function staked(uint256 index) external view returns (uint256);

    function claim(uint256 index) external;

    function depositYetiForBoost() external;

    function withdrawYetiForBoost(uint256 amount) external;

    function claimVePtp() external;
}