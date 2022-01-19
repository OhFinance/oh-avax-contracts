import { getNamedAccounts } from "hardhat";
import { getMimBankContract, getMimBankerJoeFoldingStrategyProxyContract } from "lib/contract";
import { updateBank } from "utils/tasks";

async function main() {
  try {
    const {deployer} = await getNamedAccounts()
    const bank = await getMimBankContract(deployer)
    const joeStrategy = await getMimBankerJoeFoldingStrategyProxyContract(deployer)

    await updateBank(bank.address, [joeStrategy.address]);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()