import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeAaveV2StrategyData} from 'lib/strategy';

// deploy the Oh! USDCe Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce, aaveUsdce} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE AaveV2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const aaveV2Logic = await ethers.getContract('OhAvalancheAaveV2Strategy');

  // build the data's for the strategies
  const data = await getInitializeAaveV2StrategyData(
    registry.address,
    ohUsdcBank.address,
    usdce,
    aaveUsdce
  );
  const constructorArgs = [aaveV2Logic.address, proxyAdmin.address, data];

  await deploy('OhUsdceAaveV2Strategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdceAaveV2Strategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;