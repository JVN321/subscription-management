# Docker Architecture, Instances & Host Drive Connections

> **Status: Confirmed Docker Blueprint**
>
> Specification of all container instances, host drive bind mounts, persistent volumes, networking, and complete compose files for both local development and production deployment.

---

## 1. Container Instances & Drive Topology

To ensure seamless local development and robust production deployments, services are containerized using Docker Compose. All persistent state is explicitly connected to host drives in the workspace (`./data/`), ensuring zero data loss across container lifecycle events.

```mermaid
graph TD
    subgraph HostDrives ["Host Filesystem (/devdrive/github/projects/subscription-management)"]
        HD_PG["Host Data: ./data/postgres"]
        HD_REDIS["Host Data: ./data/redis"]
        HD_MEDIA["Host Data: ./data/media"]
        HD_SRC["Host Source: ./apps, ./packages"]
    end

    subgraph DockerBridge ["Internal Docker Bridge Network (app-net)"]
        C_DB["postgres:16-alpine (Port 5432)"]
        C_REDIS["redis:7-alpine (Port 6379)"]
        C_API["api (Hono Port 3001)"]
        C_WORKER["worker (BullMQ Background Consumer)"]
        C_WEB["web (TanStack Start Port 3000)"]
        C_MAIL["mailpit (Dev: SMTP 1025 / UI 8025)"]
    end

    HD_PG ==>|Persistent Mount| C_DB
    HD_REDIS ==>|Persistent Mount| C_REDIS
    HD_MEDIA ==>|Shared Media Mount| C_API
    HD_MEDIA ==>|Shared Media Mount| C_WORKER
    HD_SRC -.->|Dev Hot-Reload Bind Mount| C_API
    HD_SRC -.->|Dev Hot-Reload Bind Mount| C_WORKER
    HD_SRC -.->|Dev Hot-Reload Bind Mount| C_WEB
```

---

## 2. Host Drive Connectivity & Mount Rules

1. **PostgreSQL Persistent Data Drive**:
   - Host Drive Path: `./data/postgres`
   - Container Mount Point: `/var/lib/postgresql/data`
   - Type: Bind Mount
   - Purpose: Stores all PostgreSQL relational database tables, indexes, WAL logs, and audit records.
2. **Redis Queue & Cache Data Drive**:
   - Host Drive Path: `./data/redis`
   - Container Mount Point: `/data`
   - Type: Bind Mount
   - Purpose: Stores Redis AOF (`appendonly.aof`) ensuring BullMQ job queues survive restarts.
3. **Rendered Media & Invoices Drive**:
   - Host Drive Path: `./data/media`
   - Container Mount Point: `/app/media`
   - Type: Shared Bind Mount
   - Purpose: Shared between `worker` (which writes generated PDFKit invoices/quotes) and `api` (which serves and streams them to users).
4. **Development Source Code Bind Mounts**:
   - Host Drive Paths: `./apps`, `./packages`
   - Container Mount Points: `/app/apps`, `/app/packages`
   - Anonymous Volume Preservation: `/app/node_modules` is declared as an anonymous volume to prevent host OS binaries from colliding with Linux container binaries.

---

## 3. Production Docker Compose Specification (`docker-compose.yml`)

```yaml
version: '3.8'

networks:
  app-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

services:
  postgres:
    image: postgres:16-alpine
    container_name: brightloop_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: brightloop_db
      POSTGRES_USER: brightloop
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-brightloop_secure_pass_2026}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U brightloop -d brightloop_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: brightloop_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy noeviction
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    networks:
      - app-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: brightloop_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://brightloop:${POSTGRES_PASSWORD:-brightloop_secure_pass_2026}@postgres:5432/brightloop_db
      REDIS_URL: redis://redis:6379
      MEDIA_STORAGE_PATH: /app/media
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL:-http://localhost:3001}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
    volumes:
      - ./data/media:/app/media
    ports:
      - "3001:3001"
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3001/api/v1/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    container_name: brightloop_worker
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://brightloop:${POSTGRES_PASSWORD:-brightloop_secure_pass_2026}@postgres:5432/brightloop_db
      REDIS_URL: redis://redis:6379
      MEDIA_STORAGE_PATH: /app/media
      RESEND_API_KEY: ${RESEND_API_KEY}
    volumes:
      - ./data/media:/app/media
    networks:
      - app-net

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: brightloop_web
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NODE_ENV: production
      PORT: 3000
      VITE_API_URL: http://api:3001
    ports:
      - "3000:3000"
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
```

---

## 4. Local Development Compose Specification (`docker-compose.dev.yml`)

For local development with instant hot-reloading and Mailpit local email capture:

```yaml
version: '3.8'

networks:
  app-net:
    driver: bridge

services:
  postgres:
    image: postgres:16-alpine
    container_name: brightloop_postgres_dev
    environment:
      POSTGRES_DB: brightloop_db
      POSTGRES_USER: brightloop
      POSTGRES_PASSWORD: brightloop_dev_pass
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-net

  redis:
    image: redis:7-alpine
    container_name: brightloop_redis_dev
    command: redis-server --appendonly yes --maxmemory-policy noeviction
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    networks:
      - app-net

  mailpit:
    image: axllent/mailpit
    container_name: brightloop_mailpit_dev
    ports:
      - "8025:8025" # Web UI
      - "1025:1025" # SMTP Port
    networks:
      - app-net

  api:
    image: node:20-alpine
    container_name: brightloop_api_dev
    working_dir: /app
    command: sh -c "pnpm install && pnpm --filter @repo/api dev"
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://brightloop:brightloop_dev_pass@postgres:5432/brightloop_db
      REDIS_URL: redis://redis:6379
      MEDIA_STORAGE_PATH: /app/media
      BETTER_AUTH_SECRET: local_dev_secret_32_characters_minimum_string
      BETTER_AUTH_URL: http://localhost:3001
      CORS_ORIGIN: http://localhost:3000
      EMAIL_PROVIDER: mailpit
      SMTP_HOST: mailpit
      SMTP_PORT: 1025
    volumes:
      - .:/app
      - ./data/media:/app/media
      - /app/node_modules
      - /app/apps/api/node_modules
    ports:
      - "3001:3001"
    networks:
      - app-net

  worker:
    image: node:20-alpine
    container_name: brightloop_worker_dev
    working_dir: /app
    command: sh -c "pnpm install && pnpm --filter @repo/worker dev"
    depends_on:
      - postgres
      - redis
      - mailpit
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://brightloop:brightloop_dev_pass@postgres:5432/brightloop_db
      REDIS_URL: redis://redis:6379
      MEDIA_STORAGE_PATH: /app/media
      EMAIL_PROVIDER: mailpit
      SMTP_HOST: mailpit
      SMTP_PORT: 1025
    volumes:
      - .:/app
      - ./data/media:/app/media
      - /app/node_modules
      - /app/apps/worker/node_modules
    networks:
      - app-net

  web:
    image: node:20-alpine
    container_name: brightloop_web_dev
    working_dir: /app
    command: sh -c "pnpm install && pnpm --filter @repo/web dev"
    depends_on:
      - api
    environment:
      NODE_ENV: development
      PORT: 3000
      VITE_API_URL: http://localhost:3001
    volumes:
      - .:/app
      - /app/node_modules
      - /app/apps/web/node_modules
    ports:
      - "3000:3000"
    networks:
      - app-net
```
