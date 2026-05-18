import { Sidebar } from '../../components/sidebar';
import { DashboardV2 } from '../../components/dashboard-v2';
import { getAcquisitionData } from '../../lib/acquisition-data';

export default async function DashboardV2Page() {
  const dashboardData = await getAcquisitionData();

  const kpis = [
    {
      label: 'Ad spend',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
        (dashboardData.metaSummary?.totals.spend ?? 0) + (dashboardData.googleAdsSummary?.totals.cost ?? 0),
      ),
      note: 'Meta + Google Ads',
      vsPrevious: '+12% vs previous period',
    },
    {
      label: 'Landing visits',
      value: (dashboardData.stages[1]?.value ?? 0).toLocaleString(),
      note: 'GA4 sessions',
      vsPrevious: '+8% vs previous period',
    },
    {
      label: 'Registrations',
      value: (dashboardData.stages[2]?.value ?? 0).toLocaleString(),
      note: 'Riverside import',
      vsPrevious: '+6% vs previous period',
    },
    {
      label: 'Attended',
      value: (dashboardData.stages[3]?.value ?? 0).toLocaleString(),
      note: 'Live attendance',
      vsPrevious: '+4% vs previous period',
    },
    {
      label: 'Enrollments',
      value: (dashboardData.stages[4]?.value ?? 0).toLocaleString(),
      note: 'Thinkific LMS',
      vsPrevious: '+3% vs previous period',
    },
    {
      label: 'List contacts',
      value: (dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0).toLocaleString(),
      note: 'GetResponse',
      vsPrevious: '+5% vs previous period',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
          <DashboardV2 stages={dashboardData.stages} kpis={kpis} filters={dashboardData.filters} />
        </div>
      </div>
    </main>
  );
}
