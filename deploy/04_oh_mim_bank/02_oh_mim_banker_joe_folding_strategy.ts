import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankerJoeFoldingStrategyData} from 'lib/strategy';

// deploy the Oh! MIM Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, mim, joeMim} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! MIM Banker Joe Folding Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohMimBank = await ethers.getContract('OhMimBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bjLogic = await ethers.getContract('OhAvalancheBankerJoeFoldingStrategy');

  const data = await getInitializeBankerJoeFoldingStrategyData(
    registry.address,
    ohMimBank.address,
    mim,
    joeMim
  );
  const constructorArgs = [bjLogic.address, proxyAdmin.address, data];

  await deploy('OhMimBankerJoeFoldingStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhMimBankerJoeFoldingStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhMimBank'];
export default deploy;