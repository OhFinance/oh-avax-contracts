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
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  etherscan: {
    // apiKey: {
    //   avalanche: process.env.SNOWTRACE_API_KEY || ''
    // }
  },
  mocha: {
    timeout: 200000
  },
  namedAccounts: {
    deployer: 0,
    worker: 1,
    token: '0x937E077aBaEA52d3abf879c9b9d3f2eBd15BAA21', // Oh! Finance Anyswap ERC-20
    ohLiquidator: '0xF955624a897A80A965FFA2E8472899CF3C571d34',
    ohManager: '0xFB288999e57DA77de3832D425816F87856DC40B9',
    ohProxyAdmin: '0x9a79E220B244A43C3c9E4bc427a270f71a5Ea595',
    ohRegistry: '0x2046547d3768A94de530FBbA86CD821D4cCf0165',
    ohUsdce: '0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB',
    ohUsdceAaveV2Strategy: '0xf6eFc37389e7A3af9ABde4D14e4b9C33F2f6EB5A', // old
    ohUsdceBankerJoeStrategy: '0x98816EB4c559F2006eDb860e7ff6cb9C68d0C324', // old
    ohUsdceBenqiStrategy: '0x390c1a5Dac5bAa501Ec8E31A041C4086791CecF7', // old
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
    alpha: {
      43114: '0x0000000000000000000000000000000000000000' // Zero address until the Alpha Token contract is deployed on Avalanche
    },
    avalancheBridgeUsdce: {
      43114: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'
    },
    avalancheBridgeUsdte: {
      43114: '0xc7198437980c041c805a1edcba50c1ce5db95118'
    },
    avalancheBridgeDaie: {
      43114: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70'
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
    ibUSDCv2Token: {
      43114: '0xD3843b60e69f958eF93BeC299467e6Ed301CbEeB' 
    },
    crUSDCeToken: {
      43114: '0xe28965073c49a02923882b8329d3e8c1d805e832' // CREAM USDCe Token
    },
    usdc: {
      43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
    },
    usdt: {
      43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
    },
    usdcSafeBox: {
      43114: '0xD3843b60e69f958eF93BeC299467e6Ed301CbEeB' // ibUSDC token is same address as SafeBox
    },
    joeRouter: {
      43114: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
    },
    joe: {
      43114: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'
    },
    joetroller: {
      43114: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC'
    },
    joeUsdce: {
      43114: '0xEd6AaF91a2B084bd594DBd1245be3691F9f637aC' // Banker Joe USD coin
    },
    joeMim: {
      43114: '0xce095a9657a02025081e0607c8d8b081c76a75ea' // Banker Joe MIM coin
    },
    mim: {
      43114: '0x130966628846bfd36ff31a822705796e8cb8c18d'
    },
    daie: {
      43114: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70' // DAI.e
    },
    ptpToken: {
      43114: '0x22d4002028f537599bE9f666d1c4Fa138522f9c8'
    },
    ptpPool: {
      43114: '0x66357dCaCe80431aee0A7507e2E361B7e2402370'
    },
    ptpMasterPlatypusV2: {
      43114: '0x68c5f4374228BEEdFa078e77b5ed93C28a2f713E'
    },
    ptpUsdceLpToken: {
      43114: '0x909b0ce4fac1a0dca78f8ca7430bbafeeca12871'
    },
    ptpUsdteLpToken: {
      43114: '0x0d26d103c91f63052fbca88aaf01d5304ae40015'
    },
    ptpDaieLpToken: {
      43114: '0xc1daa16e6979c2d1229cb1fd0823491ea44555be'
    },
    ptpUsdcLpToken: {
      43114: '0xAEf735B1E7EcfAf8209ea46610585817Dc0a2E16'
    },
    ptpUsdtLpToken: {
      43114: '0x776628A5C37335608DD2a9538807b9bba3869E14'
    },
    vePtp: {
      43114: '0x5857019c749147eee22b1fe63500f237f3c1b692'
    },
    usdc: {
      43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
    },
    usdt: {
      43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
    },
    usdce: {
      43114: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' // USDC.e
    },
    usdte: {
      43114: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' // USDT.e
    },
    wavax: {
      43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
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
        blockNumber: 	13785820
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
      gasPrice: 40000000000,
    }
  }
}

export default config