import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import { getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { getUsdceAaveV2StrategyContract, getUsdceBankContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupBankTest } from 'utils/fixture';
import { updateBank } from 'utils/tasks';

describe('OhAvalancheAaveV2Strategy', function () {
  let startingBalance: BigNumber
  let usdceToken: IERC20

  before(async function () {
    await setupBankTest()

    const { deployer, worker, usdce } = await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)

    await updateBank(bank.address, [aaveV2Strategy.address])

    usdceToken = await getERC20Contract(worker, usdce);
    startingBalance = await usdceToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Avalance AaveV2 USDC.e Strategy proxy correctly', async function () {
    const {deployer, aaveUsdce, aaveLendingPool, aaveIncentivesController, usdce, wavax} =
      await getNamedAccounts();
    const bank = await getUsdceBankContract(deployer)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)

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

  it('finances and deposits into AaveV2', async function () {
    const { worker } = await getNamedAccounts()
    const bank = await getUsdceBankContract(worker)
    const manager = await getManagerContract(worker)

    // Approve + deposit the USDC in the Bank
    await approve(worker, usdceToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);

    // Check that tha Bank now has proper amount of USDC deposited
    const bankBalance = await bank.underlyingBalance();
    expect(bankBalance).to.be.eq(startingBalance);

    await finance(worker, manager.address, bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 6));
    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async () => {
    const {worker} = await getNamedAccounts();
    
    const manager = await getManagerContract(worker)
    const bank = await getUsdceBankContract(worker)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(worker)

    // wait 1 day to accrue rewards (time-based)
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // finance to claim WAVAX and trigger liquidation
    const balanceBefore = await aaveV2Strategy.investedBalance();

    await finance(worker, manager.address, bank.address);

    const balanceAfter = await aaveV2Strategy.investedBalance();
    console.log('Liquidated WAVAX for', formatUnits(balanceAfter.sub(balanceBefore), 6), 'USDC.e');

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
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(worker)

    // Withdraw all from the strategy to the bank
    await exit(deployer, manager.address, bank.address, aaveV2Strategy.address);

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
