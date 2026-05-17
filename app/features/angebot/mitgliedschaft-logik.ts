import { MITGLIEDSCHAFTEN, PREISE, type Mitgliedschaft } from '@/data/preise';

export type MitgliedschaftId = 'flex' | 'premium' | 'longevity';

/** Leitet aus den gewünschten Sessions/Monat die passende Mitgliedschaft ab. */
export function empfehleMitgliedschaftId(sessionsProMonat: number): MitgliedschaftId {
  if (sessionsProMonat <= 3) return 'flex';
  if (sessionsProMonat <= 7) return 'premium';
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
 * Basis: Einzelpreis der Kategorie "regenerate", 1 Session = 1 Anwendung.
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
