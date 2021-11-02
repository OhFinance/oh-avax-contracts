import { ethers, getNamedAccounts } from "hardhat";
import OhAvalancheAaveV2Strategy from '../abi/OhAvalancheAaveV2Strategy.json';
import OhAvalancheBenqiStrategy from '../abi/OhAvalancheBenqiStrategy.json'
import OhAvalancheBankerJoeStrategy from '../abi/OhAvalancheBankerJoeStrategy.json';

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
  derivative: string,
  reward: string,
  extraReward: string,
  comptroller: string
) => {
  const strategyInterface = new ethers.utils.Interface(OhAvalancheBenqiStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeBenqiStrategy(address,address,address, address,address,address,address)',
    [registry, bank, underlying, derivative, reward, extraReward, comptroller]
  );
  return initializeData;
};

export const getInitializeBankerJoeStrategyData = async (
  registry: string,
  bank: string,
  underlying: string,
  derivative: string,
  joe: string,
  wavax: string,
  joetroller: string
) => {
  const strategyInterface = new ethers.utils.Interface(OhAvalancheBankerJoeStrategy);
  const initializeData = strategyInterface.encodeFunctionData(
    'initializeBankerJoeStrategy(address,address,address,address,address,address,address)',
    [registry, bank, underlying, derivative, joe, wavax, joetroller]
  );
  return initializeData;
};
