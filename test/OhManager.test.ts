import {expect} from 'chai'
import { setupManager, setupUsdceBankTest } from 'utils/fixture';
import { approve, buyback, deposit, finance, financeAll, getERC20Contract, getManagerContract, getRegistryContract, rebalance } from '@ohfinance/oh-contracts/lib';
import { getNamedAccounts } from 'hardhat';
import { getAvalancheManagerContract, getUsdceBankContract } from 'lib/contract';
import { advanceNBlocks, advanceNSeconds, TWO_DAYS } from '@ohfinance/oh-contracts/utils';
import { burn } from 'lib/manager';

describe('OhManager', function () {
  describe('deployment', function () {

    before(async function () {
      await setupManager();
    });

    it('is deployed correctly', async function () {
      const {deployer, token} = await getNamedAccounts();
      const registry = await getRegistryContract(deployer)
      const manager = await getAvalancheManagerContract(deployer)

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

  describe("OH-USDC.e deployment", function () {
    before(async function () {
      await setupUsdceBankTest();

      const { worker, usdce } = await getNamedAccounts();
      const bank = await getUsdceBankContract(worker);
      const usdceToken = await getERC20Contract(worker, usdce)
      const balance = await usdceToken.balanceOf(worker);
      
      await approve(worker, usdce, bank.address, balance);
      await deposit(worker, bank.address, balance)
    })

    it('finances single then rebalances all strategies', async function () {
      const { worker } = await getNamedAccounts();
      const manager = await getAvalancheManagerContract(worker);
      const bank = await getUsdceBankContract(worker);

      await finance(worker, manager.address, bank.address);

      const invested = await bank.strategyBalance(0);
      expect(invested).to.be.gt(0);

      await rebalance(worker, manager.address, bank.address);

      const invested0 = await bank.strategyBalance(0);
      const invested1 = await bank.strategyBalance(1);
      const invested2 = await bank.strategyBalance(2);

      expect(invested0).to.be.gt(0);
      expect(invested1).to.be.gt(0);
      expect(invested2).to.be.gt(0);
    })

    it('finances all strategies then performs buyback', async function () {
      const { worker, usdce, token } = await getNamedAccounts();
      const manager = await getAvalancheManagerContract(worker);
      const bank = await getUsdceBankContract(worker);
      const ohToken = await getERC20Contract(worker, token)
      const usdceToken = await getERC20Contract(worker, usdce)

      await advanceNSeconds(TWO_DAYS);
      await advanceNBlocks(1);

      const buybackBefore = await usdceToken.balanceOf(manager.address);
      const balanceBefore = await usdceToken.balanceOf(worker);

      await financeAll(worker, manager.address, bank.address);

      const buybackAfter = await usdceToken.balanceOf(manager.address);
      const balanceAfter = await usdceToken.balanceOf(worker);

      expect(buybackAfter).to.be.gt(buybackBefore);
      expect(balanceAfter).to.be.gt(balanceBefore);

      // log supply and perform buyback
      const before = await ohToken.balanceOf(manager.address);
      await buyback(worker, manager.address, usdce);

      const after = await ohToken.balanceOf(manager.address);
      expect(after).to.be.gt(before);
    })

    it('reverts initially then sends buyback proceeds to burner', async function () {
      const { deployer, worker, token } = await getNamedAccounts();
      const ohToken = await getERC20Contract(deployer, token);
      const manager = await getAvalancheManagerContract(deployer);
      
      await expect(manager.burn()).to.be.reverted;

      const tx = await manager.setBurner(worker);
      await tx.wait();

      const before = await ohToken.balanceOf(worker);
      await burn(deployer, manager.address);
      
      const after = await ohToken.balanceOf(worker);
      expect(after).to.be.gt(before);
    })
  })
})