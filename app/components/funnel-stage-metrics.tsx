interface FunnelStageMetric {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

export function FunnelStageMetrics({ stages }: { stages: FunnelStageMetric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stages.map((stage) => (
        <div key={stage.key} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-stone-500">{stage.label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{stage.value.toLocaleString()}</div>
          <div className="mt-2 text-sm font-medium text-stone-700">{stage.source}</div>
          <div className="mt-1 text-sm text-stone-500">{stage.detail}</div>
          {stage.conversionFromPrev ? (
            <div className="mt-3 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
              {stage.conversionFromPrev} from previous stage
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
