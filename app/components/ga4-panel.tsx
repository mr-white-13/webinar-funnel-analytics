import type { Ga4SummaryRecord, MetaSummaryRecord } from '../lib/connector-store';

export function Ga4Panel({ summary, metaSummary }: { summary: Ga4SummaryRecord | null; metaSummary: MetaSummaryRecord | null }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Live source snapshots</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">GA4 + Meta summary</h2>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/connectors/ga4/sync"
              className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              Sync GA4
            </a>
            <a
              href="/api/connectors/meta/sync"
              className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              Sync Meta
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
            <div className="text-sm text-stone-500">Top channels</div>
            {summary ? (
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {summary.byChannel.slice(0, 5).map((item) => (
                  <div key={item.channel} className="flex items-center justify-between gap-4">
                    <span>{item.channel}</span>
                    <span className="font-medium">{item.sessions.toLocaleString()} sessions</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-stone-500">No GA4 snapshot yet.</div>
            )}
          </div>

          <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
            <div className="text-sm text-stone-500">Top Meta campaigns</div>
            {metaSummary ? (
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {metaSummary.campaigns.slice(0, 5).map((item) => (
                  <div key={item.campaignId} className="flex items-center justify-between gap-4">
                    <span className="truncate">{item.campaignName}</span>
                    <span className="font-medium">€{item.spend.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-stone-500">No Meta snapshot yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">What this unlocks next</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Funnel source foundation</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
          <li>• GA4 now covers top-of-funnel traffic shape.</li>
          <li>• Meta adds paid spend, clicks, impressions, and campaign breakdowns.</li>
          <li>• Next sources should continue the same connector pattern: Google Ads, Riverside registrations, Riverside attendance, GetResponse, Thinkific, Odoo.</li>
          <li>• Registration and CRM joins can land once source snapshots are stable.</li>
        </ul>
      </div>
    </section>
  );
}
