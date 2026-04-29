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

## What this scaffold does
- starts OAuth flow
- exchanges the auth code for tokens
- runs a GA4 Data API test query
- proves property access works

## What still needs to be built
- secure token storage
- refresh-token persistence
- scheduled sync job
- normalization into `touchpoints` / daily aggregates
- connector status UI backed by real state

## Security note
Do not paste OAuth secrets into screenshots or public repos. Rotate credentials if they were exposed in chat.
