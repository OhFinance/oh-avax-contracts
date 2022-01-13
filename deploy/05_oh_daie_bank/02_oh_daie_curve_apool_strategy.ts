import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeCurveAPoolStrategyData} from 'lib/strategy';

// deploy the Oh! DAI.e Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, daie} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('DAI.e - Oh! DAI.e Curve Aave Pool Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohDaieBank = await ethers.getContract('OhDaieBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const crv3PoolLogic = await ethers.getContract('OhCurveAPoolStrategy');

  const data = await getInitializeCurveAPoolStrategyData(
    registry.address,
    ohDaieBank.address,
    daie,
    '0'
  );
  const constructorArgs = [crv3PoolLogic.address, proxyAdmin.address, data];

  await deploy('OhDaieCurveAPoolStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhDaieCurveAPoolStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhDaieBank'];
export default deploy;