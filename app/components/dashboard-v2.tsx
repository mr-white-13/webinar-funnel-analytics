'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface FunnelStage {
  key: string;
  label: string;
  value: number;
  source: string;
  detail: string;
  conversionFromPrev: string | null;
}

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardV2Props {
  stages: FunnelStage[];
  kpis: Array<{ label: string; value: string; note: string; vsPrevious?: string }>;
  filters: {
    range: string;
    campaign: string;
    country: string;
    label: string;
    options: {
      range: FilterOption[];
      campaign: FilterOption[];
      country: FilterOption[];
    };
  };
}

const campaignMultipliers: Record<string, number> = {
  all: 1,
  meta: 0.58,
  google: 0.27,
  email: 0.15,
};

const countryMultipliers: Record<string, number> = {
  all: 1,
  ua: 0.62,
  pl: 0.21,
  de: 0.1,
  uk: 0.07,
};

const rangeMeta: Record<string, { factor: number; label: string }> = {
  '7d': { factor: 0.24, label: 'Last 7 days · 9 May - 15 May 2026' },
  '30d': { factor: 1, label: 'Last 30 days · 16 Apr - 15 May 2026' },
  '90d': { factor: 2.35, label: 'Last 90 days · 15 Feb - 15 May 2026' },
};

function adjust(value: number, range: string, campaign: string, country: string) {
  return Math.round(
    value *
      (rangeMeta[range]?.factor ?? 1) *
      (campaignMultipliers[campaign] ?? 1) *
      (countryMultipliers[country] ?? 1),
  );
}

function barWidth(current: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(10, Math.round((current / max) * 100))}%`;
}

function stageTone(index: number) {
  const tones = [
    { bg: '#096BB2', light: '#E8F2FB', text: '#0B4F86' },
    { bg: '#2E86C1', light: '#EDF5FB', text: '#1C5E88' },
    { bg: '#6C5CE7', light: '#F1EEFE', text: '#4C3EBB' },
    { bg: '#F39C12', light: '#FFF4E5', text: '#B56A00' },
    { bg: '#27AE60', light: '#EAF8F0', text: '#187A42' },
  ];
  return tones[index] ?? tones[tones.length - 1];
}

export function DashboardV2({ stages, kpis, filters }: DashboardV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = searchParams.get('range') ?? filters.range;
  const campaign = searchParams.get('campaign') ?? filters.campaign;
  const country = searchParams.get('country') ?? filters.country;

  const filteredStages = useMemo(() => {
    return stages.map((stage) => ({
      ...stage,
      value: adjust(stage.value, range, campaign, country),
    }));
  }, [stages, range, campaign, country]);

  const maxValue = Math.max(...filteredStages.map((stage) => stage.value), 1);

  const recomputedStages = useMemo(() => {
    return filteredStages.map((stage, index, arr) => {
      if (index === 0) return { ...stage, conversionFromPrev: null };
      const prev = arr[index - 1].value;
      const rate = prev ? `${Math.round((stage.value / prev) * 100)}%` : '—';
      return { ...stage, conversionFromPrev: rate };
    });
  }, [filteredStages]);

  const dynamicKpis = useMemo(() => {
    return kpis.map((kpi, index) => {
      if (index >= recomputedStages.length) return kpi;
      return {
        ...kpi,
        value: recomputedStages[index]?.value?.toLocaleString() ?? kpi.value,
      };
    });
  }, [kpis, recomputedStages]);

  const chartRows = recomputedStages.slice(1).map((stage) => ({
    label: stage.label,
    rate: stage.conversionFromPrev ?? '—',
  }));

  const dateLabel = rangeMeta[range]?.label ?? filters.label;

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-[28px] border border-[#D9E6FF] bg-white shadow-sm">
        <div className="bg-[#096BB2] px-6 py-6 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Webinar acquisition funnel</h1>
              <p className="mt-2 text-sm text-white/80">{dateLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={range} onChange={(e) => updateParam('range', e.target.value)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none">
                {filters.options.range.map((option) => (
                  <option key={option.value} value={option.value} className="text-stone-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <select value={campaign} onChange={(e) => updateParam('campaign', e.target.value)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none">
                {filters.options.campaign.map((option) => (
                  <option key={option.value} value={option.value} className="text-stone-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <select value={country} onChange={(e) => updateParam('country', e.target.value)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none">
                {filters.options.country.map((option) => (
                  <option key={option.value} value={option.value} className="text-stone-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[#D9E6FF] bg-[#F5F9FF] px-6 py-5 md:grid-cols-3 xl:grid-cols-6">
          {dynamicKpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[20px] border border-[#D9E6FF] bg-white px-4 py-4 shadow-sm">
              <div className="text-xs text-[#6C88B5]">{kpi.label}</div>
              <div className="mt-1 text-2xl font-semibold text-[#153A73]">{kpi.value}</div>
              <div className="mt-1 text-xs text-[#6C88B5]">{kpi.note}</div>
              <div className="mt-3 text-xs font-medium text-[#0B4F86]">{kpi.vsPrevious ?? 'vs previous period'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Funnel performance</h2>
        <div className="mt-5 flex flex-col gap-3">
          {recomputedStages.map((stage, index) => {
            const tone = stageTone(index);
            return (
              <div key={stage.key} className="grid grid-cols-[180px_1fr_100px_100px] items-center gap-3 rounded-[18px] border border-[#D9E6FF] bg-white px-4 py-4">
                <div>
                  <div className="text-sm font-semibold" style={{ color: tone.text }}>{stage.label}</div>
                  <div className="mt-1 text-xs text-[#6C88B5]">{stage.source}</div>
                </div>
                <div className="relative h-8 overflow-hidden rounded-md" style={{ backgroundColor: tone.light }}>
                  <div className="h-full rounded-md" style={{ width: barWidth(stage.value, maxValue), backgroundColor: tone.bg }} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">{stage.detail}</span>
                </div>
                <div className="text-right text-lg font-semibold text-[#153A73]">{stage.value.toLocaleString()}</div>
                <div className="text-right text-xs text-[#6C88B5]">{stage.conversionFromPrev ?? '—'}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Conversion rate by stage</h2>
            <div className="text-xs text-[#6C88B5]">{dateLabel}</div>
          </div>
          <div className="mt-5 space-y-4">
            {chartRows.map((row, index) => {
              const tone = stageTone(index + 1);
              return (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-[#153A73]">
                    <span>{row.label}</span>
                    <span className="font-medium">{row.rate}</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ backgroundColor: tone.light }}>
                    <div className="h-3 rounded-full" style={{ width: row.rate === '—' ? '0%' : row.rate, backgroundColor: tone.bg }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Cost per stage</h2>
            <div className="text-xs text-[#6C88B5]">Meta + Google Ads</div>
          </div>
          <div className="mt-5 space-y-4">
            {recomputedStages.slice(1).map((stage, index) => {
              const tone = stageTone(index + 1);
              return (
                <div key={stage.key} className="flex items-center justify-between rounded-[18px] border border-[#D9E6FF] px-4 py-3" style={{ backgroundColor: tone.light }}>
                  <div className="text-sm font-medium text-[#153A73]">{stage.label}</div>
                  <div className="text-sm font-semibold" style={{ color: tone.text }}>Derived next</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[#D9E6FF] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-[#153A73]">Campaign breakdown</h2>
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
              <tr><td className="px-4 py-3 font-medium">Meta Ads</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td></tr>
              <tr><td className="px-4 py-3 font-medium">Google Ads</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td></tr>
              <tr><td className="px-4 py-3 font-medium">Email</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
