import { NextRequest, NextResponse } from 'next/server';
import { exchangeGa4Code, fetchGa4ConnectionTest } from '../../../../../lib/ga4';

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
      reportPreview: test.rows.slice(0, 5),
      rowCount: test.rowCount,
      metadataSample: test.metadataSample,
      nextStep:
        'Store the refresh token securely and use it for scheduled GA4 sync jobs. Do not expose tokens in the browser in production.',
    });
  } catch (callbackError) {
    return NextResponse.json(
      {
        connected: false,
        error: callbackError instanceof Error ? callbackError.message : 'GA4 callback failed',
      },
      { status: 500 },
    );
  }
}
