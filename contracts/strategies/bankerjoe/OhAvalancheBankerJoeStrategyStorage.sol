// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IAvalancheBankerJoeStrategyStorage} from "../../interfaces/strategies/bankerjoe/IAvalancheBankerJoeStrategyStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhAvalancheBankerJoeStrategyStorage is Initializable, OhUpgradeable, IAvalancheBankerJoeStrategyStorage {
    bytes32 internal constant _JOETROLLER_SLOT = 0x2161428b88882bba124b5a2dd4fd1884a906465a4c6e30d8494cf23a5c502d7e;
    bytes32 internal constant _EXTRA_REWARD_SLOT = 0x439030740bcc4b8c94e60e9bf15b9e74cc71fa04931673ee32ca99cc75178a52;

    constructor() {
        assert(_EXTRA_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeStrategy.extraReward")) - 1));
        assert(_JOETROLLER_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeStrategy.joetroller")) - 1));
    }

    function initializeBankerJoeStorage(address extraReward_, address joetroller_) internal initializer {
        _setExtraReward(extraReward_);
        _setJoetroller(joetroller_);
    }

    function joetroller() public view override returns (address) {
        return getAddress(_JOETROLLER_SLOT);
    }

    function _setJoetroller(address joetroller_) internal {
        setAddress(_JOETROLLER_SLOT, joetroller_);
    }

    function extraReward() public view override returns (address) {
        return getAddress(_EXTRA_REWARD_SLOT);
    }

    function _setExtraReward(address extraReward_) internal {
        setAddress(_EXTRA_REWARD_SLOT, extraReward_);
    }
}
