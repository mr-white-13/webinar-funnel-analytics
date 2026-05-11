import { NextRequest, NextResponse } from 'next/server';
import { addSyncRun, upsertConnectorState } from '../../../../lib/connector-store';
import { importRegistrationsCsv, getLatestRegistrationImport } from '../../../../lib/registration-import';

export async function GET() {
  const latest = await getLatestRegistrationImport();
  return NextResponse.json({ latestImport: latest });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const csv = typeof body.csv === 'string' ? body.csv : null;
    const webinarName = typeof body.webinarName === 'string' ? body.webinarName : null;

    if (!csv) {
      return NextResponse.json({ imported: false, error: 'Missing csv body field' }, { status: 400 });
    }

    const summary = await importRegistrationsCsv(csv, webinarName);

    await upsertConnectorState('manual-registrations', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncAt: summary.importedAt,
      lastSyncStatus: 'success',
      lastError: null,
      config: {
        source: 'riverside-csv',
        webinarName: summary.webinarName,
      },
      secrets: {},
    });

    await addSyncRun({
      id: `manual-registrations-${Date.now()}`,
      source: 'manual-registrations',
      startedAt: summary.importedAt,
      finishedAt: summary.importedAt,
      status: 'success',
      rows: summary.totalRegistrants,
      summary: `Imported ${summary.totalRegistrants} Riverside registrations`,
      error: null,
    });

    return NextResponse.json({ imported: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        imported: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
