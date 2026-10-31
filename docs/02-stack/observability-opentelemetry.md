# Observability & Instrumentation: OpenTelemetry

> **Status: Confirmed Architecture**
>
> Distributed tracing, request performance telemetry, BullMQ job duration metrics, and structured logging.

---

## 1. Role & Technology Overview

**OpenTelemetry (OTel)** provides vendor-neutral instrumentation across all services in the monorepo. It ensures that system performance can be continuously monitored against the sub-2-second target.

Key Instrumentation Points:
- **HTTP Latency**: Inbound request duration, status codes, and path routes in `apps/api`.
- **Database Query Performance**: Drizzle ORM query duration and slow query alerts (>100ms).
- **Queue Latency**: BullMQ job wait time in Redis, execution duration, and failure rates in `apps/worker`.
- **External Dependencies**: Latency of Resend API email dispatches.

---

## 2. Configuration & Exporter Pipeline

Telemetry data is exported via standard OpenTelemetry Protocol (OTLP):
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export const otelSdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'brightloop-api',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});
```

---

## 3. Structured Logging Alignment

Logs emitted by the system use structured JSON (via `pino`) with trace correlation:
```json
{
  "level": 30,
  "time": 1793444400000,
  "pid": 12,
  "hostname": "api-container",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "msg": "Invoice generated successfully",
  "invoiceId": "INV-2026-0812",
  "durationMs": 42
}
```
