// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IStrategy} from "@ohfinance/oh-contracts/contracts/interfaces/strategies/IStrategy.sol";
import {OhStrategy} from "@ohfinance/oh-contracts/contracts/strategies/OhStrategy.sol";

import "../../interfaces/strategies/aave/IIncentivesController.sol";
import "../../interfaces/strategies/aave/ILendingPool.sol";
import "../../interfaces/IPair.sol";
import "../../interfaces/IWAVAX.sol";

contract OhAvalancheAaveV3Strategy is IStrategy, OhStrategy, Ownable {
    using SafeMath for uint256;

    IAaveIncentivesController private rewardController;
    ILendingPool private tokenDelegator;
    IPair private swapPairToken;
    IWAVAX private constant WAVAX = IWAVAX(0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7);
    uint256 private leverageLevel;
    uint256 private safetyFactor;
    uint256 private leverageBips;
    uint256 private minMinting;
    address private avToken;
    address private avDebtToken;

    string private name;
    IERC20 private depositToken;
    IERC20 private rewardToken;

    event Reinvest(uint256 amount);
    event Deposit(address depositer, uint256 amount);
    event Withdraw(address beneficiary, uint256 amount);

    constructor(
        string memory _name,
        address _rewardController,
        address _tokenDelegator,
        address _depositToken,
        address _swapPairToken,
        address _avToken,
        address _avDebtToken,
        uint256 _leverageLevel,
        uint256 _safetyFactor,
        uint256 _leverageBips,
        uint256 _minMinting
    ) {
        name = _name;
        rewardController = IAaveIncentivesController(_rewardController);
        tokenDelegator = ILendingPool(_tokenDelegator);
        rewardToken = IERC20(address(WAVAX));
        _updateLeverage(_leverageLevel, _safetyFactor, _minMinting, _leverageBips);
        depositToken = IERC20(_depositToken);
        avToken = _avToken;
        avDebtToken = _avDebtToken;

        assignSwapPairSafely(_swapPairToken);
        setAllowances();

        emit Reinvest(0);
    }

    function assignSwapPairSafely(address _swapPairToken) private {
        require(_swapPairToken > address(0), "Swap pair is necessary but not supplied");
        swapPairToken = IPair(_swapPairToken);
        require(
            isPairEquals(swapPairToken, depositToken, rewardToken) || isPairEquals(swapPairToken, rewardToken, depositToken),
            "Swap pair does not match depositToken and rewardToken."
        );
    }

    function isPairEquals(
        IPair pair,
        IERC20 left,
        IERC20 right
    ) private view returns (bool) {
        return pair.token0() == address(left) && pair.token1() == address(right);
    }

    /// @notice Internal method to get account state
    /// @dev Values provided in 1e18 (WAD) instead of 1e27 (RAY)
    function _getAccountData()
        internal
        view
        returns (
            uint256 balance,
            uint256 borrowed,
            uint256 borrowable
        )
    {
        balance = IERC20(avToken).balanceOf(address(this));
        borrowed = IERC20(avDebtToken).balanceOf(address(this));
        borrowable = 0;
        if (balance.mul(leverageLevel.sub(leverageBips)).div(leverageLevel) > borrowed) {
            borrowable = balance.mul(leverageLevel.sub(leverageBips)).div(leverageLevel).sub(borrowed);
        }
    }

    function investedBalance() public view override returns (uint256) {
        (uint256 balance, uint256 borrowed, ) = _getAccountData();
        return balance.sub(borrowed);
    }

    function _updateLeverage(
        uint256 _leverageLevel,
        uint256 _safetyFactor,
        uint256 _minMinting,
        uint256 _leverageBips
    ) internal {
        leverageLevel = _leverageLevel;
        leverageBips = _leverageBips;
        safetyFactor = _safetyFactor;
        minMinting = _minMinting;
    }

    function updateLeverage(
        uint256 _leverageLevel,
        uint256 _safetyFactor,
        uint256 _minMinting,
        uint256 _leverageBips
    ) external onlyOwner {
        _updateLeverage(_leverageLevel, _safetyFactor, _minMinting, _leverageBips);
        (uint256 balance, uint256 borrowed, ) = _getAccountData();
        _unrollDebt(balance.sub(borrowed));
        _rollupDebt();
    }

    function setAllowances() public onlyOwner {
        IERC20(depositToken).approve(address(tokenDelegator), type(uint256).max);
        IERC20(avToken).approve(address(tokenDelegator), type(uint256).max);
    }

    function invest() external override {
        // TODO: implement
    }
    function deposit(uint256 amount) external {
        _deposit(msg.sender, amount);
    }

    function depositFor(address account, uint256 amount) external {
        _deposit(account, amount);
    }

    function _deposit(address account, uint256 amount) private {
        require(depositToken.transferFrom(account, address(this), amount), "OhAvalancheAaveV3Strategy::transfer failed");
        _stakeDepositTokens(amount);
        emit Deposit(account, amount);
    }

    function withdraw(uint256 amount) external override returns (uint256) {
        uint256 withdrawnAmount = _withdrawDepositTokens(amount);
        _safeTransfer(address(depositToken), msg.sender, withdrawnAmount);
        emit Withdraw(msg.sender, withdrawnAmount);
        return withdrawnAmount;
    }

    function withdrawAll() external override {
        // TODO: implement!
    }

    function _withdrawDepositTokens(uint256 amount) private returns (uint256) {
        _unrollDebt(amount);
        (uint256 balance, , ) = _getAccountData();
        amount = amount > balance ? type(uint256).max : amount;
        uint256 withdrawn = tokenDelegator.withdraw(address(depositToken), amount, address(this));
        _rollupDebt();
        return withdrawn;
    }

    function reinvest() external onlyOwner {
        uint256 avaxRewards = _checkRewards();
        _reinvest(avaxRewards);
    }

    /**
     * @notice Reinvest rewards from staking contract to deposit tokens
     * @dev Reverts if the expected amount of tokens are not returned from `stakingContract`
     * @param amount deposit tokens to reinvest
     */
    function _reinvest(uint256 amount) private {
        address[] memory assets = new address[](2);
        assets[0] = avToken;
        assets[1] = avDebtToken;
        rewardController.claimRewards(assets, amount, address(this));

        // TODO: update DexLibrary to other
        // uint256 depositTokenAmount = DexLibrary.swap(
        //     amount,
        //     address(rewardToken),
        //     address(depositToken),
        //     swapPairToken
        // );
        // _stakeDepositTokens(depositTokenAmount);

        emit Reinvest(investedBalance());
    }

    function _rollupDebt() internal {
        (uint256 balance, uint256 borrowed, uint256 borrowable) = _getAccountData();
        uint256 lendTarget = balance.sub(borrowed).mul(leverageLevel.sub(safetyFactor)).div(leverageBips);
        while (balance < lendTarget) {
            if (balance.add(borrowable) > lendTarget) {
                borrowable = lendTarget.sub(balance);
            }

            if (borrowable < minMinting) {
                break;
            }

            tokenDelegator.borrow(
                address(depositToken),
                borrowable,
                2, // variable interest model
                0,
                address(this)
            );

            tokenDelegator.deposit(address(depositToken), borrowable, address(this), 0);
            (balance, borrowed, borrowable) = _getAccountData();
        }
    }

    function _getRedeemable(
        uint256 balance,
        uint256 borrowed,
        uint256 threshold
    ) internal pure returns (uint256) {
        return balance.sub(borrowed).mul(1e18).sub(borrowed.mul(13).div(10).mul(1e18).div(threshold).div(100000)).div(1e18);
    }

    function _unrollDebt(uint256 amountToFreeUp) internal {
        (uint256 balance, uint256 borrowed, uint256 borrowable) = _getAccountData();
        uint256 targetBorrow = balance.sub(borrowed).sub(amountToFreeUp).mul(leverageLevel.sub(safetyFactor)).div(leverageBips).sub(
            balance.sub(borrowed).sub(amountToFreeUp)
        );
        uint256 toRepay = borrowed.sub(targetBorrow);

        while (toRepay > 0) {
            uint256 unrollAmount = borrowable;
            if (unrollAmount > borrowed) {
                unrollAmount = borrowed;
            }
            tokenDelegator.withdraw(address(depositToken), unrollAmount, address(this));
            tokenDelegator.repay(address(depositToken), unrollAmount, 2, address(this));
            (balance, borrowed, borrowable) = _getAccountData();
            if (targetBorrow >= borrowed) {
                break;
            }
            toRepay = borrowed.sub(targetBorrow);
        }
    }

    function _stakeDepositTokens(uint256 amount) private {
        require(amount > 0, "OhAvalancheAaveV3Strategy::_stakeDepositTokens");
        tokenDelegator.deposit(address(depositToken), amount, address(this), 0);
        _rollupDebt();
    }

    /**
     * @notice Safely transfer using an anonymosu ERC20 token
     * @dev Requires token to return true on transfer
     * @param token address
     * @param to recipient address
     * @param value amount
     */
    function _safeTransfer(
        address token,
        address to,
        uint256 value
    ) private {
        require(IERC20(token).transfer(to, value), "OhAvalancheAaveV3Strategy::TRANSFER_FROM_FAILED");
    }

    function _checkRewards() internal view returns (uint256 avaxAmount) {
        address[] memory assets = new address[](2);
        assets[0] = avToken;
        assets[1] = avDebtToken;
        return rewardController.getRewardsBalance(assets, address(this));
    }

    function checkReward() public view returns (uint256) {
        return _checkRewards();
    }

    function getActualLeverage() public view returns (uint256) {
        (uint256 balance, uint256 borrowed, ) = _getAccountData();
        return balance.mul(1e18).div(balance.sub(borrowed));
    }

    function rescueDeployedFunds(uint256 minReturnAmountAccepted) external onlyOwner {
        uint256 balanceBefore = depositToken.balanceOf(address(this));
        (uint256 balance, uint256 borrowed, ) = _getAccountData();
        _unrollDebt(balance.sub(borrowed));
        tokenDelegator.withdraw(address(depositToken), type(uint256).max, address(this));
        uint256 balanceAfter = depositToken.balanceOf(address(this));
        require(balanceAfter.sub(balanceBefore) >= minReturnAmountAccepted, "OhAvalancheAaveV3Strategy::rescueDeployedFunds");
        emit Reinvest(investedBalance());
    }
}
