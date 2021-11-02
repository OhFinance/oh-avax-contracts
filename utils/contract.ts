import { getBankContract, getCompoundStrategyContract, getUpgradeableProxy } from "@ohfinance/oh-contracts/utils";
import { ethers } from "hardhat";
import { OhAvalancheAaveV2Strategy, OhAvalancheBenqiStrategy } from "types";

export const getAvalancheAaveV2StrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAvalancheAaveV2Strategy', at, signer)) as OhAvalancheAaveV2Strategy;
  }
  return (await ethers.getContract('OhAvalancheAaveV2Strategy', signer)) as OhAvalancheAaveV2Strategy;
};

export const getAvalancheBenqiStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAvalancheBenqiStrategy', at, signer)) as OhAvalancheBenqiStrategy;
  }
  return (await ethers.getContract('OhAvalancheBenqiStrategy', signer)) as OhAvalancheBenqiStrategy;
};



export const getUsdceBankProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceBank');
};

export const getUsdceBankContract = async (signer:string) => {
  const proxy = await getUsdceBankProxyContract(signer);
  return await getBankContract(signer, proxy.address);
}

export const getUsdceAaveV2StrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceAaveV2Strategy');
};

export const getUsdceAaveV2StrategyContract = async (signer:string) => {
  const proxy = await getUsdceAaveV2StrategyProxyContract(signer);
  return await getAvalancheAaveV2StrategyContract(signer, proxy.address);
}

export const getUsdceBenqiStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceBenqiStrategy');
};

export const getUsdceBenqiStrategyContract = async (signer:string) => {
  const proxy = await getUsdceBenqiStrategyProxyContract(signer);
  return await getAvalancheBenqiStrategyContract(signer, proxy.address);
}

export const getUsdceTraderJoeStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceTraderJoeStrategy');
};

// export const getUsdceTraderJoeStrategyContract = async (signer:string) => {
//   const proxy = await getUsdceTraderJoeStrategyProxyContract(signer);
//   return await getCompoundStrategyContract(signer, proxy.address);
// }