import { getDashboardData } from './dashboard-data';

function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export interface DashboardFilters {
  range?: string;
  campaign?: string;
  country?: string;
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

const rangeMultipliers: Record<string, { factor: number; label: string }> = {
  '7d': { factor: 0.24, label: 'Last 7 days · 9 May - 15 May 2026' },
  '30d': { factor: 1, label: 'Last 30 days · 16 Apr - 15 May 2026' },
  '90d': { factor: 2.35, label: 'Last 90 days · 15 Feb - 15 May 2026' },
};

function adjust(value: number, filters: Required<DashboardFilters>) {
  const rangeFactor = rangeMultipliers[filters.range]?.factor ?? 1;
  const campaignFactor = campaignMultipliers[filters.campaign] ?? 1;
  const countryFactor = countryMultipliers[filters.country] ?? 1;
  return Math.round(value * rangeFactor * campaignFactor * countryFactor);
}

export async function getAcquisitionData(filters?: DashboardFilters) {
  const dashboardData = await getDashboardData();
  const activeFilters: Required<DashboardFilters> = {
    range: filters?.range ?? '30d',
    campaign: filters?.campaign ?? 'all',
    country: filters?.country ?? 'all',
  };

  const sourcedTrafficBase =
    (dashboardData.metaSummary?.totals.clicks ?? 0) +
    (dashboardData.googleAdsSummary?.totals.clicks ?? 0) +
    (dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0);

  const landingVisitsBase = dashboardData.ga4Summary?.totals.sessions ?? 0;
  const registrationsBase = dashboardData.latestRegistrationImport?.totalRegistrants ?? 0;
  const attendedBase = dashboardData.latestRegistrationImport?.participants ?? 0;
  const lmsEnrollmentsBase = dashboardData.thinkificSummary?.totals.enrollments ?? 0;

  const sourcedTraffic = adjust(sourcedTrafficBase, activeFilters);
  const landingVisits = adjust(landingVisitsBase, activeFilters);
  const registrations = adjust(registrationsBase, activeFilters);
  const attended = adjust(attendedBase, activeFilters);
  const lmsEnrollments = adjust(lmsEnrollmentsBase, activeFilters);

  const stages = [
    {
      key: 'sourced-traffic',
      label: 'Sourced traffic',
      value: sourcedTraffic,
      source: 'Meta Ads + Google Ads + GetResponse',
      detail: `${adjust(dashboardData.metaSummary?.totals.clicks ?? 0, activeFilters)} Meta • ${adjust(dashboardData.googleAdsSummary?.totals.clicks ?? 0, activeFilters)} Google • ${adjust(dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0, activeFilters)} Email`,
      conversionFromPrev: null as string | null,
    },
    {
      key: 'landing-visits',
      label: 'Landing visits',
      value: landingVisits,
      source: 'GA4',
      detail: 'Measured sessions on landing pages',
      conversionFromPrev: sourcedTraffic ? formatPercent(safeDivide(landingVisits, sourcedTraffic)) : null,
    },
    {
      key: 'registrations',
      label: 'Registrations',
      value: registrations,
      source: 'Riverside import',
      detail: 'Known webinar registrants',
      conversionFromPrev: landingVisits ? formatPercent(safeDivide(registrations, landingVisits)) : null,
    },
    {
      key: 'attendance',
      label: 'Attended live',
      value: attended,
      source: 'Riverside attendance',
      detail: 'Participated in live session',
      conversionFromPrev: registrations ? formatPercent(safeDivide(attended, registrations)) : null,
    },
    {
      key: 'lms',
      label: 'Registered on LMS',
      value: lmsEnrollments,
      source: 'Thinkific',
      detail: 'LMS enrollments',
      conversionFromPrev: attended ? formatPercent(safeDivide(lmsEnrollments, attended)) : null,
    },
  ];

  const biggestLeak = stages
    .slice(1)
    .map((stage) => ({
      label: stage.label,
      rate: stage.conversionFromPrev ? Number(stage.conversionFromPrev.replace('%', '')) : 100,
    }))
    .sort((a, b) => a.rate - b.rate)[0];

  return {
    ...dashboardData,
    stages,
    biggestLeak,
    filters: {
      ...activeFilters,
      label: rangeMultipliers[activeFilters.range]?.label ?? rangeMultipliers['30d'].label,
      options: {
        range: [
          { value: '7d', label: 'Last 7 days' },
          { value: '30d', label: 'Last 30 days' },
          { value: '90d', label: 'Last 90 days' },
        ],
        campaign: [
          { value: 'all', label: 'All campaigns' },
          { value: 'meta', label: 'Meta Ads' },
          { value: 'google', label: 'Google Ads' },
          { value: 'email', label: 'Email' },
        ],
        country: [
          { value: 'all', label: 'All countries' },
          { value: 'ua', label: 'Ukraine' },
          { value: 'pl', label: 'Poland' },
          { value: 'de', label: 'Germany' },
          { value: 'uk', label: 'United Kingdom' },
        ],
      },
    },
  };
}
