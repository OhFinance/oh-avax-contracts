// import {DeployFunction} from 'hardhat-deploy/types';
// import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy = async function (hre:any) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  console.log(deployer)

  log('Core - Registry');

  const result = await deploy('OhRegistry', {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });

  console.log(result)
  console.log(result.address)
};

deploy.tags = ['Core', 'OhRegistry'];
export default deploy;
