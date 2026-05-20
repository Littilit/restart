import type { AnwendungSlug } from './anwendungen';

export interface Mitgliedschaft {
  id: 'flex' | 'premium' | 'longevity';
  name: string;
  inkludierteSessions: string;
  inkludierteAnzahl: number | null;
  zusatzSession: number | null;
  laufzeiten: { monate: number; monatsbeitrag: number }[];
}

export const MITGLIEDSCHAFTEN: Mitgliedschaft[] = [
  {
    id: 'flex',
    name: 'FLEX-Club',
    inkludierteSessions: '2 Sessions / Monat',
    inkludierteAnzahl: 2,
    zusatzSession: 9.90,
    laufzeiten: [
      { monate: 1, monatsbeitrag: 39.90 },
      { monate: 6, monatsbeitrag: 34.90 },
      { monate: 12, monatsbeitrag: 29.90 },
    ],
  },
  {
    id: 'premium',
    name: 'Premium-Club',
    inkludierteSessions: '4 Sessions / Monat',
    inkludierteAnzahl: 4,
    zusatzSession: 9.90,
    laufzeiten: [
      { monate: 1, monatsbeitrag: 79.90 },
      { monate: 6, monatsbeitrag: 59.90 },
      { monate: 12, monatsbeitrag: 49.90 },
    ],
  },
  {
    id: 'longevity',
    name: 'Longevity-Club',
    inkludierteSessions: 'Unbegrenzt',
    inkludierteAnzahl: null,
    zusatzSession: null,
    laufzeiten: [
      { monate: 1, monatsbeitrag: 149.90 },
      { monate: 6, monatsbeitrag: 129.90 },
      { monate: 12, monatsbeitrag: 99.90 },
    ],
  },
];

export type PreisKategorie =
  | 'regenerate'
  | 'armstrong'
  | 'cryoshaper_focus'
  | 'cryoshaper_face'
  | 'cryoshaper_body'
  | 'beckenbodenstuhl';

export interface Preise {
  probe: number;
  einzel: number;
  karten: { menge: number; preis: number }[];
}

export const PREISE: Record<PreisKategorie, Preise> = {
  regenerate: {
    probe: 19.9,
    einzel: 35,
    karten: [
      { menge: 3, preis: 95 },
      { menge: 5, preis: 149 },
      { menge: 10, preis: 239 },
    ],
  },
  armstrong: {
    probe: 79,
    einzel: 119,
    karten: [
      { menge: 3, preis: 299 },
      { menge: 5, preis: 449 },
      { menge: 10, preis: 799 },
    ],
  },
  cryoshaper_focus: {
    probe: 79,
    einzel: 119,
    karten: [
      { menge: 3, preis: 299 },
      { menge: 5, preis: 449 },
      { menge: 10, preis: 799 },
    ],
  },
  cryoshaper_face: {
    probe: 59,
    einzel: 79,
    karten: [
      { menge: 3, preis: 189 },
      { menge: 5, preis: 299 },
      { menge: 10, preis: 579 },
    ],
  },
  cryoshaper_body: {
    probe: 99,
    einzel: 159,
    karten: [
      { menge: 3, preis: 419 },
      { menge: 5, preis: 619 },
      { menge: 10, preis: 1190 },
    ],
  },
  beckenbodenstuhl: {
    probe: 0,
    einzel: 0,
    karten: [
      { menge: 6, preis: 0 },
    ],
  },
};

export const NEUKUNDEN_ANGEBOT = {
  sessions: 4,
  preis: 59,
  gueltigkeitWochen: 4,
  hinweis: 'Einmaliges Angebot, keine Verlängerung. 4 Sessions frei aufteilbar.',
};

export const SLUG_KATEGORIE: Record<AnwendungSlug, PreisKategorie> = {
  eisbox: 'regenerate',
  redlight: 'regenerate',
  infrarotsauna: 'regenerate',
  'boa-lymphmassage': 'regenerate',
  armstrong: 'armstrong',
  cryoshaper: 'cryoshaper_focus',
  beckenbodenstuhl: 'beckenbodenstuhl',
};
