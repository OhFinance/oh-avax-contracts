// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";
import {IPlatypusCompounderStorage} from "../../interfaces/strategies/platypus/IPlatypusCompounderStorage.sol";

contract OhPlatypusCompounderStorage is Initializable, OhUpgradeable, IPlatypusCompounderStorage {
    bytes32 internal constant _BOOST_PERCENTAGE_SLOT = 0x6352d2ffb6ca0616a12395128468054fab4199209a354e47d34ed267a0689639;
    bytes32 internal constant _LOAN_PERCENTAGE_SLOT = 0x2ba75fdc4e90b95075234bf3d1d5943cbecf8248f14b013cacfcae23ef60abd9;    

    constructor() {
        assert(_BOOST_PERCENTAGE_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.boostPercentage")) - 1));
        assert(_LOAN_PERCENTAGE_SLOT == bytes32(uint256(keccak256("eip1967.platypusStrategy.loanPercentage")) - 1));
    }

    function initializePlatypusStorage(
        uint256 boostPercentage_,
        uint256 loanPercentage_
    ) internal initializer {
        setBoostPercentage(boostPercentage_);
        setLoanPercentage(loanPercentage_);
    }

    function boostPercentage() public view override returns (uint256) {
        return getUInt256(_BOOST_PERCENTAGE_SLOT);
    }

    function loanPercentage() public view override returns (uint256) {
        return getUInt256(_LOAN_PERCENTAGE_SLOT);
    }

    function setBoostPercentage(uint256 boostPercentage_) public override {
        setUInt256(_BOOST_PERCENTAGE_SLOT, boostPercentage_);
    }

    function setLoanPercentage(uint256 loanPercentage_) public override {
        setUInt256(_LOAN_PERCENTAGE_SLOT, loanPercentage_);
    }
}
