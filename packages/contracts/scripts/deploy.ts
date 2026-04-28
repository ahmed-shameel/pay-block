import { ethers, network } from 'hardhat';

/**
 * Deployment script for the PayBlock smart contracts.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network localhost
 *   npx hardhat run scripts/deploy.ts --network polygon_mumbai
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Network: ${network.name}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

  // ── PaymentRegistry ──────────────────────────────────────────
  console.log('Deploying PaymentRegistry…');
  const PaymentRegistry = await ethers.getContractFactory('PaymentRegistry');
  const registry = await PaymentRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`  PaymentRegistry deployed to: ${registryAddress}`);

  // ── EscrowFactory ────────────────────────────────────────────
  console.log('Deploying EscrowFactory…');
  const EscrowFactory = await ethers.getContractFactory('EscrowFactory');
  const factory = await EscrowFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`  EscrowFactory deployed to:   ${factoryAddress}`);

  console.log('\n✅ Deployment complete!');
  console.log('\nAdd these to your .env file:');
  console.log(`PAYMENT_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`ESCROW_FACTORY_ADDRESS=${factoryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
