import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import { getNamedAccounts} from 'hardhat';
import { approve, deposit, exit, finance, withdraw, getERC20Contract, getManagerContract } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { getAvalancheManagerContract, getUsdceBankContract, getUsdceBenqiStrategyContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupBankTest } from 'utils/fixture';
import { updateBank } from 'utils/tasks';

describe('OhAvalancheBenqiStrategy', function () {
  let startingBalance: BigNumber
  let usdceToken: IERC20

  before(async function () {
    await setupBankTest()

    const { deployer, worker, usdce } = await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    await updateBank(bank.address, [benqiStrategy.address])

    usdceToken = await getERC20Contract(worker, usdce);
    startingBalance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Avalanche Benqi USDC.e Strategy proxy correctly', async function () {
    const {deployer, benqi, benqiUsdce, benqiComptroller, usdce, wavax} =
      await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    const benqiStrategyBank = await benqiStrategy.bank();
    const underlying = await benqiStrategy.underlying();
    const derivative = await benqiStrategy.derivative();
    const reward = await benqiStrategy.reward();
    const extraReward = await benqiStrategy.extraReward();
    const comptroller = await benqiStrategy.comptroller();

    expect(benqiStrategyBank).eq(bank.address);
    expect(underlying).eq(usdce);
    expect(derivative).eq(benqiUsdce);
    expect(reward).eq(benqi);
    expect(extraReward).eq(wavax);
    expect(comptroller).eq(benqiComptroller);
  });

  it('finances and deposits into Benqi', async function () {
    const { worker } = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getAvalancheManagerContract(worker)

    // Deposit the USDC in the Bank
    await approve(worker, usdceToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);
    const bankBalance = await bank.underlyingBalance();

    // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial USDC into the strategy
    await finance(worker, manager.address, bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async function () {
    const {worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(worker)
    const bank = await getUsdceBankContract(worker)
    const benqiStrategy = await getUsdceBenqiStrategyContract(worker)

    // wait 1 day to accrue rewards (time-based)
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // finance to claim WAVAX and trigger liquidation
    const balanceBefore = await benqiStrategy.investedBalance();

    await finance(worker, manager.address, bank.address);

    const balanceAfter = await benqiStrategy.investedBalance();
    console.log('Liquidated QI for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC.e');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async function () {
    const {deployer, worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(deployer)
    const bank = await getUsdceBankContract(worker)
    const benqiStrategy = await getUsdceBenqiStrategyContract(worker)

    // Withdraw all from the strategy to the bank
    await exit(deployer, manager.address, bank.address, benqiStrategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker);
    await withdraw(worker, bank.address, shares);

    const endingBalance = await usdceToken.balanceOf(worker);
    expect(startingBalance).to.be.lt(endingBalance);

    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 6));
  });
});