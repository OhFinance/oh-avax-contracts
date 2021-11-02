import {expect} from 'chai';
import {formatUnits, parseEther} from '@ethersproject/units';
import {deployments, ethers, getNamedAccounts} from 'hardhat';
import { addStrategy, getErc20At, setBank, setLiquidator, setSwapRoutes } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, getLiquidatorContract, getManagerContract, ONE_DAY, TEN_DAYS, TWO_DAYS } from '@ohfinance/oh-contracts/utils';
import { swapAvaxForTokens } from 'utils/swap';
import { getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBenqiStrategyContract } from 'utils/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';

describe('OhAvalancheBenqiStrategy', function () {
  let startingBalance: BigNumber
  let usdceToken: IERC20

  before(async function () {
    await deployments.fixture(["OhUsdceBank", "OhUsdceBenqiStrategy"])

    const { deployer, worker, benqi, usdce, joeRouter, token, wavax } = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer)
    const manager = await getManagerContract(deployer)


    const bank = await ethers.getContract('OhUsdceBank', deployer)
    const benqiStrategy = await ethers.getContract('OhUsdceBenqiStrategy', deployer)

    // Setup Liquidation routes

     // buyback [usdc.e => wavax => oh]
     await setSwapRoutes(deployer, liquidator.address, joeRouter, usdce, token, [usdce, wavax, token])
     await setLiquidator(deployer, manager.address, liquidator.address, usdce, token)

    // rewards [wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdce, [wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdce)

    // rewards [qi => wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, benqi, usdce, [benqi, wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, benqi, usdce)

    // Setup Bank 
    await setBank(deployer, manager.address, bank.address)
    await addStrategy(deployer, manager.address, bank.address, benqiStrategy.address);

    // // Buy USDC using the worker wallet
    await swapAvaxForTokens(worker, usdce, parseEther('9000'));

    usdceToken = await getErc20At(usdce, worker);
    // // Check USDC balance and approve spending
    startingBalance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
    await usdceToken.approve(bank.address, startingBalance);
  });

  it('deployed and initialized Avalanche Benqi USDC.e Strategy proxy correctly', async function () {
    const {deployer, benqi, benqiUsdce, benqiComptroller, usdce} =
      await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    const benqiStrategyBank = await benqiStrategy.bank();
    const underlying = await benqiStrategy.underlying();
    const derivative = await benqiStrategy.derivative();
    const reward = await benqiStrategy.reward();
    const comptroller = await benqiStrategy.comptroller();

    expect(benqiStrategyBank).eq(bank.address);
    expect(underlying).eq(usdce);
    expect(derivative).eq(benqiUsdce);
    expect(reward).eq(benqi);
    expect(comptroller).eq(benqiComptroller);
  });

  it('finances and deposits into Benqi', async function () {
    const { worker } = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getManagerContract(worker)

    // // Deposit the USDC in the Bank
    await bank.deposit(startingBalance);
    const bankBalance = await bank.underlyingBalance();

    // // Check that tha Bank now has proper amount of USDC deposited
    expect(bankBalance).to.be.eq(startingBalance);

    // // Invest the initial USDC into the strategy
    await manager.finance(bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async () => {
    const {worker} = await getNamedAccounts();
    
    const manager = await getManagerContract(worker)
    const bank = await getUsdceBankContract(worker)
    const benqiStrategy = await getUsdceBenqiStrategyContract(worker)

    // wait 1 day to accrue rewards (time-based)
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // finance to claim WAVAX and trigger liquidation
    const balanceBefore = await benqiStrategy.investedBalance();

    await manager.finance(bank.address);

    const balanceAfter = await benqiStrategy.investedBalance();
    console.log('Liquidated QI for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC.e');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async () => {
    const {deployer, worker} = await getNamedAccounts();
    const manager = await getManagerContract(deployer)
    const bank = await getUsdceBankContract(worker)
    const benqiStrategy = await getUsdceBenqiStrategyContract(worker)

    // // Withdraw all from the strategy to the bank
    await manager.exit(bank.address, benqiStrategy.address);

    // // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 6));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 6));

    const shares = await bank.balanceOf(worker);
    await bank.withdraw(shares.toString());

    const endingBalance = await usdceToken.balanceOf(worker);
    expect(startingBalance).to.be.lt(endingBalance);

    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 6));
  });
});