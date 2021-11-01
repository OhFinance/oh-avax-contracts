// import {DeployFunction} from 'hardhat-deploy/types';
// import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy = async function (hre:any) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Core - Registry');

  await deploy('OhRegistry', {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });
};

deploy.tags = ['Core', 'OhRegistry'];
export default deploy;
