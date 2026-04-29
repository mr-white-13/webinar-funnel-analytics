import { identityNotes, implementationChecklist } from '../lib/mock-data';

export function IdentityPanel() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">Identity stitching</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Resolution rules for v1</h2>
        <ul className="mt-5 space-y-3 text-sm text-stone-600">
          {identityNotes.map((note) => (
            <li key={note} className="rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4 leading-6">
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-500">Implementation status</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Current build slice</h2>
        <div className="mt-5 space-y-3">
          {implementationChecklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm">
              <span className="text-stone-800">{item.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.status === 'Done' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-stone-500">
          Next pass should wire manual import, sync health, and lead-level investigation flows into this shell.
        </p>
      </div>
    </section>
  );
}
