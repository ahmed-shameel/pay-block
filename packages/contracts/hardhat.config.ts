import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env so private keys and RPC URLs are available during deploy
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY ?? '0x' + '0'.repeat(64);
const MUMBAI_RPC  = process.env.BLOCKCHAIN_RPC_URL ?? '';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // viaIR compiles through the Yul intermediate representation, which avoids
      // "stack too deep" errors in complex contracts and produces smaller bytecode.
      // Disable this flag if you need faster incremental compile times in development:
      //   set `viaIR: process.env.NODE_ENV !== 'test'`
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    polygon_mumbai: {
      url: MUMBAI_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    polygon_mainnet: {
      url: 'https://polygon-rpc.com',
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
