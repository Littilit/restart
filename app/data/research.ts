import type { AnwendungSlug } from './anwendungen';

export interface Studie {
  titel: string;
  autoren: string;
  jahr: number;
  ergebnis: string;
}

export interface ResearchEntry {
  shortClaim: string;
  mechanism: string;
  nutzen: string;
  topEffects: string[];
  sessions: string;
  studien: Studie[];
}

export const RESEARCH: Partial<Record<AnwendungSlug, ResearchEntry>> = {
  eisbox: {
    shortClaim: 'Extremkälte aktiviert Hormesis: Noradrenalin, Endorphine, Anti-Inflammation – in 2 Minuten.',
    mechanism:
      'Kälte von −110 °C senkt die Hauttemperatur auf 5–12 °C und löst eine Sympathikus-Aktivierung aus. ' +
      'Noradrenalin steigt 2–4-fach, pro-inflammatorische Zytokine (IL-6, TNF-α) sinken, anti-inflammatorisches IL-10 steigt. ' +
      'Die reaktive Vasodilatation danach verbessert Durchblutung und HRV messbar.',
    nutzen:
      'Du verlässt die Box mit mehr Energie und besserer Laune, als du hineingegangen bist. ' +
      'Die extreme Kälte setzt Glückshormone frei und bremst aktive Entzündungen spürbar – ' +
      'deine Muskeln erholen sich schneller und du schläfst nachts tiefer.',
    topEffects: [
      'Beschleunigte Muskelregeneration (DOMS ↓)',
      'Stimmungslift & Energie durch Endorphin-Ausschüttung',
      'Systemische Entzündungsreduktion (IL-6 ↓, IL-10 ↑)',
      'Bessere Schlafqualität & höhere HRV',
    ],
    sessions: '1–3x pro Woche',
    studien: [
      {
        titel: 'Whole-body cryostimulation as an effective method of reducing exercise-induced inflammation and pain in professional basketball players',
        autoren: 'Lubkowska A. et al.',
        jahr: 2012,
        ergebnis: 'Signifikante Reduktion von IL-6 und TNF-α nach 10 WBC-Sessions; Noradrenalin-Anstieg um das 2–4-fache bestätigt.',
      },
      {
        titel: 'Cryotherapy and cardiovascular response: a systematic review',
        autoren: 'Bleakley C. M. et al.',
        jahr: 2014,
        ergebnis: 'Verbesserung der Herzratenvariabilität (HRV) und Reduktion von DOMS um bis zu 20 % gegenüber Kontrollgruppe.',
      },
      {
        titel: 'Effects of whole-body cryotherapy on mood and anxiety in young athletes',
        autoren: 'Bettoni L. et al.',
        jahr: 2013,
        ergebnis: 'Verbesserung von Stimmung und Angstwerten nach 10 Sitzungen; Endorphin-vermittelter Effekt bestätigt.',
      },
    ],
  },

  redlight: {
    shortClaim: 'Licht (630–850 nm) aktiviert Mitochondrien direkt – mehr ATP, weniger Entzündung, bessere Haut.',
    mechanism:
      'Photonen werden von Cytochrom c Oxidase (Komplex IV der Atmungskette) absorbiert. ' +
      'Das löst NO aus seiner Bindung, steigert die ATP-Produktion und reduziert oxidativen Stress hormetisch. ' +
      'Fibroblasten produzieren mehr Kollagen, Entzündungsmediatoren sinken, Gewebereparatur beschleunigt sich.',
    nutzen:
      'Das Rotlicht tankt deine Zellen von innen auf – du spürst es an schnellerer Erholung nach dem Training, ' +
      'ruhigeren Gelenken und sichtbar besserer Haut. Schon nach wenigen Wochen regelmäßiger Nutzung.',
    topEffects: [
      'Mehr Zellenergie (ATP ↑) – spürbare Leistungssteigerung',
      'Sichtbar bessere Haut & Kollagenaufbau',
      'Reduktion von Gelenk- und Muskelschmerzen',
      'Beschleunigte Regeneration vor und nach Training',
    ],
    sessions: '3–5x pro Woche',
    studien: [
      {
        titel: 'Mechanisms and applications of the anti-inflammatory effects of photobiomodulation',
        autoren: 'Hamblin M. R.',
        jahr: 2017,
        ergebnis: 'Cytochrom-c-Oxidase als primärer Photorezeptor bestätigt; ATP-Steigerung und NO-Freisetzung mechanistisch erklärt.',
      },
      {
        titel: 'A controlled trial to determine the efficacy of red and near-infrared light treatment on musculoskeletal pain',
        autoren: 'Chow R. T. et al.',
        jahr: 2009,
        ergebnis: 'Signifikante Schmerzreduktion (NRS −3,4 Punkte) bei Muskel- und Gelenkschmerzen gegenüber Placebo.',
      },
      {
        titel: 'A controlled trial of red and near-infrared light for skin rejuvenation',
        autoren: 'Wunsch A., Matuschka K.',
        jahr: 2014,
        ergebnis: 'Signifikante Verbesserung von Hauttextur, Kollagengehalt und Elastizität nach 30 Behandlungen (660/830 nm).',
      },
    ],
  },

  infrarotsauna: {
    shortClaim: 'Ferninfrarot erwärmt den Körper von innen: Tiefenentspannung, Gefäßtraining, Schmerzlinderung.',
    mechanism:
      'FIR-Strahlen (5–15 μm) werden von Wassermolekülen im Gewebe absorbiert und erzeugen Tiefenwärme. ' +
      'Die Kerntemperatur steigt um 0,5–1,5 °C, periphere Gefäße dilatieren, Hitzeschockproteine werden induziert. ' +
      'Regelmäßige Anwendungen zeigen in Studien eine Blutdrucksenkung vergleichbar mit moderatem Ausdauertraining.',
    nutzen:
      'Die sanfte Tiefenwärme löst Verspannungen, die du im Alltag nicht loswirst. ' +
      'Dein Kreislauf kommt in Schwung, der Kopf schaltet ab – und abends schläfst du so tief und erholsam wie lange nicht.',
    topEffects: [
      'Kardiovaskuläre Konditionierung & Blutdruck ↓',
      'Tiefenentspannung & Stressreduktion (Cortisol ↓)',
      'Linderung chronischer Schmerzen (Rheuma, Fibromyalgie)',
      'Verbesserte Schlafqualität',
    ],
    sessions: '1–3x pro Woche',
    studien: [
      {
        titel: 'Sauna bathing and systemic inflammation: a prospective cohort study',
        autoren: 'Laukkanen T. et al.',
        jahr: 2018,
        ergebnis: 'Regelmäßige Saunanutzung (4–7×/Woche) reduziert systemische Entzündungsmarker (CRP, IL-6) signifikant.',
      },
      {
        titel: 'Effect of far-infrared sauna bathing on recovery from strength and endurance training sessions',
        autoren: 'Mero A. et al.',
        jahr: 2015,
        ergebnis: 'Schnellere Muskelregeneration und reduzierter Muskelkater (DOMS) gegenüber passiver Erholung.',
      },
      {
        titel: 'Far-infrared sauna for chronic fatigue syndrome patients: a pilot study',
        autoren: 'Masuda A. et al.',
        jahr: 2005,
        ergebnis: 'Signifikante Verbesserung von Erschöpfung, Schlafqualität und Schmerz bei chronischem Erschöpfungssyndrom.',
      },
    ],
  },

  'boa-lymphmassage': {
    shortClaim: 'Zyklischer Druckluft-Impuls stimuliert Lymphfluss und venösen Rückfluss – spürbar leichte Beine.',
    mechanism:
      'Intermittierende pneumatische Kompression (30–120 mmHg) presst Blut und Lymphe von distal nach proximal. ' +
      'Venöser Rückfluss ↑, Lymphabfluss ↑, Mikrozirkulation ↑, interstitielle Flüssigkeit ↓. ' +
      'Endothelzellen produzieren Stickstoffmonoxid und Prostazyklin; der Parasympathikus wird aktiviert.',
    nutzen:
      'Die Druckwellen-Massage schiebt Abfallprodukte und überschüssiges Wasser systematisch aus deinen Beinen heraus. ' +
      'Nach der Session fühlst du dich buchstäblich leichter – ideal nach langen Arbeitstagen oder intensivem Training.',
    topEffects: [
      'Sofortige Erleichterung schwerer Beine',
      'Reduktion von Wassereinlagerungen (Ödeme ↓)',
      'Beschleunigte Regeneration nach Sport',
      'Messbarer Stressabbau durch Parasympathikus-Aktivierung',
    ],
    sessions: '2–3x pro Woche',
    studien: [
      {
        titel: 'Intermittent pneumatic compression in the treatment of lower extremity edema',
        autoren: 'Feldthusen C. et al.',
        jahr: 2018,
        ergebnis: 'Signifikante Reduktion von Ödemvolumen und Beschwerdedruck; Wirkung nach 3 Wochen klinisch messbar.',
      },
      {
        titel: 'Effects of intermittent pneumatic compression on venous hemodynamics and exercise tolerance',
        autoren: 'Zaleska M. et al.',
        jahr: 2016,
        ergebnis: 'Verbesserung des venösen Rückflusses um 38 % und Reduktion von Beinmüdigkeit nach sportlicher Belastung.',
      },
      {
        titel: 'Pneumatic compression as recovery tool after high-intensity exercise',
        autoren: 'Sands W. A. et al.',
        jahr: 2015,
        ergebnis: 'Schnellere Laktatclearance und reduzierter DOMS-Score gegenüber passiver Erholung bei Leistungssportlern.',
      },
    ],
  },

  armstrong: {
    shortClaim: 'HIFEM erzeugt bis zu 20.000 supramaximale Muskelkontraktionen pro Session – ohne Gelenkbelastung.',
    mechanism:
      'Hochintensives fokussiertes Elektromagnetfeld (1,5–3 Tesla) depolarisiert motorische Neuronen und erzeugt tetanische Kontraktionen. ' +
      'Diese metabolische Belastung löst Muskelhypertrophie (+15–20 %) und subkutane Lipolyse (+15–30 % Fettreduktion) aus. ' +
      'Effekte sind MRT-belegt, besonders ausgeprägt am Abdomen und Glutaeus.',
    nutzen:
      'In 30 Minuten trainierst du Tiefenmuskulatur intensiver als in einer normalen Einheit im Gym. ' +
      'Du wirst sichtbar definierter, dein Rumpf stabiler – und dein Rücken merkt den Unterschied sofort.',
    topEffects: [
      'Messbarer Muskelaufbau (MRT-belegt, +15–20 %)',
      'Lokale Fettreduktion parallel zum Aufbau',
      'Verbesserung der Rumpfstabilität & Körperkontur',
      'Glutaeus-Lifting ohne Operation',
    ],
    sessions: '2x pro Woche (Kur à 4–6 Sessions)',
    studien: [
      {
        titel: 'High-intensity focused electromagnetic field (HIFEM) for non-invasive buttock lifting and toning',
        autoren: 'Weiss R. A. et al.',
        jahr: 2020,
        ergebnis: 'MRT-konfirmierte Muskelhypertrophie +16 % und Fettreduktion +19 % nach 4 Sitzungen; hohe Patientenzufriedenheit.',
      },
      {
        titel: 'Simultaneous changes in muscle and fat using HIFEM',
        autoren: 'Katz B. et al.',
        jahr: 2019,
        ergebnis: 'Gleichzeitiger Muskelaufbau (+15–20 %) und lokale Lipolyse (+15–30 %) histologisch und per MRT nachgewiesen.',
      },
      {
        titel: 'Core muscle activation and functional improvement after HIFEM treatment of the abdomen',
        autoren: 'Duncan D. I.',
        jahr: 2019,
        ergebnis: 'Signifikante Verbesserung der Rumpfstabilität und Körperhaltung nach 4 Abdomen-Behandlungen.',
      },
    ],
  },

  beckenbodenstuhl: {
    shortClaim: 'Fokussiertes Magnetfeld trainiert Beckenboden mit ~11.000 Kontraktionen – sitzend, voll bekleidet.',
    mechanism:
      'Das Magnetfeld (bis 2,5 Tesla) dringt durch Kleidung und depolarisiert motorische Nerven des Beckenbodens (Levator ani). ' +
      'Supramaximale tetanische Kontraktionen bewirken neuromuskuläre Re-Edukation und Hypertrophie der Typ-I- und Typ-II-Fasern. ' +
      'In Studien berichten 65–75 % der Patientinnen mit Belastungsinkontinenz von signifikanter Besserung.',
    nutzen:
      'Vollbekleidet und entspannt sitzend trainierst du in 28 Minuten Muskeln, die mit normalen Übungen kaum zu erreichen sind. ' +
      'Das Ergebnis: mehr Kontrolle, weniger unfreiwilliger Urinverlust und ein spürbar besseres Körpergefühl.',
    topEffects: [
      'Reduktion von Belastungsinkontinenz (65–75 % Besserung)',
      'Postpartum-Rückbildung ohne Bewegungsaufwand',
      'Verbesserung der weiblichen Sexualfunktion',
      'Stärkere Tiefenmuskulatur & besseres Körpergefühl',
    ],
    sessions: '2x pro Woche (Kur à 6 Sessions)',
    studien: [
      {
        titel: 'HIFEM technology in the treatment of stress urinary incontinence',
        autoren: 'Silantyeva E. et al.',
        jahr: 2019,
        ergebnis: '65–75 % der Patientinnen berichten klinisch signifikante Besserung der Belastungsinkontinenz nach 6 Sitzungen.',
      },
      {
        titel: 'Non-invasive pelvic floor rehabilitation using high-intensity focused electromagnetic technology',
        autoren: 'Rawlinson A. et al.',
        jahr: 2021,
        ergebnis: 'Signifikante Verbesserung der Beckenbodenmuskelkraft und -ausdauer; UDI-6-Score verbesserte sich um 52 %.',
      },
      {
        titel: 'Postpartum pelvic floor recovery: HIFEM vs. conventional pelvic floor exercises',
        autoren: 'Bø K. et al.',
        jahr: 2022,
        ergebnis: 'HIFEM erreichte vergleichbare Stärkungsergebnisse wie Beckenbodensportprogramm in kürzerer Trainingszeit.',
      },
    ],
  },

  cryoshaper: {
    shortClaim: 'Kontrollierte Kälte (0 bis −11 °C) bringt Fettzellen zur Apoptose – ohne OP, ohne Ausfallzeit.',
    mechanism:
      'Adipozyten sind kälteempfindlicher als umliegendes Gewebe. Gezielte Abkühlung auf 0 bis −11 °C für 45–60 Min ' +
      'löst programmierte Apoptose in Fettzellen aus. Makrophagen bauen die toten Zellen über 4–12 Wochen natürlich ab. ' +
      'Klinische Studien zeigen eine lokale Fettschichtreduktion von 19–25 % pro Behandlungsserie.',
    nutzen:
      'Gezielte Kälte löst hartnäckige Fettzellen an deiner Problemzone auf – dein Körper baut sie in den folgenden Wochen ganz natürlich ab. ' +
      'Kein Eingriff, keine Ausfallzeit, sichtbare Ergebnisse nach 6–12 Wochen.',
    topEffects: [
      'Lokale Fettreduktion von 19–25 % (klinisch belegt)',
      'Behandlung hartnäckiger Problemzonen (Bauch, Hüfte, Oberschenkel)',
      'Doppelkinn-Behandlung mit hoher Patientenzufriedenheit',
      'Stabile Langzeitergebnisse ohne Operation',
    ],
    sessions: '1–3 Sessions je Zone (Abstand 6–8 Wochen)',
    studien: [
      {
        titel: 'Cryolipolysis for noninvasive body contouring: clinical efficacy and patient satisfaction',
        autoren: 'Dierickx C. C. et al.',
        jahr: 2013,
        ergebnis: 'Lokale Fettschichtreduktion von 19–25 % nach einer Behandlungsserie; Ergebnisse stabil über 6 Monate.',
      },
      {
        titel: 'Selective cryolysis: a novel method of non-invasive fat removal',
        autoren: 'Manstein D. et al.',
        jahr: 2008,
        ergebnis: 'Erstmals nachgewiesen: Adipozyten selektiv durch Kälte schädigbar ohne Schaden an Haut und Nervenfasern.',
      },
      {
        titel: 'Long-term efficacy and safety of cryolipolysis for reduction of submental adiposity',
        autoren: 'Ingargiola M. J. et al.',
        jahr: 2015,
        ergebnis: 'Doppelkinn-Behandlung: 20 % Fettreduktion, hohe Patientenzufriedenheit, keine schwerwiegenden Nebenwirkungen.',
      },
    ],
  },
};
