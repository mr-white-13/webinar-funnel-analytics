# GA4 Connector Setup

## Current property
- GA4 Property ID: `224720340`

## Required environment variables
Create `app/.env.local` for local testing:

```bash
GA4_PROPERTY_ID=224720340
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/connectors/ga4/callback
APP_BASE_URL=http://localhost:3000
```

For Vercel, add the same variables in Project Settings → Environment Variables.

## OAuth client settings
The Google OAuth client must allow these redirect URIs:

### Local
- `http://localhost:3000/api/connectors/ga4/callback`
- `http://localhost:3000/oauth2callback`

### Vercel
- `https://webinar-funnel-analytics.vercel.app/api/connectors/ga4/callback`

## Test flow
Once env vars are set:

1. Start local app
2. Open:
   - `/api/connectors/ga4/auth`
3. Complete Google consent
4. Google redirects to:
   - `/api/connectors/ga4/callback`
5. A JSON payload confirms connection and returns a small GA4 report preview

## What this scaffold now does
- starts OAuth flow
- exchanges the auth code for tokens
- persists GA4 connector runtime state locally for dev/internal use
- stores the GA4 refresh token in local runtime storage
- runs a GA4 Data API test query
- exposes a manual sync route at `/api/connectors/ga4/sync`
- stores a dashboard-ready GA4 summary snapshot
- powers parts of the dashboard with real GA4 data when a sync exists

## What still needs to be built
- move connector state from local runtime file store to shared database storage
- scheduled sync job / cron
- normalization into `touchpoints` / daily aggregates
- source-to-source identity joins with registration/CRM data
- additional source connectors following the same pattern

## Security note
Do not paste OAuth secrets into screenshots or public repos. Rotate credentials if they were exposed in chat.
