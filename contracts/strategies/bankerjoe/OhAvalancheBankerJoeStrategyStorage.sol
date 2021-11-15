// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IAvalancheBankerJoeStrategyStorage} from "../../interfaces/strategies/bankerjoe/IAvalancheBankerJoeStrategyStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhAvalancheBankerJoeStrategyStorage is Initializable, OhUpgradeable, IAvalancheBankerJoeStrategyStorage {
    bytes32 internal constant _JOETROLLER_SLOT = 0x2161428b88882bba124b5a2dd4fd1884a906465a4c6e30d8494cf23a5c502d7e;
    bytes32 internal constant _SECONDARY_REWARD_SLOT = 0x9328b783ed097ac65723d6f32bd712be86a3fdbb5720b8abe2a1828d2c4a447c;

    constructor() {
        assert(_SECONDARY_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeStrategy.secondaryReward")) - 1));
        assert(_JOETROLLER_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeStrategy.joetroller")) - 1));
    }

    function initializeBankerJoeStorage(address secondaryReward_, address joetroller_) internal initializer {
        _setSecondaryReward(secondaryReward_);
        _setJoetroller(joetroller_);
    }

    function joetroller() public view override returns (address) {
        return getAddress(_JOETROLLER_SLOT);
    }

    function _setJoetroller(address joetroller_) internal {
        setAddress(_JOETROLLER_SLOT, joetroller_);
    }

    function secondaryReward() public view override returns (address) {
        return getAddress(_SECONDARY_REWARD_SLOT);
    }

    function _setSecondaryReward(address secondaryReward_) internal {
        setAddress(_SECONDARY_REWARD_SLOT, secondaryReward_);
    }
}
