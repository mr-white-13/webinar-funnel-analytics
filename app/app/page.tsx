import { ConnectorHealth } from '../components/connector-health';
import { FunnelPanel } from '../components/funnel-panel';
import { Header } from '../components/header';
import { IdentityPanel } from '../components/identity-panel';
import { OverviewCards } from '../components/overview-cards';
import { RecentSyncs } from '../components/recent-syncs';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <OverviewCards />
        <FunnelPanel />
        <ConnectorHealth />
        <IdentityPanel />
        <RecentSyncs />
      </div>
    </main>
  );
}
