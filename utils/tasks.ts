import { addBank, addStrategy, getLiquidatorContract, getManagerContract, getRegistryContract, setLiquidator, setManager, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";

export const updateManager = async () => {
  const {deployer} = await getNamedAccounts()
  const registry = await getRegistryContract(deployer)
  const manager = await getManagerContract(deployer)

  await setManager(deployer, registry.address, manager.address);
}

export const updateLiquidator = async () => {
  const {deployer, joeRouter, token, usdce, wavax, benqi, joe} = await getNamedAccounts()
  const manager = await getManagerContract(deployer)
  const liquidator = await getLiquidatorContract(deployer)

  // Add swap routes for buybacks and rewards to Liquidator, then add to Manager

  // buyback [usdc.e => wavax => oh]
  await setSwapRoutes(deployer, liquidator.address, joeRouter, usdce, token, [usdce, wavax, token])
  await setLiquidator(deployer, manager.address, liquidator.address, usdce, token)

  // rewards [wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdce, [wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdce)

  // rewards [joe => wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, joe, usdce, [joe, wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, joe, usdce)

  // rewards [qi => wavax => usdc.e] 
  await setSwapRoutes(deployer, liquidator.address, joeRouter, benqi, usdce, [benqi, wavax, usdce])
  await setLiquidator(deployer, manager.address, liquidator.address, benqi, usdce)
}

export const updateBank = async (bank: string, strategies: string[]) => {
  const {deployer} = await getNamedAccounts()
  const manager = await getManagerContract(deployer)

  // Add Bank to Manager
  await addBank(deployer, manager.address, bank);

  // Add all Strategies to Manager
  for (let i = 0; i < strategies.length; i++) {
    await addStrategy(deployer, manager.address, bank, strategies[i]);
  }
}