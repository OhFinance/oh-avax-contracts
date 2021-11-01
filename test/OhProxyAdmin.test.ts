import {expect} from 'chai';
import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { OhProxyAdmin } from '@ohfinance/oh-contracts/types';

describe('OhProxyAdmin', () => {

  before(async () => {
    await deployments.fixture(['OhProxyAdmin']);
  });

  it('is deployed correctly', async () => {
    const {deployer} = await getNamedAccounts();
    const registry = await ethers.getContract('OhRegistry', deployer)
    const proxyAdmin = await ethers.getContract('OhProxyAdmin', deployer) as OhProxyAdmin

    const registryAddress = await proxyAdmin.registry();
    const owner = await proxyAdmin.owner();

    expect(registryAddress).eq(registry.address);
    expect(owner).eq(deployer);
  });
})