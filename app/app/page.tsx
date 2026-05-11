import { ConnectorHealth } from '../components/connector-health';
import { MainFunnelDashboard } from '../components/main-funnel-dashboard';
import { Ga4Panel } from '../components/ga4-panel';
import { IdentityPanel } from '../components/identity-panel';
import { RecentSyncs } from '../components/recent-syncs';
import { Sidebar } from '../components/sidebar';
import { Topbar } from '../components/topbar';
import { getAcquisitionData } from '../lib/acquisition-data';

export default async function HomePage() {
  const dashboardData = await getAcquisitionData();

  const kpis = [
    {
      label: 'Ad spend',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
        (dashboardData.metaSummary?.totals.spend ?? 0) + (dashboardData.googleAdsSummary?.totals.cost ?? 0),
      ),
      note: 'Meta + Google Ads',
    },
    {
      label: 'Registrants',
      value: dashboardData.stages[2]?.value.toLocaleString() ?? '0',
      note: 'Manual Riverside import',
    },
    {
      label: 'Attended',
      value: dashboardData.stages[3]?.value.toLocaleString() ?? '0',
      note: 'Participated live',
    },
    {
      label: 'Enrollments',
      value: dashboardData.stages[4]?.value.toLocaleString() ?? '0',
      note: 'Thinkific LMS',
    },
    {
      label: 'List contacts',
      value: (dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0).toLocaleString(),
      note: 'GetResponse primary list',
    },
    {
      label: 'Sessions',
      value: (dashboardData.ga4Summary?.totals.sessions ?? 0).toLocaleString(),
      note: 'GA4 last 30 days',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
          <div className="flex flex-col gap-6">
            <Topbar />
            <MainFunnelDashboard stages={dashboardData.stages} kpis={kpis} />
            <Ga4Panel summary={dashboardData.ga4Summary} metaSummary={dashboardData.metaSummary} />
            <ConnectorHealth
              connectorHealth={dashboardData.connectorHealth}
              sourceOverview={dashboardData.sourceOverview}
            />
            <IdentityPanel />
            <RecentSyncs runs={dashboardData.recentSyncRuns} />
          </div>
        </div>
      </div>
    </main>
  );
}
