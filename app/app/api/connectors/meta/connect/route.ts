import { NextResponse } from 'next/server';
import { addSyncRun, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchMetaConnectionTest, getMetaConfigFromEnv } from '../../../../../lib/meta';

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

async function connectMeta() {
  try {
    const { adAccountId, appId, appSecret, accessToken } = getMetaConfigFromEnv();
    const test = await fetchMetaConnectionTest(accessToken, adAccountId);

    await upsertConnectorState('meta', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: null,
      config: {
        adAccountId: test.adAccountId,
        accountName: test.accountName,
        currency: test.currency,
        timezoneName: test.timezoneName,
        appId,
      },
      secrets: {
        accessToken,
        appSecret,
      },
    });

    await addSyncRun({
      id: `meta-connect-${Date.now()}`,
      source: 'meta',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: 1,
      summary: `Meta connector verified for ${test.accountName}`,
      error: null,
    });

    return NextResponse.json({
      connected: true,
      adAccountId: test.adAccountId,
      accountName: test.accountName,
      currency: test.currency,
      timezoneName: test.timezoneName,
    });
  } catch (error) {
    await upsertConnectorState('meta', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastError: JSON.stringify(serializeError(error)),
    });

    return NextResponse.json({ connected: false, error: serializeError(error) }, { status: 500 });
  }
}

export async function GET() {
  return connectMeta();
}

export async function POST() {
  return connectMeta();
}
