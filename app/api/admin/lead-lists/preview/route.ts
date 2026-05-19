import { NextResponse } from 'next/server';
import { parseSheetUrl, fetchSheetCsv } from '@/lib/sheets';

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url fehlt' }, { status: 400 });

  const parsed = parseSheetUrl(url);
  if (!parsed) return NextResponse.json({ error: 'Ungültige Google-Sheets-URL' }, { status: 400 });

  try {
    const rows = await fetchSheetCsv(parsed.sheetId, parsed.gid);
    const rawHeaders = rows[0] ?? [];
    const headers = rawHeaders.map((name, index) => ({ name, index }));
    const sampleRows = rows.slice(1, 4);
    return NextResponse.json({ headers, sampleRows, sheetId: parsed.sheetId, gid: parsed.gid ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
