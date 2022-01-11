import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from '@ohfinance/oh-contracts/lib';

// deploy the Oh! USDC Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdte} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDT.e - Oh! USDT.e Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDT Bank initializer bytecode
  const data = getInitializeBankData('Oh! USDT.e', 'OH-USDT.e', registry.address, usdte);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data]

  // deploy the Oh! USDT Bank Proxy
  await deploy('OhUsdteBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhUsdteBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
