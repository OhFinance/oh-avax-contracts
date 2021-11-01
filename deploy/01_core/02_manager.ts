import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhRegistry} from '@ohfinance/oh-contracts';

// deploy the manager and add to registry
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, token} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Manager');

  const registry = (await ethers.getContract('OhRegistry')) as OhRegistry;

  const result = await deploy('OhManager', {
    from: deployer,
    args: [registry.address, token],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    log('Setting Manager');

    await registry.setManager(result.address);
  }
};

deploy.tags = ['Core', 'OhManager'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
