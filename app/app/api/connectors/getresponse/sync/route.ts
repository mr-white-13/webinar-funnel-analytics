import { NextResponse } from 'next/server';
import { addSyncRun, getConnectorState, saveGetResponseSummary, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchGetResponseSyncPayload } from '../../../../../lib/getresponse';

function asString(value: string | number | boolean | null | undefined) {
  return typeof value === 'string' ? value : null;
}

async function runSync() {
  const startedAt = new Date().toISOString();
  const runId = `getresponse-sync-${Date.now()}`;

  const connector = await getConnectorState('getresponse');
  const apiKey = asString(connector?.secrets.apiKey);
  const accountEmail = asString(connector?.config.accountEmail);
  const primaryListName = asString(connector?.config.primaryListName);

  if (!connector || !apiKey || !accountEmail) {
    return NextResponse.json(
      {
        synced: false,
        error: 'GetResponse connector is not configured. Connect it first via /api/connectors/getresponse/connect.',
      },
      { status: 400 },
    );
  }

  await upsertConnectorState('getresponse', {
    status: 'syncing',
    updatedAt: startedAt,
    lastError: null,
  });

  try {
    const payload = await fetchGetResponseSyncPayload(apiKey, accountEmail, primaryListName);

    await saveGetResponseSummary(payload);
    await upsertConnectorState('getresponse', {
      status: 'connected',
      updatedAt: new Date().toISOString(),
      lastSyncAt: payload.syncedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        accountEmail,
        primaryListName: payload.primaryCampaignName,
      },
      secrets: {
        apiKey,
      },
    });

    await addSyncRun({
      id: runId,
      source: 'getresponse',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: payload.contactsSample.length,
      summary: `GetResponse sync stored ${payload.totals.contactsInPrimaryCampaign} primary-list contacts`,
      error: null,
    });

    return NextResponse.json({ synced: true, summary: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);

    await upsertConnectorState('getresponse', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastSyncStatus: 'failed',
      lastError: message,
    });

    await addSyncRun({
      id: runId,
      source: 'getresponse',
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'failed',
      rows: 0,
      summary: 'GetResponse sync failed',
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
