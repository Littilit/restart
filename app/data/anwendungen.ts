export type AnwendungSlug =
  | 'eisbox'
  | 'redlight'
  | 'infrarotsauna'
  | 'boa-lymphmassage'
  | 'armstrong'
  | 'beckenbodenstuhl'
  | 'cryoshaper';

export type AnwendungsKategorie = 'longevity' | 'bodyforming';

export interface Anwendung {
  slug: AnwendungSlug;
  name: string;
  kurzName: string;
  emoji: string;
  kategorie: AnwendungsKategorie;
  teaser: string;
  topWirkungen: string[];
  dauer: string;
}

export const ANWENDUNGEN: readonly Anwendung[] = [
  {
    slug: 'eisbox',
    name: 'Eisbox – Ganzkörperkryotherapie',
    kurzName: 'Eisbox',
    emoji: '❄️',
    kategorie: 'longevity',
    teaser: '2–3 Minuten bei bis zu −85 °C. Energie, Regeneration, klarer Kopf.',
    topWirkungen: ['Schnellere Muskel-Regeneration', 'Energie- und Stimmungslift', 'Entzündungs-Reduktion', 'Besserer Schlaf'],
    dauer: '2–3 Min',
  },
  {
    slug: 'redlight',
    name: 'Redlight – Photobiomodulation',
    kurzName: 'Redlight',
    emoji: '🟥',
    kategorie: 'longevity',
    teaser: 'Rotes und nah-infrarotes Licht für Zellenergie und Hautqualität.',
    topWirkungen: ['Mehr Zellenergie (ATP)', 'Bessere Hautqualität & Kollagen', 'Muskel- und Gelenk-Erholung', 'Stimmungsaufhellung'],
    dauer: '10–20 Min',
  },
  {
    slug: 'infrarotsauna',
    name: 'Infrarot-Sauna',
    kurzName: 'Infrarot',
    emoji: '🌡️',
    kategorie: 'longevity',
    teaser: 'Sanfte Tiefenwärme für Entspannung, Kreislauf und Muskeln.',
    topWirkungen: ['Tiefenentspannung & Stress-Abbau', 'Muskulatur lockert sich', 'Gefäßtraining & Durchblutung', 'Angenehm bei Verspannungen'],
    dauer: '30–45 Min',
  },
  {
    slug: 'boa-lymphmassage',
    name: 'BOA Lymphmassage',
    kurzName: 'BOA',
    emoji: '💆',
    kategorie: 'longevity',
    teaser: 'Maschinelle Druckwellenmassage für leichtere Beine und bessere Regeneration.',
    topWirkungen: ['Leichtere Beine', 'Weniger Wassereinlagerungen', 'Regeneration nach Sport', 'Anregung des Lymphflusses'],
    dauer: '30 Min',
  },
  {
    slug: 'armstrong',
    name: 'Armstrong – Magnetische Muskelstimulation',
    kurzName: 'Armstrong',
    emoji: '💪',
    kategorie: 'bodyforming',
    teaser: 'Bis zu 20.000 Muskelkontraktionen pro Session. Bauch, Beine, Po, Arme.',
    topWirkungen: ['Sichtbarer Muskelaufbau', 'Fettreduktion parallel zum Aufbau', 'Verbesserte Körperkontur', 'Stabilerer Rumpf'],
    dauer: '30 Min',
  },
  {
    slug: 'beckenbodenstuhl',
    name: 'Beckenbodenstuhl – MMS',
    kurzName: 'Beckenbodenstuhl',
    emoji: '🪑',
    kategorie: 'bodyforming',
    teaser: 'Elektromagnetisches Training des Beckenbodens — im Sitzen, voll bekleidet.',
    topWirkungen: ['Stärkere Beckenbodenmuskulatur', 'Weniger unfreiwilliger Urinverlust', 'Postpartum-Rückbildung', 'Besseres Körpergefühl'],
    dauer: '28 Min',
  },
  {
    slug: 'cryoshaper',
    name: 'Cryoshaper – Kryolipolyse',
    kurzName: 'Cryoshaper',
    emoji: '🧊',
    kategorie: 'bodyforming',
    teaser: 'Lokale Fettzellen-Reduktion durch kontrollierte Kälte.',
    topWirkungen: ['Reduktion lokaler Fettdepots', 'Gezielt an Problemzonen', 'Doppelkinn-Behandlung möglich', 'Keine Operation'],
    dauer: '60 Min',
  },
] as const;

export function getAnwendung(slug: AnwendungSlug): Anwendung {
  const found = ANWENDUNGEN.find((a) => a.slug === slug);
  if (!found) throw new Error(`Anwendung nicht gefunden: ${slug}`);
  return found;
}
