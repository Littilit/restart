import type { MainFocus, EmpfehlungEntry } from './types';
import type { AnwendungSlug } from '@/data/anwendungen';

type Chamber = Record<string, string>;

function empfehleForFocus(focus: MainFocus, chamber: Chamber): AnwendungSlug[] {
  switch (focus) {
    case 'schmerzen': {
      const loc = chamber['location'] ?? '';
      if (loc.includes('gelenke') || loc.includes('knie') || loc.includes('huefte')) {
        return ['redlight', 'eisbox', 'infrarotsauna'];
      }
      return ['redlight', 'eisbox', 'infrarotsauna'];
    }
    case 'sport': {
      const ziel = chamber['ziel'] ?? '';
      if (ziel === 'leistung') return ['eisbox', 'redlight', 'armstrong'];
      return ['eisbox', 'redlight', 'boa-lymphmassage'];
    }
    case 'vitalitaet': {
      const wunsch = chamber['wunsch'] ?? '';
      if (wunsch === 'schlaf') return ['eisbox', 'infrarotsauna', 'redlight'];
      if (wunsch === 'stress') return ['infrarotsauna', 'boa-lymphmassage', 'redlight'];
      if (wunsch === 'klarheit') return ['eisbox', 'redlight', 'infrarotsauna'];
      return ['eisbox', 'redlight', 'boa-lymphmassage'];
    }
    case 'bodyforming': {
      const ziel = chamber['ziel'] ?? '';
      if (ziel === 'fettabbau') return ['cryoshaper', 'armstrong'];
      if (ziel === 'muskelaufbau') return ['armstrong', 'cryoshaper'];
      if (ziel === 'straff') return ['redlight', 'armstrong'];
      return ['armstrong', 'cryoshaper'];
    }
    case 'beckenboden':
      return ['beckenbodenstuhl'];
    case 'biohacking': {
      const fokus = chamber['fokus'] ?? '';
      if (fokus === 'performance') return ['eisbox', 'redlight', 'armstrong'];
      if (fokus === 'recovery') return ['eisbox', 'boa-lymphmassage', 'infrarotsauna'];
      return ['eisbox', 'redlight', 'infrarotsauna'];
    }
  }
}

const SESSIONS: Partial<Record<AnwendungSlug, string>> = {
  eisbox: '2–3x pro Woche',
  redlight: '3–5x pro Woche',
  infrarotsauna: '1–3x pro Woche',
  'boa-lymphmassage': '2–3x pro Woche',
  armstrong: '2x pro Woche (Kur)',
  beckenbodenstuhl: '2x pro Woche (6 Sessions Kur)',
  cryoshaper: '1–3 Sessions je Zone',
};

const EXPLANATIONS: Record<string, Partial<Record<AnwendungSlug, string>>> = {
  schmerzen: {
    eisbox: 'Kälte blockiert Schmerzsignale und wirkt entzündungshemmend – sofortige Linderung durch Noradrenalin-Ausschüttung.',
    redlight: 'Photobiomodulation stimuliert die Zellenergie und reduziert chronische Entzündungen im Gewebe.',
    infrarotsauna: 'Tiefenwärme löst Verspannungen, verbessert die Durchblutung und lindert Schmerzen auf natürliche Weise.',
  },
  sport: {
    eisbox: 'Kryotherapie nach dem Training beschleunigt die Muskelregeneration messbar – belegt in Leistungssportstudien.',
    redlight: 'Photobiomodulation vor dem Training verbessert die Kraftausdauer, danach beschleunigt sie die Regeneration.',
    'boa-lymphmassage': 'Druckwellenmassage transportiert Stoffwechselprodukte ab und beschleunigt die Erholung nach intensiver Belastung.',
    armstrong: 'HIFEM-Technologie steigert die Muskelkraft messbar ohne Gelenkbelastung – ideal als Ergänzung zum Training.',
  },
  vitalitaet: {
    eisbox: 'Der Kältereiz aktiviert das Hormonsystem: Adrenalin, Noradrenalin und Endorphine sorgen für anhaltende Energie.',
    redlight: 'Lichtwellen aktivieren die Mitochondrien direkt – die Zellen produzieren mehr ATP, dein Akku wird voller.',
    infrarotsauna: 'Abendliche Infrarot-Sessions senken die Körpertemperatur nach dem Aufwärmen – das natürlichste Einschlafsignal.',
    'boa-lymphmassage': 'Lymphdrainage aktiviert den Parasympathikus – du wechselst aus dem Stress-Modus in echte Entspannung.',
  },
  bodyforming: {
    armstrong: 'HIFEM erzeugt bis zu 20.000 Muskelkontraktionen pro Session – mehr als im normalen Training je möglich wäre.',
    cryoshaper: 'Kryolipolyse bringt Fettzellen in Problemzonen gezielt zum Absterben – der Körper baut sie über Wochen ab.',
    redlight: 'Photobiomodulation unterstützt die Kollagenproduktion und strafft das Gewebe sichtbar nach mehreren Sessions.',
  },
  beckenboden: {
    beckenbodenstuhl: 'Das fokussierte Magnetfeld trainiert die Beckenbodenmuskulatur mit bis zu 11.000 Kontraktionen pro Session – voll bekleidet im Sitzen.',
  },
  biohacking: {
    eisbox: 'Ganzkörperkryotherapie ist das effektivste Tool für kardiovaskuläre Konditionierung, Entzündungsreduktion und HRV-Verbesserung.',
    redlight: 'Photobiomodulation moduliert die Mitochondrienfunktion – zentraler Mechanismus in aktuellen Longevity-Protokollen.',
    infrarotsauna: 'Regelmäßige Infrarot-Sessions sind mit signifikanter Reduktion kardiovaskulärer Risikofaktoren assoziiert.',
    'boa-lymphmassage': 'Lymphdrainage als Recovery-Tool reduziert systemische Entzündungsmarker messbar.',
  },
};

export function computeEmpfehlungen(
  mainFocus: MainFocus | null,
  chamber2: Chamber,
  mainFocus2: MainFocus | null,
  chamber2b: Chamber,
): EmpfehlungEntry[] {
  if (!mainFocus) return [];

  const slugs1 = empfehleForFocus(mainFocus, chamber2);
  const slugs2 = mainFocus2 ? empfehleForFocus(mainFocus2, chamber2b) : [];

  const merged: AnwendungSlug[] = [];
  for (const slug of [...slugs1, ...slugs2]) {
    if (!merged.includes(slug)) merged.push(slug);
    if (merged.length >= 3) break;
  }

  const explanationsForFocus = EXPLANATIONS[mainFocus] ?? {};

  return merged.map((slug) => ({
    slug,
    sessions: SESSIONS[slug] ?? '1–2x pro Woche',
    explanation: explanationsForFocus[slug] ?? EXPLANATIONS[mainFocus2 ?? mainFocus]?.[slug] ?? '',
  }));
}
