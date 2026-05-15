import { Sidebar } from '../../components/sidebar';
import { Topbar } from '../../components/topbar';
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
    },
    {
      label: 'Landing visits',
      value: (dashboardData.ga4Summary?.totals.sessions ?? 0).toLocaleString(),
      note: 'GA4 sessions',
    },
    {
      label: 'Registrations',
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
      note: 'GetResponse',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
          <div className="flex flex-col gap-6">
            <Topbar
              eyebrow="Dashboard v2"
              title="Webinar acquisition funnel dashboard"
              subtitle="Replica pass based on the uploaded mock layout."
            />
            <DashboardV2 stages={dashboardData.stages} kpis={kpis} />
          </div>
        </div>
      </div>
    </main>
  );
}
