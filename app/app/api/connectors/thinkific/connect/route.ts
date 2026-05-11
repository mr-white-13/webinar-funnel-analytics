import { NextResponse } from 'next/server';
import { addSyncRun, upsertConnectorState } from '../../../../../lib/connector-store';
import { fetchThinkificConnectionTest, getThinkificConfigFromEnv } from '../../../../../lib/thinkific';

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

async function connectThinkific() {
  try {
    const { apiKey, subdomain, siteDomain } = getThinkificConfigFromEnv();
    const test = await fetchThinkificConnectionTest(apiKey, subdomain, siteDomain);

    await upsertConnectorState('thinkific', {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: null,
      config: {
        siteDomain,
        subdomain,
        coursesDiscovered: test.courses.length,
      },
      secrets: {
        apiKey,
      },
    });

    await addSyncRun({
      id: `thinkific-connect-${Date.now()}`,
      source: 'thinkific',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      rows: test.courses.length,
      summary: `Thinkific connector verified with ${test.courses.length} courses`,
      error: null,
    });

    return NextResponse.json({
      connected: true,
      siteDomain,
      courses: test.courses,
    });
  } catch (error) {
    await upsertConnectorState('thinkific', {
      status: 'error',
      updatedAt: new Date().toISOString(),
      lastError: JSON.stringify(serializeError(error)),
    });

    return NextResponse.json({ connected: false, error: serializeError(error) }, { status: 500 });
  }
}

export async function GET() {
  return connectThinkific();
}

export async function POST() {
  return connectThinkific();
}
