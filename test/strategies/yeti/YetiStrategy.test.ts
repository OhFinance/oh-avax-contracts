import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import { getNamedAccounts} from 'hardhat';
import { approve, deposit, exit, finance, withdraw, getERC20Contract, getManagerContract } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, ONE_DAY, TWO_DAYS } from '@ohfinance/oh-contracts/utils';
import { getAvalancheManagerContract, getUsdcBankContract, getUsdcYetiStrategyContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupUsdcBankTest } from 'utils/fixture';
import { updateBank } from 'utils/tasks';

describe('YetiStrategy', () => {
  let usdcToken: IERC20;
  let startingBalance: BigNumber;

  before(async () => {
    await setupUsdcBankTest();

    const { deployer, worker, usdc } = await getNamedAccounts();
    const bank = await getUsdcBankContract(deployer)
    const yetiStrategy = await getUsdcYetiStrategyContract(deployer)

    await updateBank(bank.address, [yetiStrategy.address])

    usdcToken = await getERC20Contract(worker, usdc);
    startingBalance = await usdcToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized YETI USDC Strategy proxy correctly', async () => {
    const {deployer, yeti, crvYusdPool, crvLpFarm, joetroller, usdc} =
      await getNamedAccounts();
    const bank = await getUsdcBankContract(deployer)
    const yetiStrategy = await getUsdcYetiStrategyContract(deployer)

    const crvBank = await yetiStrategy.bank();
    const underlying = await yetiStrategy.underlying();
    const derivative = await yetiStrategy.derivative();
    const reward = await yetiStrategy.reward();
    const yetiCurveLpFarm = await yetiStrategy.lpFarmPool();
    const joeComptroller = await yetiStrategy.joetroller();
    const index = await yetiStrategy.index();

    expect(crvBank).eq(bank.address);
    expect(underlying).eq(usdc);
    expect(derivative).eq(crvYusdPool);
    expect(reward).eq(yeti);
    expect(yetiCurveLpFarm).eq(crvLpFarm);
    expect(joeComptroller).eq(joetroller);
    expect(index).to.be.eq(1);
  });

  it('finances and deposits into YUSD Curve Pool', async () => {
    const { worker } = await getNamedAccounts()
    const bank = await getUsdcBankContract(worker)
    const manager = await getAvalancheManagerContract(worker)

    // Deposit the USDC.e in the Bank
    await approve(worker, usdcToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);
    const bankBalance = await bank.underlyingBalance();

    // Check that the Bank now has proper amount of USDC.e deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial USDC into the strategy
    await finance(worker, manager.address, bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async () => {
    const {worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(worker)
    const bank = await getUsdcBankContract(worker)
    const yetiStrategy = await getUsdcYetiStrategyContract(worker)

    // wait ~1 day in blocks to accrue rewards (comptroller rewards are block-based)
    await advanceNSeconds(TWO_DAYS);
    await advanceNBlocks(1);

    // finance to claim YETI from Gauge and trigger liquidation
    const balanceBefore = await yetiStrategy.investedBalance();

    await manager.finance(bank.address);

    const balanceAfter = await yetiStrategy.investedBalance();
    console.log('Liquidated YETI for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {deployer, worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(deployer)
    const bank = await getUsdcBankContract(worker)
    const yetiStrategy = await getUsdcYetiStrategyContract(worker)

    // Withdraw all from the strategy to the bank
    await exit(deployer, manager.address, bank.address, yetiStrategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker);
    await withdraw(worker, bank.address, shares);

    const endingBalance = await usdcToken.balanceOf(worker);
    expect(startingBalance).to.be.lt(endingBalance);
    console.log('Starting Balance: ' + formatUnits(startingBalance.toString(), 6));
    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 6));
  });
});
