export function FunnelStageMetrics() {
  const stages = [
    { label: '1. Paid clicks', value: '1,932', note: 'Meta + Google Ads' },
    { label: '2. Landing visits', value: '6,842', note: 'GA4 sessions' },
    { label: '3. Registrations', value: '1,734', note: 'Manual Riverside import' },
    { label: '4. Email nurture', value: '1,188', note: 'GetResponse list contacts' },
    { label: '5. Live attendees', value: '801', note: 'Webinar attendance signal' },
    { label: '6. Enrollments', value: '63', note: 'Thinkific enrollments' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stages.map((stage) => (
        <div key={stage.label} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-stone-500">{stage.label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{stage.value}</div>
          <div className="mt-2 text-sm text-stone-500">{stage.note}</div>
        </div>
      ))}
    </section>
  );
}
