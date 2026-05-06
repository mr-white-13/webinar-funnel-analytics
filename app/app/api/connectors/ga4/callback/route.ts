import { NextRequest, NextResponse } from 'next/server';
import { exchangeGa4Code, fetchGa4ConnectionTest, refreshAccessToken } from '../../../../../lib/ga4';
import { addSyncRun, upsertConnectorState } from '../../../../../lib/connector-store';

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const err = error as Error & {
      code?: number | string;
      status?: number | string;
      details?: string;
      response?: unknown;
    };

    return {
      name: err.name,
      message: err.message,
      code: err.code ?? null,
      status: err.status ?? null,
      details: err.details ?? null,
      response: err.response ?? null,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return error;
  }

  return { message: String(error) };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const { oauth2Client, tokens } = await exchangeGa4Code(code);
    const propertyId = process.env.GA4_PROPERTY_ID ?? null;

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          connected: false,
          stage: 'oauth-exchange',
          error: 'No refresh token returned from Google. Reconnect with prompt=consent if needed.',
        },
        { status: 500 },
      );
    }

    const refreshedClient = await refreshAccessToken(tokens.refresh_token);
    const test = await fetchGa4ConnectionTest(refreshedClient);

    await upsertConnectorState('ga4', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: null,
      config: {
        propertyId: propertyId ?? test.propertyId,
        redirectUri: process.env.GOOGLE_REDIRECT_URI ?? null,
      },
      secrets: {
        refreshToken: tokens.refresh_token,
      },
    });

    await addSyncRun({
      id: `ga4-connect-${Date.now()}`,
      source: 'ga4',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: test.rowCount,
      summary: `GA4 connection verified for property ${test.propertyId}`,
      error: null,
    });

    return NextResponse.json({
      connected: true,
      propertyId: test.propertyId,
      rowCount: test.rowCount,
      metadataSample: test.metadataSample,
      message: 'GA4 connector saved. Next step: trigger /api/connectors/ga4/sync to store dashboard data.',
    });
  } catch (callbackError) {
    await upsertConnectorState('ga4', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastError: JSON.stringify(serializeError(callbackError)),
    });

    return NextResponse.json(
      {
        connected: false,
        stage: 'ga4-connect',
        error: serializeError(callbackError),
      },
      { status: 500 },
    );
  }
}
