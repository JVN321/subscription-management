# ADR 0006: BullMQ with Redis for Background Queues

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: `apps/worker`

---

## 1. Context and Problem Statement
Scheduled billing scans, invoice generation batches, PDF rendering, and email notifications must run outside the HTTP request-response cycle to prevent timeouts and ensure retryability.

## 2. Decision Drivers
- High throughput and low latency: Millions of jobs per day with sub-millisecond dispatch.
- Rich job features: Delayed jobs, parent-child job hierarchies, repeatable cron schedules, bounded retries with exponential backoff.
- TypeScript ecosystem standard: BullMQ is the undisputed leader for Node.js background queues.

## 3. Considered Options
1. **BullMQ + Redis**: Fast, mature, feature-rich TypeScript queue system.
2. **RabbitMQ / Celery**: Requires polyglot infrastructure or AMQP broker management.
3. **Kafka**: Vastly over-engineered for job queuing; requires ZooKeeper/KRaft and heavy partition management.

## 4. Decision Outcome
Chosen option: **BullMQ + Redis**. Provides all required queuing, retry, and scheduling primitives within the TypeScript ecosystem.
