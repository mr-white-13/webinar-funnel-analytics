import { getDashboardData } from './dashboard-data';

function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export async function getAcquisitionData() {
  const dashboardData = await getDashboardData();

  const sourcedTraffic =
    (dashboardData.metaSummary?.totals.clicks ?? 0) +
    (dashboardData.googleAdsSummary?.totals.clicks ?? 0) +
    (dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0);

  const landingVisits = dashboardData.ga4Summary?.totals.sessions ?? 0;
  const registrations = dashboardData.latestRegistrationImport?.totalRegistrants ?? 0;
  const attended = dashboardData.latestRegistrationImport?.participants ?? 0;
  const lmsEnrollments = dashboardData.thinkificSummary?.totals.enrollments ?? 0;

  const stages = [
    {
      key: 'sourced-traffic',
      label: 'Sourced traffic',
      value: sourcedTraffic,
      source: 'Meta Ads + Google Ads + GetResponse',
      detail: `${dashboardData.metaSummary?.totals.clicks ?? 0} Meta clicks • ${dashboardData.googleAdsSummary?.totals.clicks ?? 0} Google clicks • ${dashboardData.getResponseSummary?.totals.contactsInPrimaryCampaign ?? 0} email list contacts`,
      conversionFromPrev: null as string | null,
    },
    {
      key: 'landing-visits',
      label: 'Landing visits',
      value: landingVisits,
      source: 'GA4',
      detail: 'Measured sessions on webinar landing pages',
      conversionFromPrev: sourcedTraffic ? formatPercent(safeDivide(landingVisits, sourcedTraffic)) : null,
    },
    {
      key: 'registrations',
      label: 'Registrations',
      value: registrations,
      source: 'Riverside manual import',
      detail: 'Approved/known webinar registrants',
      conversionFromPrev: landingVisits ? formatPercent(safeDivide(registrations, landingVisits)) : null,
    },
    {
      key: 'attendance',
      label: 'Attended live',
      value: attended,
      source: 'Riverside attendance signal',
      detail: 'Registrants marked as participated',
      conversionFromPrev: registrations ? formatPercent(safeDivide(attended, registrations)) : null,
    },
    {
      key: 'lms',
      label: 'Registered on LMS',
      value: lmsEnrollments,
      source: 'Thinkific',
      detail: 'Enrollments / conversion action in LMS',
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
    headline: stages.map((stage) => `${stage.value} ${stage.label.toLowerCase()}`),
    biggestLeak,
  };
}
