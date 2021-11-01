import {expect} from 'chai';
import {formatUnits, parseEther} from '@ethersproject/units';
import {deployments, ethers, getNamedAccounts} from 'hardhat';
import { OhManager, OhBank, OhUpgradeableProxy } from '@ohfinance/oh-contracts/types';
import { OhAvalancheAaveV2Strategy } from '../../../types'

describe('OhAvalancheAaveV2Strategy', function () {

  before(async function () {
    await deployments.fixture(["OhUsdceBank", "OhUsdceAaveV2Strategy"])

    const { deployer, worker } = await getNamedAccounts();
    const manager = await ethers.getContract('OhManager', deployer) as OhManager
    const bank = await ethers.getContract('OhUsdceBank', deployer) as OhBank
    const aaveV2Strategy = await ethers.getContract('OhUsdceAaveV2Strategy', deployer)

    // fixture = await setupBankTest();
    // const {worker, deployer} = fixture;
    // const {manager, bank, aaveV2Strategy} = deployer;

    // const addresses = await getNamedAccounts();
    // usdc = await getErc20At(addresses.usdc, worker.address);

    await manager.setBank(bank.address, true);
    await manager.setStrategy(bank.address, aaveV2Strategy.address, true);

    // // Buy USDC using the worker wallet
    // await swapEthForTokens(worker.address, addresses.usdc, parseEther('100'));

    // // Check USDC balance and approve spending
    // startingBalance = await usdc.balanceOf(worker.address);
    // console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    // await usdc.approve(bank.address, startingBalance);
  });

  it('deployed and initialized Avalance AaveV2 USDC.e Strategy proxy correctly', async function () {
    const {deployer, aaveUsdce, aaveLendingPool, aaveIncentivesController, usdce, wavax} =
      await getNamedAccounts();
    const bank = await ethers.getContract('OhUsdceBank', deployer)
    const aaveV2StrategyProxy = await ethers.getContract("OhUsdceAaveV2Strategy", deployer) as OhUpgradeableProxy
    const aaveV2Strategy = await ethers.getContractAt('OhAvalancheAaveV2Strategy', aaveV2StrategyProxy.address, deployer) as OhAvalancheAaveV2Strategy

    const aaveV2StrategyBank = await aaveV2Strategy.bank();
    const underlying = await aaveV2Strategy.underlying();
    const derivative = await aaveV2Strategy.derivative();
    const reward = await aaveV2Strategy.reward();
    const lendingPool = await aaveV2Strategy.lendingPool();
    const incentivesController = await aaveV2Strategy.incentivesController();

    expect(aaveV2StrategyBank).eq(bank.address);
    expect(underlying).eq(usdce);
    expect(derivative).eq(aaveUsdce);
    expect(reward).eq(wavax);
    expect(lendingPool).eq(aaveLendingPool);
    expect(incentivesController).eq(aaveIncentivesController);
  });

  it('finances and deposits into AaveV2');
  // async function () {
    // const {worker} = fixture;
    // const {manager, bank} = worker;

    // // Deposit the USDC in the Bank
    // await bank.deposit(startingBalance);
    // const bankBalance = await bank.underlyingBalance();

    // // Check that tha Bank now has proper amount of USDC deposited
    // expect(bankBalance).to.be.eq(startingBalance);

    // // Invest the initial USDC into the strategy
    // await manager.finance(bank.address);

    // const strategyBalance = await bank.strategyBalance(0);
    // console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect(strategyBalance).to.be.gt(0);
  // });
});
