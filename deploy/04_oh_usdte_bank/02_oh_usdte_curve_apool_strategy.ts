import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurveAPoolStrategyData} from 'lib/strategy';

// deploy the Oh! USDT.e Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdte} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDT.e - Oh! USDT.e Curve Aave Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdteBank = await ethers.getContract('OhUsdteBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurveAPoolStrategy');

  const data = await getInitializeCurveAPoolStrategyData(
    registry.address,
    ohUsdteBank.address,
    usdte,
    '2'
  );
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdteCurveAPoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdteCurveAPoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdteBank'];
export default deploy;