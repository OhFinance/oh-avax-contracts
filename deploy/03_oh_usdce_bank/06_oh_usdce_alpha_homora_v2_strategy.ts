import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getInitializeAlphaHomoraV2StrategyData} from 'lib/strategy';

// deploy the Oh! USDC.e Alpha Homora V2 Strategy
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deployer, usdce, ibUSDCv2Token} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('USDC.e - Oh! USDCE Alpha Homora V2 Strategy');

  const registry = await ethers.getContract('OhRegistry');
  const ohUsdceBank = await ethers.getContract('OhUsdceBank');
  const proxyAdmin = await ethers.getContract('OhProxyAdmin');
  const alphaHomoraV2Logic = await ethers.getContract('OhAlphaHomoraV2Strategy');

  const data = await getInitializeAlphaHomoraV2StrategyData(
    registry.address,
    ohUsdceBank.address,
    usdce,
    ibUSDCv2Token
  );
  const constructorArgs = [alphaHomoraV2Logic.address, proxyAdmin.address, data];

  await deploy('OhUsdceAlphaHomoraV2Strategy', {
    from: deployer,
    contract: 'OhUpgradeableProxy',
    args: constructorArgs,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['OhUsdceAlphaHomoraV2Strategy'];
deploy.dependencies = ['OhRegistry', 'OhProxyAdmin', 'OhStrategy', 'OhUsdceBank'];
export default deploy;