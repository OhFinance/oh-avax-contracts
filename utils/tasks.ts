import { addBank, addStrategy, getLiquidatorContract, getRegistryContract, setLiquidator, setManager, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract } from "lib/contract";

export const updateManager = async () => {
  const {deployer} = await getNamedAccounts()
  const registry = await getRegistryContract(deployer)
  const manager = await getAvalancheManagerContract(deployer)

  await setManager(deployer, registry.address, manager.address);
}

// Add swap routes for buybacks and rewards to Liquidator, then add to Manager
export const updateLiquidator = async () => {0
  const {deployer, joeRouter, token, wavax, benqi, joe, crv, alpha, mim, yeti, daie, usdce, usdte, usdc, usdt} = await getNamedAccounts()
  const manager = await getAvalancheManagerContract(deployer)
  const liquidator = await getLiquidatorContract(deployer)

  // USDC.e

  // buyback [usdc.e => wavax => oh]
  await setSwapRoutes(deployer, liquidator.address, joeRouter, usdce, token, [usdce, wavax, token])
  await setLiquidator(deployer, manager.address, liquidator.address, usdce, token)

  // rewards [wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdce, [wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdce)

  // rewards [wavax => mim] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, mim, [wavax, mim])
  await setLiquidator(deployer, manager.address, liquidator.address, wavax, mim)

  // rewards [joe => wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, joe, usdce, [joe, wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, joe, usdce)

  // rewards [joe => wavax => mim] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, joe, mim, [joe, wavax, mim])
  await setLiquidator(deployer, manager.address, liquidator.address, joe, mim)

  // rewards [qi => wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, benqi, usdce, [benqi, wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, benqi, usdce)

  // rewards [crv => wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, usdce, [crv, wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, crv, usdce)

  // rewards [alpha => wavax => usdc.e] 
  // await setSwapRoutes(deployer, liquidator.address, joeRouter, alpha, usdce, [alpha, wavax, usdce])
  // await setLiquidator(deployer, manager.address, liquidator.address, alpha, usdce)

  // USDT.e

  // buyback [usdt.e => wavax => oh]
  await setSwapRoutes(deployer, liquidator.address, joeRouter, usdte, token, [usdte, wavax, token])
  await setLiquidator(deployer, manager.address, liquidator.address, usdte, token)

  // rewards [wavax => usdt.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdte, [wavax, usdte])
  await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdte)

  // rewards [crv => wavax => usdt.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, usdte, [crv, wavax, usdte])
  await setLiquidator(deployer, manager.address, liquidator.address, crv, usdte)

  // DAI.e

  // buyback [dai.e => wavax => oh]
  await setSwapRoutes(deployer, liquidator.address, joeRouter, daie, token, [daie, wavax, token])
  await setLiquidator(deployer, manager.address, liquidator.address, daie, token)

  // rewards [wavax => dai.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, daie, [wavax, daie])
  await setLiquidator(deployer, manager.address, liquidator.address, wavax, daie)

  // rewards [crv => wavax => dai.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, daie, [crv, wavax, daie])
  await setLiquidator(deployer, manager.address, liquidator.address, crv, daie)

  // rewards [yeti => wavax => usdc] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, yeti, usdc, [yeti, wavax, usdc])
  await setLiquidator(deployer, manager.address, liquidator.address, yeti, usdc)

  // rewards [yeti => wavax => usdt] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, yeti, usdt, [yeti, wavax, usdt])
  await setLiquidator(deployer, manager.address, liquidator.address, yeti, usdt)
}

export const updateBank = async (bank: string, strategies: string[]) => {
  const {deployer} = await getNamedAccounts()
  const manager = await getAvalancheManagerContract(deployer)

  // Add Bank to Manager
  await addBank(deployer, manager.address, bank);

  // Add all Strategies to Manager
  for (let i = 0; i < strategies.length; i++) {
    await addStrategy(deployer, manager.address, bank, strategies[i]);
  }
}