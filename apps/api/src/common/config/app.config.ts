import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL ?? '',
  blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY ?? '',
  paymentRegistryAddress: process.env.PAYMENT_REGISTRY_ADDRESS ?? '',
  escrowFactoryAddress: process.env.ESCROW_FACTORY_ADDRESS ?? '',
}));
