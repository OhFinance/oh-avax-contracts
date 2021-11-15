// environment variables
import 'dotenv/config';

// import path resolution
import 'tsconfig-paths/register';

// hardhat config
import {HardhatUserConfig} from 'hardhat/config';

// hardhat
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import 'hardhat-deploy';
// import 'hardhat-gas-reporter';
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
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  mocha: {
    timeout: 200000
  },
  namedAccounts: {
    deployer: 0,
    worker: 1,
    token: '0x937E077aBaEA52d3abf879c9b9d3f2eBd15BAA21', // Oh! Finance Anyswap ERC-20
    aaveUsdce: {
      43114: '0x46A51127C3ce23fb7AB1DE06226147F446e4a857',
    },
    aaveLendingPool: {
      43113: '0x76cc67FF2CC77821A70ED14321111Ce381C2594D',
      43114: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
    },
    aaveIncentivesController: {
      43113: '0xa1EF206fb9a8D8186157FC817fCddcC47727ED55',
      43114: '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9',
    },
    benqi: {
      43114: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
    },
    benqiUsdce: {
      43114: '0xBEb5d47A3f720Ec0a390d04b4d41ED7d9688bC7F' // qiUSDC
    },
    benqiComptroller: {
      43114: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4'
    },
    crv: {
      43114: '0x47536F17F4fF30e64A96a7555826b8f9e66ec468'
    },
    crvAGauge: {
      43114: '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858'
    },
    crvAPool: {
      43114: '0x7f90122BF0700F9E7e1F688fe926940E8839F353'
    },
    crvAToken: {
      43114: '0x1337BedC9D22ecbe766dF105c9623922A27963EC'
    },
    joeRouter: {
      43114: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
    },
    joe: {
      43114: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    },
    joetroller: {
      43114: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC',
    },
    joeUsdce: {
      43114: '0xEd6AaF91a2B084bd594DBd1245be3691F9f637aC', // Banker Joe USD coin
    },
    usdce: {
      43114: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
    },
    wavax: {
      43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
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
      live: false,
      forking: {
        url: process.env.AVALANCHE_RPC_URL ?? 'https://api.avax.network/ext/bc/C/rpc',
        blockNumber: 6900000
      }
    },
    fuji: {
      chainId: 43113,
      url: '',
      accounts: process.env.TESTNET_DEPLOYER_KEY ? [`0x${process.env.TESTNET_DEPLOYER_KEY}`] : [],
    },
    mainnet: {
      chainId: 43114,
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: process.env.DEPLOYER_KEY ? [`0x${process.env.DEPLOYER_KEY}`] : [],
      gasPrice: 120000000000,
    }
  }
}

export default config