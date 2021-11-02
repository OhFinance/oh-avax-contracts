// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IAvalancheBenqiStrategyStorage} from "../../interfaces/strategies/benqi/IAvalancheBenqiStrategyStorage.sol";

contract OhAvalancheBenqiStrategyStorage is Initializable, OhUpgradeable, IAvalancheBenqiStrategyStorage {
    bytes32 internal constant _EXTRA_REWARD_SLOT = 0xf2cb7633197ad5c3d2c45444a2d158a3bab1c87ccd1ead8e7d92ff6b3750217d;
    bytes32 internal constant _COMPTROLLER_SLOT = 0x2ef367ab1438cccede22571406f238368481af421cdc06cfd765d150e76c9965;

    constructor() {
        assert(_EXTRA_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.benqiStrategy.extraReward")) - 1));
        assert(_COMPTROLLER_SLOT == bytes32(uint256(keccak256("eip1967.benqiStrategy.comptroller")) - 1));
    }

    function initializeBenqiStorage(address extraReward_, address comptroller_) internal initializer {
        _setExtraReward(extraReward_);
        _setComptroller(comptroller_);
    }

    function comptroller() public view override returns (address) {
        return getAddress(_COMPTROLLER_SLOT);
    }

    function _setComptroller(address comptroller_) internal {
        setAddress(_COMPTROLLER_SLOT, comptroller_);
    }

    function extraReward() public view override returns (address) {
        return getAddress(_EXTRA_REWARD_SLOT);
    }

    function _setExtraReward(address extraReward_) internal {
        setAddress(_EXTRA_REWARD_SLOT, extraReward_);
    }
}
