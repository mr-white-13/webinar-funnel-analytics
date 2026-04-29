import { ConnectorHealth } from '../components/connector-health';
import { FunnelPanel } from '../components/funnel-panel';
import { IdentityPanel } from '../components/identity-panel';
import { OverviewCards } from '../components/overview-cards';
import { RecentSyncs } from '../components/recent-syncs';
import { Sidebar } from '../components/sidebar';
import { Topbar } from '../components/topbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f2ec] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
          <div className="flex flex-col gap-6">
            <Topbar />
            <OverviewCards />
            <FunnelPanel />
            <ConnectorHealth />
            <IdentityPanel />
            <RecentSyncs />
          </div>
        </div>
      </div>
    </main>
  );
}
