// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IPlatypusStrategyStorage} from "../../interfaces/strategies/platypus/IPlatypusStrategyStorage.sol";

contract OhPlatypusStrategyStorage is Initializable, OhUpgradeable, IPlatypusStrategyStorage {
    bytes32 internal constant _POOL_SLOT = 0x087162820cd41f74e5dfbf536ebb3384d255d7dbb317da9948903f6ef0a5339b;
    bytes32 internal constant _MASTER_PLATYPUS_V2_SLOT = 0x5371a0130950f29ceb2bf8fd54b843d4ec9ccd61b2d4b32e8bcc15c1116aa4e2;
    bytes32 internal constant _VE_PTP_SLOT = 0x99406d6c092e0fd60949123b1a9c1c7d882713757c43b3d0a8757da763cc5eb6;
    bytes32 internal constant _INDEX_SLOT = 0x3694b3ac6fe13948edf45a2cd459f4303fcbf12b11f22dd6fb7dacff87f82143;
    bytes32 internal constant _INVESTED_SLOT = 0xbc2dbae479ce2fcaf581d093dc4c7cee0f450700f4f4f147359874bb17f1f8b7;

    constructor() {
        assert(_POOL_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.pool")) - 1));
        assert(_MASTER_PLATYPUS_V2_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.masterplatypusv2")) - 1));
        assert(_VE_PTP_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.veptp")) - 1));
        assert(_INDEX_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.index")) - 1));
        assert(_INVESTED_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.invested")) - 1));
    }

    function initializePlatypusStorage(
        address pool_,
        address masterPLatypusV2_,
        address vePtp_,
        uint256 index_
    ) internal initializer {
        _setPool(pool_);
        _setMasterPlatypusV2(masterPLatypusV2_);
        _setVePtp(vePtp_);
        _setIndex(index_);
        setInvested(0);
    }

    function pool() public view override returns (address) {
        return getAddress(_POOL_SLOT);
    }

    function masterPlatypusV2() public view override returns(address) {
        return getAddress(_MASTER_PLATYPUS_V2_SLOT);
    }

    function vePtp() public view override returns (address) {
        return getAddress(_VE_PTP_SLOT);
    }

    function index() public view override returns (uint256) {
        return getUInt256(_INDEX_SLOT);
    }

    function invested() public view override returns (uint256) {
        return getUInt256(_INVESTED_SLOT);
    }

    function _setPool(address pool_) internal {
        setAddress(_POOL_SLOT, pool_);
    }

    function _setMasterPlatypusV2(address masterPlatypusV2_) internal {
        setAddress(_MASTER_PLATYPUS_V2_SLOT, masterPlatypusV2_);
    }

    function _setVePtp(address vePtp_) internal {
        setAddress(_VE_PTP_SLOT, vePtp_);
    }

    function _setIndex(uint256 index_) internal {
        setUInt256(_INDEX_SLOT, index_);
    }

    function setInvested(uint256 invested_) public override {
        setUInt256(_INVESTED_SLOT, invested_);
    }
}
