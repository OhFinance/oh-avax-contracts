import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import { getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { getAvalancheManagerContract, getMimBankContract, getMimBankerJoeFoldingStrategyContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { updateBank } from 'utils/tasks';
import { setupMimBankWithStratsTest } from 'utils/fixture';

describe('OhAvalancheBankerJoeFoldingStrategy with MIM', function () {
  let startingBalance: BigNumber
  let mimToken: IERC20

  before(async function () {
    await setupMimBankWithStratsTest()

    const { deployer, worker, mim } = await getNamedAccounts();
    mimToken = await getERC20Contract(worker, mim);
    startingBalance = await mimToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 18));
  });

  it('deployed and initialized Avalanche BankerJoe MIM Folding Strategy proxy correctly', async function () {
    const {deployer, joe, joeMim, joetroller, mim, wavax} =
      await getNamedAccounts();
    const bank = await getMimBankContract(deployer)
    const bankerJoeFoldingStrategy = await getMimBankerJoeFoldingStrategyContract(deployer)

    const bankerJoeFoldingStrategyBank = await bankerJoeFoldingStrategy.bank();
    const underlying = await bankerJoeFoldingStrategy.underlying();
    const derivative = await bankerJoeFoldingStrategy.derivative();
    const reward = await bankerJoeFoldingStrategy.reward();
    const secondaryReward = await bankerJoeFoldingStrategy.secondaryReward();
    const bankerJoeTroller = await bankerJoeFoldingStrategy.joetroller();

    expect(bankerJoeFoldingStrategyBank).eq(bank.address);
    expect(underlying).eq(mim);
    expect(derivative).eq(joeMim);
    expect(reward).eq(joe);
    expect(secondaryReward).eq(wavax);
    expect(bankerJoeTroller).eq(joetroller);
  });

  it('finances and deposits into BankerJoe', async function () {
    const { worker } = await getNamedAccounts()
    const bank = await getMimBankContract(worker)
    const manager = await getAvalancheManagerContract(worker)

    // Approve + deposit the MIM in the Bank
    await approve(worker, mimToken.address, bank.address, startingBalance);
    await deposit(worker, bank.address, startingBalance);

    // Check that the Bank now has proper amount of MIM deposited
    const bankBalance = await bank.underlyingBalance();
    expect(bankBalance).to.be.eq(startingBalance);

    // Invest the initial MIM into the strategy
    await finance(worker, manager.address, bank.address);

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 18));

    expect(strategyBalance).to.be.gt(0);
  });

  it('liquidates rewards and compounds deposit', async function () {
    const {worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(worker)
    const bank = await getMimBankContract(worker)
    const bankerJoeFoldingStrategy = await getMimBankerJoeFoldingStrategyContract(worker)

    // wait 1 day to accrue rewards (time-based)
    await advanceNSeconds(ONE_DAY);
    await advanceNBlocks(1);

    // finance to claim WAVAX and trigger liquidation
    const balanceBefore = await bankerJoeFoldingStrategy.investedBalance();

    await finance(worker, manager.address, bank.address);

    const balanceAfter = await bankerJoeFoldingStrategy.investedBalance();
    console.log('Liquidated JToken for', formatUnits(balanceAfter.sub(balanceBefore), 18), 'MIM');

    const strategyBalance = await bank.strategyBalance(0);
    console.log('Strategy Balance: ' + formatUnits(strategyBalance.toString(), 18));

    // expect liquidation was profitable
    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(strategyBalance).to.be.gt(0);
  });

  it('exits all and is profitable', async function () {
    const {deployer, worker} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(deployer)
    const bank = await getMimBankContract(worker)
    const bankerJoeFoldingStrategy = await getMimBankerJoeFoldingStrategyContract(worker)
    
    const shares = await bank.balanceOf(worker);
    console.log("Shares of worker: " + formatUnits(shares.toString(), 18));
    console.log("Shares unformatted: " + shares.toString());
    
    // Withdraw all from the strategy to the bank
    await exit(deployer, manager.address, bank.address, bankerJoeFoldingStrategy.address);

    // Check that underlying balance for the user is now greater than when the test started
    const virtualBalance = await bank.virtualBalance();
    const virtualPrice = await bank.virtualPrice();

    console.log('Virtual Balance:', formatUnits(virtualBalance.toString(), 18));
    console.log('Virtual Price:', formatUnits(virtualPrice.toString(), 18));

    await withdraw(worker, bank.address, shares);

    const endingBalance = await mimToken.balanceOf(worker);
    expect(startingBalance).to.be.lt(endingBalance);

    console.log('Ending Balance: ' + formatUnits(endingBalance.toString(), 18));
  });
});