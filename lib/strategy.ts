import { ethers, getNamedAccounts } from "hardhat";
import OhAvalancheAaveV2Strategy from '../abi/OhAvalancheAaveV2Strategy.json';
import OhAvalancheBenqiStrategy from '../abi/OhAvalancheBenqiStrategy.json'
import OhAvalancheBankerJoeStrategy from '../abi/OhAvalancheBankerJoeStrategy.json';
import OhAvalancheBankerJoeFoldingStrategy from '../abi/OhAvalancheBankerJoeFoldingStrategy.json';
import OhCurveAPoolStrategy from '../abi/OhCurveAPoolStrategy.json';
import OhAlphaHomoraV2Strategy from '../abi/OhAlphaHomoraV2Strategy.json';
import OhPlatypusStrategy from '../abi/OhPlatypusStrategy.json';
import OhPlatypusCompounder from '../abi/OhPlatypusCompounder.json';

export const getInitializeAaveV2StrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const {aaveLendingPool, aaveIncentivesController, wavax} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAvalancheAaveV2Strategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeAaveV2Strategy(address,address,address,address,address,address,address)',
    [
      registry,
      bank,
      underlying,
      derivative,
      wavax,
      aaveLendingPool,
      aaveIncentivesController,
    ]
  );
  return initializeData;
}

export const getInitializeBenqiStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const {benqi, benqiComptroller, wavax} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAvalancheBenqiStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeBenqiStrategy(address,address,address, address,address,address,address)',
    [registry, bank, underlying, derivative, benqi, wavax, benqiComptroller]
  );
  return initializeData;
};

export const getInitializeBankerJoeStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const {joe, joetroller, wavax} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAvalancheBankerJoeStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeBankerJoeStrategy(address,address,address,address,address,address,address)',
    [registry, bank, underlying, derivative, joe, wavax, joetroller]
  );
  return initializeData;
};

export const getInitializeBankerJoeFoldingStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const {joe, joetroller} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAvalancheBankerJoeFoldingStrategy);
  const bjMimFoldingAmount = 5; // Number of time we fold for borrowing/lending
  const bjMimCFNumerator = 540; // Collateral factor expressed as x/1000
  const bjMimCFDenominator = 1000;
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeBankerJoeFoldingStrategy(address,address,address,address,address,address,uint256,uint256,uint256)',
    [registry, bank, underlying, derivative, joe, joetroller,
      bjMimFoldingAmount,bjMimCFNumerator,bjMimCFDenominator]
  );
  return initializeData;
};

export const getInitializeCurveAPoolStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  index: string
) => {
  const {crv, crvAToken, crvAPool, crvAGauge, wavax} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhCurveAPoolStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeCurveAPoolStrategy(address,address,address,address,address,address,address,address,uint256)',
    [registry, bank, underlying, crvAToken, wavax, crv, crvAPool, crvAGauge, index]
  );
  return initializeData;
};

export const getInitializeAlphaHomoraV2StrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string
) => {
  const {crUSDCeToken, wavax, alpha, usdcSafeBox} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhAlphaHomoraV2Strategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeAlphaHomoraV2Strategy(address,address,address,address,address,address,address,address)',
    [registry, bank, underlying, derivative, alpha, wavax, crUSDCeToken, usdcSafeBox]
  );
  return initializeData;
};

export const getInitializePlatypusStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string,
  compounder: string,
  index: number
) => {
  // For index: USDT = 5, USDC = 4, DAI = Not a pool, USDCe = 1, USDTe = 0, DAIe = 2
  const {ptpToken} = await getNamedAccounts();
  const strategyInterface = new ethers.utils.Interface(OhPlatypusStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializePlatypusStrategy(address,address,address,address,address,address,uint256)',
    [registry, bank, underlying, derivative, ptpToken, compounder, index]
  );
  return initializeData;
};

export const getInitializePlatypusCompounderData = async (
  registry: string
) => {
  const {ptpToken, vePtp, ptpPool, ptpMasterPlatypusV2} = await getNamedAccounts();
  const compounderInterface = new ethers.utils.Interface(OhPlatypusCompounder);
  const initializeData = compounderInterface.encodeFunctionData(
    'initializePlatypusCompounder(address,address,address,address,address,uint256)',
    [registry, ptpToken, vePtp, ptpPool, ptpMasterPlatypusV2, 10]
  );
  return initializeData;
};
