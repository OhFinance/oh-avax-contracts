// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusCompounder {
    function investedBalance(uint256 pid, address lpToken) external view returns (uint256);

    function addLiquidity(address underlying, uint256 amount) external;

    function removeLiquidity(address lpToken, address underlying, address recipient, uint256 amount, uint256 minAmount) external returns (uint256);

    function stake(address lpToken, uint256 index) external;

    function unstake(uint256 amount, uint256 index) external;

    function claimPtp(uint256 index) external;

    function depositPtpForBoost() external;

    function withdrawPtpForBoost(uint256 amount) external;

    function claimVePtp() external;
}