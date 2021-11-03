import {expect} from 'chai';
import {formatUnits, parseEther} from '@ethersproject/units';
import {deployments, getNamedAccounts} from 'hardhat';
import { getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract, getUsdceBenqiStrategyContract } from 'utils/contract';
import { advanceNBlocks, advanceNSeconds, getLiquidatorContract, getManagerContract, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { addStrategy, getErc20At, setBank, setLiquidator, setSwapRoutes } from '@ohfinance/oh-contracts/lib';
import { swapAvaxForTokens } from 'utils/swap';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts';

describe('Oh! USDC.e', async function() {
  this.retries(3)

  let startingBalance: BigNumber
  let usdceToken: IERC20

  beforeEach(async function () {
    await deployments.fixture(["OhUsdceBank", "OhUsdceAaveV2Strategy", "OhUsdceBankerJoeStrategy", "OhUsdceBenqiStrategy"])

    const { deployer, worker, usdce, joeRouter, token, benqi, joe, wavax } = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer)
    const manager = await getManagerContract(deployer)
    const bank = await getUsdceBankContract(deployer)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    // buyback [usdc.e => wavax => oh]
    await setSwapRoutes(deployer, liquidator.address, joeRouter, usdce, token, [usdce, wavax, token])
    await setLiquidator(deployer, manager.address, liquidator.address, usdce, token)

    // rewards [wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdce, [wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdce)

    // rewards [joe => wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, joe, usdce, [joe, wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, joe, usdce)

    // rewards [qi => wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, benqi, usdce, [benqi, wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, benqi, usdce)

    // Setup Bank 
    await setBank(deployer, manager.address, bank.address)
    await addStrategy(deployer, manager.address, bank.address, aaveV2Strategy.address);
    await addStrategy(deployer, manager.address, bank.address, bankerJoeStrategy.address)
    await addStrategy(deployer, manager.address, bank.address, benqiStrategy.address);

    // Buy USDC using the worker wallet
    await swapAvaxForTokens(worker, usdce, parseEther('1000'));

    // Check USDC balance and approve spending
    usdceToken = await getErc20At(usdce, worker);
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

    const balance = await usdceToken.balanceOf(worker);

    await usdceToken.approve(bank.address, balance);
    await bank.deposit(balance);

    const bankBalance = await bank.underlyingBalance();
    const bankShares = await bank.balanceOf(worker);

    await bank.withdraw(bankShares);

    const remainingShares = await bank.balanceOf(worker);

    expect(bankBalance.toString()).eq(balance.toString());
    expect(bankShares.toString()).eq(balance.toString());
    expect(remainingShares.toNumber()).eq(0);
  });

  it('allows users to deposit and allows investing into Oh! USDC.e Bank Stratgies', async function () {
    const {worker} = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getManagerContract(worker);

    const balance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance is:', formatUnits(balance.toString(), 6));
    await usdceToken.approve(bank.address, balance);

    const amount = balance.div(3);
    for (let i = 0; i < 3; i++) {
      await bank.deposit(amount);

      const bankBalance = await bank.underlyingBalance();

      expect(bankBalance).to.be.eq(amount);
      await manager.finance(bank.address);

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
      await bank.withdraw(batch.toString());
    }

    let remainingShares = await bank.balanceOf(worker);

    await bank.withdraw(remainingShares.toString());

    const endBalance = await usdceToken.balanceOf(worker);
    console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  });
});
