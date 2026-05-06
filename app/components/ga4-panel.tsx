import type { Ga4SummaryRecord } from '../lib/connector-store';

export function Ga4Panel({ summary }: { summary: Ga4SummaryRecord | null }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">GA4 ingestion</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Traffic summary</h2>
          </div>
          <a
            href="/api/connectors/ga4/sync"
            className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Trigger sync
          </a>
        </div>

        {summary ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
              <div className="text-sm text-stone-500">Top channels</div>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {summary.byChannel.slice(0, 5).map((item) => (
                  <div key={item.channel} className="flex items-center justify-between gap-4">
                    <span>{item.channel}</span>
                    <span className="font-medium">{item.sessions.toLocaleString()} sessions</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
              <div className="text-sm text-stone-500">Top landing pages</div>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {summary.byLandingPage.slice(0, 5).map((item) => (
                  <div key={item.landingPage} className="flex items-center justify-between gap-4">
                    <span className="truncate">{item.landingPage}</span>
                    <span className="font-medium">{item.sessions.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[22px] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
            GA4 is connected, but no synced dashboard snapshot is stored yet. Hit the sync endpoint once to persist the first dataset.
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">What this unlocks next</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Funnel source foundation</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
          <li>• GA4 now defines the connector persistence and sync pattern for the rest of the funnel.</li>
          <li>• Next sources should follow the same shape: config, secrets, sync runs, normalized summary.</li>
          <li>• Priority order after GA4: Meta Ads, Google Ads, Riverside registrations, Riverside attendance, GetResponse, Thinkific, Odoo.</li>
          <li>• Registration and CRM joins can land on top once source snapshots are stable.</li>
        </ul>
      </div>
    </section>
  );
}
