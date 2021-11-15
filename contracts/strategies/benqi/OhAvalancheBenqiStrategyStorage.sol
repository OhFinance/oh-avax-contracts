// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IAvalancheBenqiStrategyStorage} from "../../interfaces/strategies/benqi/IAvalancheBenqiStrategyStorage.sol";

contract OhAvalancheBenqiStrategyStorage is Initializable, OhUpgradeable, IAvalancheBenqiStrategyStorage {
    bytes32 internal constant _SECONDARY_REWARD_SLOT = 0x16bda68537f666a68a423fc52f9a686ea81b226a5c034d2dfb63b5b749ceb83c;
    bytes32 internal constant _COMPTROLLER_SLOT = 0x2ef367ab1438cccede22571406f238368481af421cdc06cfd765d150e76c9965;

    constructor() {
        assert(_SECONDARY_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.benqiStrategy.secondaryReward")) - 1));
        assert(_COMPTROLLER_SLOT == bytes32(uint256(keccak256("eip1967.benqiStrategy.comptroller")) - 1));
    }

    function initializeBenqiStorage(address secondaryReward_, address comptroller_) internal initializer {
        _setSecondaryReward(secondaryReward_);
        _setComptroller(comptroller_);
    }

    function secondaryReward() public view override returns (address) {
        return getAddress(_SECONDARY_REWARD_SLOT);
    }

    function _setSecondaryReward(address secondaryReward_) internal {
        setAddress(_SECONDARY_REWARD_SLOT, secondaryReward_);
    }

    function comptroller() public view override returns (address) {
        return getAddress(_COMPTROLLER_SLOT);
    }

    function _setComptroller(address comptroller_) internal {
        setAddress(_COMPTROLLER_SLOT, comptroller_);
    }
}
