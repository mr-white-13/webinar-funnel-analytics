# Build Plan

## Phase 0 — Confirm source systems (0.5-1 day)
- List actual tools in use for ads, webinar, email, registration, LMS/purchase.
- Confirm which system owns canonical registration event.
- Confirm what IDs/UTMs are available at registration and purchase.
- Pick one recent webinar for backfill/testing.

## Phase 1 — Foundation (1-2 days)
- Create app shell and DB.
- Apply initial schema.
- Build connector run log / sync cursor tables.
- Create manual CSV import route for quick data loading.
- Seed one example webinar and source mappings.

## Phase 2 — Core ingestion (3-5 days)
- Implement Meta Ads sync.
- Implement registration source sync/import.
- Implement webinar platform sync.
- Implement Stripe/LMS/app conversion sync.
- Normalize data and link to people/webinars/campaigns.

## Phase 3 — Identity + attribution (1-2 days)
- Email-first identity resolution.
- External ID linking.
- First-touch and last-non-direct attribution snapshot.
- Daily aggregate tables/materialized views.

## Phase 4 — Dashboards (2-4 days)
- Executive overview.
- Acquisition table.
- Webinar performance page.
- Lead timeline debug page.
- Data health page.

## Phase 5 — Email enrichment (1-2 days)
- Add email platform events.
- Add nurture cohort metrics.
- Add attendance/purchase lift views.

## Phase 6 — Hardening (1-2 days)
- Backfill scripts.
- Better error handling and retries.
- QA against source totals.
- Add saved filters / export CSV if needed.

## Recommended delivery shape
Ship useful slices, not infrastructure layers:
1. Spend + registration + attendance + purchase
2. Then attribution
3. Then email enrichment
4. Then polish

## Exit criteria for MVP
- Team uses it weekly instead of spreadsheets.
- Campaign decisions can be made from the dashboard.
- Metrics reconcile closely enough with source systems.
- Investigating a bad webinar takes minutes, not hours.
