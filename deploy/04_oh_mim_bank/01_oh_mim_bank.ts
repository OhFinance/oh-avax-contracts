import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankData} from '@ohfinance/oh-contracts/lib';

// deploy the Oh! MIM Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts, network, run} = hre;
  const {deployer, mim} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('MIM - Oh! MIM Bank');

  const registry = await ethers.getContract('OhRegistry');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bankLogic = await ethers.getContract('OhBank');

  // get Oh! MIM Bank initializer bytecode
  const data = getInitializeBankData('Oh! MIM', 'OH-MIM', registry.address, mim);
  const constructorArguments = [bankLogic.address, proxyAdmin.address, data]

  // deploy the Oh! MIM Bank Proxy
  await deploy('OhMimBank', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArguments,
    log: true,
    deterministicDeployment: false,
  });
};

deploy.tags = ['OhMimBank'];
deploy.dependencies = ['OhRegistry', 'OhBank', 'OhProxyAdmin'];
export default deploy;
