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
  abiExporter: {
    flat: true,
    clear: true,
  },
  namedAccounts: {
    deployer: 0,
    token: '0x937E077aBaEA52d3abf879c9b9d3f2eBd15BAA21', // Oh! Finance Anyswap ERC-20
    usdce: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
    wavax: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    aaveUsdce: '0x46A51127C3ce23fb7AB1DE06226147F446e4a857',
    aaveLendingPool: {
      43113: '0x76cc67FF2CC77821A70ED14321111Ce381C2594D',
      43114: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
    },
    aaveIncentivesController: {
      43113: '0xa1EF206fb9a8D8186157FC817fCddcC47727ED55',
      43114: '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9',
    },
  },
  paths: {
    deploy: "./deploy",
  },
  typechain: {
    outDir: './types',
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