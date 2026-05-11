import { NextResponse } from 'next/server';
import { addSyncRun, getConnectorState, saveMetaSummary, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchMetaSyncPayload } from '../../../../../lib/meta';

function asString(value: string | number | boolean | null | undefined) {
  return typeof value === 'string' ? value : null;
}

async function runSync() {
  const startedAt = new Date().toISOString();
  const runId = `meta-sync-${Date.now()}`;

  const connector = await getConnectorState('meta');
  const adAccountId = asString(connector?.config.adAccountId);
  const accessToken = asString(connector?.secrets.accessToken);

  if (!connector || !adAccountId || !accessToken) {
    return NextResponse.json(
      {
        synced: false,
        error: 'Meta connector is not configured. Connect Meta first via /api/connectors/meta/connect.',
      },
      { status: 400 },
    );
  }

  await upsertConnectorState('meta', {
    status: 'syncing',
    updatedAt: startedAt,
    lastError: null,
  });

  try {
    const payload = await fetchMetaSyncPayload(accessToken, adAccountId);

    await saveMetaSummary(payload);
    await upsertConnectorState('meta', {
      status: 'connected',
      updatedAt: new Date().toISOString(),
      lastSyncAt: payload.syncedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        adAccountId,
      },
      secrets: {
        accessToken,
      },
    });

    await addSyncRun({
      id: runId,
      source: 'meta',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: payload.campaigns.length,
      summary: `Meta sync stored ${payload.totals.spend} spend across ${payload.campaigns.length} campaigns`,
      error: null,
    });

    return NextResponse.json({ synced: true, summary: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);

    await upsertConnectorState('meta', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastSyncStatus: 'failed',
      lastError: message,
    });

    await addSyncRun({
      id: runId,
      source: 'meta',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      rows: 0,
      summary: 'Meta sync failed',
      error: message,
    });

    return NextResponse.json({ synced: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return runSync();
}

export async function POST() {
  return runSync();
}
