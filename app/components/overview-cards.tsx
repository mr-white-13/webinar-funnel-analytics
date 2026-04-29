import { overviewCards } from '../lib/mock-data';

export function OverviewCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {overviewCards.map((card) => {
        const toneClass = card.tone === 'positive' ? 'text-emerald-300' : 'text-slate-300';

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <div className="text-sm text-slate-400">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{card.value}</div>
            <div className={`mt-2 text-sm ${toneClass}`}>{card.change} vs previous webinar</div>
          </div>
        );
      })}
    </section>
  );
}
