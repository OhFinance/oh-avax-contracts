// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAvalancheBankerJoeFoldingStrategyStorage {
    function joetroller() external view returns (address);

    function folds() external view returns (uint256);

    function collateralFactorNumerator() external view returns (uint256);

    function collateralFactorDenominator() external view returns (uint256);

    function suppliedUnderlying() external view returns (uint256);

    function setSuppliedUnderlying(uint256 suppliedUnderlying_) external;

    function borrowedUnderlying() external view returns (uint256);

    function setBorrowedUnderlying(uint256 borrowedUnderlying_) external;
}