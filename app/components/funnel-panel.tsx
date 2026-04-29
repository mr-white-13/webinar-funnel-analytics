import { funnelSteps } from '../lib/mock-data';

function percent(value: number, baseline: number) {
  return Math.max(8, Math.round((value / baseline) * 100));
}

export function FunnelPanel() {
  const baseline = funnelSteps[0].value;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Executive overview</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Core webinar funnel</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Static v1 shell for the daily funnel read: acquisition, registration, attendance, replay, and purchase.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Biggest leak: registration → live attendance
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          {funnelSteps.map((step) => (
            <div key={step.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>{step.label}</span>
                <span>{step.value.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${percent(step.value, baseline)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h3 className="text-lg font-medium text-white">v1 interpretation</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Paid traffic volume is healthy, but show-up rate is the first major bottleneck.</li>
            <li>• Replay usage is meaningful enough to keep in core funnel reporting.</li>
            <li>• Purchase volume is low enough that attribution has to stay explainable, not fancy.</li>
            <li>• Registration fields should anchor source and identity whenever possible.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
