interface FunnelStage {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

function barWidth(current: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(12, Math.round((current / max) * 100))}%`;
}

export function MainFunnelDashboard({
  stages,
  kpis,
}: {
  stages: FunnelStage[];
  kpis: Array<{ label: string; value: string; note: string }>;
}) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Webinar acquisition funnel</h2>
          <p className="mt-2 text-sm text-stone-500">Last 30 days · funnel-first operating dashboard</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600">Last 30 days</div>
          <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600">All campaigns</div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[20px] bg-stone-50 px-4 py-4">
            <div className="text-xs text-stone-500">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold text-stone-900">{kpi.value}</div>
            <div className="mt-1 text-xs text-stone-500">{kpi.note}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-lg font-semibold text-stone-900">Funnel performance by stage</h3>
      <div className="mt-4 flex flex-col gap-3">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className="grid grid-cols-[220px_1fr_90px_110px] items-center gap-3 rounded-[18px] border border-stone-200 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-200 text-[11px] font-semibold text-stone-700">
                {index + 1}
              </span>
              <div>
                <div className="text-sm font-medium text-stone-900">{stage.label}</div>
                <div className="text-xs text-stone-500">{stage.source}</div>
              </div>
            </div>
            <div className="relative h-7 overflow-hidden rounded-md bg-stone-100">
              <div className="h-full rounded-md bg-stone-700" style={{ width: barWidth(stage.value, maxValue) }} />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                {stage.value.toLocaleString()} · {stage.detail}
              </span>
            </div>
            <div className="text-right text-sm font-semibold text-stone-900">{stage.value.toLocaleString()}</div>
            <div className="text-right text-xs text-stone-500">{stage.conversionFromPrev ?? '—'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
