import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, wavax} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Liquidator');

  const registry = await ethers.getContract('OhRegistry');

  await deploy('OhLiquidatorV2', {
    from: deployer,
    args: [registry.address, wavax],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
}

deploy.tags = ['Core', 'OhLiquidator'];
deploy.dependencies = ['OhManager'];
export default deploy