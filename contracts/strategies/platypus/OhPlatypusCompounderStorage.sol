// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IPlatypusCompounderStorage} from "../../interfaces/strategies/platypus/IPlatypusCompounderStorage.sol";

contract OhPlatypusCompounderStorage is Initializable, OhUpgradeable, IPlatypusCompounderStorage {
    bytes32 internal constant _PTP_SLOT = 0x38923e0139408c50864954df1a1c75d8343439765c895a445d3602b03f3ddad8;
    bytes32 internal constant _VE_PTP_SLOT = 0x99406d6c092e0fd60949123b1a9c1c7d882713757c43b3d0a8757da763cc5eb6;
    bytes32 internal constant _POOL_SLOT = 0x087162820cd41f74e5dfbf536ebb3384d255d7dbb317da9948903f6ef0a5339b;
    bytes32 internal constant _MASTER_PLATYPUS_V2_SLOT = 0x5371a0130950f29ceb2bf8fd54b843d4ec9ccd61b2d4b32e8bcc15c1116aa4e2; 
    bytes32 internal constant _BOOST_PERCENTAGE_SLOT = 0x6352d2ffb6ca0616a12395128468054fab4199209a354e47d34ed267a0689639;

    constructor() {
        assert(_PTP_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.ptp")) - 1));
        assert(_VE_PTP_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.veptp")) - 1));
        assert(_POOL_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.pool")) - 1));
        assert(_MASTER_PLATYPUS_V2_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.masterplatypusv2")) - 1));
        assert(_BOOST_PERCENTAGE_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.boostPercentage")) - 1));
    }

    function initializePlatypusCompounderStorage(
        address ptp_,
        address vePtp_,
        address pool_,
        address masterPlatypusV2_,
        uint256 boostPercentage_
    ) internal initializer {
        _setPtp(ptp_);
        _setVePtp(vePtp_);
        _setPool(pool_);
        _setMasterPlatypusV2(masterPlatypusV2_);
        _setBoostPercentage(boostPercentage_);
    }

    function ptp() public view override returns (address) {
        return getAddress(_PTP_SLOT);
    }

    function vePtp() public view override returns (address) {
        return getAddress(_VE_PTP_SLOT);
    }

    function pool() public view override returns (address) {
        return getAddress(_POOL_SLOT);
    }

    function masterPlatypusV2() public view override returns (address) {
        return getAddress(_MASTER_PLATYPUS_V2_SLOT);
    }

    function boostPercentage() public view override returns (uint256) {
        return getUInt256(_BOOST_PERCENTAGE_SLOT);
    }

    function _setPtp(address ptp_) internal {
        setAddress(_PTP_SLOT, ptp_);
    }

    function _setVePtp(address vePtp_) internal {
        setAddress(_VE_PTP_SLOT, vePtp_);
    }

    function _setPool(address pool_) internal {
        setAddress(_POOL_SLOT, pool_);
    }
    
    function _setMasterPlatypusV2(address masterPlatypusV2_) internal {
        setAddress(_MASTER_PLATYPUS_V2_SLOT, masterPlatypusV2_);
    }

    function _setBoostPercentage(uint256 boostPercentage_) internal {
        setUInt256(_BOOST_PERCENTAGE_SLOT, boostPercentage_);
    }
}
