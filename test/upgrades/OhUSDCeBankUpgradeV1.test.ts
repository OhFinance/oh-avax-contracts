import { formatUnits, parseEther } from "@ethersproject/units";
import { addStrategy, approve, deposit, finance, financeAll, getBankContract, getERC20Contract, getProxyAdminContract, rebalance, removeStrategy, setLiquidator, setSwapRoutes, upgradeProxy, withdraw } from "@ohfinance/oh-contracts/lib";
import { advanceNBlocks, advanceNSeconds, impersonateAccount, ONE_DAY } from "@ohfinance/oh-contracts/utils";
import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { getAvalancheBankerJoeStrategyContract, getAvalancheBenqiStrategyContract, getAvalancheManagerContract, getUsdceBankContract, getUsdceBankerJoeStrategyContract, getUsdceBenqiStrategyContract, getUsdceCurveAPoolStrategyContract } from "lib/contract";
import { swapAvaxForTokens } from "utils/swap";

const DEPLOYER_ADDRESS = '0x000000010b5AFA32AB82B72625D68571B11EAE13'
// const STRATEGIC_ADDRESS = '0x33333331d5205cC38e34a1c245Df69985B9E5Be5'

describe('Oh! USDC.e Upgrade V1', function () {
  let deployer: string
  // let strategic: string

  before(async function () {
    await deployments.fixture(['OhStrategy', 'OhUsdceBankerJoeStrategy', 'OhUsdceBenqiStrategy', 'OhUsdceCurveAPoolStrategy'])

    await impersonateAccount([DEPLOYER_ADDRESS]);
    // await impersonateAccount([STRATEGIC_ADDRESS]);
    deployer = (await ethers.getSigner(DEPLOYER_ADDRESS)).address;    
    // strategic = (await ethers.getSigner(STRATEGIC_ADDRESS)).address;    
  })

  it('removes Avalanche Aave V2 Strategy', async function () {
    const {ohManager, ohUsdce, ohUsdceAaveV2Strategy, ohUsdceBankerJoeStrategy, ohUsdceBenqiStrategy} = await getNamedAccounts();
    const bank = await getBankContract(deployer, ohUsdce);

    const balanceBefore = await bank.virtualBalance();

    await financeAll(deployer, ohManager, ohUsdce);

    await removeStrategy(deployer, ohManager, ohUsdce, ohUsdceAaveV2Strategy)
    await removeStrategy(deployer, ohManager, ohUsdce, ohUsdceBankerJoeStrategy)
    await removeStrategy(deployer, ohManager, ohUsdce, ohUsdceBenqiStrategy)

    const totalStrategies = await bank.totalStrategies();
    const balance = await bank.virtualBalance();

    expect(totalStrategies.toNumber()).eq(0);
    expect(balance).gt(balanceBefore);
  })

  it('adds Avalanche Curve APool Strategy', async function () {
    const {ohManager, ohUsdce} = await getNamedAccounts();
    const bank = await getBankContract(deployer, ohUsdce);
    const bankerJoeStrategy = await getUsdceBankerJoeStrategyContract(deployer);
    const benqiStrategy = await getUsdceBenqiStrategyContract(deployer);
    const crvStrategy = await getUsdceCurveAPoolStrategyContract(deployer);

    await addStrategy(deployer, ohManager, ohUsdce, bankerJoeStrategy.address);
    await addStrategy(deployer, ohManager, ohUsdce, benqiStrategy.address)
    await addStrategy(deployer, ohManager, ohUsdce, crvStrategy.address)

    const totalStrategies = await bank.totalStrategies();

    expect(totalStrategies.toNumber()).eq(3);
  })

  // it('allows users to deposit and allows investing after updates', async function () {
  //   const {worker, ohUsdce, ohManager} = await getNamedAccounts()
  //   const bank = await getBankContract(strategic, ohUsdce)

  //   const totalStrategies = await bank.totalStrategies();

  //   await financeAll(worker, ohManager, ohUsdce);

  //   for (let i = 0; i < totalStrategies.toNumber(); i++) {
  //     const strategyBalance = await bank.strategyBalance(i);
  //     expect(strategyBalance).to.be.gt(0);
  //   }

  //   await advanceNSeconds(ONE_DAY);
  //   await advanceNBlocks(1);

  //   await rebalance(worker, ohManager, ohUsdce)

  //   const virtualBalance = await bank.virtualBalance();
  //   const virtualPrice = await bank.virtualPrice();

  //   console.log('Virtual Balance is:', formatUnits(virtualBalance.toString(), 6));
  //   console.log('Virtual Price is:', formatUnits(virtualPrice.toString(), 6));

  //   const shares = await bank.balanceOf(strategic);

  //   let batch = shares.div(10);
  //   const withdrawCount = 6;
  //   for (let i = 0; i < withdrawCount; i++) {
  //     await withdraw(strategic, bank.address, batch.toString());
  //   }

  //   let remainingShares = await bank.balanceOf(strategic);
  //   await withdraw(strategic, bank.address, remainingShares.toString());

  //   // const endBalance = await usdceToken.balanceOf(worker);
  //   // console.log('Ending Balance is:', formatUnits(endBalance.toString(), 6));
  // });
})