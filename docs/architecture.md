# Architecture and Stack

## Recommended v1 stack
### App
- Next.js 14+ with App Router
- TypeScript
- Tailwind for speed
- Recharts for charts

### Data
- PostgreSQL as source of truth
- Prisma ORM for app access
- SQL-first for analytics views/materialized tables where useful

### Sync / ingestion
- Node worker process
- BullMQ + Redis for scheduled and retryable jobs
- Provider modules per connector
- CSV import path for manual uploads/backfills

### Hosting
- Vercel or self-hosted for UI
- Managed Postgres (Neon/Supabase/RDS)
- Managed Redis (Upstash/Redis Cloud)

## Why this stack
- Fast to ship internally
- Easy to hire for
- Good enough for moderate data volumes
- Leaves room to split into services later
- SQL/Postgres fits analytics-style aggregations well at this stage

## High-level architecture
1. Connectors pull source data on a schedule.
2. Raw payload metadata and normalized records are written to Postgres.
3. Identity resolution links events to a person.
4. Attribution snapshot job computes simple credit fields.
5. Dashboard queries read from normalized tables and summary views.

## Data flow
- Source API/CSV
- Connector fetch job
- Normalize + map fields
- Upsert into source-specific staging/normalized tables
- Link to person/webinar/campaign
- Recompute daily aggregates / attribution snapshots
- Dashboard

## Suggested project structure
- `app/` UI routes and server actions
- `lib/` DB client, query helpers, connector interfaces
- `workers/` sync jobs and attribution jobs
- `schema/` SQL migrations
- `sql/` analytics queries/views
- `docs/` product/design docs

## Productization-ready decisions worth keeping
- Stable internal IDs + source external IDs
- Connector abstraction with sync cursors
- Separate normalized events from summary tables
- Tenant column can be added later to major tables

## Explicitly deferred
- Event streaming infra
- dbt/Kafka/Airbyte stack
- universal reverse ETL
- custom report builder
- real-time user journey processing
