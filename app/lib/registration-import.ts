import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export interface ImportedRegistrant {
  firstName: string | null;
  lastName: string | null;
  email: string;
  registeredAt: string;
  approved: boolean;
  participated: boolean;
  attendanceRate: string | null;
  duration: string | null;
  joinLink: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  webinarName: string | null;
}

export interface RegistrationImportSummary {
  importedAt: string;
  source: string;
  webinarName: string | null;
  totalRegistrants: number;
  participants: number;
  approvedCount: number;
  contacts: ImportedRegistrant[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const REGISTRATIONS_PATH = path.join(DATA_DIR, 'registrations-import.json');

function parseBool(value: string | undefined) {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

function parseDate(value: string | undefined) {
  if (!value) return new Date().toISOString();
  const [datePart, timePart] = value.split(',').map((part) => part.trim());
  if (!datePart || !timePart) return new Date(value).toISOString();
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(REGISTRATIONS_PATH, 'utf8');
  } catch {
    await writeFile(REGISTRATIONS_PATH, JSON.stringify({ imports: [] }, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureFile();
  const raw = await readFile(REGISTRATIONS_PATH, 'utf8');
  return JSON.parse(raw) as { imports: RegistrationImportSummary[] };
}

async function writeStore(store: { imports: RegistrationImportSummary[] }) {
  await ensureFile();
  await writeFile(REGISTRATIONS_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function importRegistrationsCsv(csvText: string, webinarName?: string | null) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV must contain a header and at least one registrant row');
  }

  const headers = splitCsvLine(lines[0]);
  const records: ImportedRegistrant[] = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    return {
      firstName: row.name || null,
      lastName: row.lastName || null,
      email: row.email,
      registeredAt: parseDate(row.registeredAt),
      approved: parseBool(row.approved),
      participated: parseBool(row.participated),
      attendanceRate: row.attendanceRate || null,
      duration: row.duration || null,
      joinLink: row.joinLink || null,
      referrer: row.referrer || null,
      utmSource: row.utmSource || null,
      utmMedium: row.utmMedium || null,
      utmCampaign: row.utmCampaign || null,
      utmTerm: row.utmTerm || null,
      utmContent: row.utmContent || null,
      webinarName: webinarName ?? null,
    };
  });

  const summary: RegistrationImportSummary = {
    importedAt: new Date().toISOString(),
    source: 'riverside-csv',
    webinarName: webinarName ?? null,
    totalRegistrants: records.length,
    participants: records.filter((record) => record.participated).length,
    approvedCount: records.filter((record) => record.approved).length,
    contacts: records,
  };

  const store = await readStore();
  store.imports.unshift(summary);
  store.imports = store.imports.slice(0, 20);
  await writeStore(store);

  return summary;
}

export async function getLatestRegistrationImport() {
  const store = await readStore();
  return store.imports[0] ?? null;
}
