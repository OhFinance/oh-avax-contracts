import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { getAvalancheManagerContract, getDaieBankContract } from 'lib/contract';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupDaieBankTest } from 'utils/fixture';

describe('Oh! DAI.e', function () {
  let startingBalance: BigNumber
  let daiToken: IERC20

  before(async function () {
    await setupDaieBankTest();

    const {worker, daie} = await getNamedAccounts()
    daiToken = await getERC20Contract(worker, daie);
    startingBalance = await daiToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! DAI.e Bank proxy correctly', async function () {
    const { deployer, daie } = await getNamedAccounts()
    const bank = await getDaieBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(daie);
    expect(decimals).eq(18);
    expect(symbol).eq('OH-DAI.e');
    expect(name).eq('Oh! DAI.e');
  });

  it('allows one user to deposit and withdraw from the Oh! DAI.e Bank', async function () {
    const {worker} = await getNamedAccounts()
    const bank = await getDaieBankContract(worker)

    await approve(worker, daiToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);

    const bankBalance = await bank.underlyingBalance();
    const bankShares = await bank.balanceOf(worker);

    await withdraw(worker, bank.address, bankShares);

    const remainingShares = await bank.balanceOf(worker);

    expect(bankBalance.toString()).eq(startingBalance.toString());
    expect(bankShares.toString()).eq(startingBalance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into Oh! DAI.e Bank Stratgies', async function () {
    const {worker} = await getNamedAccounts()
    const bank = await getDaieBankContract(worker)
    const manager = await getAvalancheManagerContract(worker);
    const totalStrategies = await bank.totalStrategies();

    const balance = await daiToken.balanceOf(worker);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await approve(worker, daiToken.address, bank.address, balance);

    const amount = balance.div(totalStrategies);
    for (let i = 0; i < totalStrategies.toNumber(); i++) {
      await deposit(worker, bank.address, amount);

      const bankBalance = await bank.underlyingBalance();

      expect(bankBalance).to.be.eq(amount);
      await finance(worker, manager.address, bank.address);

      const strategyBalance = await bank.strategyBalance(i);
      console.log('Balance:', strategyBalance.toString());

      expect(strategyBalance).to.be.gt(0);

      await advanceNSeconds(ONE_DAY);
      await advanceNBlocks(1);
    }

    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance is:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price is:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker);

    let batch = shares.div(10);
    const withdrawCount = 6;
    for (let i = 0; i < withdrawCount; i++) {
      await withdraw(worker, bank.address, batch.toString());
    }

    let remainingShares = await bank.balanceOf(worker);
    await withdraw(worker, bank.address, remainingShares.toString());

    const endBalance = await daiToken.balanceOf(worker);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
})