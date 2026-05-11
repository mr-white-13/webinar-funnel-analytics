import {
  connectorHealth as mockConnectorHealth,
  overviewCards as mockOverviewCards,
  recentSyncRuns as mockRecentSyncRuns,
  sourceOverview as mockSourceOverview,
} from './mock-data';
import { getGa4Summary, getMetaSummary, getConnectorState, listSyncRuns } from './connector-store';

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
  const [ga4Summary, metaSummary, ga4Connector, metaConnector, syncRuns] = await Promise.all([
    getGa4Summary(),
    getMetaSummary(),
    getConnectorState('ga4'),
    getConnectorState('meta'),
    listSyncRuns(),
  ]);

  let overviewCards: DashboardOverviewCard[] = mockOverviewCards.map((card) => ({ ...card }));

  if (ga4Summary || metaSummary) {
    overviewCards = [
      {
        label: 'Sessions',
        value: ga4Summary ? formatNumber(ga4Summary.totals.sessions) : mockOverviewCards[1].value,
        change: ga4Summary ? 'Last 30 days' : mockOverviewCards[1].change,
        tone: ga4Summary ? 'neutral' : mockOverviewCards[1].tone,
      },
      {
        label: 'Spend',
        value: metaSummary ? formatCurrency(metaSummary.totals.spend) : mockOverviewCards[0].value,
        change: metaSummary ? 'Last 30 days' : mockOverviewCards[0].change,
        tone: metaSummary ? 'neutral' : mockOverviewCards[0].tone,
      },
      {
        label: 'Clicks',
        value: metaSummary ? formatNumber(metaSummary.totals.clicks) : mockOverviewCards[2].value,
        change: metaSummary ? 'Live Meta data' : mockOverviewCards[2].change,
        tone: metaSummary ? 'positive' : mockOverviewCards[2].tone,
      },
      {
        label: 'Users',
        value: ga4Summary ? formatNumber(ga4Summary.totals.totalUsers) : mockOverviewCards[3].value,
        change: ga4Summary ? 'Live GA4 data' : mockOverviewCards[3].change,
        tone: ga4Summary ? 'positive' : mockOverviewCards[3].tone,
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
    overviewCards,
    connectorHealth,
    sourceOverview,
    recentSyncRuns,
  };
}
