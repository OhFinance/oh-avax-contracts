import { getLiquidatorContract, setLiquidator, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract } from "lib/contract";

async function main() {
  try {
    const {deployer, joeRouter, token, daie, crv, wavax} = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer);
    const manager = await getAvalancheManagerContract(deployer);

    // buyback [dai.e => wavax => oh]
    await setSwapRoutes(deployer, liquidator.address, joeRouter, daie, token, [daie, wavax, token])
    await setLiquidator(deployer, manager.address, liquidator.address, daie, token)

    // rewards [wavax => dai.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, daie, [wavax, daie])
    await setLiquidator(deployer, manager.address, liquidator.address, wavax, daie)

    // rewards [crv => wavax => usdc.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, daie, [crv, wavax, daie])
    await setLiquidator(deployer, manager.address, liquidator.address, crv, daie)
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()