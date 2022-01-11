import { getNamedAccounts } from "hardhat";
import { getUsdteBankContract, getUsdteCurveAPoolStrategyProxyContract } from "lib/contract";
import { updateBank } from "utils/tasks";

async function main() {
  try {
    const {deployer} = await getNamedAccounts()
    const bank = await getUsdteBankContract(deployer)
    const curveStrategy = await getUsdteCurveAPoolStrategyProxyContract(deployer)

    await updateBank(bank.address, [curveStrategy.address]);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()