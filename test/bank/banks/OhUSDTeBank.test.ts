import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { getDaieBankContract, getUsdteBankContract } from 'lib/contract';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupUsdteBankTest } from 'utils/fixture';

describe('Oh! USDT.e', function () {
  let startingBalance: BigNumber
  let usdtToken: IERC20

  before(async function () {
    await setupUsdteBankTest();

    const {worker, usdte} = await getNamedAccounts()
    usdtToken = await getERC20Contract(worker, usdte);
    startingBalance = await usdtToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! USDT.e Bank proxy correctly', async function () {
    const { deployer, usdte } = await getNamedAccounts()
    const bank = await getUsdteBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdte);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDT.e');
    expect(name).eq('Oh! USDT.e');
  });
})