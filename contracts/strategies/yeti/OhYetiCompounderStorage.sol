// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IYetiCompounderStorage} from "../../interfaces/strategies/yeti/IYetiCompounderStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhYetiCompounderStorage is Initializable, OhUpgradeable, IYetiCompounderStorage {
    bytes32 internal constant _YETI_SLOT = 0x3f6dc11b5e4ef53289fde3761e1fd7b11049baab5e02e7fdf908b4adb01c3b1a;
    bytes32 internal constant _CRV_YUSD_POOL_SLOT = 0x88ca2342a3fc4afcb04cc6b080cd7f652518b33711d6fbe85dde191d0a1baf70;
    bytes32 internal constant _LP_FARM_POOL_SLOT = 0xea323f0ac8df69a706b3de501a3f849cff16e6c65609d8b710622373d4c6de5d;
    bytes32 internal constant _VE_YETI_SLOT = 0x87e10c3bfa4acbda13d0ae7794caaa1f028a0bfae02e2a0b4d3830358ce76879;
    bytes32 internal constant _VE_YETI_EMISSIONS_SLOT = 0x6bea31947bedc4a2e37dfa588b5e0e8124d998e5bef2554c2f592ef5aedbbe10;
    bytes32 internal constant _BOOST_PERCENTAGE_SLOT = 0x1714a43197ea524f54896fb818ec51b1a2eb1f525eb3e65a1615fb44daba9432;
    bytes32 internal constant _USDC_BALANCE_SLOT = 0x16ea6ab2a4b5e0da286e9200f27cf8deddcaba859708957b63f1a46243479d0a;
    bytes32 internal constant _USDT_BALANCE_SLOT = 0x62cb3c717ea5c73d19bbcdaeb0c7ea0b32d5754621c670c03c9605f456b97484;

    constructor() {
        assert(_YETI_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.yeti")) - 1));
        assert(_CRV_YUSD_POOL_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.crvyusdpool")) - 1));
        assert(_LP_FARM_POOL_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.lpfarmpool")) - 1));
        assert(_VE_YETI_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.veyeti")) - 1));
        assert(_VE_YETI_EMISSIONS_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.veyetiemissions")) - 1));
        assert(_BOOST_PERCENTAGE_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.boostpercentage")) - 1));
        assert(_USDC_BALANCE_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.usdcbalance")) - 1));
        assert(_USDT_BALANCE_SLOT == bytes32(uint256(keccak256("eip1967.yetiStrategy.usdtbalance")) - 1));
    }

    function initializeYetiCompounderStorage(
        address yeti_,
        address crvYusdPool_,
        address lpFarmPool_,
        address veYeti_,
        address veYetiEmissions_,
        uint256 boostPercentage_
    ) internal initializer {
        _setYeti(yeti_);
        _setCrvYusdPool(crvYusdPool_);
        _setLpFarmPool(lpFarmPool_);
        _setVeYeti(veYeti_);
        _setVeYetiEmissions(veYetiEmissions_);
        _setBoostPercentage(boostPercentage_);
        _setUsdcBalance(0);
        _setUsdtBalance(0);
    }

    function yeti() public view override returns (address) {
        return getAddress(_YETI_SLOT);
    }

    function crvYusdPool() public view override returns (address) {
        return getAddress(_CRV_YUSD_POOL_SLOT);
    }

    function lpFarmPool() public view override returns (address) {
        return getAddress(_LP_FARM_POOL_SLOT);
    }

    function veYeti() public view override returns (address) {
        return getAddress(_VE_YETI_SLOT);
    }

    function veYetiEmissions() public view override returns (address) {
        return getAddress(_VE_YETI_EMISSIONS_SLOT);
    }

    function boostPercentage() public view override returns (uint256) {
        return getUInt256(_BOOST_PERCENTAGE_SLOT);
    }

    function usdcBalance() public view override returns (uint256) {
        return getUInt256(_USDC_BALANCE_SLOT);
    }

    function usdtBalance() public view override returns (uint256) {
        return getUInt256(_USDT_BALANCE_SLOT);
    }

    function _setYeti(address yeti_) internal {
        setAddress(_YETI_SLOT, yeti_);
    }

    function _setCrvYusdPool(address crvYusdPool_) internal {
        setAddress(_CRV_YUSD_POOL_SLOT, crvYusdPool_);
    }

    function _setLpFarmPool(address lpFarmPool_) internal {
        setAddress(_LP_FARM_POOL_SLOT, lpFarmPool_);
    }

    function _setVeYeti(address veYeti_) internal {
        setAddress(_VE_YETI_SLOT, veYeti_);
    }

    function _setVeYetiEmissions(address veYetiEmissions_) internal {
        setAddress(_VE_YETI_EMISSIONS_SLOT, veYetiEmissions_);
    }

    function _setBoostPercentage(uint256 boostPercentage_) internal {
        setUInt256(_BOOST_PERCENTAGE_SLOT, boostPercentage_);
    }

    function _setUsdcBalance(uint256 usdcBalance_) internal {
        setUInt256(_USDC_BALANCE_SLOT, usdcBalance_);
    }

    function _setUsdtBalance(uint256 usdtBalance_) internal {
        setUInt256(_USDT_BALANCE_SLOT, usdtBalance_);
    }
}
