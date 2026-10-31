# ADR 0007: Redis Queue and Cache Namespace Isolation

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: Infrastructure / Redis

---

## 1. Context and Problem Statement
Redis initially serves dual purposes: BullMQ queue state storage and fast application caching (dashboard aggregates). If cache eviction policies drop queue keys, background jobs will be lost or corrupted.

## 2. Decision Drivers
- Job reliability: BullMQ requires that queue state keys are never evicted arbitrarily under memory pressure.
- Operational simplicity: Avoid running two separate Redis container instances in initial deployment.

## 3. Considered Options
1. **Single Redis with Strict Namespace Isolation & Noeviction**: Prefix queue keys (`bull:*`) and cache keys (`cache:*`); set `--maxmemory-policy noeviction`.
2. **Two Separate Redis Instances**: One for BullMQ (`noeviction`), one for application cache (`allkeys-lru`).

## 4. Decision Outcome
Chosen option: **Single Redis with Strict Namespace Isolation & Noeviction**.
- Run Redis 7 with `--maxmemory-policy noeviction` and `--appendonly yes`.
- Application cache entries must specify explicit TTLs (e.g. 60 seconds).
- If memory pressure exceeds thresholds in the future, the cache will be migrated to a dedicated Redis instance.
