import {expect} from 'chai';
import {ethers, getNamedAccounts} from 'hardhat';
import { OhLiquidatorV2 } from '@ohfinance/oh-contracts/types';
import { setupBankTest, setupLiquidator } from 'utils/fixture';
import { getLiquidatorContract, getManagerContract } from '@ohfinance/oh-contracts/lib';
import { getAvalancheManagerContract } from 'lib/contract';

describe('OhLiquidator', function () {

  describe('deployment', function () {
    before(async function () {
      await setupLiquidator()
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
  
  describe('OH-USDC.e deployment', function () {
    before(async function () {
      await setupBankTest();
    })

    it('added swap routes correctly', async function () {
      const {deployer, joeRouter, wavax, joe, benqi, token, usdce} = await getNamedAccounts();
      const liquidator = await getLiquidatorContract(deployer);

      const wavaxInfo = await liquidator.getSwapInfo(wavax, usdce);
      const joeInfo = await liquidator.getSwapInfo(joe, usdce);
      const benqiInfo = await liquidator.getSwapInfo(benqi, usdce);
      const buybackInfo = await liquidator.getSwapInfo(usdce, token);
  
      expect(joeRouter).eq(wavaxInfo.router).eq(joeInfo.router).eq(benqiInfo.router).eq(buybackInfo.router);
      expect(3).eq(joeInfo.path.length).eq(benqiInfo.path.length).eq(buybackInfo.path.length);
      expect(2).eq(wavaxInfo.path.length);
      expect(wavax).eq(joeInfo.path[1]).eq(benqiInfo.path[1]).eq(buybackInfo.path[1]);
    });
  
    it('was added to manager', async () => {
      const {deployer, wavax, joe, token, benqi, usdce} = await getNamedAccounts();
      const manager = await getAvalancheManagerContract(deployer)
      const liquidator = await getLiquidatorContract(deployer)

      const a1 = await manager.liquidators(wavax, usdce);
      const a2 = await manager.liquidators(joe, usdce);
      const a3 = await manager.liquidators(benqi, usdce);
      const a4 = await manager.liquidators(usdce, token)
  
      expect(liquidator.address).eq(a1).eq(a2).eq(a3).eq(a4);
    });
  })
  
})