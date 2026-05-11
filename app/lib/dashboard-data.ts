import {
  connectorHealth as mockConnectorHealth,
  overviewCards as mockOverviewCards,
  recentSyncRuns as mockRecentSyncRuns,
  sourceOverview as mockSourceOverview,
} from './mock-data';
import { getGa4Summary, getGetResponseSummary, getGoogleAdsSummary, getMetaSummary, getConnectorState, listSyncRuns } from './connector-store';
import { getLatestRegistrationImport } from './registration-import';

type DashboardOverviewCard = {
  label: string;
  value: string;
  change: string;
  tone: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function relativeTime(iso: string | null) {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC';
}

export async function getDashboardData() {
  const [
    ga4Summary,
    metaSummary,
    googleAdsSummary,
    getResponseSummary,
    latestRegistrationImport,
    ga4Connector,
    metaConnector,
    googleAdsConnector,
    getResponseConnector,
    manualRegistrationsConnector,
    syncRuns,
  ] = await Promise.all([
    getGa4Summary(),
    getMetaSummary(),
    getGoogleAdsSummary(),
    getGetResponseSummary(),
    getLatestRegistrationImport(),
    getConnectorState('ga4'),
    getConnectorState('meta'),
    getConnectorState('google-ads'),
    getConnectorState('getresponse'),
    getConnectorState('manual-registrations'),
    listSyncRuns(),
  ]);

  let overviewCards: DashboardOverviewCard[] = mockOverviewCards.map((card) => ({ ...card }));

  if (ga4Summary || metaSummary || googleAdsSummary || getResponseSummary || latestRegistrationImport) {
    overviewCards = [
      {
        label: 'Sessions',
        value: ga4Summary ? formatNumber(ga4Summary.totals.sessions) : mockOverviewCards[1].value,
        change: ga4Summary ? 'Last 30 days' : mockOverviewCards[1].change,
        tone: ga4Summary ? 'neutral' : mockOverviewCards[1].tone,
      },
      {
        label: 'Paid spend',
        value: formatCurrency((metaSummary?.totals.spend ?? 0) + (googleAdsSummary?.totals.cost ?? 0)),
        change: 'Meta + Google Ads',
        tone: 'neutral',
      },
      {
        label: 'Registrations',
        value: latestRegistrationImport ? formatNumber(latestRegistrationImport.totalRegistrants) : mockOverviewCards[2].value,
        change: latestRegistrationImport ? 'Manual Riverside import' : mockOverviewCards[2].change,
        tone: 'positive',
      },
      {
        label: 'List contacts',
        value: getResponseSummary ? formatNumber(getResponseSummary.totals.contactsInPrimaryCampaign) : mockOverviewCards[3].value,
        change: getResponseSummary ? 'Primary webinar list' : mockOverviewCards[3].change,
        tone: getResponseSummary ? 'positive' : mockOverviewCards[3].tone,
      },
      ...mockOverviewCards.slice(4),
    ];
  }

  const connectorHealth = mockConnectorHealth.map((item) => {
    if (item.name === 'GA4') {
      return {
        ...item,
        status:
          ga4Connector?.status === 'connected'
            ? 'Healthy'
            : ga4Connector?.status === 'syncing'
              ? 'Watch'
              : ga4Connector?.status === 'error'
                ? 'Delayed'
                : 'Watch',
        lastSync: relativeTime(ga4Connector?.lastSyncAt ?? ga4Connector?.connectedAt ?? null),
        rows: ga4Summary ? `${formatNumber(ga4Summary.totals.sessions)} sessions` : 'Awaiting sync',
        lag: ga4Summary ? 'Manual sync' : 'Connect + sync',
      };
    }

    if (item.name === 'Meta Ads') {
      return {
        ...item,
        status:
          metaConnector?.status === 'connected'
            ? 'Healthy'
            : metaConnector?.status === 'syncing'
              ? 'Watch'
              : metaConnector?.status === 'error'
                ? 'Delayed'
                : 'Watch',
        lastSync: relativeTime(metaConnector?.lastSyncAt ?? metaConnector?.connectedAt ?? null),
        rows: metaSummary ? `${formatNumber(metaSummary.totals.clicks)} clicks` : 'Awaiting sync',
        lag: metaSummary ? 'Manual sync' : 'Connect + sync',
      };
    }

    if (item.name === 'Google Ads') {
      return {
        ...item,
        status:
          googleAdsConnector?.status === 'connected'
            ? 'Healthy'
            : googleAdsConnector?.status === 'syncing'
              ? 'Watch'
              : googleAdsConnector?.status === 'error'
                ? 'Delayed'
                : 'Watch',
        lastSync: relativeTime(googleAdsConnector?.lastSyncAt ?? googleAdsConnector?.connectedAt ?? null),
        rows: googleAdsSummary ? `${formatNumber(googleAdsSummary.totals.clicks)} clicks` : 'Awaiting sync',
        lag: googleAdsSummary ? 'Manual sync' : 'Connect + sync',
      };
    }

    if (item.name === 'GetResponse') {
      return {
        ...item,
        status:
          getResponseConnector?.status === 'connected'
            ? 'Healthy'
            : getResponseConnector?.status === 'syncing'
              ? 'Watch'
              : getResponseConnector?.status === 'error'
                ? 'Delayed'
                : 'Watch',
        lastSync: relativeTime(getResponseConnector?.lastSyncAt ?? getResponseConnector?.connectedAt ?? null),
        rows: getResponseSummary ? `${formatNumber(getResponseSummary.totals.contactsInPrimaryCampaign)} contacts` : 'Awaiting sync',
        lag: getResponseSummary ? 'Manual sync' : 'Connect + sync',
      };
    }

    return item;
  });

  const sourceOverview = mockSourceOverview.map((item) => {
    if (item.name === 'GA4') {
      return {
        ...item,
        detail: ga4Summary
          ? `Property ${ga4Summary.propertyId} synced ${relativeTime(ga4Summary.syncedAt)}`
          : 'OAuth ready; run first sync',
        status: ga4Summary ? 'Connected' : ga4Connector?.status === 'connected' ? 'Partial' : 'Partial',
      };
    }

    if (item.name === 'Meta Ads') {
      return {
        ...item,
        detail: metaSummary
          ? `Account ${metaSummary.adAccountId} synced ${relativeTime(metaSummary.syncedAt)}`
          : 'Token ready; run first sync',
        status: metaSummary ? 'Connected' : metaConnector?.status === 'connected' ? 'Partial' : 'Partial',
      };
    }

    if (item.name === 'Google Ads') {
      return {
        ...item,
        detail: googleAdsSummary
          ? `Customer ${googleAdsSummary.customerId} synced ${relativeTime(googleAdsSummary.syncedAt)}`
          : 'OAuth ready; run first sync',
        status: googleAdsSummary ? 'Connected' : googleAdsConnector?.status === 'connected' ? 'Partial' : 'Partial',
      };
    }

    if (item.name === 'GetResponse') {
      return {
        ...item,
        detail: getResponseSummary
          ? `${getResponseSummary.primaryCampaignName ?? 'Primary list'} synced ${relativeTime(getResponseSummary.syncedAt)}`
          : 'API key ready; run first sync',
        status: getResponseSummary ? 'Connected' : getResponseConnector?.status === 'connected' ? 'Partial' : 'Partial',
      };
    }

    return item;
  });

  const recentSyncRuns = syncRuns.length
    ? syncRuns.slice(0, 8).map((run) => ({
        connector: `${run.source}-sync`,
        source: run.source,
        status: run.status === 'failed' ? 'retrying' : run.status,
        startedAt: shortTime(run.startedAt),
        rows: run.rows,
      }))
    : mockRecentSyncRuns;

  return {
    ga4Summary,
    metaSummary,
    googleAdsSummary,
    getResponseSummary,
    latestRegistrationImport,
    manualRegistrationsConnector,
    overviewCards,
    connectorHealth,
    sourceOverview,
    recentSyncRuns,
  };
}
