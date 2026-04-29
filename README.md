# Webinar Funnel Analytics

Internal v1 analytics platform for webinar funnels.

## Goal
Unify performance data across the webinar journey in one place:

ads -> landing page -> registration -> email nurture -> live attendance -> replay -> LMS/signup/purchase -> post-webinar retargeting

This project is intentionally narrow:
- internal first
- one funnel model
- simple attribution
- useful dashboards over perfect modeling

## What is included now
- Product spec: `docs/v1-spec.md`
- Architecture: `docs/architecture.md`
- MVP connector plan: `docs/connectors.md`
- Dashboard plan: `docs/dashboards.md`
- Build phases: `docs/build-plan.md`
- Initial Postgres schema: `schema/001_init.sql`
- Seed metrics query examples: `sql/core-metrics.sql`
- Minimal app scaffold: `app/`

## Recommended stack
- Next.js + TypeScript
- Postgres + Prisma
- TanStack Query
- Recharts
- BullMQ + Redis for scheduled sync jobs
- Optional object storage later for raw payload archive

## v1 principles
1. Prefer daily/hourly syncs over real-time.
2. Preserve raw IDs from source systems.
3. Model people, touchpoints, conversions, and spend first.
4. Keep attribution simple and inspectable.
5. Build for one internal team before multi-tenant productization.

## Suggested first implementation order
1. Stand up DB and schema
2. Build manual CSV upload for two sources
3. Add Meta Ads + webinar platform sync
4. Add landing/registration events
5. Add dashboard pages
6. Add simple attribution snapshots

## Notes
This scaffold is a practical starting point, not a finished product.
