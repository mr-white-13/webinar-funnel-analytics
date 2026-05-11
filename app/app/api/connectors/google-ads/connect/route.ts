import { NextResponse } from 'next/server';
import { addSyncRun, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchGoogleAdsConnectionTest, getGoogleAdsConfigFromEnv } from '../../../../../lib/google-ads';

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

async function connectGoogleAds() {
  try {
    const { customerId, managerId, developerToken } = getGoogleAdsConfigFromEnv();
    const test = await fetchGoogleAdsConnectionTest(customerId);

    await upsertConnectorState('google-ads', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: null,
      config: {
        customerId: test.customerId,
        descriptiveName: test.descriptiveName,
        currencyCode: test.currencyCode,
        timeZone: test.timeZone,
        managerId,
        developerToken,
      },
      secrets: {},
    });

    await addSyncRun({
      id: `google-ads-connect-${Date.now()}`,
      source: 'google-ads',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: 1,
      summary: `Google Ads connector verified for ${test.descriptiveName}`,
      error: null,
    });

    return NextResponse.json({
      connected: true,
      customerId: test.customerId,
      descriptiveName: test.descriptiveName,
      currencyCode: test.currencyCode,
      timeZone: test.timeZone,
    });
  } catch (error) {
    await upsertConnectorState('google-ads', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastError: JSON.stringify(serializeError(error)),
    });

    return NextResponse.json({ connected: false, error: serializeError(error) }, { status: 500 });
  }
}

export async function GET() {
  return connectGoogleAds();
}

export async function POST() {
  return connectGoogleAds();
}
