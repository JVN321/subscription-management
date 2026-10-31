# Logging & Monitoring Architecture

> **Status: Confirmed Operations Standard**
>
> Structured JSON logging, trace correlation, health probes, and alerting metrics.

---

## 1. Structured Logging Standard

All services utilize **Pino** for fast, asynchronous structured logging output to `stdout`.

Log levels:
- `debug`: Detailed SQL queries and job payloads (disabled in production).
- `info`: Standard lifecycle events (user signup, quotation conversion, invoice generated).
- `warn`: Retried network calls, high memory alerts, near-limit discount usage.
- `error`: Uncaught exceptions, failed payments, DLQ job failures.

Every log entry automatically includes:
- `timestamp`: ISO 8601 string.
- `service`: `api`, `worker`, or `web`.
- `traceId` & `spanId`: OpenTelemetry correlation tokens.

---

## 2. Health & Readiness Probes

Container orchestrators and load balancers monitor application health via:

- **Liveness Probe**: `GET /api/v1/health`
  - Returns `200 OK` if the Node.js event loop is responsive.
- **Readiness Probe**: `GET /api/v1/ready`
  - Validates active connectivity to both PostgreSQL (`SELECT 1`) and Redis (`PING`).
  - Returns `503 Service Unavailable` if either dependency is degraded.
