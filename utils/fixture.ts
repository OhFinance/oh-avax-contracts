import { parseEther } from '@ethersproject/units';
import {deployments} from 'hardhat';
import { getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract,
  getUsdceBenqiStrategyContract, getUsdceCurveAPoolStrategyContract, getUsdceAlphaHomoraV2StrategyContract } from '../lib/contract';
import { swapAvaxForTokens } from './swap';
import { updateBank, updateLiquidator, updateManager } from './tasks';

export const setupRegistry = deployments.createFixture(async ({deployments}) => {
  await deployments.fixture(['OhRegistry']);
});

export const setupManager = deployments.createFixture(async ({deployments}) => {
  await deployments.fixture(['OhManager']);
  await updateManager();
});

export const setupLiquidator = deployments.createFixture(async ({deployments}) => {
  await deployments.fixture(['OhLiquidator']);
  await updateManager();
});

export const setupProxyAdmin = deployments.createFixture(async ({deployments}) => {
  await deployments.fixture(['OhProxyAdmin']);
  await updateManager();
});

export const setupBankTest = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(["OhUsdceBank", "OhUsdceAaveV2Strategy", "OhUsdceBankerJoeStrategy", "OhUsdceBenqiStrategy", "OhUsdceCurveAPoolStrategy", "OhUsdceAlphaHomoraV2Strategy"])
  await updateManager();
  await updateLiquidator();

  // buy USDC.e for worker
  const {worker, usdce} = await getNamedAccounts()
  await swapAvaxForTokens(worker, usdce, parseEther('1000'));
});

export const setupUsdceBankTest  = deployments.createFixture(async ({deployments, getNamedAccounts}) => {
  await deployments.fixture(["OhUsdceBank", "OhUsdceAaveV2Strategy", "OhUsdceBankerJoeStrategy", "OhUsdceBenqiStrategy", "OhUsdceCurveAPoolStrategy", "OhUsdceAlphaHomoraV2Strategy"])
  await updateManager();
  await updateLiquidator();

  const {deployer, worker, usdce} = await getNamedAccounts()
  const bank = await getUsdceBankContract(deployer)
  // const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)
  const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer)
  //const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)
  const curveStrategy = await getUsdceCurveAPoolStrategyContract(deployer)
  const alphaHomoraV2Strategy = await getUsdceAlphaHomoraV2StrategyContract(deployer)

  // Add Bank and Strategies to Manager
  await updateBank(bank.address, [bankerJoeStrategy.address, curveStrategy.address, alphaHomoraV2Strategy.address])

  // buy USDC.e for worker
  await swapAvaxForTokens(worker, usdce, parseEther('1000'));
});