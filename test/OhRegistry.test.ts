import { getRegistryContract } from '@ohfinance/oh-contracts/utils';
import {expect} from 'chai';
import {deployments, ethers, getNamedAccounts} from 'hardhat';

describe('OhRegistry', () => {

    before(async () => {
      await deployments.fixture(['OhRegistry']);
    })

    it('was deployed correctly', async () => {
      // const {deployer} = fixture;
      // const {registry} = deployer;
      
      
      const {deployer} = await getNamedAccounts();
      const registry = await getRegistryContract(deployer);

      const governorAddress = await registry.governance();
      const managerAddress = await registry.manager();

      expect(governorAddress).eq(deployer);
      // expect(managerAddress).eq(zero);
    });
  
})