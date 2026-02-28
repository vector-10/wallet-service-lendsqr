# Demo Credit — Wallet Service

A backend wallet service built to enable lending functionality. Users can create accounts (with a wallet provisioned automatically), fund their wallets, transfer funds to other users, withdraw funds, and view their transaction history. 
On signup, the Lendsqr Adjutor Karma blacklist is used to detect past loan defaulters and refuse them getting onboarded.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Design Decisions](#design-decisions)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [API Overview](#api-overview)
- [Known Limitations](#known-limitations)
- [Project Structure](#project-structure)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express  |
| Database | MySQL |
| Query ORM | Knex.js |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| BVN Encryption | AES-256-CBC (Node crypto) |
| Blacklist Check | Lendsqr Adjutor Karma API |
| Rate Limiting | express-rate-limit |
| Testing | Jest  |

---

## Entity Relationship Diagram

![ERD](https://erd.dbdesigner.net/designer/schema/1772075466-lensqr-wallet-service)

> **Relationships:**
> - One `user` has exactly one `wallet` (created atomically during registration)
> - One `wallet` can appear as `source_wallet_id` or `destination_wallet_id` on many `transactions`
> - `source_wallet_id` is `NULL` for fund operations (money coming in from outside)
> - `destination_wallet_id` is `NULL` for withdrawal operations (money going out)

---

## Design Decisions

### Why MySQL
MySQL is a natural fit for a service handling financial data. It offers multiple benefits like ACID compliance, Data Integrity plus security and regulatory compliance in the industry. The relational model also makes it straightforward to enforce the one-user-one-wallet constraint at the schema level.

### Wallet provisioning at registration
The user insert and wallet insert queries happen inside a single database transaction. Either both succeed or not. This means there is no window where a user exists without a wallet.

### Row-level locking on transfers
When performing transfers, Knex's `forUpdate()` was used to lock both wallets inside the transaction in ascending `user_id` order no matter who is sending and who is receiving. This means every concurrent transfer grabs locks in the same order, so this eliminates risk of a dead-lock.

The balance check also happens inside the locked transaction — not before it. This means if two transfers try to drain the same wallet at the same time, the second one will see the already-updated balance from the first and correctly reject with insufficient funds, rather than both passing validation on a stale balance read.


### Karma check returns 404 for clean users
The Adjutor API returns `404` when a BVN is not on the blacklist (not found = not blacklisted). Any other error (network failure, 5xx) is treated as a service outage and returns `503` to the caller rather than silently allowing registration.

### Minimum balance enforcement
Every wallet has a `minimum_balance` of NGN 100 that cannot be spent. Withdrawals and transfers are rejected if the transaction would leave the sender's balance below this floor.


### Why Express over NestJS
Express was chosen for its minimal abstraction layer and full control over middleware, routing, and transaction boundaries. For a relatively small, single-service application, this keeps the architecture explicit and avoids unnecessary framework overhead.

### Security considerations
The assessment spec noted that a faux token-based authentication would suffice. A single JWT is issued on login and verified on every protected request. There are no refresh tokens or token rotation — that would be the next step toward a production-grade auth system.

- Passwords are hashed with bcrypt before storage and never returned in any response
- BVN is used for Adjutor API check as each user has only one, as opposed to email or account number which a user can have multiple options
- BVN is encrypted at rest using AES-256-CBC and excluded from all API responses
- JWT tokens are stateless and short-lived (`JWT_EXPIRES_IN` in env)
- Auth routes are rate-limited to 10 requests per 15 minutes per IP to slow brute-force attempts
- Sensitive fields (`password_hash`, `bvn`, `karma_checked_at`) are removed from user objects when returning data

---

## Getting Started

### Prerequisites

- Node.js >= 18 (Version 24 LTS recommended)
- MySQL >= 8
- pnpm (or npm / yarn)  

### Installation

```bash
git clone https://github.com/vector-10/wallet-service-lendsqr.git
cd wallet-service-lendsqr
pnpm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: `5000`) |
| `NODE_ENV` | `development` / `test` / `production` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: `3306`) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (test DB is `<DB_NAME>_test`) |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7h` |
| `ADJUTOR_BASE_URL` | Lendsqr Adjutor base URL |
| `ADJUTOR_API_KEY` | Lendsqr Adjutor API key |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-CBC BVN encryption |

### Database Setup

```bash
# Create the database first, then run migrations
pnpm migrate
```

---

## Running the App

```bash
# Development (with hot reload)
pnpm dev

# Production build
pnpm build
pnpm start
```

Health check:

```bash
curl http://localhost:5000/health
```

---

## Running Tests

```bash
# Run all tests with coverage
pnpm test

# Watch mode
pnpm test:watch
```

Tests use a separate `<DB_NAME>_test` database. All service and route layers are tested against mocked dependencies — no live database or external API calls are made during the test suite.

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

**Authentication**

| Method | Endpoint |
|---|---|
| `POST` | `/auth/register` |
| `POST` | `/auth/login` |

**Wallet** — requires `Authorization: Bearer <token>`

| Method | Endpoint |
|---|---|
| `GET` | `/wallet/balance` |
| `POST` | `/wallet/fund` |
| `POST` | `/wallet/transfer` |
| `POST` | `/wallet/withdraw` |
| `GET` | `/wallet/transactions` |

Full request/response examples are available in the Postman collection (`postman_collection.json`) included in the repository root.

---

## Known Limitations

- **Funding is simulated** — there is no payment gateway. The fund endpoint credits a wallet directly, representing what would happen after a real provider (Paystack, Flutterwave, etc.) confirms a deposit. In production, funding would be triggered by a webhook from the payment provider, not a direct API call.
- **No idempotency keys** — submitting the same fund or transfer request twice will create two separate transactions. Production systems guard against this with a client-provided idempotency key so that retried requests do not result in duplicate money movements.

---

## Project Structure

```
wallet-service-lendsqr/
├── src/
│   ├── __tests__/              # Unit and integration tests
│   ├── config/
│   │   └── database.ts         # Knex instance, picks env from NODE_ENV
│   ├── controllers/            # Parse request, call service, send response
│   ├── middlewares/
│   │   ├── auth.ts             # JWT verification
│   │   ├── errorHandler.ts     # Global Express error handler
│   │   └── rateLimiter.ts      # IP-based rate limiter for auth routes
│   ├── migrations/             # Knex schema migrations
│   ├── routes/                 # Express routers
│   ├── services/               # Business logic
│   │   ├── adjutor.service.ts  # Lendsqr Karma blacklist check
│   │   ├── user.service.ts     # Registration, login, BVN encryption
│   │   └── wallet.service.ts   # Fund, transfer, withdraw, history
│   ├── types/                  # Shared TypeScript interfaces and types
│   ├── utils/
│   │   ├── asyncHandler.ts     # Wraps async controllers, catches errors
│   │   ├── encryption.ts       # AES-256-CBC encrypt for BVN
│   │   ├── errors.ts           # Custom AppError subclasses with HTTP codes
│   │   ├── reference.ts        # UUID-based transaction reference generator
│   │   ├── response.ts         # sendSuccess / sendError helpers
│   │   ├── token.ts            # JWT sign and verify
│   │   └── validateEnv.ts      # Fail-fast check for required env vars
│   ├── app.ts                  # Express app setup
│   └── server.ts               # HTTP server entry point
├── .env.example
├── jest.config.js
├── knexfile.ts
└── tsconfig.json
```

---

## License

ISC
