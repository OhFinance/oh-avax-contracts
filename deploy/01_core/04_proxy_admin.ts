import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import { getRegistryContract } from '@ohfinance/oh-contracts/lib';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Proxy Admin');

  const registry = await getRegistryContract(deployer)

  await deploy('OhProxyAdmin', {
    from: deployer,
    args: [registry.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });
};

deploy.tags = ['Core', 'OhProxyAdmin'];
deploy.dependencies = ['OhLiquidator'];
export default deploy;
