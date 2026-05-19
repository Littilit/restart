import { prisma } from './prisma';
import { fetchSheetCsv } from './sheets';
import { samePersonByName } from './name-similarity';

const THROTTLE_MS = 3 * 60 * 1000; // 3 Minuten

function normalizeEmail(e: string): string {
  return e.toLowerCase().trim();
}

function normalizeTelefon(t: string): string {
  return t.replace(/\D/g, '');
}

function splitName(full: string): { vorname: string; nachname: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { vorname: parts[0], nachname: '' };
  const vorname = parts[0];
  const nachname = parts.slice(1).join(' ');
  return { vorname, nachname };
}

function resolveIndex(headers: string[], columnName: string | null | undefined): number {
  if (!columnName) return -1;
  return headers.findIndex((h) => h.toLowerCase().trim() === columnName.toLowerCase().trim());
}

export async function syncLeadList(listId: string): Promise<number> {
  const list = await prisma.leadList.findUnique({ where: { id: listId } });
  if (!list) throw new Error('LeadList nicht gefunden');

  await prisma.leadList.update({ where: { id: listId }, data: { lastSyncedAt: new Date(), syncFehler: null } });

  let rows: string[][];
  try {
    rows = await fetchSheetCsv(list.sheetId, list.gid);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.leadList.update({ where: { id: listId }, data: { syncFehler: msg } });
    return 0;
  }

  if (rows.length < 2) return 0; // nur Header, keine Daten

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Spalten-Indizes auflösen
  const idxEmail = resolveIndex(headers, list.spalteEmail);
  const idxTelefon = resolveIndex(headers, list.spalteTelefon);
  const idxVorname = resolveIndex(headers, list.spalteVorname);
  const idxNachname = resolveIndex(headers, list.spalteNachname);
  const idxName = resolveIndex(headers, list.spalteName);

  // Pflicht-Spalten-Fehler
  if (list.nameModus === 'kombiniert' && idxName === -1) {
    await prisma.leadList.update({ where: { id: listId }, data: { syncFehler: 'Spalte "Name" nicht gefunden' } });
    return 0;
  }
  if (list.nameModus === 'getrennt' && idxVorname === -1 && idxNachname === -1) {
    await prisma.leadList.update({ where: { id: listId }, data: { syncFehler: 'Weder Vorname- noch Nachname-Spalte gefunden' } });
    return 0;
  }

  // Bestehende dedupeKeys dieser Liste laden
  const existing = await prisma.lead.findMany({ where: { leadListId: listId }, select: { dedupeKey: true } });
  const existingKeys = new Set(existing.map((l) => l.dedupeKey));

  let newCount = 0;

  for (const row of dataRows) {
    try {
      const get = (idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

      let vorname: string;
      let nachname: string;

      if (list.nameModus === 'kombiniert') {
        const { vorname: v, nachname: n } = splitName(get(idxName));
        vorname = v;
        nachname = n;
      } else {
        vorname = get(idxVorname);
        nachname = get(idxNachname);
      }

      const email = get(idxEmail);
      const telefon = get(idxTelefon);

      // Leere Zeile überspringen
      if (!vorname && !nachname && !email && !telefon) continue;

      // dedupeKey
      const normEmail = normalizeEmail(email);
      const normTel = normalizeTelefon(telefon);
      const dedupeKey = normEmail || normTel;
      if (!dedupeKey) continue;

      // Duplikat innerhalb dieser Liste
      if (existingKeys.has(dedupeKey)) continue;
      existingKeys.add(dedupeKey);

      // Customer global finden oder anlegen
      let customerId: string | null = null;
      const hasMinData = (vorname.length >= 2 || nachname.length >= 2) && (normEmail || normTel);

      if (hasMinData) {
        // Zuerst per E-Mail suchen
        if (normEmail) {
          const candidates = await prisma.customer.findMany({ where: { email: normEmail }, select: { id: true, vorname: true } });
          const match = candidates.find((c) => samePersonByName(c.vorname, vorname || nachname));
          if (match) {
            customerId = match.id;
          }
        }

        // Wenn nicht gefunden, per Telefon suchen
        if (!customerId && normTel) {
          const byPhone = await prisma.customer.findFirst({
            where: { telefon: { contains: normTel } },
            select: { id: true, vorname: true },
          });
          if (byPhone && samePersonByName(byPhone.vorname, vorname || nachname)) {
            customerId = byPhone.id;
          }
        }

        // Neu anlegen
        if (!customerId) {
          const customer = await prisma.customer.create({
            data: {
              vorname: vorname || '?',
              nachname: nachname || '?',
              email: normEmail || '',
              telefon: normTel || '',
              herkunft: list.name,
              status: 'neukunde',
            },
          });
          customerId = customer.id;
        }
      }

      await prisma.lead.create({
        data: {
          leadListId: listId,
          vorname,
          nachname,
          email,
          telefon,
          dedupeKey,
          customerId,
          status: 'neu',
        },
      });
      newCount++;
    } catch {
      // Einzelne Fehler-Zeile überspringen, Rest weiterlaufen lassen
      continue;
    }
  }

  return newCount;
}

export async function syncAllLists(): Promise<number> {
  const lists = await prisma.leadList.findMany({ where: { aktiv: true } });
  let total = 0;

  for (const list of lists) {
    const isStale = !list.lastSyncedAt || Date.now() - list.lastSyncedAt.getTime() > THROTTLE_MS;
    if (!isStale) continue;
    total += await syncLeadList(list.id);
  }

  return total;
}
