const GETRESPONSE_API_BASE = 'https://api.getresponse.com/v3';

export interface GetResponseConnectionTestResult {
  accountEmail: string;
  campaigns: Array<{
    campaignId: string;
    name: string;
  }>;
}

export interface GetResponseSyncPayload {
  syncedAt: string;
  accountEmail: string;
  primaryCampaignId: string | null;
  primaryCampaignName: string | null;
  campaigns: Array<{
    campaignId: string;
    name: string;
    contactsCount: number;
  }>;
  contactsSample: Array<{
    contactId: string;
    email: string;
    name: string | null;
    campaignId: string | null;
    campaignName: string | null;
  }>;
  totals: {
    campaigns: number;
    contactsInPrimaryCampaign: number;
  };
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function getresponseFetch<T>(path: string, apiKey: string, init?: RequestInit) {
  const response = await fetch(`${GETRESPONSE_API_BASE}${path}`, {
    ...init,
    headers: {
      'X-Auth-Token': `api-key ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      name: 'GetResponseApiError',
      message: `GetResponse API request failed with ${response.status}`,
      status: response.status,
      response: data,
    };
  }

  return data as T;
}

export function getGetResponseConfigFromEnv() {
  return {
    apiKey: required('GETRESPONSE_API_KEY'),
    accountEmail: required('GETRESPONSE_ACCOUNT_EMAIL'),
    primaryListName: process.env.GETRESPONSE_PRIMARY_LIST_NAME ?? null,
  };
}

export async function fetchGetResponseConnectionTest(apiKey: string, accountEmail: string): Promise<GetResponseConnectionTestResult> {
  const campaigns = await getresponseFetch<Array<{ campaignId: string; name: string }>>('/campaigns?perPage=20', apiKey);

  return {
    accountEmail,
    campaigns: campaigns.map((campaign) => ({
      campaignId: campaign.campaignId,
      name: campaign.name,
    })),
  };
}

export async function fetchGetResponseSyncPayload(apiKey: string, accountEmail: string, primaryListName?: string | null): Promise<GetResponseSyncPayload> {
  const campaigns = await getresponseFetch<Array<{ campaignId: string; name: string }>>('/campaigns?perPage=50', apiKey);

  const matchedPrimary = primaryListName
    ? campaigns.find((campaign) => campaign.name.toLowerCase() === primaryListName.toLowerCase()) ?? null
    : campaigns[0] ?? null;

  const campaignContactCounts = await Promise.all(
    campaigns.slice(0, 10).map(async (campaign) => {
      const contacts = await getresponseFetch<Array<{ contactId: string }>>(
        `/contacts?campaignId=${campaign.campaignId}&perPage=1`,
        apiKey,
      );

      return {
        campaignId: campaign.campaignId,
        name: campaign.name,
        contactsCount: contacts.length,
      };
    }),
  );

  let contactsSample: GetResponseSyncPayload['contactsSample'] = [];
  let contactsInPrimaryCampaign = 0;

  if (matchedPrimary) {
    const contacts = await getresponseFetch<
      Array<{
        contactId: string;
        email: string;
        name?: string;
        campaign?: { campaignId?: string; name?: string };
      }>
    >(`/contacts?campaignId=${matchedPrimary.campaignId}&perPage=20`, apiKey);

    contactsInPrimaryCampaign = contacts.length;
    contactsSample = contacts.slice(0, 10).map((contact) => ({
      contactId: contact.contactId,
      email: contact.email,
      name: contact.name ?? null,
      campaignId: contact.campaign?.campaignId ?? matchedPrimary.campaignId,
      campaignName: contact.campaign?.name ?? matchedPrimary.name,
    }));
  }

  return {
    syncedAt: new Date().toISOString(),
    accountEmail,
    primaryCampaignId: matchedPrimary?.campaignId ?? null,
    primaryCampaignName: matchedPrimary?.name ?? null,
    campaigns: campaignContactCounts,
    contactsSample,
    totals: {
      campaigns: campaigns.length,
      contactsInPrimaryCampaign,
    },
  };
}
