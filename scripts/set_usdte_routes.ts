import { getLiquidatorContract, setLiquidator, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract } from "lib/contract";

async function main() {
  try {
    const {deployer, joeRouter, token, usdte, crv, wavax} = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer);
    const manager = await getAvalancheManagerContract(deployer);

    // buyback [usdt.e => wavax => oh]
    await setSwapRoutes(deployer, liquidator.address, joeRouter, usdte, token, [usdte, wavax, token])
    await setLiquidator(deployer, manager.address, liquidator.address, usdte, token)

    // rewards [wavax => usdt.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, wavax, usdte, [wavax, usdte])
    await setLiquidator(deployer, manager.address, liquidator.address, wavax, usdte)

    // rewards [crv => wavax => usdt.e] 
    await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, usdte, [crv, wavax, usdte])
    await setLiquidator(deployer, manager.address, liquidator.address, crv, usdte)
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()