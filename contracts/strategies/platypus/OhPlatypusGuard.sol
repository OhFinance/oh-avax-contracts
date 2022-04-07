// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {OhSubscriber} from "@ohfinance/oh-contracts/contracts/registry/OhSubscriber.sol";

abstract contract OhPlatypusGuard is OhSubscriber {
    using Address for address;

    // The mapping of contracts that are whitelisted for Bank use/management
    mapping(address => bool) internal whitelisted;

    /// @notice Only allow EOAs or Whitelisted contracts to interact
    /// @dev Prevents sandwich / flash loan attacks & re-entrancy
    modifier onlyPtpStrategy {
        require(msg.sender == tx.origin || whitelisted[msg.sender], "OhPlatypusGuard: Only EOA or Whitelist");
        _;
    }

    /// @notice Whitelists strategy for Bank use/management
    /// @param _contract the strategy contract
    /// @param _whitelisted the whitelisted status of the strategy
    /// @dev Only Governance can call this function
    function setWhitelisted(address _contract, bool _whitelisted) external onlyGovernance {
        require(_contract.isContract(), "OhPlatypusGuard: Not Contract");
        whitelisted[_contract] = _whitelisted;
    }
}