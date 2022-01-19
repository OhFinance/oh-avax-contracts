import { ethers, getNamedAccounts } from "hardhat";
import OhAvalancheAaveV2Strategy from '../abi/OhAvalancheAaveV2Strategy.json';
import OhAvalancheBenqiStrategy from '../abi/OhAvalancheBenqiStrategy.json'
import OhAvalancheBankerJoeStrategy from '../abi/OhAvalancheBankerJoeStrategy.json';
import OhAvalancheBankerJoeFoldingStrategy from '../abi/OhAvalancheBankerJoeFoldingStrategy.json';
import OhCurveAPoolStrategy from '../abi/OhCurveAPoolStrategy.json';
import OhAlphaHomoraV2Strategy from '../abi/OhAlphaHomoraV2Strategy.json';

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
