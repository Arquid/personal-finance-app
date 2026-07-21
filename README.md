# Personal Finance App

[![CI](https://github.com/Arquid/personal-finance-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Arquid/personal-finance-app/actions/workflows/ci.yml)

A full-stack personal finance manager with transaction tracking, budget management, savings pots, recurring bill tracking, and spending analytics. Built to demonstrate handling sensitive financial data with proper validation, relational data modeling, and SQL-based reporting (GROUP BY aggregations and window functions).

## Features

- **Overview dashboard** — total balance, monthly income/expenses, spending-by-category donut chart, budget vs. actual bar chart, pot progress, latest transactions
- **Transactions** — paginated (10/page), searchable, sortable, filterable by category; full CRUD; CSV import with per-row validation
- **Budgets** — CRUD per category, progress bars with over/warning/ok status, latest 3 transactions per budget category, budget-limit alerts shown when adding/editing a transaction
- **Pots** — CRUD, deposit/withdraw with balance validation, progress toward savings goal
- **Recurring Bills** — CRUD, search and sort, current-month payment status (Paid / Due / Overdue), automatic detection of recurring payment patterns from transaction history
- Currency switcher (USD/EUR/GBP), applied app-wide and persisted to localStorage
- Form validation throughout (Zod on both client and server)
- Keyboard navigation (sortable table headers, arrow-key pagination, modals close on Escape and trap focus)
- Accessible confirmation dialogs for all delete actions (no native `window.confirm`)

## Tech Stack

**Backend:** Node.js, Express 5, PostgreSQL, Prisma 6 (ORM), Zod (validation), Multer + csv-parse (CSV import)

**Frontend:** React 19, Vite, React Router, TanStack Query (React Query v5), React Hook Form + Zod, Recharts, Axios

**Testing:** Vitest on both sides — unit + Supertest integration tests on the backend (against a dedicated test database), unit + React Testing Library component tests on the frontend

## Project Structure

```
personal-finance-app/
├── .github/workflows/ci.yml CI: lint + test on every push/PR to master
├── docker-compose.yml       Local PostgreSQL (dev + test databases), no manual install needed
├── docker/init-test-db.sql  Creates finance_test_db on first container start
├── server/                  Express API
│   ├── prisma/
│   │   ├── schema.prisma    Database schema
│   │   └── seed.js          Sample data generator
│   ├── tests/               Integration tests (Supertest, hit the real API + test DB)
│   └── src/
│       ├── app.js           Express app (routes, middleware) — no listen(), used by tests
│       ├── index.js         Loads .env and starts app.js listening
│       ├── routes/          One file per resource (accounts, transactions, budgets, pots, recurringBills, reports, categories)
│       ├── schemas/         Zod validation schemas (each has a *.test.js next to it)
│       ├── middleware/      validate.js, errorHandler.js
│       └── utils/           budgetAlert.js, recurringBillStatus.js (each has a *.test.js next to it)
└── client/                  React app
    └── src/
        ├── test/setup.js    Vitest + Testing Library setup (jest-dom matchers, cleanup)
        ├── api/client.js    Axios calls to the backend
        ├── pages/           One page per route
        ├── components/      One folder per feature (transactions, budgets, pots, recurringBills, layout, shared) — key components have a *.test.jsx next to them
        ├── context/         CurrencyProvider — app-wide currency selection (USD/EUR/GBP), persisted to localStorage, with CurrencyProvider.test.jsx
        ├── hooks/           Shared hooks (useModal.js — Escape-to-close + focus trap for all modals, with useModal.test.jsx; useCurrency.js)
        └── stylesheets/      All CSS lives here, one file per page/shared concern
```

## Prerequisites

- Node.js 20+
- Git
- Either **Docker** (recommended — spins up PostgreSQL for you) or a local **PostgreSQL 13+** install — see step 2 below

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Arquid/personal-finance-app.git
cd personal-finance-app
```

### 2. Database

**Option A — Docker Compose (recommended, no local PostgreSQL install needed):**

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with `finance_user` / `finance_pass` already configured, and creates both `finance_db` (dev) and `finance_test_db` (test) databases on first startup. Skip ahead to step 3 — `finance_user` already has full rights on both databases (including for Prisma's migration shadow database).

**Option B — Install PostgreSQL locally:**

- Download the installer from [postgresql.org/download](https://www.postgresql.org/download/) and run it (default port `5432` is fine). This also installs `psql`, the command-line client used below.

Connect as the PostgreSQL superuser (`postgres`) using `psql` — either from a terminal (on Windows, if `psql` isn't on your PATH, run it from `C:\Program Files\PostgreSQL\<version>\bin\psql.exe`) or via a GUI client like pgAdmin:

```bash
psql -U postgres
```

Then, at the `psql` prompt (or in pgAdmin's query tool), run:

```sql
CREATE USER finance_user WITH PASSWORD 'finance_pass';
CREATE DATABASE finance_db OWNER finance_user;
GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;
ALTER USER finance_user CREATEDB;
```

The last line grants `CREATEDB`, which Prisma needs for its shadow database during migrations.

### 3. Backend

```bash
cd server
npm install
cp .env.example .env
```

The defaults in `.env.example` already match the database and user from step 2, so no editing is needed unless you changed something there.

Run the migration and seed sample data:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:4000`.

### 4. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Testing

### Backend

Backend tests need their own database, kept separate from your dev data (tests wipe/create rows as they run).

If you used **Docker Compose** in step 2, `finance_test_db` already exists — just create the env file:

```bash
cd server
cp .env.test.example .env.test
```

If you installed PostgreSQL **locally**, create the database the same way as the dev database (step 2), just with a different name:

```sql
CREATE DATABASE finance_test_db OWNER finance_user;
GRANT ALL PRIVILEGES ON DATABASE finance_test_db TO finance_user;
```

then copy the env file as above.

Run the tests:

```bash
cd server
npm test
```

This automatically migrates the test database first (`pretest` script), then runs both the unit tests (Zod schemas, `recurringBillStatus.js` — no DB needed) and the integration tests (Supertest against the real Express app) for every resource — accounts, transactions, budgets, pots, recurring bills, and reports — including a test that fires 10 concurrent pot withdrawals to verify the balance can never go negative, and tests that verify the reporting endpoints' raw SQL (`GROUP BY` aggregation and the `ROW_NUMBER() OVER (PARTITION BY ...)` window function).

### Frontend

```bash
cd client
npm test
```

Runs unit tests for `useModal` (focus trap, Escape-to-close) and `CurrencyProvider` (currency switching, localStorage persistence), and component tests for `PotCard`, `BudgetCard`, `RecurringBillsTable`, and `ConfirmDialog`. No backend or database needed — these render components in isolation with mocked props.

## Continuous Integration

Every push and pull request to `master` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml), with two jobs in parallel:

- **client** — `npm run lint` (ESLint) and `npm test` (Vitest + Testing Library)
- **server** — `npm test` against a disposable PostgreSQL 16 service container (migrations applied automatically via the `pretest` script, same as local dev)

Both jobs must pass before a PR is mergeable. No local setup is required to benefit from this — it runs entirely on GitHub's infrastructure.

## Scripts

**server/**
| Command | Description |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart on change) |
| `npm start` | Start the API without nodemon |
| `npm test` | Migrate the test DB, then run all unit + integration tests once |
| `npm run test:watch` | Run tests in watch mode against the test DB |
| `npx prisma migrate dev` | Apply schema migrations |
| `npx prisma db seed` | Re-seed sample data (clears existing data first) |
| `npx prisma studio` | Browse the database in a GUI |

**client/**
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run all component/hook tests once |
| `npm run test:watch` | Run tests in watch mode |

## API Overview

All endpoints are prefixed with `/api`.

| Resource | Endpoints |
|---|---|
| Accounts | `GET/POST /accounts`, `GET/PUT/DELETE /accounts/:id` |
| Transactions | `GET/POST /transactions`, `GET/PUT/DELETE /transactions/:id`, `POST /transactions/import` (CSV) |
| Budgets | `GET/POST /budgets`, `GET/PUT/DELETE /budgets/:id` |
| Pots | `GET/POST /pots`, `GET/PUT/DELETE /pots/:id`, `POST /pots/:id/deposit`, `POST /pots/:id/withdraw` |
| Recurring Bills | `GET/POST /recurring-bills`, `GET/PUT/DELETE /recurring-bills/:id`, `GET /recurring-bills/detect` |
| Categories | `GET /categories` |
| Reports | `GET /reports/overview`, `GET /reports/spending-by-category`, `GET /reports/budget-vs-actual`, `GET /reports/latest-by-category`, `GET /reports/monthly-trend` |

`GET /transactions` supports `page`, `limit`, `search`, `category`, `accountId`, `sortBy`, `order` query parameters.

## Notes

- Prisma is pinned to `6.x` rather than the current `7.x` major release — v7 switched to a TypeScript/ESM-only generated client and driver adapters, which doesn't fit this project's plain JavaScript/CommonJS stack.
- The database has no fixed transaction/account IDs baked into the app — always check current IDs via the API (e.g. `GET /accounts`) rather than assuming they start at 1, since `db seed` re-creates rows with fresh auto-incremented IDs each time it runs.
