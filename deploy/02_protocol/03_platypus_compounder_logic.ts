import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts} = hre;
    const {deployer} = await getNamedAccounts();
    const {deploy, log} = deployments;
  
    log('Protocol - Platypus Compounder Logic');

    await deploy('OhPlatypusCompounder', {
        from: deployer,
        log: true,
        deterministicDeployment: false,
        skipIfAlreadyDeployed: false,
    });
}

deploy.tags = ['Protocol', 'OhPlatypusCompounder'];
export default deploy;