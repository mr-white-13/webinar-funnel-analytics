import {
  connectorHealth as mockConnectorHealth,
  overviewCards as mockOverviewCards,
  recentSyncRuns as mockRecentSyncRuns,
  sourceOverview as mockSourceOverview,
} from './mock-data';
import { getGa4Summary, getConnectorState, listSyncRuns } from './connector-store';

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
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
  const [ga4Summary, ga4Connector, syncRuns] = await Promise.all([
    getGa4Summary(),
    getConnectorState('ga4'),
    listSyncRuns(),
  ]);

  const overviewCards = ga4Summary
    ? [
        { label: 'Sessions', value: formatNumber(ga4Summary.totals.sessions), change: 'Last 30 days', tone: 'neutral' },
        { label: 'Total users', value: formatNumber(ga4Summary.totals.totalUsers), change: 'Live GA4 data', tone: 'positive' },
        { label: 'Page views', value: formatNumber(ga4Summary.totals.screenPageViews), change: 'Live GA4 data', tone: 'positive' },
        { label: 'Conversions', value: formatNumber(ga4Summary.totals.conversions), change: 'Live GA4 data', tone: 'positive' },
        ...mockOverviewCards.slice(4),
      ]
    : mockOverviewCards;

  const connectorHealth = mockConnectorHealth.map((item) => {
    if (item.name !== 'GA4') return item;
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
  });

  const sourceOverview = mockSourceOverview.map((item) => {
    if (item.name !== 'GA4') return item;
    return {
      ...item,
      detail: ga4Summary
        ? `Property ${ga4Summary.propertyId} synced ${relativeTime(ga4Summary.syncedAt)}`
        : 'OAuth ready; run first sync',
      status: ga4Summary ? 'Connected' : ga4Connector?.status === 'connected' ? 'Partial' : 'Partial',
    };
  });

  const recentSyncRuns = syncRuns.length
    ? syncRuns.slice(0, 8).map((run) => ({
        connector: run.source === 'ga4' ? 'ga4-sync' : run.source,
        source: run.source,
        status: run.status === 'failed' ? 'retrying' : run.status,
        startedAt: shortTime(run.startedAt),
        rows: run.rows,
      }))
    : mockRecentSyncRuns;

  return {
    ga4Summary,
    overviewCards,
    connectorHealth,
    sourceOverview,
    recentSyncRuns,
  };
}
