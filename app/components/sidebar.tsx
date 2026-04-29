import { navItems } from '../lib/mock-data';

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-stone-50 xl:flex xl:flex-col">
      <div className="px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white">
            W
          </div>
          <div>
            <div className="text-lg font-semibold text-stone-900">Webinar Ops</div>
            <div className="text-sm text-stone-500">Internal analytics</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                index === 0
                  ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-stone-900">Complete onboarding</div>
          <div className="mt-1 text-sm text-stone-500">Essential setup</div>
          <div className="mt-4 h-2 rounded-full bg-stone-100">
            <div className="h-2 w-1/3 rounded-full bg-stone-400" />
          </div>
          <div className="mt-2 text-right text-xs text-stone-500">2 / 6</div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-3xl bg-stone-900 px-4 py-4 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-700 text-lg font-semibold">
            A
          </div>
          <div>
            <div className="text-sm font-medium">Andrew White</div>
            <div className="text-xs text-stone-300">Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
