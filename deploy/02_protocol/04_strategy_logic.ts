import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();
  const {deploy, log} = deployments;

  log('Protocol - Strategy Logic');

  await deploy('OhAvalancheAaveV2Strategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });

  await deploy('OhAvalancheBenqiStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  await deploy('OhAvalancheBankerJoeStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  await deploy('OhCurveAPoolStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  await deploy('OhAlphaHomoraV2Strategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  await deploy('OhAvalancheBankerJoeFoldingStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });

  await deploy('OhPlatypusStrategy', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
  });
};

deploy.tags = ['Protocol', 'OhStrategy'];
deploy.dependencies = ['OhBank'];
export default deploy;
