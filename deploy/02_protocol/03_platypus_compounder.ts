import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializePlatypusCompounderData} from 'lib/strategy';

// Deploy the Oh! Platypus Compounder Proxy
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Protocol: Oh! Platypus Compounder');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const ptpCompounderLogic = await ethers.getContract('OhPlatypusCompounder');
  const data = await getInitializePlatypusCompounderData(registry.address);
  const constructorArgs = [ptpCompounderLogic.address, proxyAdmin.address, data];

  await deploy('OhGlobalPlatypusCompounder', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhGlobalPlatypusCompounder'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhPlatypusCompounder'];
export default deploy;