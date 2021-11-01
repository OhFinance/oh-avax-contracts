import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {OhRegistry} from '@ohfinance/oh-contracts';

// deploy the manager and add to registry
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, token, wavax} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Liquidator');

  const registry = await ethers.getContract('OhRegistry');

  const result = await deploy('OhLiquidatorV2', {
    from: deployer,
    args: [registry.address, wavax],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });


  // add route [wavax, usdce]
}

export default deploy