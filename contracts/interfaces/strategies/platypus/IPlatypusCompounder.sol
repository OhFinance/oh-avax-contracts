// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IPlatypusCompounder {
    function lpTokenBalance(address lpToken) external view returns (uint256);

    function addLiquidity(address pool, address underlying, address sender, uint256 amount) external;

    function removeLiquidity(address pool, address lpToken, address underlying, address recipient, uint256 amount, uint256 minAmount) external returns (uint256);

    function stake(address masterPlatypus, address lpToken, uint256 index) external;

    function unstake(address masterPlatypus, uint256 amount, uint256 index) external;

    function claimPtp(address masterPlatypus, uint256 index) external;

    function depositPtpForBoost(uint256 amount, address vePtp) external;

    function withdrawPtpForBoost(uint256 amount, address vePtp) external;

    function claimVePtp(address vePtp) external;
}