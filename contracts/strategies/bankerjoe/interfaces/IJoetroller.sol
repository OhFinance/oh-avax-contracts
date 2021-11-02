// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IJoetroller {
    function getAccountLiquidity(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function getHypotheticalAccountLiquidity(
        address account,
        address JTokenModify,
        uint256 redeemTokens,
        uint256 borrowAmount
    )
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function claimReward(uint8 rewardType, address holder) external;

    function enterMarkets(address[] calldata JTokens) external returns (uint256[] memory);

    function exitMarket(address JToken) external returns (uint256);
}
