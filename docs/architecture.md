# PayBlock – Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│   Browser (Next.js SPA)         Developer (REST API)            │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │ HTTPS                │ HTTPS
                   ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                      apps/api  (NestJS)                          │
│                                                                   │
│  AuthModule   PaymentsModule   ContractsModule   BlockchainModule │
│      │              │                │                 │         │
│      └──────────────┴────────────────┘                 │         │
│                      │                                  │         │
│               TypeORM (PostgreSQL)              ethers.js         │
└──────────────────────┬──────────────────────────────────┬────────┘
                       │                                  │
           ┌───────────▼───────────┐          ┌───────────▼────────┐
           │    PostgreSQL DB       │          │  Polygon / Hardhat │
           │  users                │          │                    │
           │  payments             │          │  PaymentRegistry   │
           │  payment_contracts    │          │  EscrowFactory     │
           └───────────────────────┘          │  Escrow            │
                                              │  MilestonePayment  │
                                              └────────────────────┘
```

## Module Responsibilities

### AuthModule
- Register / login with email + password (bcrypt)
- Issue JWT tokens (HS256)
- Passport.js JwtStrategy for route guards

### PaymentsModule
- Create Stripe PaymentIntents
- Handle Stripe webhooks (raw body)
- Anchor payment proofs on-chain after success
- Public `GET /payments/:id/verify` endpoint

### ContractsModule
- CRUD for payment contracts (escrow / milestone / subscription)
- Deploy contracts via EscrowFactory
- Trigger on-chain actions (release / refund / complete_milestone)

### BlockchainModule
- Thin service wrapping ethers.js
- Initialises provider + signer from environment variables
- Gracefully degrades if blockchain is not configured (dev mode)

## Security Considerations

1. **JWT** – secrets loaded from env; short expiry (`JWT_EXPIRES_IN`).
2. **Private keys** – never logged; loaded from env; dev uses a zero-value key.
3. **Stripe webhooks** – verified via HMAC signature before processing.
4. **Smart contracts** – ReentrancyGuard on all Ether transfer paths.
5. **Database** – parameterised queries via TypeORM; no raw string interpolation.
6. **Docker** – all services run as non-root users.
7. **CORS** – configured via `CORS_ORIGIN` env variable.

## Scalability Notes

- The API is stateless; horizontal scaling is possible behind a load balancer.
- Blockchain calls are async and non-blocking; failures are logged and retried.
- JSONB `config` and `metadata` columns allow schema-less extensibility.
- The `PaymentRegistry` contract uses O(1) mapping lookups.
