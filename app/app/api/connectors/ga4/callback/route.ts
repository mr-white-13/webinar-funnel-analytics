import { NextRequest, NextResponse } from 'next/server';
import { exchangeGa4Code, fetchGa4ConnectionTest, getOauthTokenInfo } from '../../../../../lib/ga4';

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const err = error as Error & {
      code?: number | string;
      status?: number | string;
      details?: string;
      errors?: unknown;
      response?: { data?: unknown };
    };

    return {
      name: err.name,
      message: err.message,
      code: err.code ?? null,
      status: err.status ?? null,
      details: err.details ?? null,
      response: err.response?.data ?? null,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
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
    const oauthTokenInfo = await getOauthTokenInfo(oauth2Client);

    try {
      const test = await fetchGa4ConnectionTest(oauth2Client);

      return NextResponse.json({
        connected: true,
        propertyId: test.propertyId,
        tokenInfo: {
          hasAccessToken: Boolean(tokens.access_token),
          hasRefreshToken: Boolean(tokens.refresh_token),
          expiryDate: tokens.expiry_date ?? null,
          scope: tokens.scope ?? null,
        },
        oauthTokenInfo,
        reportPreview: test.rows.slice(0, 5),
        rowCount: test.rowCount,
        metadataSample: test.metadataSample,
        nextStep:
          'Store the refresh token securely and use it for scheduled GA4 sync jobs. Do not expose tokens in the browser in production.',
      });
    } catch (ga4Error) {
      return NextResponse.json(
        {
          connected: false,
          stage: 'ga4-query',
          propertyId: process.env.GA4_PROPERTY_ID ?? null,
          tokenInfo: {
            hasAccessToken: Boolean(tokens.access_token),
            hasRefreshToken: Boolean(tokens.refresh_token),
            expiryDate: tokens.expiry_date ?? null,
            scope: tokens.scope ?? null,
          },
          oauthTokenInfo,
          error: serializeError(ga4Error),
        },
        { status: 500 },
      );
    }
  } catch (callbackError) {
    return NextResponse.json(
      {
        connected: false,
        stage: 'oauth-exchange',
        error: serializeError(callbackError),
      },
      { status: 500 },
    );
  }
}
