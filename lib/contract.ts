import { getBankContract, getUpgradeableProxy, getUpgradeableProxyAt } from "@ohfinance/oh-contracts/lib";
import { ethers } from "hardhat";
import { OhAvalancheAaveV2Strategy, OhAvalancheBenqiStrategy, OhAvalancheBankerJoeStrategy,
  OhAvalancheBankerJoeFoldingStrategy, OhCurveAPoolStrategy, OhAlphaHomoraV2Strategy, OhAvalancheManager } from "types";

export const getAvalancheManagerContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAvalancheManager', at, signer)) as OhAvalancheManager;
  }
  return (await ethers.getContract('OhAvalancheManager', signer)) as OhAvalancheManager;
}

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

export const getAvalancheBankerJoeStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAvalancheBankerJoeStrategy', at, signer)) as OhAvalancheBankerJoeStrategy;
  }
  return (await ethers.getContract('OhAvalancheBankerJoeStrategy', signer)) as OhAvalancheBankerJoeStrategy;
};

export const getAvalancheBankerJoeFoldingStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAvalancheBankerJoeFoldingStrategy', at, signer)) as OhAvalancheBankerJoeFoldingStrategy;
  }
  return (await ethers.getContract('OhAvalancheBankerJoeFoldingStrategy', signer)) as OhAvalancheBankerJoeFoldingStrategy;
};

export const getCurveAPoolStrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhCurveAPoolStrategy', at, signer)) as OhCurveAPoolStrategy;
  }
  return (await ethers.getContract('OhCurveAPoolStrategy', signer)) as OhCurveAPoolStrategy;
};

export const getAlphaHomoraV2StrategyContract = async (signer: string, at?: string) => {
  if (at) {
    return (await ethers.getContractAt('OhAlphaHomoraV2Strategy', at, signer)) as OhAlphaHomoraV2Strategy;
  }
  return (await ethers.getContract('OhAlphaHomoraV2Strategy', signer)) as OhAlphaHomoraV2Strategy;
};

export const getUsdcBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhUsdcBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhUsdcBank');
};

export const getUsdcBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getUsdcBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getUsdcBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
}

export const getUsdtBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhUsdtBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhUsdtBank');
};

export const getUsdtBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getUsdtBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getUsdtBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
}

export const getUsdceBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhUsdceBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhUsdceBank');
};

export const getMimBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhMimBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhMimBank');
};

export const getUsdceBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getUsdceBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getUsdceBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
}

export const getMimBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getMimBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getMimBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
}

export const getUsdteBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhUsdteBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhUsdteBank');
};

export const getUsdteBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getUsdteBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getUsdteBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
}

export const getDaieBankProxyContract = async (signer: string, at?: string) => {
  if (at) {
    return await getUpgradeableProxy(signer, 'OhDaieBank', at)
  }
  return await getUpgradeableProxy(signer, 'OhDaieBank');
};

export const getDaieBankContract = async (signer:string, at?: string) => {
  if (at) {
    const proxy = await getDaieBankProxyContract(signer, at);
    return await getBankContract(signer, proxy.address);
  } else {
    const proxy = await getDaieBankProxyContract(signer);
    return await getBankContract(signer, proxy.address);
  } 
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

export const getUsdceBankerJoeStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceBankerJoeStrategy');
};

export const getUsdceBankerJoeStrategyContract = async (signer:string) => {
  const proxy = await getUsdceBankerJoeStrategyProxyContract(signer);
  return await getAvalancheBankerJoeStrategyContract(signer, proxy.address);
}

export const getUsdceCurveAPoolStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceCurveAPoolStrategy');
};

export const getUsdteCurveAPoolStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdteCurveAPoolStrategy');
};

export const getDaieCurveAPoolStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhDaieCurveAPoolStrategy');
};

export const getUsdceCurveAPoolStrategyContract = async (signer:string) => {
  const proxy = await getUsdceCurveAPoolStrategyProxyContract(signer);
  return await getCurveAPoolStrategyContract(signer, proxy.address);
}

export const getUsdceAlphaHomoraV2StrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhUsdceAlphaHomoraV2Strategy');
};

export const getUsdceAlphaHomoraV2StrategyContract = async (signer:string) => {
  const proxy = await getUsdceAlphaHomoraV2StrategyProxyContract(signer);
  return await getAlphaHomoraV2StrategyContract(signer, proxy.address);
}

export const getMimBankerJoeFoldingStrategyProxyContract = async (signer: string) => {
  return await getUpgradeableProxy(signer, 'OhMimBankerJoeFoldingStrategy');
};

export const getMimBankerJoeFoldingStrategyContract = async (signer:string) => {
  const proxy = await getMimBankerJoeFoldingStrategyProxyContract(signer);
  return await getAvalancheBankerJoeFoldingStrategyContract(signer, proxy.address);
}