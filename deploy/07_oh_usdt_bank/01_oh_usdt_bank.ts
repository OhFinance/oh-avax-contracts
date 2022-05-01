import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from '@ohfinance/oh-contracts/lib';

// deploy the Oh! USDT Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, usdt} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDT Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! USDT Bank initializer bytecode
  const data = getInitializeBankData('Oh! USDT', 'OH-USDT', registry.address, usdt);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data]

  // deploy the Oh! USDT Bank Proxy
  await deploy('OhUsdtBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhUsdtBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
