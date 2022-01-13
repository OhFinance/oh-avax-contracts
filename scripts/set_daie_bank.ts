import { getNamedAccounts } from "hardhat";
import { getDaieBankContract, getDaieCurveAPoolStrategyProxyContract } from "lib/contract";
import { updateBank } from "utils/tasks";

async function main() {
  try {
    const {deployer} = await getNamedAccounts()
    const bank = await getDaieBankContract(deployer)
    const curveStrategy = await getDaieCurveAPoolStrategyProxyContract(deployer)

    await updateBank(bank.address, [curveStrategy.address]);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()