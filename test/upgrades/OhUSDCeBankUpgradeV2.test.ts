
import { financeAll, getBankContract, removeStrategy } from "@ohfinance/oh-contracts/lib";
import { impersonateAccount } from "@ohfinance/oh-contracts/utils";
import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat"

const DEPLOYER_ADDRESS = '0x000000010b5AFA32AB82B72625D68571B11EAE13'
// const STRATEGIC_ADDRESS = '0x33333331d5205cC38e34a1c245Df69985B9E5Be5'

describe('Oh! USDC.e Upgrade V2', function () {
  let deployer: string
  // let strategic: string

  before(async function () {
    await deployments.fixture(['OhStrategy', 'OhUsdceBankerJoeStrategy', 'OhUsdceBenqiStrategy', 'OhUsdceCurveAPoolStrategy'])

    await impersonateAccount([DEPLOYER_ADDRESS]);
    // await impersonateAccount([STRATEGIC_ADDRESS]);
    deployer = (await ethers.getSigner(DEPLOYER_ADDRESS)).address;    
    // strategic = (await ethers.getSigner(STRATEGIC_ADDRESS)).address;    
  })

  it('removes BankerJoe and Benqi Strategy', async function () {
    const {ohManager, ohUsdce} = await getNamedAccounts();
    const bank = await getBankContract(deployer, ohUsdce);

    const balanceBefore = await bank.virtualBalance();
    console.log("balance before:", balanceBefore.toString())

    await removeStrategy(deployer, ohManager, ohUsdce, "0xA8f537eEC73C558Dd48b8ef5627a143FfaE4C04C") //banker joe
    await removeStrategy(deployer, ohManager, ohUsdce, "0x0945235D08c692937eeF30fd44e7D53A6f103476") //benqi
        
    const balance = await bank.virtualBalance();
    console.log("Balance after:", balance.toString())

    await financeAll(deployer, ohManager, ohUsdce);

    const finalBalance = await bank.virtualBalance();
    console.log("Final balance:", finalBalance.toString())

    const totalStrategies = await bank.totalStrategies();
    expect(totalStrategies.toNumber()).eq(1);
  })
})