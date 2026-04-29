export const overviewCards = [
  { label: 'Spend', value: '$18,420', change: '+9.4%', tone: 'neutral' },
  { label: 'Landing visits', value: '6,842', change: '+12.1%', tone: 'positive' },
  { label: 'Registrations', value: '1,734', change: '+8.7%', tone: 'positive' },
  { label: 'Live attendees', value: '801', change: '+5.3%', tone: 'positive' },
  { label: 'Purchases', value: '72', change: '+14.2%', tone: 'positive' },
  { label: 'CPA', value: '$255.83', change: '-4.8%', tone: 'positive' },
] as const;

export const funnelSteps = [
  { label: 'Visits', value: 6842 },
  { label: 'Registrations', value: 1734 },
  { label: 'Live', value: 801 },
  { label: 'Replay', value: 492 },
  { label: 'Purchases', value: 72 },
] as const;

export const connectorHealth = [
  { name: 'Meta Ads', status: 'Healthy', lastSync: '36m ago', rows: '1,248 rows', lag: 'Hourly' },
  { name: 'Google Ads', status: 'Healthy', lastSync: '42m ago', rows: '684 rows', lag: 'Hourly' },
  { name: 'Webflow / Riverside form', status: 'Watch', lastSync: '2h ago', rows: '211 rows', lag: 'Manual + API' },
  { name: 'GA4', status: 'Healthy', lastSync: '58m ago', rows: '9,411 events', lag: 'Hourly' },
  { name: 'Riverside webinar', status: 'Healthy', lastSync: '51m ago', rows: '377 attendance rows', lag: 'Hourly' },
  { name: 'GetResponse', status: 'Delayed', lastSync: '6h ago', rows: '1,188 events', lag: 'Retry needed' },
  { name: 'Thinkific', status: 'Healthy', lastSync: '1h ago', rows: '63 conversions', lag: 'Hourly' },
  { name: 'Odoo', status: 'Watch', lastSync: '3h ago', rows: '94 CRM rows', lag: 'Backfill pending' },
] as const;

export const recentSyncRuns = [
  { connector: 'meta-ads', source: 'meta_ads', status: 'success', startedAt: '10:12 UTC', rows: 412 },
  { connector: 'ga4-daily', source: 'ga4', status: 'success', startedAt: '10:05 UTC', rows: 2388 },
  { connector: 'getresponse-events', source: 'getresponse', status: 'retrying', startedAt: '09:56 UTC', rows: 0 },
  { connector: 'riverside-attendance', source: 'riverside', status: 'success', startedAt: '09:48 UTC', rows: 137 },
  { connector: 'thinkific-purchases', source: 'thinkific', status: 'success', startedAt: '09:31 UTC', rows: 14 },
] as const;

export const navItems = [
  'Overview',
  'Acquisition',
  'Webinars',
  'Email Nurture',
  'Revenue',
  'Lead Debug',
  'Data Health',
] as const;

export const identityNotes = [
  'Email is the primary person key.',
  'Registration is the main join anchor across GA4, Webflow, Riverside, and downstream tools.',
  'External identities are preserved for ga_client_id, ad click IDs, GetResponse, Thinkific, and Odoo.',
  'Ambiguous matches should land in manual review instead of silently auto-linking.',
] as const;

export const implementationChecklist = [
  { label: 'Identity mapping table', status: 'Done' },
  { label: 'Manual review queue', status: 'Done' },
  { label: 'Dashboard shell', status: 'Done' },
  { label: 'Real connectors', status: 'Next' },
  { label: 'Attribution snapshots job', status: 'Next' },
] as const;
