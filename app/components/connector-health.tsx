import { connectorHealth, sourceOverview } from '../lib/mock-data';

function statusClass(status: string) {
  if (status === 'Healthy' || status === 'Connected') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Delayed') return 'bg-rose-50 text-rose-700';
  if (status === 'Partial') return 'bg-amber-50 text-amber-700';
  return 'bg-stone-100 text-stone-700';
}

export function ConnectorHealth() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Sources status overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Connector health</h2>
          </div>
          <p className="text-sm text-stone-400">Freshness target: 1–6 hours</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {connectorHealth.map((item) => (
            <div key={item.name} className="rounded-[22px] border border-stone-200 bg-stone-50 p-5">
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>
                {item.status}
              </div>
              <h3 className="mt-4 text-lg font-medium text-stone-900">{item.name}</h3>
              <dl className="mt-4 space-y-2 text-sm text-stone-600">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-400">Last sync</dt>
                  <dd>{item.lastSync}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-400">Rows</dt>
                  <dd>{item.rows}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-400">Mode</dt>
                  <dd>{item.lag}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Available sources</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Connections</h2>
          </div>
          <button className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
            View all
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {sourceOverview.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4">
              <div>
                <div className="text-sm font-medium text-stone-900">{item.name}</div>
                <div className="text-sm text-stone-500">{item.detail}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>
                  {item.status}
                </span>
                <button className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 hover:bg-white">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
