import { expect } from 'chai';
import { formatUnits } from '@ethersproject/units';
import { getNamedAccounts } from 'hardhat';
import { getERC20Contract } from '@ohfinance/oh-contracts/lib';
import { getUsdtBankContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupUsdtBankTest } from 'utils/fixture';

describe('Oh! USDT', function () {
  let startingBalance: BigNumber
  let usdtToken: IERC20

  before(async function () {
    await setupUsdtBankTest();

    const {worker, usdt} = await getNamedAccounts()
    
    usdtToken = await getERC20Contract(worker, usdt);
    startingBalance = await usdtToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! USDT Bank proxy correctly', async function () {
    const { deployer, usdt } = await getNamedAccounts()
    const bank = await getUsdtBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdt);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDT');
    expect(name).eq('Oh! USDT');
  });
});