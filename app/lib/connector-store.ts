import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type ConnectorStatus = 'disconnected' | 'connected' | 'syncing' | 'error';
export type SyncStatus = 'success' | 'failed' | 'running';

export interface ConnectorState {
  source: string;
  status: ConnectorStatus;
  connectedAt: string | null;
  updatedAt: string;
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus | null;
  lastError: string | null;
  config: Record<string, string | number | boolean | null>;
  secrets: Record<string, string | null>;
}

export interface SyncRunRecord {
  id: string;
  source: string;
  startedAt: string;
  finishedAt: string | null;
  status: SyncStatus;
  rows: number;
  summary: string;
  error: string | null;
}

export interface Ga4SummaryRecord {
  propertyId: string;
  syncedAt: string;
  dateRange: { startDate: string; endDate: string };
  totals: {
    sessions: number;
    totalUsers: number;
    screenPageViews: number;
    conversions: number;
  };
  byChannel: Array<{
    channel: string;
    sessions: number;
    users: number;
  }>;
  byLandingPage: Array<{
    landingPage: string;
    sessions: number;
    users: number;
  }>;
  byDevice: Array<{
    deviceCategory: string;
    sessions: number;
  }>;
  byCountry: Array<{
    country: string;
    sessions: number;
  }>;
}

export interface MetaSummaryRecord {
  adAccountId: string;
  syncedAt: string;
  dateRange: { since: string; until: string };
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
  }>;
}

export interface GoogleAdsSummaryRecord {
  customerId: string;
  syncedAt: string;
  dateRange: { startDate: string; endDate: string };
  totals: {
    costMicros: number;
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    costMicros: number;
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface GetResponseSummaryRecord {
  syncedAt: string;
  accountEmail: string;
  primaryCampaignId: string | null;
  primaryCampaignName: string | null;
  campaigns: Array<{
    campaignId: string;
    name: string;
    contactsCount: number;
  }>;
  contactsSample: Array<{
    contactId: string;
    email: string;
    name: string | null;
    campaignId: string | null;
    campaignName: string | null;
  }>;
  totals: {
    campaigns: number;
    contactsInPrimaryCampaign: number;
  };
}

interface RuntimeStore {
  connectors: Record<string, ConnectorState>;
  syncRuns: SyncRunRecord[];
  ga4Summary: Ga4SummaryRecord | null;
  metaSummary: MetaSummaryRecord | null;
  googleAdsSummary: GoogleAdsSummaryRecord | null;
  getResponseSummary: GetResponseSummaryRecord | null;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'connectors-runtime.json');

const defaultStore = (): RuntimeStore => ({
  connectors: {},
  syncRuns: [],
  ga4Summary: null,
  metaSummary: null,
  googleAdsSummary: null,
  getResponseSummary: null,
});

async function ensureStoreFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STORE_PATH, 'utf8');
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(defaultStore(), null, 2), 'utf8');
  }
}

async function readStore(): Promise<RuntimeStore> {
  await ensureStoreFile();
  const raw = await readFile(STORE_PATH, 'utf8');
  try {
    return JSON.parse(raw) as RuntimeStore;
  } catch {
    return defaultStore();
  }
}

async function writeStore(store: RuntimeStore) {
  await ensureStoreFile();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function getConnectorState(source: string): Promise<ConnectorState | null> {
  const store = await readStore();
  return store.connectors[source] ?? null;
}

export async function upsertConnectorState(source: string, patch: Partial<ConnectorState>) {
  const store = await readStore();
  const existing = store.connectors[source];
  const next: ConnectorState = {
    source,
    status: patch.status ?? existing?.status ?? 'disconnected',
    connectedAt: patch.connectedAt ?? existing?.connectedAt ?? null,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
    lastSyncAt: patch.lastSyncAt ?? existing?.lastSyncAt ?? null,
    lastSyncStatus: patch.lastSyncStatus ?? existing?.lastSyncStatus ?? null,
    lastError: patch.lastError ?? existing?.lastError ?? null,
    config: { ...(existing?.config ?? {}), ...(patch.config ?? {}) },
    secrets: { ...(existing?.secrets ?? {}), ...(patch.secrets ?? {}) },
  };

  store.connectors[source] = next;
  await writeStore(store);
  return next;
}

export async function listConnectorStates() {
  const store = await readStore();
  return Object.values(store.connectors);
}

export async function addSyncRun(run: SyncRunRecord) {
  const store = await readStore();
  store.syncRuns.unshift(run);
  store.syncRuns = store.syncRuns.slice(0, 25);
  await writeStore(store);
}

export async function listSyncRuns(source?: string) {
  const store = await readStore();
  return source ? store.syncRuns.filter((run) => run.source === source) : store.syncRuns;
}

export async function saveGa4Summary(summary: Ga4SummaryRecord) {
  const store = await readStore();
  store.ga4Summary = summary;
  await writeStore(store);
}

export async function getGa4Summary() {
  const store = await readStore();
  return store.ga4Summary;
}

export async function saveMetaSummary(summary: MetaSummaryRecord) {
  const store = await readStore();
  store.metaSummary = summary;
  await writeStore(store);
}

export async function getMetaSummary() {
  const store = await readStore();
  return store.metaSummary;
}

export async function saveGoogleAdsSummary(summary: GoogleAdsSummaryRecord) {
  const store = await readStore();
  store.googleAdsSummary = summary;
  await writeStore(store);
}

export async function getGoogleAdsSummary() {
  const store = await readStore();
  return store.googleAdsSummary;
}

export async function saveGetResponseSummary(summary: GetResponseSummaryRecord) {
  const store = await readStore();
  store.getResponseSummary = summary;
  await writeStore(store);
}

export async function getGetResponseSummary() {
  const store = await readStore();
  return store.getResponseSummary;
}
