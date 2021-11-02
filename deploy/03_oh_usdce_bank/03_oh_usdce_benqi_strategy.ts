import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { getInitializeBenqiStrategyData } from 'lib/strategy';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce, benqiUsdce, benqi, benqiComptroller, wavax} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE AaveV2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdceBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const benqiLogic = await ethers.getContract('OhAvalancheBenqiStrategy');

  // build the data's for the strategies
  const data = await getInitializeBenqiStrategyData(
    registry.address,
    ohUsdceBank.address,
    usdce,
    benqiUsdce,
    benqi,
    wavax,
    benqiComptroller
  );
  const constructorArgs = [benqiLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdceBenqiStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdceBenqiStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;