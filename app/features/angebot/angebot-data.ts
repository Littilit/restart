import { prisma } from '@/lib/prisma';
import type { AnwendungSlug } from '@/data/anwendungen';
import type { Mitgliedschaft } from '@/data/preise';
import { getMitgliedschaft } from './mitgliedschaft-logik';

export interface AnwendungItem {
  slug: AnwendungSlug;
  haeufigkeitText: string;
  begruendung: string;
}

export interface PreisEntry {
  probe: number;
  einzel: number;
  karten: { menge: number; preis: number }[];
}

export interface AngebotDaten {
  empfehlungId: string;
  kundenName: string;
  kundenNachname: string;
  typ: 'neukunde' | 'folge';
  anwendungen: AnwendungItem[];
  preisSnapshot: Record<string, PreisEntry>;
  einleitung: string | null;
  zusatzhinweis: string | null;
  mitgliedschaft: Mitgliedschaft | null;
  sessionsProMonat: number | null;
  erstelltAm: Date;
  gueltigBis: Date | null;
  geoeffnetAm: Date | null;
  zugesagtAm: Date | null;
}

/** Lädt eine Empfehlung per shareToken und bringt sie in eine getypte, gefilterte Form. */
export async function ladeAngebot(token: string): Promise<AngebotDaten | null> {
  const empfehlung = await prisma.empfehlung.findUnique({
    where: { shareToken: token },
    include: { customer: true },
  });

  if (!empfehlung) return null;

  const rawAnwendungen = Array.isArray(empfehlung.anwendungen) ? empfehlung.anwendungen : [];
  const anwendungen: AnwendungItem[] = rawAnwendungen
    .filter(
      (a): a is { slug: AnwendungSlug; haeufigkeitText: string; begruendung: string } =>
        typeof a === 'object' &&
        a !== null &&
        typeof (a as Record<string, unknown>).slug === 'string' &&
        typeof (a as Record<string, unknown>).haeufigkeitText === 'string' &&
        typeof (a as Record<string, unknown>).begruendung === 'string',
    )
    .map((a) => ({
      slug: a.slug,
      haeufigkeitText: a.haeufigkeitText,
      begruendung: a.begruendung,
    }));

  const preisSnapshot =
    typeof empfehlung.preisSnapshot === 'object' &&
    empfehlung.preisSnapshot !== null &&
    !Array.isArray(empfehlung.preisSnapshot)
      ? (empfehlung.preisSnapshot as unknown as Record<string, PreisEntry>)
      : {};

  return {
    empfehlungId: empfehlung.id,
    kundenName: `${empfehlung.customer.vorname} ${empfehlung.customer.nachname}`,
    kundenNachname: empfehlung.customer.nachname,
    typ: empfehlung.typ,
    anwendungen,
    preisSnapshot,
    einleitung: empfehlung.einleitung,
    zusatzhinweis: empfehlung.zusatzhinweis,
    mitgliedschaft: getMitgliedschaft(empfehlung.mitgliedschaft),
    sessionsProMonat: empfehlung.sessionsProMonat,
    erstelltAm: empfehlung.createdAt,
    gueltigBis: empfehlung.gueltigBis,
    geoeffnetAm: empfehlung.geoeffnetAm,
    zugesagtAm: empfehlung.zugesagtAm,
  };
}
