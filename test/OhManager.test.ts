import {expect} from 'chai'
import { setupManager } from 'utils/fixture';
import { getManagerContract, getRegistryContract } from '@ohfinance/oh-contracts/lib';
import { getNamedAccounts } from 'hardhat';

describe('OhManager', function () {
  describe('deployment', function () {

    before(async function () {
      await setupManager();
    });

    it('is deployed correctly', async function () {
      const {deployer, token} = await getNamedAccounts();
      const registry = await getRegistryContract(deployer)
      const manager = await getManagerContract(deployer)

      const registryAddress = await manager.registry();
      const tokenAddress = await manager.token();
      const buybackFee = await manager.buybackFee();
      const managementFee = await manager.managementFee();

      expect(registryAddress).eq(registry.address);
      expect(tokenAddress).eq(token);
      expect(buybackFee).to.be.eq(200);
      expect(managementFee).to.be.eq(20);
    });
  });
})