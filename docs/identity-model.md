# Identity Model and V1 Attribution

## Goal
For v1, identity stitching should be reliable enough for internal decision-making, not perfect cross-device attribution.

## Primary identity key
- `email` is the primary person key.
- `people.normalized_email` remains the strongest durable identifier.

## Secondary identity keys
We also preserve external identifiers from each system so records can be linked before email is known or when email quality is poor.

Examples:
- `ga_client_id`
- `gclid`, `fbclid`, `msclkid`, generic click IDs
- Webflow / Riverside form submission IDs
- Riverside registrant / attendee IDs
- GetResponse contact IDs and message IDs
- Thinkific user / order IDs
- Odoo contact / lead / opportunity IDs

## New table: `person_external_identities`
This table stores system-specific identifiers tied to a person.

Use it for:
- linking source records to a known person
- preserving raw IDs for audit/debugging
- allowing ingestion jobs to attach records before or after a registration happens

Important fields:
- `person_id`
- `source_system`
- `identity_type` — examples: `email`, `ga_client_id`, `riverside_registrant_id`, `getresponse_contact_id`, `thinkific_user_id`, `odoo_contact_id`
- `identity_value`
- `is_primary`
- `confidence`
- `status` — `resolved`, `pending_review`, `ignored`
- `first_seen_at`, `last_seen_at`

## New table: `identity_resolution_queue`
Not every match should auto-resolve.

This queue is for ambiguous or incomplete cases such as:
- same GA client ID mapping to multiple emails
- registration without email but with click/session data
- Odoo or Thinkific records that appear before a trusted registration match
- duplicate registrations with different emails but same platform identity

Statuses:
- `pending`
- `resolved`
- `ignored`

## Recommended v1 stitching logic
1. Match by normalized email when present.
2. Otherwise try known external identity matches from `person_external_identities`.
3. Otherwise attach by strong registration anchor if a registration carries both email and source IDs.
4. Otherwise keep the record linked only by raw IDs and queue it for review if it matters.

## Registration as the main anchor
Registration is the best cross-system join point in v1 because it often contains:
- email
- webinar context
- UTMs
- click IDs
- session IDs
- landing page/referrer

When a registration arrives, use it to:
- create or find the `person`
- attach platform IDs to `person_external_identities`
- create touchpoints from captured source fields

## V1 attribution
Keep it simple and inspectable.

Recommended models:
- `first_touch`
- `last_non_direct`

Rules:
- source fields captured at registration are trusted over inferred campaign data
- direct / unknown traffic should not overwrite a known prior paid or organic source in last-non-direct
- attribution snapshots should be recomputed idempotently from normalized touchpoints

## What not to do in v1
- no probabilistic identity graph
- no real-time journey graph
- no cross-device fingerprinting
- no black-box attribution model

## Operator guidance
If a dashboard number looks wrong, the team should be able to:
1. open the lead timeline
2. inspect email + raw IDs
3. see the stitched identities
4. see whether attribution came from registration fields, touchpoints, or manual review
