import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { OAuth2Client } from 'google-auth-library';

const GA_SCOPE = ['https://www.googleapis.com/auth/analytics.readonly'];

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getGa4OauthClient() {
  return new OAuth2Client(
    required('GOOGLE_CLIENT_ID'),
    required('GOOGLE_CLIENT_SECRET'),
    required('GOOGLE_REDIRECT_URI'),
  );
}

export function getGa4AuthUrl() {
  const oauth2Client = getGa4OauthClient();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GA_SCOPE,
    include_granted_scopes: true,
  });
}

export async function exchangeGa4Code(code: string) {
  const oauth2Client = getGa4OauthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return { oauth2Client, tokens };
}

export async function getOauthTokenInfo(auth: OAuth2Client) {
  const accessToken = auth.credentials.access_token;
  if (!accessToken) {
    throw new Error('No access token returned from Google OAuth');
  }

  return auth.getTokenInfo(accessToken);
}

export async function fetchGa4ConnectionTest(auth: OAuth2Client) {
  const propertyId = required('GA4_PROPERTY_ID');
  const analyticsData = new BetaAnalyticsDataClient({ authClient: auth });

  const metadataResponse = await analyticsData.getMetadata({
    name: `properties/${propertyId}/metadata`,
  });

  const reportResponse = await analyticsData.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    limit: 10,
  });

  const report = reportResponse[0];
  const metadata = metadataResponse[0];

  return {
    propertyId,
    rowCount: report.rowCount ?? 0,
    rows: report.rows ?? [],
    metadataSample: (metadata.dimensions ?? []).slice(0, 5).map((item) => item.apiName ?? ''),
  };
}
