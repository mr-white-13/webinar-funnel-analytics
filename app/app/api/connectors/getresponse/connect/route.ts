import { NextResponse } from 'next/server';
import { addSyncRun, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchGetResponseConnectionTest, getGetResponseConfigFromEnv } from '../../../../../lib/getresponse';

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const err = error as Error & { status?: number | string; response?: unknown };
    return {
      name: err.name,
      message: err.message,
      status: err.status ?? null,
      response: err.response ?? null,
    };
  }

  if (typeof error === 'object' && error !== null) return error;
  return { message: String(error) };
}

async function connectGetResponse() {
  try {
    const { apiKey, accountEmail, primaryListName } = getGetResponseConfigFromEnv();
    const test = await fetchGetResponseConnectionTest(apiKey, accountEmail);

    await upsertConnectorState('getresponse', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: null,
      config: {
        accountEmail,
        primaryListName: primaryListName ?? null,
        campaignsDiscovered: test.campaigns.length,
      },
      secrets: {
        apiKey,
      },
    });

    await addSyncRun({
      id: `getresponse-connect-${Date.now()}`,
      source: 'getresponse',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: test.campaigns.length,
      summary: `GetResponse connector verified with ${test.campaigns.length} campaigns`,
      error: null,
    });

    return NextResponse.json({
      connected: true,
      accountEmail,
      campaigns: test.campaigns,
    });
  } catch (error) {
    await upsertConnectorState('getresponse', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastError: JSON.stringify(serializeError(error)),
    });

    return NextResponse.json({ connected: false, error: serializeError(error) }, { status: 500 });
  }
}

export async function GET() {
  return connectGetResponse();
}

export async function POST() {
  return connectGetResponse();
}
