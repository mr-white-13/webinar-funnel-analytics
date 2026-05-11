const META_API_BASE = 'https://graph.facebook.com/v22.0';

export interface MetaConnectionTestResult {
  adAccountId: string;
  accountName: string;
  currency: string;
  timezoneName: string;
}

export interface MetaSyncPayload {
  adAccountId: string;
  syncedAt: string;
  dateRange: { since: string; until: string };
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
  }>;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function normalizeAdAccountId(adAccountId: string) {
  return adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
}

async function metaFetch<T>(path: string, accessToken: string, params?: Record<string, string>) {
  const url = new URL(`${META_API_BASE}${path}`);
  url.searchParams.set('access_token', accessToken);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), { cache: 'no-store' });
  const data = await response.json().catch(() => null);

  if (!response.ok || (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>))) {
    throw {
      name: 'MetaApiError',
      message: `Meta API request failed with ${response.status}`,
      status: response.status,
      response: data,
    };
  }

  return data as T;
}

export function getMetaConfigFromEnv() {
  return {
    adAccountId: normalizeAdAccountId(required('META_AD_ACCOUNT_ID')),
    appId: required('META_APP_ID'),
    appSecret: required('META_APP_SECRET'),
    accessToken: required('META_ACCESS_TOKEN'),
  };
}

export async function fetchMetaConnectionTest(accessToken: string, adAccountId: string): Promise<MetaConnectionTestResult> {
  const result = await metaFetch<{
    id: string;
    name: string;
    currency: string;
    timezone_name: string;
  }>(`/${normalizeAdAccountId(adAccountId)}`, accessToken, {
    fields: 'id,name,currency,timezone_name',
  });

  return {
    adAccountId: result.id,
    accountName: result.name,
    currency: result.currency,
    timezoneName: result.timezone_name,
  };
}

export async function fetchMetaSyncPayload(accessToken: string, adAccountId: string): Promise<MetaSyncPayload> {
  const normalizedId = normalizeAdAccountId(adAccountId);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const until = new Date().toISOString().slice(0, 10);

  const [accountInsights, campaigns] = await Promise.all([
    metaFetch<{
      data: Array<{
        spend?: string;
        impressions?: string;
        clicks?: string;
        reach?: string;
      }>;
    }>(`/${normalizedId}/insights`, accessToken, {
      fields: 'spend,impressions,clicks,reach',
      time_range: JSON.stringify({ since, until }),
      level: 'account',
      limit: '1',
    }),
    metaFetch<{
      data: Array<{
        campaign_id: string;
        campaign_name: string;
        spend?: string;
        impressions?: string;
        clicks?: string;
        reach?: string;
      }>;
    }>(`/${normalizedId}/insights`, accessToken, {
      fields: 'campaign_id,campaign_name,spend,impressions,clicks,reach',
      time_range: JSON.stringify({ since, until }),
      level: 'campaign',
      limit: '10',
    }),
  ]);

  const total = accountInsights.data?.[0] ?? {};

  return {
    adAccountId: normalizedId,
    syncedAt: new Date().toISOString(),
    dateRange: { since, until },
    totals: {
      spend: Number(total.spend ?? 0),
      impressions: Number(total.impressions ?? 0),
      clicks: Number(total.clicks ?? 0),
      reach: Number(total.reach ?? 0),
    },
    campaigns: (campaigns.data ?? []).map((campaign) => ({
      campaignId: campaign.campaign_id,
      campaignName: campaign.campaign_name,
      spend: Number(campaign.spend ?? 0),
      impressions: Number(campaign.impressions ?? 0),
      clicks: Number(campaign.clicks ?? 0),
      reach: Number(campaign.reach ?? 0),
    })),
  };
}
