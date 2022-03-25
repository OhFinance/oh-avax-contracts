// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IPtpPool {
    function deposit(address token, uint256 amount, address to, uint256 deadline) external returns (uint256);

    function withdraw(address token, uint256 liquidity, uint256 minimumAmount, address to, uint256 deadline) external returns (uint256);

    function quotePotentialWithdraw(address token, uint256 liquidity) external returns (uint256,uint256,bool);
    
    function swap(address fromToken, address toToken, uint256 fromAmount, uint256 minimumToAmount, address to, uint256 deadline) external returns(uint256,uint256);
}