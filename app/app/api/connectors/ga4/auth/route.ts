import { NextResponse } from 'next/server';
import { getGa4AuthUrl } from '../../../../../lib/ga4';

export async function GET() {
  try {
    const url = getGa4AuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create GA4 auth URL' },
      { status: 500 },
    );
  }
}
