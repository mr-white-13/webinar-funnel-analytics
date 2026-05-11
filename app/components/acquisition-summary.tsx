export function AcquisitionSummary({
  biggestLeak,
}: {
  biggestLeak: { label: string; rate: number } | undefined;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-stone-500">Headline flow</div>
        <div className="mt-2 text-lg font-semibold text-stone-900">Paid / email source → registration → attendance → LMS</div>
        <div className="mt-2 text-sm text-stone-500">This is the operational funnel you asked for, with counts at each stage.</div>
      </div>
      <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-stone-500">Biggest leak</div>
        <div className="mt-2 text-lg font-semibold text-stone-900">
          {biggestLeak ? `${biggestLeak.label} (${biggestLeak.rate}%)` : 'Not enough data yet'}
        </div>
        <div className="mt-2 text-sm text-stone-500">Lowest conversion stage right now.</div>
      </div>
      <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-stone-500">Next refinement</div>
        <div className="mt-2 text-lg font-semibold text-stone-900">Stage attribution + leak diagnostics</div>
        <div className="mt-2 text-sm text-stone-500">Next pass can break each stage down by channel and campaign.</div>
      </div>
    </section>
  );
}
