import {expect} from 'chai'
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { OhManager } from '@ohfinance/oh-contracts/types';

describe('OhManager', () => {
  describe('deployment', () => {

    before(async () => {
      await deployments.fixture(['OhManager'])
    });

    it('is deployed correctly', async () => {
      const {deployer, token} = await getNamedAccounts();
      const registry = await ethers.getContract('OhRegistry', deployer)
      const manager = await ethers.getContract('OhManager', deployer) as OhManager

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