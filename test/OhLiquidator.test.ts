import {expect} from 'chai';
import {deployments, ethers, getNamedAccounts} from 'hardhat';
import { OhLiquidatorV2 } from '@ohfinance/oh-contracts/types';

describe('OhLiquidator', () => {

  before(async () => {
    await deployments.fixture(["OhLiquidator"]);
  });

  it('is deployed correctly', async () => {
    const {deployer, wavax} = await getNamedAccounts();
    const registry = await ethers.getContract('OhRegistry', deployer)
    const liquidator = await ethers.getContract('OhLiquidatorV2', deployer) as OhLiquidatorV2

    const registryAddress = await liquidator.registry();
    const wavaxAddress = await liquidator.weth();

    expect(registryAddress).eq(registry.address);
    expect(wavaxAddress).eq(wavax);
  });
})