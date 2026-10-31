# Local Development Runbook

> **Authoritative Step-by-Step Operator Guide for Local Environment Setup**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. System Prerequisites

Ensure the following tools are installed on your host machine:

| Requirement | Minimum Version | Recommended | Verification Command |
|---|---|---|---|
| **Node.js** | `>= 20.0.0` | `22.x LTS` or `26.x` | `node -v` |
| **pnpm** | `>= 9.0.0` | `11.13.0` | `pnpm -v` |
| **Docker Engine** | `>= 24.0.0` | Latest Community | `docker --version` |
| **Docker Compose** | `>= 2.20.0` | Latest v2 | `docker compose version` |
| **Chromium** | Latest | System or Playwright | `chromium-browser --version` |

---

## 2. Environment Configuration

Copy the example environment configuration to `.env`:

```bash
cp .env.example .env
```

Verify the `.env` settings:

```dotenv
# Database Configuration
DATABASE_URL=postgres://brightloop_dev:brightloop_secret_password_123@localhost:5433/brightloop_subscriptions_dev

# Application Network Ports
API_PORT=3001
WEB_PORT=3000
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Authentication & Session Security (Better Auth)
BETTER_AUTH_SECRET=brightloop_super_secret_development_key_32_chars_12345
BETTER_AUTH_URL=http://localhost:3001

# In-Memory Cache & Job Queue
REDIS_URL=redis://localhost:6379

# Mock Email SMTP (Mailpit)
SMTP_HOST=localhost
SMTP_PORT=1025
```

---

## 3. Starting Local Docker Services

Brightloop provides an optimized development Compose file (`docker-compose.dev.yml`) providing isolated PostgreSQL 16 and Redis 7 instances:

```bash
# Start background containers
pnpm docker:up
```

*To stop the containers when finished:*
```bash
pnpm docker:down
```

Verify container health:
```bash
docker ps
```
You should see:
- `brightloop_postgres_dev` on host port `5433` (internal `5432`).
- `brightloop_redis_dev` on host port `6379`.

---

## 4. Database Migrations & Seeding

### 4.1 Apply Schema Migrations
Apply version-controlled Drizzle migrations to initialize the 16 tables:

```bash
pnpm db:migrate
```

### 4.2 Seed Business Data
Populate the database with demo users, software products, brand variants (+$560 Odoo), billing plans, taxes, discounts, and template quotes:

```bash
pnpm db:seed
```

*(See [docs/guides/database-and-seeding.md](database-and-seeding.md) for full seed accounts and credential tables).*

---

## 5. Launching Development Servers

Run the web frontend and API backend concurrently with hot-module replacement:

```bash
pnpm dev
```

The application will be accessible at:
- **Web Console & Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Hono REST API & Health Endpoint**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
- **Better Auth Native Endpoint**: [http://localhost:3001/api/auth/ok](http://localhost:3001/api/auth/ok)

---

## 6. Running Automated Tests

Brightloop includes a full-stack test suite comprising 32 automated tests across unit, integration, and browser E2E layers:

```bash
# Run all unit/component tests across domain, db, api, and web (26 tests)
pnpm test

# Run Playwright browser end-to-end test suite against Chromium (6 tests)
pnpm test:e2e

# Run complete full-stack verification (32 tests total)
pnpm test:all

# Type-check TypeScript across all packages
pnpm typecheck
```

---

## 7. Troubleshooting Common Local Issues

1. **Port 5433 Already in Use**:
   - Check if an existing PostgreSQL instance is running: `lsof -i :5433`.
   - Update `5433:5432` in `docker-compose.dev.yml` and `.env` if needed.
2. **Postgres Permission Denied on Linux with SELinux**:
   - The `./data/postgres` volume uses `:Z` mount flags. If permissions fail:
     ```bash
     chmod -R 777 ./data
     ```
3. **Playwright Browser Missing**:
   - If Playwright complains about missing browser binaries:
     ```bash
     pnpm --filter @repo/web exec playwright install chromium
     ```
