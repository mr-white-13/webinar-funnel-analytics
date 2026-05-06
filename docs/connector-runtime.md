# Connector Runtime Foundation

This project now has a simple local-first connector runtime so sources can move from one-off auth tests to persistent ingestion.

## Current persistence model
Runtime connector state is stored in:

- `app/.data/connectors-runtime.json`

This file is intentionally ignored by git.

## What is stored
Per connector:
- source name
- status (`disconnected`, `connected`, `syncing`, `error`)
- connection timestamps
- last sync timestamps/status
- last error
- non-secret config (for example GA4 property ID)
- secret values needed for local/dev sync (currently GA4 refresh token)

Also stored:
- recent sync runs
- latest GA4 aggregated summary snapshot for dashboard use

## Why local-first
We do not yet have a shared database configured for this project. This runtime layer keeps momentum:
- proves connector lifecycle
- proves ingestion pattern
- lets the dashboard consume real source data
- creates the same shape future sources can follow

## Connector pattern for future sources
Each source should follow the same sequence:
1. auth/config route
2. connector state saved
3. manual sync route
4. sync run recorded
5. normalized summary stored
6. dashboard consumes summary data

## Planned sources after GA4
Priority order:
1. Meta Ads
2. Google Ads
3. Riverside registrations
4. Riverside attendance
5. GetResponse
6. Thinkific
7. Odoo

## Migration path later
When Supabase/Postgres is ready:
- move connector runtime state from local file store to database tables
- move sync runs to durable relational storage
- keep API shapes the same so UI/routes do not need a large rewrite
