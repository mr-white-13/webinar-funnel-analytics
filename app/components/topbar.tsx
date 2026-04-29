export function Topbar() {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Internal v1</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Webinar funnel analytics</h1>
        <p className="mt-2 text-sm text-stone-500">
          Funnel health, attribution sanity, and connector trust for webinar growth.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">Plan: Internal Ops</div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Freshness: within SLA</div>
        <button className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
          View details
        </button>
      </div>
    </div>
  );
}
