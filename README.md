# Demo Credit — Wallet Service

A backend wallet microservice built for the Lendsqr assessment. Borrowers can create accounts (with a wallet provisioned automatically), fund their wallets, transfer money to other users, withdraw funds, and view their transaction history. Any individual flagged on the Lendsqr Adjutor Karma blacklist is blocked at the point of registration and cannot be onboarded.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Design Decisions](#design-decisions)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express 5 |
| Database | MySQL |
| Query Builder | Knex.js |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| BVN Encryption | AES-256-CBC (Node crypto) |
| Blacklist Check | Lendsqr Adjutor Karma API |
| Rate Limiting | express-rate-limit |
| Testing | Jest + Supertest |

---

## Entity Relationship Diagram

![ERD](./docs/erd.png)

> **Relationships:**
> - One `user` has exactly one `wallet` (created atomically during registration)
> - One `wallet` can appear as `source_wallet_id` or `destination_wallet_id` on many `transactions`
> - `source_wallet_id` is `NULL` for fund operations (money coming in from outside)
> - `destination_wallet_id` is `NULL` for withdrawal operations (money going out)

---

## Design Decisions

### Why MySQL
MySQL was specified for this project and it is a natural fit for financial data. InnoDB's ACID compliance means a failed transaction is always rolled back cleanly — no partial state. The relational model also makes it straightforward to enforce the one-user-one-wallet constraint at the schema level.

### Wallet provisioning at registration
The user insert and wallet insert happen inside a single database transaction. Either both succeed or neither does. This means there is no window where a user exists without a wallet.

### Row-level locking on transfers
The first version of the transfer logic read the receiver's wallet outside the transaction. The problem with that is two concurrent transfers between the same two users in opposite directions can deadlock — each transaction holds a lock the other one is waiting for.

The fix: both wallets are fetched with `SELECT FOR UPDATE` inside the same transaction, and they are always locked in ascending `user_id` order. Since all transactions acquire locks in the same sequence, circular waits cannot form.

### BVN encryption
BVN is stored encrypted (AES-256-CBC) rather than plain text. This service never needs to read the BVN back after storing it — it is only needed at the point of the karma check — so there is no decrypt function exposed.

### Karma check returns 404 for clean users
The Adjutor API returns `404` when a BVN is not on the blacklist (not found = not blacklisted). Any other error (network failure, 5xx) is treated as a service outage and returns `503` to the caller rather than silently allowing registration.

---

## Getting Started

### Prerequisites

- Node.js >= 18
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
| `JWT_EXPIRES_IN` | Token expiry e.g. `24h` |
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

Current coverage: **~99% statements, ~97% branches** across 66 tests.

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

All responses follow this shape:

```json
{
  "status": true | false,
  "message": "string",
  "data": {}
}
```

---

### Auth

#### Register

```
POST /auth/register
```

**Request**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "bvn": "22345678901",
  "phone": "08012345678",
  "password": "Password123!"
}
```

**Response `201`**
```json
{
  "status": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "08012345678",
      "status": "active",
      "created_at": "2026-02-28T10:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

**Error cases**

| Status | Reason |
|---|---|
| `400` | Missing required field |
| `409` | Email already registered |
| `422` | BVN is on the Adjutor Karma blacklist |
| `503` | Adjutor API is unreachable |

---

#### Login

```
POST /auth/login
```

**Request**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response `200`**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "<jwt>"
  }
}
```

> Rate limit: 10 requests per 15 minutes per IP on both auth endpoints.

---

### Wallet

All wallet endpoints require:

```
Authorization: Bearer <token>
```

---

#### Get Balance

```
GET /wallet/balance
```

**Response `200`**
```json
{
  "status": true,
  "message": "Wallet balance retrieved",
  "data": {
    "id": 1,
    "user_id": 1,
    "balance": "4500.00",
    "currency": "NGN"
  }
}
```

---

#### Fund Wallet

```
POST /wallet/fund
```

**Request**
```json
{ "amount": 5000 }
```

**Response `200`**
```json
{
  "status": true,
  "message": "Wallet funded successfully",
  "data": {
    "wallet": { "id": 1, "balance": "5000.00", "currency": "NGN" },
    "reference": "TXN-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

#### Transfer

```
POST /wallet/transfer
```

**Request**
```json
{
  "receiver_email": "jane.doe@example.com",
  "amount": 1000
}
```

**Response `200`**
```json
{
  "status": true,
  "message": "Transfer successful",
  "data": {
    "reference": "TXN-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "amount": 1000,
    "receiver": "jane.doe@example.com"
  }
}
```

**Error cases**

| Status | Reason |
|---|---|
| `400` | Missing or invalid amount |
| `404` | Receiver not found |
| `422` | Insufficient funds |
| `422` | Cannot transfer to yourself |

---

#### Withdraw

```
POST /wallet/withdraw
```

**Request**
```json
{ "amount": 500 }
```

**Response `200`**
```json
{
  "status": true,
  "message": "Withdrawal successful",
  "data": {
    "wallet": { "id": 1, "balance": "3500.00", "currency": "NGN" },
    "reference": "TXN-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

#### Transaction History

```
GET /wallet/transactions
```

**Response `200`**
```json
{
  "status": true,
  "message": "Transaction history retrieved",
  "data": [
    {
      "id": 3,
      "reference": "TXN-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "source_wallet_id": null,
      "destination_wallet_id": 1,
      "type": "fund",
      "amount": "5000.00",
      "status": "success",
      "narration": "Wallet Funded with NGN 5000",
      "created_at": "2026-02-28T10:05:00.000Z"
    }
  ]
}
```

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
