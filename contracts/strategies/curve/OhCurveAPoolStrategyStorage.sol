// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {ICurveAPoolStrategyStorage} from "../../interfaces/strategies/curve/ICurveAPoolStrategyStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhCurveAPoolStrategyStorage is Initializable, OhUpgradeable, ICurveAPoolStrategyStorage {
    bytes32 internal constant _SECONDARY_REWARD_SLOT = 0x5998c690f9a1844257ca5c21cb39f78d4bbd2eae05acb65890e299ab4a7bfa4f;
    bytes32 internal constant _POOL_SLOT = 0x330f10e3036378592f49e68634d0df63784e4e3fc8e020d4b867b13c5238eba4;
    bytes32 internal constant _GAUGE_SLOT = 0x42abdd437833f719b2143194014e248a0b88732beec95d86e79864eea92009b2;
    bytes32 internal constant _INDEX_SLOT = 0xb6b51a75a44d9b0046bc08b5d45e10870e79dec03d49ff1beeb7491b35bfe32f;

    constructor() {
        assert(_SECONDARY_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.curveAPoolStrategy.secondaryReward")) - 1));
        assert(_POOL_SLOT == bytes32(uint256(keccak256("eip1967.curveAPoolStrategy.pool")) - 1));
        assert(_GAUGE_SLOT == bytes32(uint256(keccak256("eip1967.curveAPoolStrategy.gauge")) - 1));
        assert(_INDEX_SLOT == bytes32(uint256(keccak256("eip1967.curveAPoolStrategy.index")) - 1));
    }

    function initializeCurveAPoolStorage(
        address secondaryReward_,
        address pool_,
        address gauge_,
        uint256 index_
    ) internal initializer {
        _setSecondaryReward(secondaryReward_);
        _setPool(pool_);
        _setGauge(gauge_);
        _setIndex(index_);
    }

    function secondaryReward() public view override returns (address) {
        return getAddress(_SECONDARY_REWARD_SLOT);
    }

    function pool() public view override returns (address) {
        return getAddress(_POOL_SLOT);
    }

    function gauge() public view override returns (address) {
        return getAddress(_GAUGE_SLOT);
    }

    function index() public view override returns (uint256) {
        return getUInt256(_INDEX_SLOT);
    }

    function _setSecondaryReward(address secondaryReward_) internal {
        setAddress(_SECONDARY_REWARD_SLOT, secondaryReward_);
    }

    function _setPool(address pool_) internal {
        setAddress(_POOL_SLOT, pool_);
    }

    function _setGauge(address gauge_) internal {
        setAddress(_GAUGE_SLOT, gauge_);
    }

    function _setIndex(uint256 index_) internal {
        setUInt256(_INDEX_SLOT, index_);
    }
}
