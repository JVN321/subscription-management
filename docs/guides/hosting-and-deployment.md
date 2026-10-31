# Production Hosting & Deployment Runbook

> **Authoritative Deployment & Operations Guide for Production Infrastructure**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Production Architecture Overview

In production, Brightloop runs as containerized micro-services orchestrated via Docker Compose or Kubernetes, behind a TLS-terminating reverse proxy (Caddy or Nginx):

```
                        HTTPS / Port 443
                               │
                               ▼
               ┌───────────────────────────────┐
               │    Caddy / Nginx Gateway      │
               │  Automatic Let's Encrypt TLS  │
               └───────────────┬───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│     @repo/web         │             │     @repo/api         │
│  Static Nginx / Node  │             │   Hono HTTP Server    │
│  Port 3000 (Internal) │             │  Port 3001 (Internal) │
└───────────────────────┘             └───────────┬───────────┘
                                                  │
                               ┌──────────────────┴──────────────────┐
                               ▼                                     ▼
                    ┌─────────────────────┐               ┌─────────────────────┐
                    │    PostgreSQL 16    │               │       Redis 7       │
                    │ Authoritative Store │               │  Cache & Job Queue  │
                    │    Port 5432        │               │     Port 6379       │
                    └─────────────────────┘               └─────────────────────┘
```

---

## 2. Production Docker Compose Configuration

Create `docker-compose.prod.yml` on the deployment host:

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - api
      - web

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
    expose:
      - "3000"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=https://api.yourdomain.com
    expose:
      - "3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory-policy noeviction
    volumes:
      - redis_prod_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  caddy_data:
  caddy_config:
  postgres_prod_data:
  redis_prod_data:
```

---

## 3. Reverse Proxy Configuration (Caddy)

Create `Caddyfile` for automated TLS and clean path routing:

```caddy
app.yourdomain.com {
    reverse_proxy web:3000
}

api.yourdomain.com {
    reverse_proxy api:3001
}
```

---

## 4. Production Deployment Workflow

### 4.1 Deployment Commands
```bash
# 1. Pull latest verified commits from origin main
git pull origin main

# 2. Build production container images
docker compose -f docker-compose.prod.yml build

# 3. Apply database migrations
docker compose -f docker-compose.prod.yml run --rm api pnpm db:migrate

# 4. Launch containers in background
docker compose -f docker-compose.prod.yml up -d
```

### 4.2 Health Verification
Verify running status and health endpoints:

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check API health
curl -f https://api.yourdomain.com/api/v1/health

# Check Better Auth health
curl -f https://api.yourdomain.com/api/auth/ok
```

---

## 5. Automated Database Backups

Schedule daily logical backups using `cron` on the host:

```bash
# Edit host crontab
crontab -e

# Add daily 02:00 AM UTC backup:
0 2 * * * docker compose -f /opt/brightloop/docker-compose.prod.yml exec -T postgres pg_dump -U brightloop_admin brightloop_subscriptions | gzip > /opt/backups/brightloop_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

To test backup recovery:
```bash
gunzip -c /opt/backups/backup_file.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U brightloop_admin brightloop_subscriptions
```
