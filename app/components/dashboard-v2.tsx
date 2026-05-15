import Image from 'next/image';

interface FunnelStage {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

interface DashboardV2Props {
  stages: FunnelStage[];
  kpis: Array<{ label: string; value: string; note: string }>;
}

function barWidth(current: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(10, Math.round((current / max) * 100))}%`;
}

export function DashboardV2({ stages, kpis }: DashboardV2Props) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  const chartRows = stages.slice(1).map((stage) => ({
    label: stage.label,
    rate: stage.conversionFromPrev ?? '—',
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-[28px] border border-[#D9E6FF] bg-white shadow-sm">
        <div className="bg-[#096BB2] px-6 py-6 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-[18px] bg-white/12 p-3 backdrop-blur-sm">
                <Image src="/branding/unowa-logo.svg" alt="UNOWA" width={44} height={44} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">UNOWA analytics</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Webinar acquisition funnel dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                  Funnel visibility from paid source to registration, attendance, and LMS conversion.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">Last 30 days</div>
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">All traffic sources</div>
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">All campaigns</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[#D9E6FF] bg-[#F5F9FF] px-6 py-5 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[20px] border border-[#D9E6FF] bg-white px-4 py-4 shadow-sm">
              <div className="text-xs text-[#6C88B5]">{kpi.label}</div>
              <div className="mt-1 text-2xl font-semibold text-[#153A73]">{kpi.value}</div>
              <div className="mt-1 text-xs text-[#6C88B5]">{kpi.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Funnel performance</h2>
              <p className="mt-1 text-sm text-[#6C88B5]">Numeric flow through the full webinar journey.</p>
            </div>
            <div className="rounded-full bg-[#F5F9FF] px-4 py-2 text-sm text-[#096BB2]">Live connector-backed numbers</div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                className="grid grid-cols-[180px_1fr_100px_100px] items-center gap-3 rounded-[18px] border border-[#D9E6FF] bg-white px-4 py-4"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6C88B5]">Stage {index + 1}</div>
                  <div className="mt-1 text-sm font-semibold text-[#153A73]">{stage.label}</div>
                  <div className="mt-1 text-xs text-[#6C88B5]">{stage.source}</div>
                </div>
                <div className="relative h-8 overflow-hidden rounded-md bg-[#EAF2FF]">
                  <div className="h-full rounded-md bg-[#096BB2]" style={{ width: barWidth(stage.value, maxValue) }} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                    {stage.detail}
                  </span>
                </div>
                <div className="text-right text-lg font-semibold text-[#153A73]">{stage.value.toLocaleString()}</div>
                <div className="text-right text-xs text-[#6C88B5]">{stage.conversionFromPrev ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#D9E6FF] bg-[#F5F9FF] p-6 shadow-sm">
          <div className="overflow-hidden rounded-[22px] border border-[#D9E6FF] bg-white p-4">
            <div className="mb-3 text-sm font-medium text-[#153A73]">Brand illustration</div>
            <Image
              src="/branding/illustrations/mikko-1.png"
              alt="UNOWA illustration"
              width={520}
              height={520}
              className="h-auto w-full rounded-[18px]"
            />
          </div>
          <div className="mt-4 rounded-[22px] border border-[#D9E6FF] bg-white p-4">
            <div className="flex items-center gap-3">
              <Image src="/branding/icons/icon-1.png" alt="UNOWA icon" width={28} height={28} className="h-7 w-7" />
              <div>
                <div className="text-sm font-semibold text-[#153A73]">UNOWA operating view</div>
                <div className="text-xs text-[#6C88B5]">Connect traffic, registrations, attendance, and enrollments.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Conversion rate by stage</h2>
              <p className="mt-1 text-sm text-[#6C88B5]">How much traffic progresses to the next step.</p>
            </div>
            <div className="text-xs text-[#6C88B5]">Last 30 days</div>
          </div>
          <div className="mt-5 space-y-4">
            {chartRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-[#153A73]">
                  <span>{row.label}</span>
                  <span className="font-medium">{row.rate}</span>
                </div>
                <div className="h-3 rounded-full bg-[#EAF2FF]">
                  <div className="h-3 rounded-full bg-[#096BB2]" style={{ width: row.rate === '—' ? '0%' : row.rate }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Cost per stage</h2>
              <p className="mt-1 text-sm text-[#6C88B5]">Placeholder cost view until more revenue-side data is connected.</p>
            </div>
            <div className="text-xs text-[#6C88B5]">Meta + Google Ads</div>
          </div>
          <div className="mt-5 space-y-4">
            {stages.slice(1).map((stage, index) => (
              <div key={stage.key} className="flex items-center justify-between rounded-[18px] border border-[#D9E6FF] bg-[#F5F9FF] px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-[#153A73]">{stage.label}</div>
                  <div className="text-xs text-[#6C88B5]">Stage {index + 2}</div>
                </div>
                <div className="text-sm font-semibold text-[#153A73]">Derived next</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Campaign breakdown</h2>
            <p className="mt-1 text-sm text-[#6C88B5]">Source-level contribution into the webinar funnel.</p>
          </div>
          <div className="text-xs text-[#6C88B5]">Preview table</div>
        </div>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#D9E6FF]">
          <table className="min-w-full divide-y divide-[#D9E6FF] text-sm">
            <thead className="bg-[#F5F9FF] text-left text-[#6C88B5]">
              <tr>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Registrations</th>
                <th className="px-4 py-3 font-medium">Attendance</th>
                <th className="px-4 py-3 font-medium">Enrollments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E6FF] bg-white text-[#153A73]">
              <tr>
                <td className="px-4 py-3 font-medium">Meta Ads</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Google Ads</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Email</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
