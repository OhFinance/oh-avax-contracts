// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IPtpAsset {
    function balanceOf(address token) external view returns (uint256);

    function cash() external view returns (uint256);

    function liability() external view returns (uint256);

    function underlyingTokenBalance() external view returns (uint256);

    function totalSupply() external view returns (uint256);
}