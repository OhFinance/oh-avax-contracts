import { expect } from 'chai';
import { formatUnits } from '@ethersproject/units';
import { getNamedAccounts } from 'hardhat';
import { getERC20Contract } from '@ohfinance/oh-contracts/lib';
import { getUsdcBankContract } from 'lib/contract';
import { BigNumber } from '@ethersproject/bignumber';
import { IERC20 } from '@ohfinance/oh-contracts/types';
import { setupUsdcBankTest } from 'utils/fixture';

describe('Oh! USDC', function () {
  let startingBalance: BigNumber
  let usdcToken: IERC20

  before(async function () {
    await setupUsdcBankTest();

    const {worker, usdc} = await getNamedAccounts()
    
    usdcToken = await getERC20Contract(worker, usdc);
    startingBalance = await usdcToken.balanceOf(worker);
    console.log('Starting Balance:', formatUnits(startingBalance.toString(), 6));
  });

  it('deployed and initialized Oh! USDC Bank proxy correctly', async function () {
    const { deployer, usdc } = await getNamedAccounts()
    const bank = await getUsdcBankContract(deployer);

    const underlying = await bank.underlying();
    const decimals = await bank.decimals();
    const symbol = await bank.symbol();
    const name = await bank.name();

    expect(underlying).eq(usdc);
    expect(decimals).eq(6);
    expect(symbol).eq('OH-USDC');
    expect(name).eq('Oh! USDC');
  });
});