import type { AnwendungSlug } from './anwendungen';

export interface ResearchEntry {
  shortClaim: string;
  mechanism: string;
  topEffects: string[];
  sessions: string;
}

export const RESEARCH: Partial<Record<AnwendungSlug, ResearchEntry>> = {
  eisbox: {
    shortClaim: 'Extremkälte aktiviert Hormesis: Noradrenalin, Endorphine, Anti-Inflammation – in 2 Minuten.',
    mechanism:
      'Kälte von −110 °C senkt die Hauttemperatur auf 5–12 °C und löst eine Sympathikus-Aktivierung aus. ' +
      'Noradrenalin steigt 2–4-fach, pro-inflammatorische Zytokine (IL-6, TNF-α) sinken, anti-inflammatorisches IL-10 steigt. ' +
      'Die reaktive Vasodilatation danach verbessert Durchblutung und HRV messbar.',
    topEffects: [
      'Beschleunigte Muskelregeneration (DOMS ↓)',
      'Stimmungslift & Energie durch Endorphin-Ausschüttung',
      'Systemische Entzündungsreduktion (IL-6 ↓, IL-10 ↑)',
      'Bessere Schlafqualität & höhere HRV',
    ],
    sessions: '1–3x pro Woche',
  },

  redlight: {
    shortClaim: 'Licht (630–850 nm) aktiviert Mitochondrien direkt – mehr ATP, weniger Entzündung, bessere Haut.',
    mechanism:
      'Photonen werden von Cytochrom c Oxidase (Komplex IV der Atmungskette) absorbiert. ' +
      'Das löst NO aus seiner Bindung, steigert die ATP-Produktion und reduziert oxidativen Stress hormetisch. ' +
      'Fibroblasten produzieren mehr Kollagen, Entzündungsmediatoren sinken, Gewebereparatur beschleunigt sich.',
    topEffects: [
      'Mehr Zellenergie (ATP ↑) – spürbare Leistungssteigerung',
      'Sichtbar bessere Haut & Kollagenaufbau',
      'Reduktion von Gelenk- und Muskelschmerzen',
      'Beschleunigte Regeneration vor und nach Training',
    ],
    sessions: '3–5x pro Woche',
  },

  infrarotsauna: {
    shortClaim: 'Ferninfrarot erwärmt den Körper von innen: Tiefenentspannung, Gefäßtraining, Schmerzlinderung.',
    mechanism:
      'FIR-Strahlen (5–15 μm) werden von Wassermolekülen im Gewebe absorbiert und erzeugen Tiefenwärme. ' +
      'Die Kerntemperatur steigt um 0,5–1,5 °C, periphere Gefäße dilatieren, Hitzeschockproteine werden induziert. ' +
      'Regelmäßige Anwendungen zeigen in Studien eine Blutdrucksenkung vergleichbar mit moderatem Ausdauertraining.',
    topEffects: [
      'Kardiovaskuläre Konditionierung & Blutdruck ↓',
      'Tiefenentspannung & Stressreduktion (Cortisol ↓)',
      'Linderung chronischer Schmerzen (Rheuma, Fibromyalgie)',
      'Verbesserte Schlafqualität',
    ],
    sessions: '1–3x pro Woche',
  },

  'boa-lymphmassage': {
    shortClaim: 'Zyklischer Druckluft-Impuls stimuliert Lymphfluss und venösen Rückfluss – spürbar leichte Beine.',
    mechanism:
      'Intermittierende pneumatische Kompression (30–120 mmHg) presst Blut und Lymphe von distal nach proximal. ' +
      'Venöser Rückfluss ↑, Lymphabfluss ↑, Mikrozirkulation ↑, interstitielle Flüssigkeit ↓. ' +
      'Endothelzellen produzieren Stickstoffmonoxid und Prostazyklin; der Parasympathikus wird aktiviert.',
    topEffects: [
      'Sofortige Erleichterung schwerer Beine',
      'Reduktion von Wassereinlagerungen (Ödeme ↓)',
      'Beschleunigte Regeneration nach Sport',
      'Messbarer Stressabbau durch Parasympathikus-Aktivierung',
    ],
    sessions: '2–3x pro Woche',
  },

  armstrong: {
    shortClaim: 'HIFEM erzeugt bis zu 20.000 supramaximale Muskelkontraktionen pro Session – ohne Gelenkbelastung.',
    mechanism:
      'Hochintensives fokussiertes Elektromagnetfeld (1,5–3 Tesla) depolarisiert motorische Neuronen und erzeugt tetanische Kontraktionen. ' +
      'Diese metabolische Belastung löst Muskelhypertrophie (+15–20 %) und subkutane Lipolyse (+15–30 % Fettreduktion) aus. ' +
      'Effekte sind MRT-belegt, besonders ausgeprägt am Abdomen und Glutaeus.',
    topEffects: [
      'Messbarer Muskelaufbau (MRT-belegt, +15–20 %)',
      'Lokale Fettreduktion parallel zum Aufbau',
      'Verbesserung der Rumpfstabilität & Körperkontur',
      'Glutaeus-Lifting ohne Operation',
    ],
    sessions: '2x pro Woche (Kur à 4–6 Sessions)',
  },

  beckenbodenstuhl: {
    shortClaim: 'Fokussiertes Magnetfeld trainiert Beckenboden mit ~11.000 Kontraktionen – sitzend, voll bekleidet.',
    mechanism:
      'Das Magnetfeld (bis 2,5 Tesla) dringt durch Kleidung und depolarisiert motorische Nerven des Beckenbodens (Levator ani). ' +
      'Supramaximale tetanische Kontraktionen bewirken neuromuskuläre Re-Edukation und Hypertrophie der Typ-I- und Typ-II-Fasern. ' +
      'In Studien berichten 65–75 % der Patientinnen mit Belastungsinkontinenz von signifikanter Besserung.',
    topEffects: [
      'Reduktion von Belastungsinkontinenz (65–75 % Besserung)',
      'Postpartum-Rückbildung ohne Bewegungsaufwand',
      'Verbesserung der weiblichen Sexualfunktion',
      'Stärkere Tiefenmuskulatur & besseres Körpergefühl',
    ],
    sessions: '2x pro Woche (Kur à 6 Sessions)',
  },

  cryoshaper: {
    shortClaim: 'Kontrollierte Kälte (0 bis −11 °C) bringt Fettzellen zur Apoptose – ohne OP, ohne Ausfallzeit.',
    mechanism:
      'Adipozyten sind kälteempfindlicher als umliegendes Gewebe. Gezielte Abkühlung auf 0 bis −11 °C für 45–60 Min ' +
      'löst programmierte Apoptose in Fettzellen aus. Makrophagen bauen die toten Zellen über 4–12 Wochen natürlich ab. ' +
      'Klinische Studien zeigen eine lokale Fettschichtreduktion von 19–25 % pro Behandlungsserie.',
    topEffects: [
      'Lokale Fettreduktion von 19–25 % (klinisch belegt)',
      'Behandlung hartnäckiger Problemzonen (Bauch, Hüfte, Oberschenkel)',
      'Doppelkinn-Behandlung mit hoher Patientenzufriedenheit',
      'Stabile Langzeitergebnisse ohne Operation',
    ],
    sessions: '1–3 Sessions je Zone (Abstand 6–8 Wochen)',
  },
};
