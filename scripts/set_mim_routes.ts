import { getLiquidatorContract, setLiquidator, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract } from "lib/contract";

async function main() {
  try {
    const {deployer, joeRouter, token, mim, joe, wavax} = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer);
    const manager = await getAvalancheManagerContract(deployer);

    // buyback [mim => wavax => oh]
    await setSwapRoutes(deployer, liquidator.address, joeRouter, mim, token, [mim, wavax, token])
    await setLiquidator(deployer, manager.address, liquidator.address, mim, token)

    // rewards [joe => wavax => mim] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, joe, mim, [joe, wavax, mim])
    await setLiquidator(deployer, manager.address, liquidator.address, joe, mim)
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()






