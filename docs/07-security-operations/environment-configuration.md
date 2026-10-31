# Environment Configuration & Secrets

> **Status: Confirmed Environment Standards**
>
> Specification of all environment variables across applications and shared packages.

---

## 1. Environment Variable Catalog

| Variable Name | Required | Default (Local Dev) | Description |
|---|:---:|---|---|
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `test`, `production`) |
| `DATABASE_URL` | Yes | `postgresql://brightloop:secret@localhost:5432/brightloop_db` | PostgreSQL connection string |
| `DB_POOL_MAX` | No | `20` | Max database connections per process |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection string for BullMQ and cache |
| `BETTER_AUTH_SECRET` | Yes | *(32-char hex string)* | Secret key for signing session tokens and cookies |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3001` | Base URL of the API for auth callbacks |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Permitted frontend origins (comma-separated) |
| `RESEND_API_KEY` | Production | `re_test_mock` | API key for Resend email service |
| `EMAIL_PROVIDER` | No | `mailpit` | `mailpit` for dev SMTP, `resend` for production |
| `SMTP_HOST` | Dev | `localhost` | Mailpit SMTP host (dev only) |
| `SMTP_PORT` | Dev | `1025` | Mailpit SMTP port (dev only) |
| `MEDIA_STORAGE_PATH` | No | `/app/media` | Filesystem directory for storing generated PDFs |
| `OTEL_EXPORTER_OTLP_ENDPOINT`| No | `http://localhost:4318` | OpenTelemetry collector endpoint |
| `LOG_LEVEL` | No | `info` | Minimum log severity (`debug`, `info`, `warn`, `error`) |

---

## 2. `.env.example` Baseline Template

A committed `.env.example` is maintained at the root of the repository:

```bash
# Server & Environment
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database (PostgreSQL 16)
DATABASE_URL=postgresql://brightloop:brightloop_dev_pass@localhost:5432/brightloop_db
DB_POOL_MAX=20

# Cache & Queues (Redis 7)
REDIS_URL=redis://localhost:6379

# Authentication (Better Auth)
BETTER_AUTH_SECRET=changeme_dev_secret_key_minimum_32_characters_long_12345
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Email (Resend in prod, Mailpit in dev)
EMAIL_PROVIDER=mailpit
SMTP_HOST=localhost
SMTP_PORT=1025
RESEND_API_KEY=re_placeholder

# Storage
MEDIA_STORAGE_PATH=./data/media

# Observability
OTEL_SERVICE_NAME=brightloop-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```
