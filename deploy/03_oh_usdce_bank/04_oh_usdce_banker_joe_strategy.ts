import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeBankerJoeStrategyData} from 'lib/strategy';

// deploy the Oh! USDCe Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce, joeUsdce, joe, wavax, joetroller} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE Banker Joe Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdceBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const bjLogic = await ethers.getContract('OhAvalancheBankerJoeStrategy');

  const data = await getInitializeBankerJoeStrategyData(
    registry.address,
    ohUsdceBank.address,
    usdce,
    joeUsdce,
    joe,
    wavax,
    joetroller,
  );
  const constructorArgs = [bjLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdceBankerJoeStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdceBankerJoeStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;