import { funnelSteps, productUpdates } from '../lib/mock-data';

function percent(value: number, baseline: number) {
  return Math.max(10, Math.round((value / baseline) * 100));
}

export function FunnelPanel() {
  const baseline = funnelSteps[0].value;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">Executive overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Core webinar funnel</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              A clean internal read of the webinar journey: traffic, registration, attendance, replay, and purchase.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Biggest leak: registration → live attendance
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200">
          {funnelSteps.map((step) => (
            <div key={step.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-stone-700">
                <span>{step.label}</span>
                <span className="font-medium">{step.value.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-stone-700" style={{ width: `${percent(step.value, baseline)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {productUpdates.map((item) => (
            <div key={item.title} className="rounded-[22px] border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-base font-medium text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">Interpretation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Current read</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
          <li>• Paid traffic volume is healthy, but show-up rate is still the first major bottleneck.</li>
          <li>• Replay consumption is significant enough to stay in the primary conversion story.</li>
          <li>• Purchase volume is still low enough that attribution must remain explainable.</li>
          <li>• Registration fields should anchor source and identity whenever possible.</li>
        </ul>

        <div className="mt-8 rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200">
          <div className="text-sm font-medium text-stone-900">Suggested next UI modules</div>
          <div className="mt-3 space-y-2 text-sm text-stone-500">
            <div>Lead-level timeline</div>
            <div>Campaign comparison table</div>
            <div>Sync failure drilldown</div>
            <div>Manual identity review queue</div>
          </div>
        </div>
      </div>
    </section>
  );
}
