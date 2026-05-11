interface AcquisitionStage {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

export function AcquisitionStageBoard({ stages }: { stages: AcquisitionStage[] }) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">Acquisition funnel map</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Stage-by-stage webinar flow</h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-500">
            A direct numeric flow from sourced traffic into registrations, live attendance, and LMS enrollments.
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">Live connector-backed funnel</div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[1200px] items-stretch gap-3">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="w-[220px] rounded-[24px] border border-stone-200 bg-stone-50 p-4 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Step {index + 1}</div>
                <div className="mt-2 text-base font-semibold text-stone-900">{stage.label}</div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{stage.value.toLocaleString()}</div>
                <div className="mt-2 text-sm font-medium text-stone-700">{stage.source}</div>
                <div className="mt-1 text-sm text-stone-500">{stage.detail}</div>
                {stage.conversionFromPrev ? (
                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
                    {stage.conversionFromPrev} from previous
                  </div>
                ) : null}
              </div>
              {index < stages.length - 1 ? <div className="text-stone-300">→</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
