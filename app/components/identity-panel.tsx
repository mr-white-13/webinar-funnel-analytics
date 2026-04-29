import { identityNotes, implementationChecklist } from '../lib/mock-data';

export function IdentityPanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Identity stitching</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Resolution rules for v1</h2>
        <ul className="mt-5 space-y-3 text-sm text-slate-300">
          {identityNotes.map((note) => (
            <li key={note} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Implementation status</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Current build slice</h2>
        <div className="mt-5 space-y-3">
          {implementationChecklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
              <span className="text-slate-200">{item.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.status === 'Done'
                    ? 'bg-emerald-400/10 text-emerald-200'
                    : 'bg-cyan-400/10 text-cyan-200'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Next real implementation pass should wire manual import + connector sync logs to this shell.
        </p>
      </div>
    </section>
  );
}
