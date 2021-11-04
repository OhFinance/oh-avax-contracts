import { getRegistryContract } from '@ohfinance/oh-contracts/lib';
import {expect} from 'chai';
import {getNamedAccounts} from 'hardhat';
import { setupRegistry } from 'utils/fixture';

describe('OhRegistry', () => {

    before(async () => {
      await setupRegistry();
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