import { NextResponse } from 'next/server';
import { addSyncRun, getConnectorState, saveGoogleAdsSummary, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchGoogleAdsSyncPayload } from '../../../../../lib/google-ads';

function asString(value: string | number | boolean | null | undefined) {
  return typeof value === 'string' ? value : null;
}

async function runSync() {
  const startedAt = new Date().toISOString();
  const runId = `google-ads-sync-${Date.now()}`;

  const connector = await getConnectorState('google-ads');
  const customerId = asString(connector?.config.customerId);

  if (!connector || !customerId) {
    return NextResponse.json(
      {
        synced: false,
        error: 'Google Ads connector is not configured. Connect it first via /api/connectors/google-ads/connect.',
      },
      { status: 400 },
    );
  }

  await upsertConnectorState('google-ads', {
    status: 'syncing',
    updatedAt: startedAt,
    lastError: null,
  });

  try {
    const payload = await fetchGoogleAdsSyncPayload(customerId);

    await saveGoogleAdsSummary(payload);
    await upsertConnectorState('google-ads', {
      status: 'connected',
      updatedAt: new Date().toISOString(),
      lastSyncAt: payload.syncedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        customerId,
      },
    });

    await addSyncRun({
      id: runId,
      source: 'google-ads',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: payload.campaigns.length,
      summary: `Google Ads sync stored ${payload.totals.cost} cost across ${payload.campaigns.length} campaigns`,
      error: null,
    });

    return NextResponse.json({ synced: true, summary: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);

    await upsertConnectorState('google-ads', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastSyncStatus: 'failed',
      lastError: message,
    });

    await addSyncRun({
      id: runId,
      source: 'google-ads',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      rows: 0,
      summary: 'Google Ads sync failed',
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
