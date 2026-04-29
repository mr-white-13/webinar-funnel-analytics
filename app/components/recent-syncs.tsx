import { recentSyncRuns } from '../lib/mock-data';

function badgeClass(status: string) {
  if (status === 'success') return 'bg-emerald-50 text-emerald-700';
  if (status === 'retrying') return 'bg-amber-50 text-amber-700';
  return 'bg-stone-200 text-stone-700';
}

export function RecentSyncs() {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">Sync activity</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Recent connector runs</h2>
        </div>
        <button className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
          View all syncs
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Connector</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium text-right">Rows</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white text-stone-700">
            {recentSyncRuns.map((run) => (
              <tr key={`${run.connector}-${run.startedAt}`}>
                <td className="px-4 py-3 font-medium text-stone-900">{run.connector}</td>
                <td className="px-4 py-3 text-stone-500">{run.source}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(run.status)}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">{run.startedAt}</td>
                <td className="px-4 py-3 text-right">{run.rows.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
