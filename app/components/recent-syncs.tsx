import { recentSyncRuns } from '../lib/mock-data';

function badgeClass(status: string) {
  if (status === 'success') return 'bg-emerald-400/10 text-emerald-200';
  if (status === 'retrying') return 'bg-amber-400/10 text-amber-100';
  return 'bg-slate-700 text-slate-200';
}

export function RecentSyncs() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Sync activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent connector runs</h2>
        </div>
        <p className="text-sm text-slate-400">Mocked from connector_sync_runs shape</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-950/70 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Connector</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium text-right">Rows</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
            {recentSyncRuns.map((run) => (
              <tr key={`${run.connector}-${run.startedAt}`}>
                <td className="px-4 py-3 font-medium">{run.connector}</td>
                <td className="px-4 py-3 text-slate-400">{run.source}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${badgeClass(run.status)}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{run.startedAt}</td>
                <td className="px-4 py-3 text-right">{run.rows.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
