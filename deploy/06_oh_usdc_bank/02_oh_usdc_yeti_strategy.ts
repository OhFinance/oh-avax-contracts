import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeYetiStrategyData} from 'lib/strategy';

// deploy the Oh! USDC.e Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdc} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC - Oh! USDC YETI Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdcBank = await ethers.getContract('OhUsdcBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const yetiLogic = await ethers.getContract('OhYetiStrategy');

  const data = await getInitializeYetiStrategyData(
    registry.address,
    ohUsdcBank.address,
    usdc,
    '1'
  );
  const constructorArgs = [yetiLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdcYetiStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdcYetiStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdcBank'];
export default deploy;