import { acquisitionStages } from '../lib/mock-data';

function toneClasses(tone: string) {
  switch (tone) {
    case 'blue':
      return 'border-blue-200 bg-blue-50';
    case 'indigo':
      return 'border-indigo-200 bg-indigo-50';
    case 'amber':
      return 'border-amber-200 bg-amber-50';
    case 'orange':
      return 'border-orange-200 bg-orange-50';
    case 'rose':
      return 'border-rose-200 bg-rose-50';
    case 'emerald':
      return 'border-emerald-200 bg-emerald-50';
    default:
      return 'border-stone-200 bg-stone-50';
  }
}

export function AcquisitionStageBoard() {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">Acquisition funnel map</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Stage-by-stage webinar flow</h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-500">
            A simple operating view of how paid traffic moves into registrations, nurture, attendance, enrollments, and post-webinar conversion.
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">Use this as the working funnel map</div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[1400px] items-start gap-3">
          {acquisitionStages.map((stage, index) => (
            <div key={stage.step} className="flex items-center gap-3">
              <div className={`w-[220px] rounded-[24px] border p-4 shadow-sm ${toneClasses(stage.tone)}`}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{stage.step}. {stage.title}</div>
                <div className="mt-2 text-base font-semibold text-stone-900">{stage.subtitle}</div>
                <div className="mt-2 text-sm text-stone-600">{stage.note}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {stage.systems.map((system) => (
                    <span key={system} className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-stone-700 ring-1 ring-black/5">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              {index < acquisitionStages.length - 1 ? <div className="text-stone-300">→</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
