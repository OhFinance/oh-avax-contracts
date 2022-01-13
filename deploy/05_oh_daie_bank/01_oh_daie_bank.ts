import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from '@ohfinance/oh-contracts/lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, daie} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('DAI.e - Oh! DAI.e Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDC Bank initializer bytecode
  const data = getInitializeBankData('Oh! DAI.e', 'OH-DAI.e', registry.address, daie);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data]

  // deploy the Oh! USDC Bank Proxy
  await deploy('OhDaieBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhDaieBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
