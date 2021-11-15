import { getLiquidatorContract, setLiquidator, setSwapRoutes } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract } from "lib/contract";

async function main() {
  try {
    const {deployer, usdce, joeRouter, crv, wavax} = await getNamedAccounts();
    const liquidator = await getLiquidatorContract(deployer);
    const manager = await getAvalancheManagerContract(deployer);

    await setSwapRoutes(deployer, liquidator.address, joeRouter, crv, usdce, [crv, wavax, usdce])
    await setLiquidator(deployer, manager.address, liquidator.address, crv, usdce)
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()

