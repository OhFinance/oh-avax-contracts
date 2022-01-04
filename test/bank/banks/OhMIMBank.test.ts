import {expect} from 'chai';
import {formatUnits} from '@ethersproject/units';
import {getNamedAccounts} from 'hardhat';
import { approve, deposit, finance, withdraw, getERC20Contract, getManagerContract, exit } from '@ohfinance/oh-contracts/lib';
import { getMimBankContract } from 'lib/contract';
import { advanceNBlocks, advanceNSeconds, ONE_DAY } from '@ohfinance/oh-contracts/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupMimBankTest } from 'utils/fixture';

describe('Oh! MIM', function () {
  let startingBalance: BigNumber
  let mimToken: IERC20

  before(async function () {
    await setupMimBankTest();

    const {worker, mim} = await getNamedAccounts()
    mimToken = await getERC20Contract(worker, mim);
    startingBalance = await mimToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! MIM Bank proxy correctly', async function () {
    const { deployer, mim } = await getNamedAccounts()
    const bank = await getMimBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(mim);
    expect(decimals).eq(18);
    expect(symbol).eq('OH-MIM');
    expect(name).eq('Oh! MIM');
  });
});
