import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from '@ohfinance/oh-contracts/lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdce} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDC Bank initializer bytecode
  const data = getInitializeBankData('Oh! USDC.e', 'OH-USDC.e', registry.address, usdce);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data]

  // deploy the Oh! USDC Bank Proxy
  await deploy('OhUsdceBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhUsdceBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
