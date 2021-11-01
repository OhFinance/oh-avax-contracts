// environment variables
import 'dotenv/config';

// import path resolution
import 'tsconfig-paths/register';

// hardhat config
import {HardhatUserConfig, task} from 'hardhat/config';

// hardhat
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: 0
  },
  paths: {
    deploy: "./deploy",
  },
  external: {
    contracts: [
      {
        artifacts: "../node_modules/@ohfinance/oh-contracts/artifacts"
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 43114,
      live: false
    }
  }
}

export default config