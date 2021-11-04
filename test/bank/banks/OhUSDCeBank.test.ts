import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { getAvalancheManagerContract, getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract, getUsdceBenqiStrategyContract } from 'lib/contract';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupUsdceBankTest } from 'utils/fixture';

describe('Oh! USDC.e', function () {
  let startingBalance: BigNumber
  let usdceToken: IERC20

  before(async function () {
    await setupUsdceBankTest();

    const {worker, usdce} = await getNamedAccounts()
    usdceToken = await getERC20Contract(worker, usdce);
    startingBalance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! USDC.e Bank proxy correctly', async function () {
    const { deployer, usdce } = await getNamedAccounts()
    const bank = await getUsdceBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdce);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDC.e');
    expect(name).eq('Oh! USDC.e');
  });

  it('added AaveV2, BankerJoe, and Benqi strategies to Oh! USDC.e Bank correctly', async function () {
    const {deployer} = await getNamedAccounts()
    const bank = await getUsdceBankContract(deployer);
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    const totalStrategies = await bank.totalStrategies();
    const aaveV2StrategyAddress = await bank.strategies(0);
    const bankerJoeStrategyAddress = await bank.strategies(1);
    const benqiStrategyAddress = await bank.strategies(2);

    expect(totalStrategies.toNumber()).eq(3);
    expect(aaveV2StrategyAddress).eq(aaveV2Strategy.address);
    expect(bankerJoeStrategyAddress).eq(bankerJoeStrategy.address);
    expect(benqiStrategyAddress).eq(benqiStrategy.address);
  });

  it('allows one user to deposit and withdraw from the Oh! USDC.e Bank', async function () {
    const {worker} = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)

    await approve(worker, usdceToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);

    const bankBalance = await bank.underlyingBalance();
    const bankShares = await bank.balanceOf(worker);

    await withdraw(worker, bank.address, bankShares);

    const remainingShares = await bank.balanceOf(worker);

    expect(bankBalance.toString()).eq(startingBalance.toString());
    expect(bankShares.toString()).eq(startingBalance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into Oh! USDC.e Bank Stratgies', async function () {
    const {worker} = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getAvalancheManagerContract(worker);

    const balance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await approve(worker, usdceToken.address, bank.address, balance);

    const amount = balance.div(3);
    for (let i = 0; i < 3; i++) {
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

    const endBalance = await usdceToken.balanceOf(worker);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
