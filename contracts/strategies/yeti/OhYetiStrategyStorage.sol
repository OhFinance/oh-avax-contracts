// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IYetiStrategyStorage} from "../../interfaces/strategies/yeti/IYetiStrategyStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhYetiStrategyStorage is Initializable, OhUpgradeable, IYetiStrategyStorage {
    bytes32 internal constant _YETI_COMPOUNDER_SLOT = 0xf465d0e6bfeb414a859e0f63d07ebd9fc3653a7e1808781de1f7597814baff26;
    bytes32 internal constant _JOETROLLER_SLOT = 0x5f172def326e0b7f354ba662373397751191c85745f32260985fa9226277cbea;
    bytes32 internal constant _INDEX_SLOT = 0x8e1776b4204d8b31881bd2b59f1810f5fe91a50b1435fbae179963c576704453;

    constructor() {
        assert(_YETI_COMPOUNDER_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.yeticompounder")) - 1));
        assert(_JOETROLLER_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.joetroller")) - 1));
        assert(_INDEX_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.index")) - 1));
    }

    function initializeYetiStorage(
        address yetiCompounder_,
        address joetroller_,
        uint256 index_
    ) internal initializer {
        _setYetiCompounder(yetiCompounder_);
        _setJoetroller(joetroller_);
        _setIndex(index_);
    }

    function yetiCompounder() public view override returns (address) {
        return getAddress(_YETI_COMPOUNDER_SLOT);
    }

    function joetroller() public view override returns (address) {
        return getAddress(_JOETROLLER_SLOT);
    }

    function index() public view override returns (uint256) {
        return getUInt256(_INDEX_SLOT);
    }

    function _setYetiCompounder(address yetiCompounder_) internal {
        setAddress(_YETI_COMPOUNDER_SLOT, yetiCompounder_);
    }

    function _setJoetroller(address joetroller_) internal {
        setAddress(_JOETROLLER_SLOT, joetroller_);
    }

    function _setIndex(uint256 index_) internal {
        setUInt256(_INDEX_SLOT, index_);
    }
}
