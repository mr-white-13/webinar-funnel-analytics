import { connectorHealth } from '../lib/mock-data';

function statusClass(status: string) {
  if (status === 'Healthy') return 'bg-emerald-400/10 text-emerald-200 border-emerald-400/20';
  if (status === 'Delayed') return 'bg-rose-400/10 text-rose-200 border-rose-400/20';
  return 'bg-amber-400/10 text-amber-100 border-amber-400/20';
}

export function ConnectorHealth() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Data health</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Connector status</h2>
        </div>
        <p className="text-sm text-slate-400">Freshness target: 1–6 hours</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {connectorHealth.map((item) => (
          <div key={item.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClass(item.status)}`}>
              {item.status}
            </div>
            <h3 className="mt-4 text-lg font-medium text-white">{item.name}</h3>
            <dl className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Last sync</dt>
                <dd>{item.lastSync}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Rows</dt>
                <dd>{item.rows}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Mode</dt>
                <dd>{item.lag}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
