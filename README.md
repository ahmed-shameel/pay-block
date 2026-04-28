# PayBlock 🔗💳

> A production-grade hybrid payment platform that combines traditional fiat payments (Stripe) with blockchain-based verification and programmable payment contracts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-purple)](https://docs.soliditylang.org)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Hybrid Payments** | Accept fiat via Stripe; anchor immutable proofs on Polygon/Ethereum |
| **Escrow Contracts** | Lock funds in a Solidity escrow; release or refund via the API |
| **Milestone Payments** | Incremental payment release tied to project milestones |
| **Subscription Logic** | Configurable subscription contracts |
| **Public Verification** | Anyone can verify a payment proof without authentication |
| **Developer API** | RESTful NestJS API with full OpenAPI/Swagger docs |
| **Dashboard UI** | Next.js + Tailwind dashboard for transactions and contracts |

---

## 🏗️ Monorepo Structure

```
pay-block/
├── apps/
│   ├── api/                    # NestJS backend (REST API)
│   │   └── src/
│   │       ├── auth/           # JWT authentication
│   │       ├── payments/       # Stripe + blockchain payments
│   │       ├── contracts/      # Programmable payment contracts
│   │       └── blockchain/     # ethers.js service layer
│   └── web/                    # Next.js + Tailwind dashboard
│       └── src/
│           ├── app/            # Next.js App Router pages
│           ├── components/     # Reusable UI components
│           └── lib/            # API client, React Query provider
├── packages/
│   └── contracts/              # Hardhat + Solidity smart contracts
│       ├── contracts/
│       │   ├── Escrow.sol
│       │   ├── EscrowFactory.sol
│       │   ├── MilestonePayment.sol
│       │   └── PaymentRegistry.sol
│       ├── scripts/deploy.ts
│       └── test/
├── docs/
│   ├── architecture.md
│   └── schema.sql
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Docker & Docker Compose (for the full stack)
- A Stripe account (test keys are fine)
- An Alchemy / Infura RPC URL for Polygon Mumbai (optional, for blockchain features)

### 1. Clone & install

```bash
git clone https://github.com/ahmed-shameel/pay-block.git
cd pay-block
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your Stripe keys, database credentials, and RPC URL
```

### 3. Start with Docker Compose

```bash
docker-compose up
```

This starts:
- PostgreSQL on port `5432`
- Local Hardhat node on port `8545`
- NestJS API on port `3001`
- Next.js dashboard on port `3000`

### 4. Or run services individually

```bash
# Start the API in development (watch mode)
npm run dev:api

# Start the frontend
npm run dev:web

# Start a local blockchain node
npm run dev:contracts
```

---

## 🔌 API Reference

The full OpenAPI spec is available at **`http://localhost:3001/api/docs`** when the API is running.

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new account |
| `POST` | `/api/auth/login` | — | Login and receive JWT |
| `POST` | `/api/payments` | ✅ JWT | Create a Stripe payment |
| `GET`  | `/api/payments` | ✅ JWT | List your payments |
| `GET`  | `/api/payments/:id/verify` | — | **Public** on-chain proof verification |
| `POST` | `/api/contracts` | ✅ JWT | Create a payment contract |
| `POST` | `/api/contracts/:id/deploy` | ✅ JWT | Deploy contract to blockchain |
| `POST` | `/api/contracts/:id/actions` | ✅ JWT | Trigger a contract action |

### Example: Create a payment

```bash
curl -X POST http://localhost:3001/api/payments \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "usd"}'
```

### Example: Create an escrow contract

```bash
curl -X POST http://localhost:3001/api/contracts \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "escrow",
    "beneficiaryRef": "alice@example.com",
    "amount": 5000,
    "currency": "usd",
    "config": { "releaseCondition": "Delivery confirmed" }
  }'
```

---

## 🔐 Smart Contracts

### Contracts

| Contract | Description |
|---|---|
| `PaymentRegistry` | Stores immutable payment proofs (keccak-256) on-chain |
| `Escrow` | Single-payment escrow with depositor/beneficiary/arbitrator |
| `EscrowFactory` | Factory for creating Escrow contracts |
| `MilestonePayment` | Milestone-based incremental payment release |

### Compile & Test

```bash
cd packages/contracts
npm install
npm run compile
npm test
```

### Deploy to local Hardhat node

```bash
npm run deploy:local
```

### Deploy to Polygon Mumbai testnet

```bash
# Ensure BLOCKCHAIN_RPC_URL and BLOCKCHAIN_PRIVATE_KEY are set in .env
npm run deploy
```

---

## 🧪 Running Tests

```bash
# Run all tests across all workspaces
npm test

# Backend unit tests only
npm run test --workspace=apps/api

# Smart contract tests only
npm run test --workspace=packages/contracts
```

---

## 🔒 Security

- All passwords are hashed with **bcrypt** (12 rounds)
- JWTs are signed with a secret loaded from environment variables
- Stripe webhooks are verified via **HMAC signature**
- Smart contracts use **ReentrancyGuard** on all Ether transfer paths
- Docker containers run as **non-root users**
- Private keys are **never** logged or committed

---

## 🗄️ Database Schema

See [`docs/schema.sql`](docs/schema.sql) for the full PostgreSQL schema.

Key tables:
- **`users`** – accounts with hashed passwords
- **`payments`** – fiat/crypto payment records with blockchain anchoring
- **`payment_contracts`** – programmable contract configurations and on-chain state

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

MIT © [ahmed-shameel](https://github.com/ahmed-shameel)