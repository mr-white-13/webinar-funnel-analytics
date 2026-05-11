const THINKIFIC_API_BASE = 'https://api.thinkific.com/api/public/v1';

export interface ThinkificConnectionTestResult {
  siteDomain: string;
  courses: Array<{
    id: number;
    name: string;
    slug: string | null;
  }>;
}

export interface ThinkificSyncPayload {
  syncedAt: string;
  siteDomain: string;
  totals: {
    courses: number;
    users: number;
    enrollments: number;
  };
  courses: Array<{
    id: number;
    name: string;
    slug: string | null;
    enrollmentsCount: number;
  }>;
  usersSample: Array<{
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    signInCount: number | null;
  }>;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function normalizeThinkificDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

async function thinkificFetch<T>(path: string, apiKey: string, subdomain: string) {
  const response = await fetch(`${THINKIFIC_API_BASE}${path}`, {
    headers: {
      'X-Auth-API-Key': apiKey,
      'X-Auth-Subdomain': subdomain,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      name: 'ThinkificApiError',
      message: `Thinkific API request failed with ${response.status}`,
      status: response.status,
      response: data,
    };
  }

  return data as T;
}

export function getThinkificConfigFromEnv() {
  return {
    siteDomain: normalizeThinkificDomain(required('THINKIFIC_SITE_DOMAIN')),
    subdomain: required('THINKIFIC_SUBDOMAIN'),
    apiKey: required('THINKIFIC_API_KEY'),
  };
}

export async function fetchThinkificConnectionTest(apiKey: string, subdomain: string, siteDomain: string): Promise<ThinkificConnectionTestResult> {
  const courses = await thinkificFetch<{ items?: Array<{ id: number; name: string; slug?: string | null }> }>('/courses?page=1&limit=10', apiKey, subdomain);

  return {
    siteDomain,
    courses: (courses.items ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      slug: course.slug ?? null,
    })),
  };
}

export async function fetchThinkificSyncPayload(apiKey: string, subdomain: string, siteDomain: string): Promise<ThinkificSyncPayload> {
  const [coursesResult, usersResult, enrollmentsResult] = await Promise.all([
    thinkificFetch<{ items?: Array<{ id: number; name: string; slug?: string | null }> }>('/courses?page=1&limit=20', apiKey, subdomain),
    thinkificFetch<{ items?: Array<{ id: number; email: string; first_name?: string; last_name?: string; sign_in_count?: number }> }>('/users?page=1&limit=20', apiKey, subdomain),
    thinkificFetch<{ items?: Array<{ course_id: number }> }>('/enrollments?page=1&limit=100', apiKey, subdomain),
  ]);

  const enrollments = enrollmentsResult.items ?? [];
  const enrollmentsByCourse = new Map<number, number>();
  for (const enrollment of enrollments) {
    enrollmentsByCourse.set(enrollment.course_id, (enrollmentsByCourse.get(enrollment.course_id) ?? 0) + 1);
  }

  const courses = (coursesResult.items ?? []).map((course) => ({
    id: course.id,
    name: course.name,
    slug: course.slug ?? null,
    enrollmentsCount: enrollmentsByCourse.get(course.id) ?? 0,
  }));

  const usersSample = (usersResult.items ?? []).slice(0, 10).map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    signInCount: user.sign_in_count ?? null,
  }));

  return {
    syncedAt: new Date().toISOString(),
    siteDomain,
    totals: {
      courses: courses.length,
      users: usersResult.items?.length ?? 0,
      enrollments: enrollments.length,
    },
    courses,
    usersSample,
  };
}
