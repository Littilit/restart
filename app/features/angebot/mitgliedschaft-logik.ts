import { MITGLIEDSCHAFTEN, PREISE, type Mitgliedschaft } from '@/data/preise';

const WOCHEN_PRO_MONAT = 4.3;

/**
 * Schätzt aus einem Frequenz-Freitext die Sessions pro Monat.
 * Erkennt "Nx pro Woche", "N–Mx pro Woche", "Nx pro Monat" (auch mit "/").
 * Gibt null zurück, wenn der Text nicht interpretierbar ist.
 */
export function sessionsProMonat(haeufigkeitText: string): number | null {
  const text = haeufigkeitText.toLowerCase();

  const woche = text.match(/(\d+)(?:\s*[–\-]\s*(\d+))?\s*x?\s*(?:pro|\/)\s*woche/);
  if (woche) {
    const a = parseInt(woche[1], 10);
    const b = woche[2] ? parseInt(woche[2], 10) : a;
    return Math.round(((a + b) / 2) * WOCHEN_PRO_MONAT);
  }

  const monat = text.match(/(\d+)(?:\s*[–\-]\s*(\d+))?\s*x?\s*(?:pro|\/)\s*monat/);
  if (monat) {
    const a = parseInt(monat[1], 10);
    const b = monat[2] ? parseInt(monat[2], 10) : a;
    return Math.round((a + b) / 2);
  }

  return null;
}

/** Summe der geschätzten Sessions/Monat über den Longevity-Core-Stack. */
export function protokollSessionsProMonat(coreEintraege: { haeufigkeitText: string }[]): number {
  let summe = 0;
  for (const e of coreEintraege) {
    const s = sessionsProMonat(e.haeufigkeitText);
    if (s !== null) summe += s;
  }
  return summe;
}

export type MitgliedschaftId = 'flex' | 'premium' | 'longevity';

/** Leitet aus der Session-Frequenz die passende Mitgliedschaft ab. */
export function empfehleMitgliedschaftId(sessionsProMonat: number): MitgliedschaftId {
  if (sessionsProMonat <= 2) return 'flex';
  if (sessionsProMonat <= 5) return 'premium';
  return 'longevity';
}

export function getMitgliedschaft(id: string | null | undefined): Mitgliedschaft | null {
  if (!id) return null;
  return MITGLIEDSCHAFTEN.find((m) => m.id === id) ?? null;
}

/** Die längste Laufzeit ist immer die günstigste pro Monat ("Bester Preis"). */
export function besteLaufzeit(m: Mitgliedschaft): { monate: number; monatsbeitrag: number } {
  return m.laufzeiten.reduce((a, b) => (b.monatsbeitrag < a.monatsbeitrag ? b : a));
}

export interface Preisvergleich {
  sessions: number;
  einzelpreis: number;
  einzelProMonat: number;
  /** Effektiver Monatsbeitrag inkl. ggf. nötiger Zusatz-Sessions, bei bester Laufzeit. */
  mitgliedschaftProMonat: number;
  laufzeitMonate: number;
  ersparnisProMonat: number;
  ersparnisProJahr: number;
}

/**
 * Stellt die Einzelbuchungskosten den Mitgliedschaftskosten gegenüber.
 * Basis: Longevity-Core-Stack, Einzelpreis der Kategorie "regenerate".
 */
export function berechnePreisvergleich(
  sessionsProMonat: number,
  m: Mitgliedschaft,
): Preisvergleich | null {
  if (sessionsProMonat <= 0) return null;

  const einzelpreis = PREISE.regenerate.einzel;
  const einzelProMonat = sessionsProMonat * einzelpreis;

  const lz = besteLaufzeit(m);
  const zusatz =
    m.inkludierteAnzahl !== null && m.zusatzSession !== null
      ? Math.max(0, sessionsProMonat - m.inkludierteAnzahl) * m.zusatzSession
      : 0;
  const mitgliedschaftProMonat = lz.monatsbeitrag + zusatz;

  const ersparnisProMonat = einzelProMonat - mitgliedschaftProMonat;

  return {
    sessions: sessionsProMonat,
    einzelpreis,
    einzelProMonat,
    mitgliedschaftProMonat,
    laufzeitMonate: lz.monate,
    ersparnisProMonat,
    ersparnisProJahr: ersparnisProMonat * 12,
  };
}

export function formatEuro(betrag: number): string {
  return `${betrag.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}
