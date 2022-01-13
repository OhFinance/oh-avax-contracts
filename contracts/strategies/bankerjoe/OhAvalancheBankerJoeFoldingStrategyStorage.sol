// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import {IAvalancheBankerJoeFoldingStrategyStorage} from "../../interfaces/strategies/bankerjoe/IAvalancheBankerJoeFoldingStrategyStorage.sol";
import {OhUpgradeable} from "@ohfinance/oh-contracts/contracts/proxy/OhUpgradeable.sol";

contract OhAvalancheBankerJoeFoldingStrategyStorage is Initializable, OhUpgradeable, IAvalancheBankerJoeFoldingStrategyStorage {
    bytes32 internal constant _SECONDARY_REWARD_SLOT = 0xe92764c73743fa82af30af57881d71cb3552bcab7db5413e39640bec7888368e;
    bytes32 internal constant _JOETROLLER_SLOT = 0xa8500b33177885436fffd1cad82f3d2505b0c5599689e0cc7ddc3cd69e835a0a;
    bytes32 internal constant _FOLDS = 0x3f7ee994563fc1c4ce9783c52305490733b6dbde7985bc669d8320bf0782dda8;
    bytes32 internal constant _COLLATERAL_FACTOR = 0xd0637784b71c719bba82dcdf8faa54186e4b319a889f085ee2cfe76b7d2325f8;
    bytes32 internal constant _COLLATERAL_FACTOR_NUMERATOR = 0x2583c2fe9a19a2c5d372d3844edcdcb06f04785322744fde694dc2cf87b09907;
    bytes32 internal constant _COLLATERAL_FACTOR_DENOMINATOR = 0x89897de7bf54873cd4b26bf44ee19d24f2bf9ea7480517440d5f2213ec2770d8;
    bytes32 internal constant _SUPPLIED_UNDERLYING = 0x142313439ce87f0d58e0f7d4947bc31c1124d9fab1eec74dc028983fec37c48a;
    bytes32 internal constant _BORROWED_UNDERLYING = 0x24d7357e790aaef7672d5161e8993dbbae37ca571a36629afb4d93cdff80bf36;

    constructor() {
        assert(_SECONDARY_REWARD_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.secondaryReward")) - 1));
        assert(_JOETROLLER_SLOT == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.joetroller")) - 1));
        assert(_FOLDS == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.folds")) - 1));
        assert(_COLLATERAL_FACTOR == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.collateralFactor")) - 1));
        assert(_COLLATERAL_FACTOR_NUMERATOR == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.collateralFactorNumerator")) - 1));
        assert(_COLLATERAL_FACTOR_DENOMINATOR == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.collateralFactorDenominator")) - 1));
        assert(_SUPPLIED_UNDERLYING == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.suppliedUnderlying")) - 1));
        assert(_BORROWED_UNDERLYING == bytes32(uint256(keccak256("eip1967.bankerjoeFoldingStrategy.borrowedUnderlying")) - 1));
    }

    function initializeBankerJoeFoldingStorage(
        address secondaryReward_,
        address joetroller_,
        uint256 folds_,
        uint256 collateralFactorNumerator_,
        uint256 collateralFactorDenominator_) internal initializer {
        _setSecondaryReward(secondaryReward_);
        _setJoetroller(joetroller_);
        _setFolds(folds_);
        _setCollateralFactorNumerator(collateralFactorNumerator_);
        _setCollateralFactorDenominator(collateralFactorDenominator_);
        setSuppliedUnderlying(0);
        setBorrowedUnderlying(0);
    }

    function secondaryReward() public view override returns (address) {
        return getAddress(_SECONDARY_REWARD_SLOT);
    }

    function _setSecondaryReward(address secondaryReward_) internal {
        setAddress(_SECONDARY_REWARD_SLOT, secondaryReward_);
    }

    function joetroller() public view override returns (address) {
        return getAddress(_JOETROLLER_SLOT);
    }

    function _setJoetroller(address joetroller_) internal {
        setAddress(_JOETROLLER_SLOT, joetroller_);
    }

    function folds() public view override returns (uint256) {
        return getUInt256(_FOLDS);
    }

    function _setFolds(uint256 folds_) internal {
        setUInt256(_FOLDS, folds_);
    }

    function collateralFactorNumerator() public view override returns (uint256) {
        return getUInt256(_COLLATERAL_FACTOR_NUMERATOR);
    }

    function _setCollateralFactorNumerator(uint256 collateralFactorNumerator_) internal {
        setUInt256(_COLLATERAL_FACTOR_NUMERATOR, collateralFactorNumerator_);
    }

    function collateralFactorDenominator() public view override returns (uint256) {
        return getUInt256(_COLLATERAL_FACTOR_DENOMINATOR);
    }

    function _setCollateralFactorDenominator(uint256 collateralFactorDenominator_) internal {
        setUInt256(_COLLATERAL_FACTOR_DENOMINATOR, collateralFactorDenominator_);
    }

    function suppliedUnderlying() public view override returns (uint256) {
        return getUInt256(_SUPPLIED_UNDERLYING);
    }

    function setSuppliedUnderlying(uint256 suppliedUnderlying_) public override {
        setUInt256(_SUPPLIED_UNDERLYING, suppliedUnderlying_);
    }

    function borrowedUnderlying() public view override returns (uint256) {
        return getUInt256(_BORROWED_UNDERLYING);
    }

    function setBorrowedUnderlying(uint256 borrowedUnderlying_) public override {
        setUInt256(_BORROWED_UNDERLYING, borrowedUnderlying_);
    }
}
