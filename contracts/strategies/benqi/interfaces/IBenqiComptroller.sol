// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IBenqiComptroller {
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
        address qiTokenModify,
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

    // function claimReward(uint8 rewardType, address holder, address[] memory qiTokens) external;

    function enterMarkets(address[] calldata qiTokens) external returns (uint256[] memory);

    function exitMarket(address qiToken) external returns (uint256);
}
