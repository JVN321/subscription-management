# Backup & Disaster Recovery

> **Status: Confirmed Operations Standard**
>
> PostgreSQL automated backup policies, WAL archiving, point-in-time recovery, and Redis recovery procedures.

---

## 1. PostgreSQL Backup Policy

Because PostgreSQL is the authoritative source of truth, backup procedures guarantee zero data loss (RPO < 15 minutes) and rapid recovery (RTO < 1 hour):

1. **Daily Full Logical Backups (`pg_dump`)**:
   - Automated cron container executes daily at 02:00 UTC:
     ```bash
     pg_dump -Fc -U brightloop -d brightloop_db > /backup/brightloop_db_$(date +%Y%m%d).dump
     ```
   - Retained for 30 days on encrypted off-site cloud storage (e.g. AWS S3 Glacier or Cloudflare R2).
2. **Continuous WAL Archiving (Point-in-Time Recovery)**:
   - PostgreSQL Write-Ahead Logs (WAL) are continuously archived to offsite storage, permitting recovery to any exact second within the last 7 days.

---

## 2. Redis Recovery Policy

- Redis operates with Append-Only File (AOF) persistence (`appendonly yes`, `appendfsync everysec`).
- If the Redis container crashes, it reconstructs its queue state from `./data/redis/appendonly.aof`.
- If Redis data is completely destroyed:
  - BullMQ queues will be recreated by workers on restart.
  - Active subscriptions will resume normal billing on the next scheduled run.
  - No customer, financial, or invoice data is lost because Redis is non-authoritative.
