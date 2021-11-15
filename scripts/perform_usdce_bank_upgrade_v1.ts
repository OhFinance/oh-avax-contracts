import { addStrategy, removeStrategy } from "@ohfinance/oh-contracts/lib";
import { getNamedAccounts } from "hardhat";
import { getAvalancheManagerContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract, getUsdceBenqiStrategyContract, getUsdceCurveAPoolStrategyContract } from "lib/contract";

async function main() {
  try {
    const {deployer, ohUsdceAaveV2Strategy, ohUsdceBankerJoeStrategy, ohUsdceBenqiStrategy} = await getNamedAccounts();
    const manager = await getAvalancheManagerContract(deployer);
    const bank = await getUsdceBankContract(deployer)
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer);
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer);
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(deployer);

    await removeStrategy(deployer, manager.address, bank.address, ohUsdceAaveV2Strategy)
    await removeStrategy(deployer, manager.address, bank.address, ohUsdceBankerJoeStrategy)
    await removeStrategy(deployer, manager.address, bank.address, ohUsdceBenqiStrategy)

    await addStrategy(deployer, manager.address, bank.address, bankerJoeStrategy.address);
    await addStrategy(deployer, manager.address, bank.address, benqiStrategy.address)
    await addStrategy(deployer, manager.address, bank.address, crvStrategy.address)
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
}

main()
    
    