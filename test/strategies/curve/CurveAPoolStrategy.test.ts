import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import { getNamedAccounts} from 'hardhat';
import { approve, deposit, exit, finance, withdraw, getERC20Contract, getManagerContract } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { getAvalancheManagerContract, getUsdceBankContract, getUsdceCurveAPoolStrategyContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupBankTest } from 'utils/fixture';
import { updateBank } from 'utils/tasks';

describe('CurveAPoolStrategy', () => {
  let usdceToken: IERC20;
  let startingBalance: BigNumber;

  before(async () => {
    await setupBankTest();

    const { deployer, worker, usdce } = await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(deployer)

    await updateBank(bank.address, [crvStrategy.address])

    usdceToken = await getERC20Contract(worker, usdce);
    startingBalance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Avalanche Curve APool USDCE Strategy proxy correctly', async () => {
    const {deployer, crv, crvAPool, a3CrvToken, crvGauge, usdce, wavax} =
      await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(deployer)

    const crvBank = await crvStrategy.bank();
    const underlying = await crvStrategy.underlying();
    const derivative = await crvStrategy.derivative();
    const reward = await crvStrategy.reward();
    const pool = await crvStrategy.pool();
    const gauge = await crvStrategy.gauge();
    const index = await crvStrategy.index();

    expect(crvBank).eq(bank.address);
    expect(underlying).eq(usdce);
    expect(derivative).eq(a3CrvToken);
    expect(reward).eq(crv);
    expect(pool).eq(crvAPool);
    expect(gauge).eq(crvGauge);
    expect(index).to.be.eq(1);
  });

  it('finances and deposits into Curve Aave Pool', async () => {
    const { worker } = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getAvalancheManagerContract(worker)

    // Deposit the USDC.e in the Bank
    await approve(worker, usdceToken.address, bank.address, startingBalance);
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
    const bank = await getUsdceBankContract(worker)
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(worker)

    // wait ~1 day in blocks to accrue rewards (comptroller rewards are block-based)
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // finance to claim CRV & WAVAX from Gauge and trigger liquidation
    const balanceBefore = await crvStrategy.investedBalance();

    await manager.finance(bank.address);

    const balanceAfter = await crvStrategy.investedBalance();
    console.log('Liquidated CRV & WAVAX for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {deployer, worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(deployer)
    const bank = await getUsdceBankContract(worker)
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(worker)

    // Withdraw all from the strategy to the bank
    await exit(deployer, manager.address, bank.address, crvStrategy.address);

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
7