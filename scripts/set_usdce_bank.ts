import { getNamedAccounts } from "hardhat";
import { getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract, getUsdceBenqiStrategyContract } from "lib/contract";
import { updateBank } from "utils/tasks";

async function main() {
  try {
    const {deployer} = await getNamedAccounts()
    const bank = await getUsdceBankContract(deployer)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)

    await updateBank(bank.address, [aaveV2Strategy.address, bankerJoeStrategy.address, benqiStrategy.address]);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()

