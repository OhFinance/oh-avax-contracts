// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IPlatypusStrategyStorage} from "../../interfaces/strategies/platypus/IPlatypusStrategyStorage.sol";

contract OhPlatypusStrategyStorage is Initializable, OhUpgradeable, IPlatypusStrategyStorage {
    bytes32 internal constant _PLATYPUS_COMPOUNDER_SLOT = 0xef8342acc10ebd981f55bff9b7420f594a2578223e0d3218aecc760a9abcda05;
    bytes32 internal constant _INDEX_SLOT = 0x3694b3ac6fe13948edf45a2cd459f4303fcbf12b11f22dd6fb7dacff87f82143;

    constructor() {
        assert(_PLATYPUS_COMPOUNDER_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.platypusCompounder")) - 1));
        assert(_INDEX_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.index")) - 1));
    }

    function initializePlatypusStorage(
        address platypusCompounder_,
        uint256 index_
    ) internal initializer {
        _setPlatypusCompounder(platypusCompounder_);
        _setIndex(index_);
    }

    function platypusCompounder() public view override returns (address) {
        return getAddress(_PLATYPUS_COMPOUNDER_SLOT);
    }

    function index() public view override returns (uint256) {
        return getUInt256(_INDEX_SLOT);
    }

    function _setPlatypusCompounder(address platypusCompounder_) internal {
        setAddress(_PLATYPUS_COMPOUNDER_SLOT, platypusCompounder_);
    }

    function _setIndex(uint256 index_) internal {
        setUInt256(_INDEX_SLOT, index_);
    }
}
