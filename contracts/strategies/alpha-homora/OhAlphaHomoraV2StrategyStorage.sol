// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IAvalancheAlphaHomoraV2StrategyStorage} from "../../interfaces/strategies/alpha-homora/IAvalancheAlphaHomoraV2StrategyStorage.sol";

contract OhAlphaHomoraV2StrategyStorage is Initializable, OhUpgradeable, IAvalancheAlphaHomoraV2StrategyStorage {
    bytes32 internal constant _SECONDARY_REWARD_SLOT = 0xfc40feddd2ec402785b29ba05b6eed44f4e3923230f1e3fd37723c1ad4994568;
    bytes32 internal constant _SAFEBOX_SLOT = 0x64c173a9d92a9628af3aca85e581c8e5ecef29fd894ebb0b189d65966a8666a1;
    bytes32 internal constant _CREAMUSDCETOKEN_SLOT = 0xcf850a8a0343f5d7e3be556a74e900ac0ec14e17da77020f5b9d8f30a1dbf843;

    constructor() {
        assert(_SECONDARY_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.alphahomorav2Strategy.secondaryReward")) - 1));
        assert(_SAFEBOX_SLOT == bytes32(uint256(keccak256("eip1967.alphahomorav2Strategy.safebox")) - 1));
        assert(_CREAMUSDCETOKEN_SLOT == bytes32(uint256(keccak256("eip1967.alphahomorav2Strategy.creamusdcetoken")) - 1));
    }

    function initializeAlphaHomoraV2Storage(
        address secondaryReward_,
        address creamUSDCeToken_,
        address safeBox_) internal initializer {
        _setSecondaryReward(secondaryReward_);
        _setCreamUSDCeToken(creamUSDCeToken_);
        _setSafeBox(safeBox_);
    }

    function secondaryReward() public view override returns (address) {
        return getAddress(_SECONDARY_REWARD_SLOT);
    }

    function _setSecondaryReward(address secondaryReward_) internal {
        setAddress(_SECONDARY_REWARD_SLOT, secondaryReward_);
    }

    function creamUSDCeToken() public view override returns (address) {
        return getAddress(_CREAMUSDCETOKEN_SLOT);
    }

    function _setCreamUSDCeToken(address creamUSDCeToken_) internal {
        setAddress(_CREAMUSDCETOKEN_SLOT, creamUSDCeToken_);
    }

    function safeBox() public view override returns (address) {
        return getAddress(_SAFEBOX_SLOT);
    }

    function _setSafeBox(address safeBox_) internal {
        setAddress(_SAFEBOX_SLOT, safeBox_);
    }
}