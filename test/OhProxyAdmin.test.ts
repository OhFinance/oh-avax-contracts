import {expect} from 'chai';
import { deployments, getNamedAccounts } from 'hardhat';
import { getProxyAdminContract, getRegistryContract } from '@ohfinance/oh-contracts/utils';

describe('OhProxyAdmin', () => {

  before(async () => {
    await deployments.fixture(['OhProxyAdmin']);
  });

  it('is deployed correctly', async () => {
    const {deployer} = await getNamedAccounts();
    const registry = await getRegistryContract(deployer)
    const proxyAdmin = await getProxyAdminContract(deployer)

    const registryAddress = await proxyAdmin.registry();
    const owner = await proxyAdmin.owner();

    expect(registryAddress).eq(registry.address);
    expect(owner).eq(deployer);
  });
})