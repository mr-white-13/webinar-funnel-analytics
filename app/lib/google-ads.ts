import { refreshAccessToken } from './ga4';

const GOOGLE_ADS_API_BASE = 'https://googleads.googleapis.com/v20';

export interface GoogleAdsConnectionTestResult {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
}

export interface GoogleAdsSyncPayload {
  customerId: string;
  syncedAt: string;
  dateRange: { startDate: string; endDate: string };
  totals: {
    costMicros: number;
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    costMicros: number;
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function normalizeCustomerId(customerId: string) {
  return customerId.replace(/-/g, '');
}

async function getAccessTokenFromRefreshToken() {
  const refreshToken = required('GOOGLE_REFRESH_TOKEN');
  const auth = await refreshAccessToken(refreshToken);
  const accessToken = auth.credentials.access_token;
  if (!accessToken) throw new Error('No Google access token available');
  return accessToken;
}

async function googleAdsSearch<T>(customerId: string, query: string) {
  const accessToken = await getAccessTokenFromRefreshToken();
  const response = await fetch(`${GOOGLE_ADS_API_BASE}/customers/${normalizeCustomerId(customerId)}/googleAds:search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': required('GOOGLE_ADS_DEVELOPER_TOKEN'),
      'login-customer-id': normalizeCustomerId(required('GOOGLE_ADS_MANAGER_ID')),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>))) {
    throw {
      name: 'GoogleAdsApiError',
      message: `Google Ads API request failed with ${response.status}`,
      status: response.status,
      response: data,
    };
  }

  return data as T;
}

export function getGoogleAdsConfigFromEnv() {
  return {
    customerId: normalizeCustomerId(required('GOOGLE_ADS_CUSTOMER_ID')),
    managerId: normalizeCustomerId(required('GOOGLE_ADS_MANAGER_ID')),
    developerToken: required('GOOGLE_ADS_DEVELOPER_TOKEN'),
  };
}

export async function fetchGoogleAdsConnectionTest(customerId: string): Promise<GoogleAdsConnectionTestResult> {
  const result = await googleAdsSearch<{
    results?: Array<{
      customer: {
        id: string;
        descriptiveName: string;
        currencyCode: string;
        timeZone: string;
      };
    }>;
  }>(customerId, `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.time_zone
    FROM customer
    LIMIT 1
  `);

  const customer = result.results?.[0]?.customer;
  if (!customer) throw new Error('No Google Ads customer data returned');

  return {
    customerId: customer.id,
    descriptiveName: customer.descriptiveName,
    currencyCode: customer.currencyCode,
    timeZone: customer.timeZone,
  };
}

export async function fetchGoogleAdsSyncPayload(customerId: string): Promise<GoogleAdsSyncPayload> {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const result = await googleAdsSearch<{
    results?: Array<{
      campaign: {
        id: string;
        name: string;
      };
      metrics: {
        costMicros?: string;
        impressions?: string;
        clicks?: string;
        conversions?: string;
      };
    }>;
  }>(customerId, `
    SELECT
      campaign.id,
      campaign.name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.cost_micros DESC
    LIMIT 10
  `);

  const campaigns = (result.results ?? []).map((row) => {
    const costMicros = Number(row.metrics.costMicros ?? 0);
    return {
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      costMicros,
      cost: costMicros / 1_000_000,
      impressions: Number(row.metrics.impressions ?? 0),
      clicks: Number(row.metrics.clicks ?? 0),
      conversions: Number(row.metrics.conversions ?? 0),
    };
  });

  const totals = campaigns.reduce(
    (acc, campaign) => ({
      costMicros: acc.costMicros + campaign.costMicros,
      cost: acc.cost + campaign.cost,
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
    }),
    { costMicros: 0, cost: 0, impressions: 0, clicks: 0, conversions: 0 },
  );

  return {
    customerId: normalizeCustomerId(customerId),
    syncedAt: new Date().toISOString(),
    dateRange: { startDate, endDate },
    totals,
    campaigns,
  };
}
