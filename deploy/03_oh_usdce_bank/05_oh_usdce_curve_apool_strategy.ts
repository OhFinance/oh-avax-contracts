import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurveAPoolStrategyData} from 'lib/strategy';

// deploy the Oh! USDC.e Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE Curve Aave Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdceBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurveAPoolStrategy');

  const data = await getInitializeCurveAPoolStrategyData(
    registry.address,
    ohUsdceBank.address,
    usdce,
    '1'
  );
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdceCurveAPoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdceCurveAPoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;