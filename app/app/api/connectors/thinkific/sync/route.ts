import { NextResponse } from 'next/server';
import { addSyncRun, getConnectorState, saveThinkificSummary, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchThinkificSyncPayload } from '../../../../../lib/thinkific';

function asString(value: string | number | boolean | null | undefined) {
  return typeof value === 'string' ? value : null;
}

async function runSync() {
  const startedAt = new Date().toISOString();
  const runId = `thinkific-sync-${Date.now()}`;

  const connector = await getConnectorState('thinkific');
  const apiKey = asString(connector?.secrets.apiKey);
  const subdomain = asString(connector?.config.subdomain);
  const siteDomain = asString(connector?.config.siteDomain);

  if (!connector || !apiKey || !subdomain || !siteDomain) {
    return NextResponse.json(
      {
        synced: false,
        error: 'Thinkific connector is not configured. Connect it first via /api/connectors/thinkific/connect.',
      },
      { status: 400 },
    );
  }

  await upsertConnectorState('thinkific', {
    status: 'syncing',
    updatedAt: startedAt,
    lastError: null,
  });

  try {
    const payload = await fetchThinkificSyncPayload(apiKey, subdomain, siteDomain);

    await saveThinkificSummary(payload);
    await upsertConnectorState('thinkific', {
      status: 'connected',
      updatedAt: new Date().toISOString(),
      lastSyncAt: payload.syncedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        siteDomain,
        subdomain,
      },
      secrets: {
        apiKey,
      },
    });

    await addSyncRun({
      id: runId,
      source: 'thinkific',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: payload.usersSample.length,
      summary: `Thinkific sync stored ${payload.totals.users} users and ${payload.totals.enrollments} enrollments`,
      error: null,
    });

    return NextResponse.json({ synced: true, summary: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);

    await upsertConnectorState('thinkific', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastSyncStatus: 'failed',
      lastError: message,
    });

    await addSyncRun({
      id: runId,
      source: 'thinkific',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      rows: 0,
      summary: 'Thinkific sync failed',
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
