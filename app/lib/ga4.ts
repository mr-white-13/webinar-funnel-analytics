import { OAuth2Client } from 'google-auth-library';

const GA_SCOPE = ['https://www.googleapis.com/auth/analytics.readonly'];
const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

export interface Ga4ConnectionTestResult {
  propertyId: string;
  rowCount: number;
  rows: unknown[];
  metadataSample: string[];
}

export interface Ga4SyncPayload {
  propertyId: string;
  syncedAt: string;
  dateRange: { startDate: string; endDate: string };
  totals: {
    sessions: number;
    totalUsers: number;
    screenPageViews: number;
    conversions: number;
  };
  byChannel: Array<{
    channel: string;
    sessions: number;
    users: number;
  }>;
  byLandingPage: Array<{
    landingPage: string;
    sessions: number;
    users: number;
  }>;
  byDevice: Array<{
    deviceCategory: string;
    sessions: number;
  }>;
  byCountry: Array<{
    country: string;
    sessions: number;
  }>;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function ga4Fetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${GA4_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      name: 'Ga4ApiError',
      message: `GA4 API request failed with ${response.status}`,
      status: response.status,
      response: data,
    };
  }

  return data as T;
}

function metricValue(row: { metricValues?: Array<{ value?: string }> } | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

function dimensionValue(row: { dimensionValues?: Array<{ value?: string }> } | undefined, index: number, fallback = 'Unknown') {
  return row?.dimensionValues?.[index]?.value || fallback;
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

export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getGa4OauthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: credentials.access_token ?? undefined,
    expiry_date: credentials.expiry_date ?? undefined,
  });
  return oauth2Client;
}

export async function fetchGa4ConnectionTest(auth: OAuth2Client): Promise<Ga4ConnectionTestResult> {
  const propertyId = required('GA4_PROPERTY_ID');
  const accessToken = auth.credentials.access_token;

  if (!accessToken) {
    throw new Error('No access token available for GA4 request');
  }

  const metadata = await ga4Fetch<{
    dimensions?: Array<{ apiName?: string }>;
  }>(`/properties/${propertyId}/metadata`, accessToken);

  const report = await ga4Fetch<{
    rowCount?: number;
    rows?: unknown[];
  }>(`/properties/${propertyId}:runReport`, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      limit: 10,
    }),
  });

  return {
    propertyId,
    rowCount: report.rowCount ?? 0,
    rows: report.rows ?? [],
    metadataSample: (metadata.dimensions ?? []).slice(0, 5).map((item) => item.apiName ?? ''),
  };
}

export async function fetchGa4SyncPayload(auth: OAuth2Client, propertyId: string): Promise<Ga4SyncPayload> {
  const accessToken = auth.credentials.access_token;
  if (!accessToken) {
    throw new Error('No access token available for GA4 sync');
  }

  const [totals, channels, landingPages, devices, countries] = await Promise.all([
    ga4Fetch<{ rows?: Array<{ metricValues?: Array<{ value?: string }> }> }>(`/properties/${propertyId}:runReport`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
        ],
      }),
    }),
    ga4Fetch<{ rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> }>(`/properties/${propertyId}:runReport`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6,
      }),
    }),
    ga4Fetch<{ rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> }>(`/properties/${propertyId}:runReport`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'landingPagePlusQueryString' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      }),
    }),
    ga4Fetch<{ rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> }>(`/properties/${propertyId}:runReport`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      }),
    }),
    ga4Fetch<{ rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> }>(`/properties/${propertyId}:runReport`, accessToken, {
      method: 'POST',
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5,
      }),
    }),
  ]);

  const totalRow = totals.rows?.[0];

  return {
    propertyId,
    syncedAt: new Date().toISOString(),
    dateRange: { startDate: '30daysAgo', endDate: 'today' },
    totals: {
      sessions: metricValue(totalRow, 0),
      totalUsers: metricValue(totalRow, 1),
      screenPageViews: metricValue(totalRow, 2),
      conversions: metricValue(totalRow, 3),
    },
    byChannel: (channels.rows ?? []).map((row) => ({
      channel: dimensionValue(row, 0),
      sessions: metricValue(row, 0),
      users: metricValue(row, 1),
    })),
    byLandingPage: (landingPages.rows ?? []).map((row) => ({
      landingPage: dimensionValue(row, 0, '/'),
      sessions: metricValue(row, 0),
      users: metricValue(row, 1),
    })),
    byDevice: (devices.rows ?? []).map((row) => ({
      deviceCategory: dimensionValue(row, 0),
      sessions: metricValue(row, 0),
    })),
    byCountry: (countries.rows ?? []).map((row) => ({
      country: dimensionValue(row, 0),
      sessions: metricValue(row, 0),
    })),
  };
}
