import { navItems } from '../lib/mock-data';

export function Header() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Internal v1</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Webinar Funnel Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">
            Funnel health, attribution sanity, and connector trust for webinar growth.
          </p>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 lg:block">
          Scope: Meta + Google + GA4 + Riverside + GetResponse + Thinkific + Odoo
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-5">
        {navItems.map((item, index) => (
          <span
            key={item}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
              index === 0
                ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
                : 'border-white/10 bg-white/5 text-slate-300'
            }`}
          >
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
}
