import { overviewCards } from '../lib/mock-data';

export function OverviewCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {overviewCards.map((card) => {
        const toneClass = card.tone === 'positive' ? 'text-emerald-700' : 'text-stone-500';

        return (
          <div key={card.label} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-stone-500">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{card.value}</div>
            <div className={`mt-2 text-sm ${toneClass}`}>{card.change} vs previous webinar</div>
          </div>
        );
      })}
    </section>
  );
}
