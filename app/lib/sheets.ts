import { parseCsv } from './csv';

export class SheetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetError';
  }
}

interface ParsedSheetUrl {
  sheetId: string;
  gid?: string;
}

export function parseSheetUrl(url: string): ParsedSheetUrl | null {
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const sheetId = idMatch[1];
  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : undefined;
  return { sheetId, gid };
}

export function buildCsvUrl(sheetId: string, gid?: string | null): string {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  return gid ? `${base}&gid=${gid}` : base;
}

export async function fetchSheetCsv(sheetId: string, gid?: string | null): Promise<string[][]> {
  const url = buildCsvUrl(sheetId, gid);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch {
    throw new SheetError('Sheet nicht erreichbar (Timeout oder Netzwerkfehler)');
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new SheetError(`Sheet-Abruf fehlgeschlagen (HTTP ${res.status})`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const body = await res.text();

  // Google liefert HTML-Loginseite bei privaten Sheets
  if (!contentType.includes('text/csv') && !contentType.includes('text/plain')) {
    if (body.trimStart().startsWith('<')) {
      throw new SheetError('Sheet nicht öffentlich erreichbar. Bitte "Jeder mit dem Link kann ansehen" aktivieren.');
    }
  }

  const rows = parseCsv(body);
  if (rows.length === 0) {
    throw new SheetError('Sheet ist leer oder enthält keine Daten');
  }
  return rows;
}
