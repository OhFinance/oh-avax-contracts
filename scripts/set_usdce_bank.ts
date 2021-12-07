import { getNamedAccounts } from "hardhat";
import { getUsdceAaveV2StrategyContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract,
  getUsdceBenqiStrategyContract, getUsdceCurveAPoolStrategyContract, getUsdceAlphaHomoraV2StrategyContract } from "lib/contract";
import { updateBank } from "utils/tasks";

async function main() {
  try {
    const {deployer} = await getNamedAccounts()
    const bank = await getUsdceBankContract(deployer)
    const aaveV2Strategy = await getUsdceAaveV2StrategyContract(deployer)
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer)
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer)
    const curveStrategy = await getUsdceCurveAPoolStrategyContract(deployer)
    const alphaHomoraV2Strategy = await getUsdceAlphaHomoraV2StrategyContract(deployer)

    await updateBank(bank.address, [aaveV2Strategy.address, bankerJoeStrategy.address, benqiStrategy.address, curveStrategy.address, alphaHomoraV2Strategy.address]);
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()

