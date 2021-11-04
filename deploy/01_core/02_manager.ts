import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { getRegistryContract } from '@ohfinance/oh-contracts/lib';

// deploy the manager and add to registry
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer, token} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Manager');

  const registry = await getRegistryContract(deployer)

  await deploy('OhAvalancheManager', {
    from: deployer,
    args: [registry.address, token],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
};

deploy.tags = ['Core', 'OhManager'];
deploy.dependencies = ['OhRegistry'];
export default deploy;
