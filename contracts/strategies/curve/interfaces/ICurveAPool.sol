// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface ICurveAPool {
    function calc_token_amount(uint256[3] calldata amounts, bool deposit)
        external
        view
        returns (uint256);

    function calc_withdraw_one_coin(uint256, int128) external view returns (uint256);

    function get_virtual_price() external view returns (uint256);

    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount, bool use_underlying) external;

    function remove_liquidity_imbalance(uint256[3] calldata amounts, uint256 max_burn_amount, bool use_underlying)
        external;

    function remove_liquidity(uint256 _amount, uint256[3] calldata amounts, bool use_underlying) external;

    function exchange(
        int128 from,
        int128 to,
        uint256 _from_amount,
        uint256 _min_to_amount
    ) external;
}
