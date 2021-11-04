import {expect} from 'chai';
import { getNamedAccounts } from 'hardhat';
import { getProxyAdminContract, getRegistryContract } from '@ohfinance/oh-contracts/lib';
import { setupProxyAdmin } from 'utils/fixture';

describe('OhProxyAdmin', function () {

  before(async function () {
    await setupProxyAdmin()
  });

  it('is deployed correctly', async function () {
    const {deployer} = await getNamedAccounts();
    const registry = await getRegistryContract(deployer)
    const proxyAdmin = await getProxyAdminContract(deployer)

    const registryAddress = await proxyAdmin.registry();
    const owner = await proxyAdmin.owner();

    expect(registryAddress).eq(registry.address);
    expect(owner).eq(deployer);
  });
})