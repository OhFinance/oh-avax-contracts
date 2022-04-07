import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializePlatypusStrategyData} from 'lib/strategy';

// deploy the Oh! USDCe Bank Proxies
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce, ptpUsdceLpToken} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE Platypus Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdceBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const ptpLogic = await ethers.getContract('OhPlatypusStrategy');
  const ptpCompounderLogic = await ethers.getContract('OhPlatypusCompounder');

  const data = await getInitializePlatypusStrategyData(
    registry.address,
    ohUsdceBank.address,
    usdce,
    ptpUsdceLpToken,
    ptpCompounderLogic.address,
    1
  );
  const constructorArgs = [ptpLogic.address, proxyAdmin.address, data];

  await deploy('OhUsdcePlatypusStrategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdcePlatypusStrategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;