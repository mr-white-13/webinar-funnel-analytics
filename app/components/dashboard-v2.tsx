interface FunnelStage {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

interface DashboardV2Props {
  stages: FunnelStage[];
  kpis: Array<{ label: string; value: string; note: string }>;
}

function barWidth(current: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(10, Math.round((current / max) * 100))}%`;
}

export function DashboardV2({ stages, kpis }: DashboardV2Props) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  const chartRows = stages.slice(1).map((stage) => ({
    label: stage.label,
    rate: stage.conversionFromPrev ?? '—',
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Webinar acquisition funnel dashboard</h1>
            <p className="mt-2 text-sm text-stone-500">Track traffic, registrations, attendance, and LMS action across the webinar flow.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600">Last 30 days</div>
            <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600">All traffic sources</div>
            <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600">All campaigns</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-4">
              <div className="text-xs text-stone-500">{kpi.label}</div>
              <div className="mt-1 text-2xl font-semibold text-stone-900">{kpi.value}</div>
              <div className="mt-1 text-xs text-stone-500">{kpi.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Funnel performance</h2>
            <p className="mt-1 text-sm text-stone-500">Numeric flow through the full webinar journey.</p>
          </div>
          <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">Live connector-backed numbers</div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {stages.map((stage, index) => (
            <div
              key={stage.key}
              className="grid grid-cols-[180px_1fr_100px_100px] items-center gap-3 rounded-[18px] border border-stone-200 bg-white px-4 py-4"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-stone-400">Stage {index + 1}</div>
                <div className="mt-1 text-sm font-semibold text-stone-900">{stage.label}</div>
                <div className="mt-1 text-xs text-stone-500">{stage.source}</div>
              </div>
              <div className="relative h-8 overflow-hidden rounded-md bg-stone-100">
                <div className="h-full rounded-md bg-stone-800" style={{ width: barWidth(stage.value, maxValue) }} />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                  {stage.detail}
                </span>
              </div>
              <div className="text-right text-lg font-semibold text-stone-900">{stage.value.toLocaleString()}</div>
              <div className="text-right text-xs text-stone-500">{stage.conversionFromPrev ?? '—'}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">Conversion rate by stage</h2>
              <p className="mt-1 text-sm text-stone-500">How much traffic progresses to the next step.</p>
            </div>
            <div className="text-xs text-stone-400">Last 30 days</div>
          </div>
          <div className="mt-5 space-y-4">
            {chartRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-stone-700">
                  <span>{row.label}</span>
                  <span className="font-medium">{row.rate}</span>
                </div>
                <div className="h-3 rounded-full bg-stone-100">
                  <div className="h-3 rounded-full bg-stone-700" style={{ width: row.rate === '—' ? '0%' : row.rate }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">Cost per stage</h2>
              <p className="mt-1 text-sm text-stone-500">Placeholder cost view until more revenue-side data is connected.</p>
            </div>
            <div className="text-xs text-stone-400">Meta + Google Ads</div>
          </div>
          <div className="mt-5 space-y-4">
            {stages.slice(1).map((stage, index) => (
              <div key={stage.key} className="flex items-center justify-between rounded-[18px] border border-stone-200 bg-stone-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-stone-900">{stage.label}</div>
                  <div className="text-xs text-stone-500">Stage {index + 2}</div>
                </div>
                <div className="text-sm font-semibold text-stone-900">Derived next</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Campaign breakdown</h2>
            <p className="mt-1 text-sm text-stone-500">Source-level contribution into the webinar funnel.</p>
          </div>
          <div className="text-xs text-stone-400">Preview table</div>
        </div>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Registrations</th>
                <th className="px-4 py-3 font-medium">Attendance</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white text-stone-700">
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Meta Ads</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Google Ads</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-stone-900">Email</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
