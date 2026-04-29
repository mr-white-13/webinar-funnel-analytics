# MVP Connectors

V1 should start with the minimum sources needed to explain funnel performance end to end.

## Tier 1: Must-have

### 1. Ad platform connector
Preferred first: Meta Ads. Optional second: Google Ads.

Ingest:
- account, campaign, ad set, ad metadata
- spend by day
- impressions, clicks, CTR, CPC
- UTM params / tracking template fields where available
- campaign status

Why:
Spend and campaign hierarchy are mandatory for acquisition reporting.

### 2. Landing page / registration source
Preferred source depends on setup:
- website database
- form tool
- landing page platform exports
- GA4/export only if no better source exists

Ingest:
- page visits/sessions if available
- registration form submissions
- UTM/source/campaign/ad params captured at registration
- landing page URL
- referrer
- device/country if available
- timestamp

Why:
Registration is the main funnel anchor.

### 3. Webinar platform connector
Examples: Zoom Webinar, WebinarJam, Demio, Livestorm, GoTo Webinar.

Ingest:
- webinar/event metadata
- registrants
- attendance status
- join time / leave time / duration
- watch percentage if available
- replay watch records if available

Why:
Separates lead quantity from attendance quality.

### 4. Email platform connector
Examples: ActiveCampaign, HubSpot, Mailchimp, ConvertKit.

Ingest:
- contact ID/email
- campaign/automation IDs
- email sent/open/click/unsubscribe events
- timestamps
- tags/lists if important to webinar flow

Why:
Email nurture strongly affects show-up and purchase rates.

### 5. LMS / signup / purchase connector
Examples: Stripe, Paddle, LMS DB, app signup DB, course platform.

Ingest:
- signup started/completed
- purchase/order/subscription events
- revenue amount, currency
- product/offer
- refund if relevant
- customer email/external user ID

Why:
Need downstream outcome, not just webinar metrics.

## Tier 2: Nice-to-have after MVP
- Google Ads
- LinkedIn Ads
- CRM/opportunity data
- call booking source (Cal.com, HubSpot Meetings)
- retargeting audiences / audience membership
- product usage milestones after purchase

## Connector ingestion rules
- Always store `source_system` and `external_id`.
- Make syncs idempotent with upserts.
- Track `synced_at`, `last_seen_at`, and source cursor.
- Capture original UTM fields exactly as provided before cleaning.
- Prefer API pulls; allow CSV upload for gaps.

## Practical v1 recommendation
Start with these 4-5 connectors only:
1. Meta Ads
2. registration source
3. webinar platform
4. email platform
5. Stripe or LMS/app DB

That is enough to produce real business value.
