import { NextResponse } from 'next/server';
import { addSyncRun, getConnectorState, saveGa4Summary, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchGa4SyncPayload, refreshAccessToken } from '../../../../../lib/ga4';

function asString(value: string | number | boolean | null | undefined) {
  return typeof value === 'string' ? value : null;
}

async function runSync() {
  const startedAt = new Date().toISOString();
  const runId = `ga4-sync-${Date.now()}`;

  const connector = await getConnectorState('ga4');
  const propertyId = asString(connector?.config.propertyId);
  const refreshToken = asString(connector?.secrets.refreshToken);

  if (!connector || !propertyId || !refreshToken) {
    return NextResponse.json(
      {
        synced: false,
        error: 'GA4 connector is not configured. Connect GA4 first via /api/connectors/ga4/auth.',
      },
      { status: 400 },
    );
  }

  await upsertConnectorState('ga4', {
    status: 'syncing',
    updatedAt: startedAt,
    lastError: null,
  });

  try {
    const auth = await refreshAccessToken(refreshToken);
    const payload = await fetchGa4SyncPayload(auth, propertyId);

    await saveGa4Summary(payload);
    await upsertConnectorState('ga4', {
      status: 'connected',
      updatedAt: new Date().toISOString(),
      lastSyncAt: payload.syncedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        propertyId,
      },
      secrets: {
        refreshToken,
      },
    });

    await addSyncRun({
      id: runId,
      source: 'ga4',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: payload.byChannel.length + payload.byLandingPage.length + payload.byCountry.length + payload.byDevice.length,
      summary: `GA4 sync stored ${payload.totals.sessions} sessions across ${payload.byChannel.length} channels`,
      error: null,
    });

    return NextResponse.json({
      synced: true,
      summary: payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);

    await upsertConnectorState('ga4', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastSyncStatus: 'failed',
      lastError: message,
    });

    await addSyncRun({
      id: runId,
      source: 'ga4',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      rows: 0,
      summary: 'GA4 sync failed',
      error: message,
    });

    return NextResponse.json({ synced: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  return runSync();
}

export async function GET() {
  return runSync();
}
