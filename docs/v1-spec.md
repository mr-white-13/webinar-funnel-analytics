# V1 Product Spec

## Product name
Webinar Funnel Analytics

## Objective
Give the marketing team one internal place to answer:
- Which campaigns and creatives drive registrations?
- Which registrants actually attend live or watch replay?
- Which cohorts convert to LMS/signup/purchase?
- What is CAC / cost per registration / cost per attendee / cost per purchase by campaign, webinar, and date?
- Where is the biggest leakage in the funnel?

## Primary user
Internal growth/marketing operator.

## Core jobs to be done
1. Monitor funnel health for each webinar.
2. Compare channels/campaigns/ad sets/ads.
3. Trace conversion path for a person or cohort.
4. Reconcile spend with downstream outcomes.
5. Export clean summaries for decision-making.

## V1 scope
### Included
- Single workspace / single company
- One or more webinar events
- Core funnel stages:
  - ad click / session
  - landing page visit
  - registration submitted
  - email sent/open/click
  - live attendance
  - replay watched
  - LMS/signup/purchase
- Daily dashboarding and drilldowns
- Simple source/campaign attribution
- Connector health/status page
- Manual backfill via CSV where API work is not ready

### Success criteria
Within 2 weeks of implementation, team can answer for any webinar:
- spend
- visits
- registrations
- attendance rate
- replay rate
- purchase rate
- CAC / CPL / CPA
- top campaigns and creatives
- top leak points

## Key entities
- Person / lead
- Webinar
- Campaign hierarchy
- Session / touchpoint
- Event
- Conversion
- Spend record
- Attribution snapshot

## Functional requirements
1. Ingest ad spend and campaign metadata.
2. Ingest landing page + registration events.
3. Ingest webinar attendance and replay data.
4. Ingest email engagement.
5. Ingest LMS/signup/purchase events.
6. Identity resolution based on email first, then platform external IDs, then click/session IDs where available.
7. Provide funnel views by webinar, date range, source, campaign, ad set, ad, country, device.
8. Show person-level timeline for debugging attribution.
9. Preserve raw source payload IDs for reconciliation.
10. Allow manual overrides for source mapping and ignored records.

## Non-functional requirements
- Internal-only auth is enough for v1.
- Data freshness target: every 1-6 hours; daily minimum acceptable.
- Backfills should be idempotent.
- Every synced row should keep source system + external ID.
- Every dashboard number should be traceable to underlying records.

## V1 user flows
### 1. Daily check
Open overview -> pick webinar/date range -> review spend, registrations, attendance, purchases, CPL, CPA, funnel drop-off.

### 2. Campaign analysis
Open acquisition page -> filter source/campaign -> compare campaign performance and downstream conversion quality.

### 3. Lead debugging
Search by email -> inspect timeline of ad touch, registration, emails, attendance, replay, purchase.

### 4. Connector monitoring
Open data health page -> see last sync, row counts, errors, delayed sources.

## Risks
- Cross-platform identity stitching can get messy.
- Some webinar/email tools expose incomplete join keys.
- UTMs may be inconsistent.
- Spend and conversion latency can create temporary mismatch.

## Productization guardrails
Design tables and connectors so they can become multi-tenant later, but do not build multi-tenant RBAC, billing, self-serve onboarding, or generic connector marketplace in v1.
