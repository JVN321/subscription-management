# Local Development Environment & Quickstart

> **Status: Confirmed Developer Guide**
>
> Developer environment setup, Docker Compose workflows, host drive connections, database seeding, and port assignments.

---

## 1. Quickstart Workflow

### Prerequisites
- Docker Engine 24+ and Docker Compose v2.20+
- Node.js 20+ (LTS) & pnpm 9+
- Linux / macOS / WSL2 environment

### Step 1: Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```

### Step 2: Initialize Persistent Host Drives
Create local host directories for Docker bind-mounts:
```bash
mkdir -p data/postgres data/redis data/media
```

### Step 3: Launch Supporting Infrastructure via Docker
Start PostgreSQL, Redis, and Mailpit:
```bash
docker compose -f docker-compose.dev.yml up -d postgres redis mailpit
```

### Step 4: Run Initial Database Migrations & Seeds
```bash
# Install root and workspace dependencies
pnpm install

# Run Drizzle migrations
pnpm --filter @repo/db db:migrate

# Seed initial admin user and sample products
pnpm --filter @repo/db db:seed
```

### Step 5: Start Development Services
Run the applications in parallel with live hot-reloading:
```bash
pnpm dev
```

---

## 2. Port Mappings & Service URLs

| Service | Protocol | Host URL | Description |
|---|---|---|---|
| **TanStack Start Web** | HTTP | `http://localhost:3000` | Frontend portal for Admin, Staff, Customer |
| **Hono HTTP API** | HTTP | `http://localhost:3001` | REST API routes (`/api/v1/*`) |
| **OpenAPI Documentation** | HTTP | `http://localhost:3001/api/docs` | Interactive Swagger/Scalar API playground |
| **PostgreSQL Database** | TCP | `localhost:5432` | Relational database (`brightloop_db`) |
| **Redis Broker** | TCP | `localhost:6379` | BullMQ queues and fast cache |
| **Mailpit Web UI** | HTTP | `http://localhost:8025` | Inspect sent transactional emails and reset links |
| **Mailpit SMTP Server** | SMTP | `localhost:1025` | Mock email ingestion server |

---

## 3. Useful Developer Commands

```bash
# Inspect PostgreSQL schema via Drizzle Studio:
pnpm --filter @repo/db db:studio

# Run linting across all packages:
pnpm lint

# Run type-checking:
pnpm typecheck

# Synchronize CodeGraph knowledge graph:
codegraph sync .
```
