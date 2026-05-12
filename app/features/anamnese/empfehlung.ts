import type { MainFocus, EmpfehlungEntry } from './types';
import type { AnwendungSlug } from '@/data/anwendungen';

type Chamber = Record<string, string>;

// ---------------------------------------------------------------------------
// Empfehlungs-Logik
// ---------------------------------------------------------------------------

function empfehleForFocus(focus: MainFocus, chamber: Chamber): AnwendungSlug[] {
  switch (focus) {
    case 'schmerzen': {
      const loc = chamber['location'] ?? '';
      const dauer = chamber['dauer'] ?? '';

      if (loc.includes('ruecken')) {
        if (dauer === 'chronisch' || dauer === 'lang') {
          return ['infrarotsauna', 'armstrong', 'beckenbodenstuhl'];
        }
        return ['eisbox', 'infrarotsauna', 'armstrong'];
      }
      if (
        (loc.includes('gelenke') || loc.includes('knie') || loc.includes('huefte')) &&
        (dauer === 'chronisch' || dauer === 'lang')
      ) {
        return ['redlight', 'infrarotsauna', 'eisbox'];
      }
      if (dauer === 'akut' || loc.includes('muskeln')) {
        return ['eisbox', 'redlight', 'infrarotsauna'];
      }
      return ['redlight', 'eisbox', 'infrarotsauna'];
    }

    case 'sport': {
      const ziel = chamber['ziel'] ?? '';
      const sportart = chamber['sportart'] ?? '';

      if (ziel === 'leistung') {
        if (sportart.includes('kraft')) return ['eisbox', 'armstrong', 'redlight'];
        return ['eisbox', 'redlight', 'armstrong'];
      }
      if (ziel === 'praevention') return ['redlight', 'eisbox', 'boa-lymphmassage'];
      if (sportart.includes('kraft')) return ['eisbox', 'armstrong', 'boa-lymphmassage'];
      if (sportart.includes('ausdauer')) return ['eisbox', 'boa-lymphmassage', 'redlight'];
      if (sportart.includes('yoga')) return ['infrarotsauna', 'eisbox', 'redlight'];
      return ['eisbox', 'redlight', 'boa-lymphmassage'];
    }

    case 'vitalitaet': {
      const wunsch = chamber['wunsch'] ?? '';
      const raeube = chamber['raeube'] ?? '';

      if (wunsch === 'energie') {
        if (raeube.includes('schlaf')) return ['infrarotsauna', 'eisbox', 'redlight'];
        if (raeube.includes('bewegung')) return ['eisbox', 'boa-lymphmassage', 'redlight'];
        return ['eisbox', 'redlight', 'boa-lymphmassage'];
      }
      if (wunsch === 'schlaf') return ['eisbox', 'infrarotsauna', 'redlight'];
      if (wunsch === 'stress') return ['infrarotsauna', 'boa-lymphmassage', 'redlight'];
      if (wunsch === 'klarheit') return ['eisbox', 'redlight', 'infrarotsauna'];
      return ['eisbox', 'redlight', 'boa-lymphmassage'];
    }

    case 'bodyforming': {
      const ziel = chamber['ziel'] ?? '';
      const zone = chamber['zone'] ?? '';

      if (ziel === 'fettabbau') {
        if (
          zone.includes('arme') &&
          !zone.includes('bauch') &&
          !zone.includes('oberschenkel') &&
          !zone.includes('huefte') &&
          !zone.includes('doppelkinn')
        ) {
          return ['armstrong', 'cryoshaper'];
        }
        return ['cryoshaper', 'armstrong'];
      }
      if (ziel === 'muskelaufbau') return ['armstrong', 'cryoshaper'];
      if (ziel === 'straff') return ['redlight', 'armstrong'];
      if (ziel === 'kontur') {
        const zoneCount = zone.split(',').filter(Boolean).length;
        if (zoneCount >= 2 || zone.includes('doppelkinn')) return ['cryoshaper', 'armstrong'];
        return ['armstrong', 'cryoshaper'];
      }
      return ['armstrong', 'cryoshaper'];
    }

    case 'beckenboden':
      return ['beckenbodenstuhl'];

    case 'biohacking': {
      const fokus = chamber['fokus'] ?? '';

      if (fokus === 'performance') return ['eisbox', 'redlight', 'armstrong'];
      if (fokus === 'recovery') return ['eisbox', 'boa-lymphmassage', 'infrarotsauna'];
      if (fokus === 'immunsystem') return ['infrarotsauna', 'redlight', 'eisbox'];
      return ['eisbox', 'infrarotsauna', 'redlight'];
    }
  }
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

const SESSIONS: Partial<Record<AnwendungSlug, string>> = {
  eisbox: '1–2x pro Woche',
  redlight: '1–2x pro Woche',
  infrarotsauna: '1x pro Woche',
  'boa-lymphmassage': '1–2x pro Woche',
  armstrong: '2x pro Woche (Kur)',
  beckenbodenstuhl: '2x pro Woche (6 Sessions Kur)',
  cryoshaper: '5–10 Sessions je Zone',
};

function getCryoshaperSessions(chamber2: Chamber, chamber2b: Chamber): string {
  const zone = (chamber2['zone'] ?? '') + (chamber2b['zone'] ?? '');
  const isAbdomen = zone.includes('bauch') || zone.includes('doppelkinn');
  const isBody = zone.includes('oberschenkel') || zone.includes('huefte') || zone.includes('po');
  if (isAbdomen && !isBody) return '10 Sessions je Zone';
  if (isBody && !isAbdomen) return 'ca. 5 Sessions je Zone';
  return '5–10 Sessions je Zone';
}

// ---------------------------------------------------------------------------
// Lesbare Kundenantwort-Labels
// ---------------------------------------------------------------------------

const LOCATION_TEXT: Record<string, string> = {
  ruecken: 'Rücken / Nacken',
  gelenke: 'Gelenke',
  knie: 'Knie',
  huefte: 'Hüfte',
  muskeln: 'Muskeln',
  kopf: 'Kopfschmerzen',
  'ganzkörper': 'Ganzkörper',
  sonstiges: 'sonstige Bereiche',
};

const DAUER_SCHMERZ_TEXT: Record<string, string> = {
  akut: 'akut (unter 2 Wochen)',
  kurz: 'seit 2–6 Wochen',
  lang: 'seit 2–6 Monaten',
  chronisch: 'seit über 6 Monaten',
};

const SPORTART_TEXT: Record<string, string> = {
  kraft: 'Kraft / Gym',
  ausdauer: 'Ausdauer / Laufen',
  ballsport: 'Ballsport',
  kampfsport: 'Kampfsport',
  yoga: 'Yoga / Pilates',
  functional: 'Functional Training',
  sonstiges: 'sonstigen Sport',
};

const ZIEL_SPORT_TEXT: Record<string, string> = {
  regeneration: 'schnellere Regeneration',
  leistung: 'mehr Leistung',
  praevention: 'Verletzungsprävention',
  wohlbefinden: 'allgemeines Wohlbefinden',
};

const WUNSCH_TEXT: Record<string, string> = {
  energie: 'mehr Energie & Antrieb',
  schlaf: 'besseren Schlaf',
  stress: 'weniger Stress',
  klarheit: 'mentale Klarheit & Fokus',
};

const RAEUBE_TEXT: Record<string, string> = {
  arbeit: 'Stress bei der Arbeit',
  schlaf: 'schlechter Schlaf',
  schmerzen: 'körperliche Schmerzen',
  bewegung: 'zu wenig Bewegung',
  ernaehrung: 'unausgewogene Ernährung',
  familie: 'familiäre Belastung',
};

const ZIEL_BODY_TEXT: Record<string, string> = {
  fettabbau: 'lokalen Fettabbau',
  muskelaufbau: 'Muskelaufbau & Definierung',
  straff: 'Straffung & verbessertes Hautbild',
  kontur: 'bessere Körperkontur',
};

const ZONE_TEXT: Record<string, string> = {
  bauch: 'Bauch',
  po: 'Po',
  oberschenkel: 'Oberschenkel',
  huefte: 'Hüfte / Love Handles',
  arme: 'Arme',
  ruecken: 'Rücken',
  doppelkinn: 'Doppelkinn',
};

const THEMA_TEXT: Record<string, string> = {
  inkontinenz: 'Belastungsinkontinenz (beim Niesen, Husten oder Sport)',
  drang: 'Dranginkontinenz (das Halten fällt schwer)',
  postpartum: 'Rückbildung nach der Schwangerschaft',
  'schwäche': 'allgemeine Beckenbodenschwäche',
  praevention: 'Prävention & Vorsorge',
};

const DAUER_BECK_TEXT: Record<string, string> = {
  kurz: 'wenigen Wochen',
  mittel: 'einigen Monaten',
  lang: 'mehr als einem Jahr',
  praventiv: 'noch nicht – präventiv',
};

const FOKUS_TEXT: Record<string, string> = {
  longevity: 'Langlebigkeit & Prävention',
  performance: 'Peak Performance',
  recovery: 'optimale Erholung',
  immunsystem: 'Immunsystem stärken',
};

const PROTOKOLL_TEXT: Record<string, string> = {
  kalt: 'Kältetherapie',
  sauna: 'Sauna / Wärme',
  licht: 'Lichttherapie',
  ernaehrung: 'spezielle Ernährung',
  sport: 'gezieltes Training',
};

function joinList(raw: string, map: Record<string, string>): string {
  const items = raw.split(',').filter(Boolean).map((id) => map[id] ?? id);
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' und ' + items[items.length - 1];
}

// ---------------------------------------------------------------------------
// Antwortbezogene Begründungen
// ---------------------------------------------------------------------------

function generateExplanation(
  slug: AnwendungSlug,
  focus: MainFocus,
  chamber: Chamber,
): string {
  switch (focus) {
    case 'schmerzen':
      return schmerzenExplanation(slug, chamber);
    case 'sport':
      return sportExplanation(slug, chamber);
    case 'vitalitaet':
      return vitalitaetExplanation(slug, chamber);
    case 'bodyforming':
      return bodyformingExplanation(slug, chamber);
    case 'beckenboden':
      return beckenbodenExplanation(slug, chamber);
    case 'biohacking':
      return biohackingExplanation(slug, chamber);
  }
}

function schmerzenExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const loc = chamber['location'] ?? '';
  const dauer = chamber['dauer'] ?? '';
  const isChronisch = dauer === 'chronisch' || dauer === 'lang';
  const isAkut = dauer === 'akut' || dauer === 'kurz';

  const locLabel = joinList(loc, LOCATION_TEXT);
  const dauerLabel = DAUER_SCHMERZ_TEXT[dauer] ?? '';
  const locRef = locLabel ? `Beschwerden an ${locLabel}` : 'Beschwerden';
  const dauerRef = dauerLabel ? `, die ${dauerLabel} bestehen` : '';

  switch (slug) {
    case 'eisbox':
      if (isAkut)
        return `Du hast ${locRef} angegeben${dauerRef}. Die Eisbox blockiert Schmerzsignale innerhalb von Sekunden und stoppt die akute Entzündungskaskade – direkte Linderung ohne Medikamente.`;
      if (isChronisch && loc.includes('ruecken'))
        return `Du hast Beschwerden an Rücken / Nacken angegeben${dauerRef}. Systemische Kälte bei −110 °C senkt pro-entzündliche Zytokine (IL-6, TNF-α) messbar – das Immunsystem schaltet in den Reparatur-Modus.`;
      return `Du hast ${locRef} angegeben${dauerRef}. Kryotherapie hemmt Entzündungsmediatoren und blockiert Schmerzsignale – messbar, ohne Medikamente.`;

    case 'redlight':
      if ((loc.includes('gelenke') || loc.includes('knie') || loc.includes('huefte')) && isChronisch)
        return `Du hast ${locRef} angegeben${dauerRef}. Photobiomodulation regeneriert Knorpel und Synovialgewebe auf Zellebene – ohne Belastung, ohne Ausfallzeit.`;
      if (isChronisch)
        return `Du hast ${locRef} angegeben${dauerRef}. Chronische Schmerzen entstehen oft, weil betroffene Zellen zu wenig Energie produzieren – Rotlicht erhöht die ATP-Produktion direkt in den Mitochondrien.`;
      return `Du hast ${locRef} angegeben. Photobiomodulation stimuliert die Zellenergie und reduziert Entzündungen genau in dem Gewebe, das betroffen ist.`;

    case 'infrarotsauna':
      if (loc.includes('ruecken'))
        return `Du hast Beschwerden an Rücken / Nacken angegeben${dauerRef}. Ferninfrarot dringt 4–5 cm ins Gewebe ein und löst muskuläre Verspannungen direkt an der Quelle auf – wirksamer als Wärmepflaster, ohne Nebenwirkungen.`;
      if (loc.includes('muskeln'))
        return `Du hast Muskelbeschwerden angegeben${dauerRef}. Ferninfrarot dringt 4–5 cm ins Gewebe ein und löst Verspannungen direkt – wirksamer als Wärmepflaster, ohne Nebenwirkungen.`;
      if (isChronisch)
        return `Du hast ${locRef} angegeben${dauerRef}. Bei chronischen Schmerzbildern ist der kumulative Effekt von Infrarot-Sessions klinisch belegt – jede Session baut auf der vorherigen auf.`;
      return `Du hast ${locRef} angegeben. Tiefenwärme verbessert die Durchblutung, löst Verspannungen und lindert Schmerzen auf natürliche Weise.`;

    case 'armstrong':
      if (loc.includes('ruecken'))
        return `Du hast Beschwerden an Rücken / Nacken angegeben${dauerRef}. Armstrong stärkt die tiefe Rückenmuskulatur mit bis zu 20.000 fokussierten Kontraktionen – ohne Gelenkbelastung. Ein stabiler Rumpf ist die effektivste Prophylaxe gegen wiederkehrende Rückenschmerzen.`;
      return `Du hast ${locRef} angegeben. Magnetische Muskelstimulation stärkt die Muskulatur rund um belastete Strukturen und reduziert den Druck auf Gelenke und Nerven.`;

    case 'beckenbodenstuhl':
      if (loc.includes('ruecken'))
        return `Du hast Beschwerden an Rücken / Nacken angegeben. Rücken und Beckenboden bilden eine funktionelle Einheit – eine schwache Beckenbodenmuskulatur belastet direkt die Lendenwirbelsäule. Gezieltes Training dieser tiefen Struktur lindert Rückenschmerzen nachhaltig.`;
      return `Du hast ${locRef} angegeben. Beckenboden und Rumpfmuskulatur stabilisieren gemeinsam die Wirbelsäule – gezieltes Training verbessert die Gesamtstabilität.`;

    default:
      return '';
  }
}

function sportExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const ziel = chamber['ziel'] ?? '';
  const sportart = chamber['sportart'] ?? '';

  const sportLabel = joinList(sportart, SPORTART_TEXT) || 'Sport';
  const zielLabel = ZIEL_SPORT_TEXT[ziel] ?? ziel;

  switch (slug) {
    case 'eisbox':
      if (ziel === 'leistung')
        return `Du hast ${sportLabel} angegeben und möchtest mehr Leistung. Kryotherapie nach dem Training senkt Muskelkater messbar und verkürzt die Regenerationszeit – du kannst schneller wieder voll trainieren.`;
      if (ziel === 'praevention')
        return `Du hast Verletzungsprävention als Ziel angegeben. Kälte reduziert Mikro-Entzündungen nach dem Training, bevor sie sich zu Überlastungsschäden aufbauen – mit messbarem Effekt.`;
      if (sportart.includes('ausdauer'))
        return `Du hast ${sportLabel} als Sportart angegeben. Nach langen Ausdauerbelastungen normalisiert Kryotherapie die Herzfrequenz und reduziert systemische Entzündung – schnellere Erholung, mehr Trainingsvolumen möglich.`;
      return `Du hast ${sportLabel} angegeben und möchtest ${zielLabel}. Kryotherapie beschleunigt die Muskelregeneration messbar – du bist schneller wieder einsatzbereit.`;

    case 'redlight':
      if (ziel === 'leistung')
        return `Du hast ${sportLabel} angegeben und möchtest mehr Leistung. Rotlicht erhöht vor dem Training die Muskelkraft (ATP-Synthese ↑); danach beschleunigt es die Reparatur von Muskelschäden auf Zellebene.`;
      if (ziel === 'praevention')
        return `Du hast Verletzungsprävention als Ziel angegeben. Photobiomodulation stärkt Kollagen in Sehnen und Gelenken – die häufigsten Verletzungspunkte werden belastbarer.`;
      return `Du hast ${sportLabel} angegeben und möchtest ${zielLabel}. Photobiomodulation verbessert die Kraftausdauer vor dem Training und beschleunigt die Regeneration danach.`;

    case 'boa-lymphmassage':
      if (sportart.includes('ausdauer'))
        return `Du hast ${sportLabel} als Sportart angegeben. Nach Ausdauerbelastungen transportiert die BOA-Druckwellenmassage venöses Blut und Laktat effizienter zurück – leichtere Beine, schnellere Erholung.`;
      return `Du hast ${sportLabel} angegeben und möchtest ${zielLabel}. Druckwellenmassage transportiert Stoffwechselprodukte ab und beschleunigt die Erholung nach intensiver Belastung.`;

    case 'armstrong':
      if (sportart.includes('kraft'))
        return `Du hast ${sportLabel} als Sportart angegeben. HIFEM erzeugt supramaximale Kontraktionen – Reize, die kein Training erreicht. Muskelfasern werden effizienter rekrutiert, das Fundament für mehr Leistung.`;
      if (ziel === 'leistung')
        return `Du möchtest mehr Leistung aus deinem ${sportLabel}-Training. HIFEM steigert die Muskelkraft messbar ohne Gelenkbelastung – ideal als Ergänzung, wenn du nah an deiner Leistungsgrenze trainierst.`;
      return `Du hast ${sportLabel} angegeben. HIFEM-Technologie steigert die Muskelkraft ohne Gelenkbelastung – eine sinnvolle Ergänzung zu deinem Training.`;

    case 'infrarotsauna':
      if (sportart.includes('yoga'))
        return `Du hast ${sportLabel} als Sportart angegeben. Infrarotsauna und Yoga teilen dasselbe Ziel: Tiefenentspannung und Mobilität. FIR-Wärme löst Faszien und erhöht die Gewebeflexibilität.`;
      return `Du hast ${sportLabel} angegeben und möchtest ${zielLabel}. Infrarot-Sessions nach dem Training senken Cortisol und beschleunigen die parasympathische Erholung.`;

    default:
      return '';
  }
}

function vitalitaetExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const wunsch = chamber['wunsch'] ?? '';
  const raeube = chamber['raeube'] ?? '';

  const wunschLabel = WUNSCH_TEXT[wunsch] ?? wunsch;
  const raeubeLabel = joinList(raeube, RAEUBE_TEXT);

  switch (slug) {
    case 'eisbox':
      if (wunsch === 'energie' && raeube.includes('schlaf'))
        return `Du möchtest mehr Energie und hast angegeben, dass schlechter Schlaf dir Energie raubt. Die Eisbox steigert Noradrenalin auf das 2–4-fache und löst Endorphine aus – ein Energieschub, der stundenlang anhält.`;
      if (wunsch === 'energie')
        return `Du hast "${wunschLabel}" als Wunsch angegeben. In 2–3 Minuten steigt Noradrenalin auf das 2–4-fache, Endorphine fluten das System – anhaltender Energieschub ohne Koffein-Crash.`;
      if (wunsch === 'schlaf')
        return `Du hast "${wunschLabel}" als Wunsch angegeben. Die reaktive Erwärmung nach der Kälte senkt die Kerntemperatur am Abend messbar – das stärkste natürliche Einschlafsignal des Körpers.`;
      if (wunsch === 'klarheit')
        return `Du möchtest ${wunschLabel}. Kälte löst eine Noradrenalin-Ausschüttung aus, die Aufmerksamkeit und kognitiven Fokus nachweislich verbessert – 2 Minuten, volle Wirkung.`;
      return `Du hast ${wunschLabel} als Wunsch angegeben${raeubeLabel ? ` und ${raeubeLabel} als Belastung` : ''}. Kälte aktiviert Adrenalin, Noradrenalin und Endorphine – anhaltende Energie und Stimmungslift.`;

    case 'redlight':
      if (wunsch === 'energie')
        return `Du hast "${wunschLabel}" als Wunsch angegeben. Rotlicht aktiviert Cytochrom c Oxidase direkt in den Mitochondrien – die Zellen produzieren messbar mehr ATP. Chronische Erschöpfung hat häufig eine mitochondriale Ursache.`;
      if (wunsch === 'klarheit')
        return `Du möchtest ${wunschLabel}. Photobiomodulation verbessert die zerebrale Durchblutung und Mitochondrienfunktion – mentale Schärfe von innen heraus.`;
      return `Du hast ${wunschLabel} als Wunsch angegeben. Lichtwellen aktivieren die Mitochondrien direkt – die Zellen produzieren mehr ATP, dein Energieakku wird voller.`;

    case 'infrarotsauna':
      if (wunsch === 'schlaf')
        return `Du hast "${wunschLabel}" als Wunsch angegeben. Abendliche Infrarot-Sessions erhöhen kurz die Körperkerntemperatur – beim Abkühlen danach sinkt sie unter den Ausgangswert. Das ist das präziseste Einschlafsignal für den Körper.`;
      if (wunsch === 'stress')
        return `Du möchtest ${wunschLabel}. Ferninfrarot senkt Cortisol messbar und aktiviert den Parasympathikus – der Körper schaltet aus dem Alarm-Modus in echte Erholung.`;
      if (wunsch === 'energie' && raeube.includes('schlaf'))
        return `Du möchtest mehr Energie und hast schlechten Schlaf als Energieräuber angegeben. Infrarot verbessert die Schlaftiefe nachhaltig – die Basis für dauerhaft mehr Energie.`;
      return `Du hast ${wunschLabel} als Wunsch angegeben${raeubeLabel ? ` und ${raeubeLabel} als Belastung` : ''}. Infrarot-Sessions senken Cortisol und verbessern die Schlafqualität.`;

    case 'boa-lymphmassage':
      if (wunsch === 'stress')
        return `Du möchtest ${wunschLabel}. Pneumatische Kompression aktiviert den Parasympathikus direkt – nach der Session schaltet der Körper spürbar aus dem Stress-Modus heraus.`;
      if (raeube.includes('bewegung'))
        return `Du hast angegeben, dass dir zu wenig Bewegung Energie raubt. BOA bewegt Lymphe und venöses Blut ohne eigene Muskelaktivität – ideal wenn Bewegungsmangel den Lymphfluss bremst und du dich schwer und müde fühlst.`;
      return `Du hast ${wunschLabel} als Wunsch angegeben. Lymphdrainage aktiviert den Parasympathikus – du wechselst aus dem Stress-Modus in echte Entspannung.`;

    default:
      return '';
  }
}

function bodyformingExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const ziel = chamber['ziel'] ?? '';
  const zone = chamber['zone'] ?? '';

  const zielLabel = ZIEL_BODY_TEXT[ziel] ?? ziel;
  const zoneLabel = joinList(zone, ZONE_TEXT) || 'deinen Zielzonen';

  switch (slug) {
    case 'armstrong':
      if (ziel === 'muskelaufbau')
        return `Du hast "${zielLabel}" als Ziel angegeben. Armstrong erzeugt bis zu 20.000 supramaximale Kontraktionen pro Session – im normalen Training physisch unmöglich. MRT-Studien belegen +15–20 % Muskelvolumen nach einer Kur.`;
      if (ziel === 'fettabbau')
        return `Du möchtest ${zielLabel} an ${zoneLabel}. Die extreme metabolische Belastung durch HIFEM löst parallel zur Muskelhypertrophie eine lokale Lipolyse aus – Muskelaufbau und Fettreduktion gleichzeitig (MRT-belegt: +15–30 %).`;
      if (ziel === 'straff')
        return `Du möchtest ${zielLabel}. Armstrong stimuliert die Muskulatur unter dem Gewebe – straffere Körperkontur durch mehr Muskelvolumen, nicht nur durch Haut.`;
      if (ziel === 'kontur')
        return `Du möchtest ${zielLabel} an ${zoneLabel}. HIFEM formt die Körperkonturen von innen: Mehr Muskel bedeutet besser definierte Form – ohne OP, ohne Ausfallzeit.`;
      return `Du hast ${zielLabel} als Ziel angegeben. HIFEM erzeugt bis zu 20.000 Muskelkontraktionen pro Session – mehr als im normalen Training je möglich.`;

    case 'cryoshaper':
      if (zone.includes('doppelkinn'))
        return `Du hast Doppelkinn als Zielzone angegeben. Kryolipolyse ist hier besonders effektiv: Die Gesichtsapplikator-Technologie kühlt das Fettgewebe gezielt – 10 Sessions, dauerhaftes Ergebnis ohne OP.`;
      if (zone.includes('bauch'))
        return `Du hast Bauch als Zielzone angegeben${ziel ? ` und möchtest ${zielLabel}` : ''}. Bauchfett reagiert besonders kälteempfindlich: Kryolipolyse löst die Apoptose der Fettzellen aus – der Körper baut sie über 8–12 Wochen natürlich ab. Klinisch: 19–25 % Reduktion nach 10 Sessions.`;
      if (zone.includes('oberschenkel') || zone.includes('huefte'))
        return `Du hast ${zoneLabel} als Zielzone angegeben. Das sind klassische Zonen für Kryolipolyse – Fettzellen reagieren auf kontrollierte Kälte mit Apoptose. Ca. 5 Sessions reichen hier oft aus.`;
      return `Du hast ${zoneLabel} als Zielzonen und ${zielLabel} als Ziel angegeben. Kryolipolyse bringt Fettzellen gezielt zur Apoptose – klinisch belegt: 19–25 % Fettreduktion pro Zone.`;

    case 'redlight':
      if (ziel === 'straff')
        return `Du hast "${zielLabel}" als Ziel angegeben. Photobiomodulation stimuliert Fibroblasten zur Kollagenproduktion – sichtbar strafferes Gewebe nach mehreren Sessions, besonders effektiv bei Hauterschlaffung.`;
      return `Du hast ${zielLabel} als Ziel angegeben. Photobiomodulation unterstützt die Kollagenproduktion und strafft das Gewebe sichtbar nach mehreren Sessions.`;

    default:
      return '';
  }
}

function beckenbodenExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const thema = chamber['thema'] ?? '';
  const dauer = chamber['dauer'] ?? '';

  if (slug !== 'beckenbodenstuhl') return '';

  const themaLabel = THEMA_TEXT[thema] ?? '';
  const dauerLabel = DAUER_BECK_TEXT[dauer] ?? '';
  const dauerContext = dauerLabel && dauer !== 'praventiv' ? ` Du beschäftigst dich damit seit ${dauerLabel}.` : '';

  switch (thema) {
    case 'inkontinenz':
      return `Du hast ${themaLabel} angegeben.${dauerContext} In klinischen Studien berichten 65–75 % der Betroffenen von signifikanter Besserung nach einer 6er-Kur – sitzend, voll bekleidet, ca. 11.000 Kontraktionen pro Session.`;
    case 'drang':
      return `Du hast ${themaLabel} angegeben.${dauerContext} Das Magnetfeld re-edukiert die motorischen Nervenbahnen und trainiert gezielt die Typ-I-Fasern für bessere Haltekontrolle.`;
    case 'postpartum':
      return `Du hast ${themaLabel} als Grund angegeben. Der Beckenbodenstuhl trainiert Levator ani und tiefe Stabilisierungsmuskulatur ohne eigene Bewegungsleistung – ideal wenn Erschöpfung das aktive Training erschwert.`;
    case 'schwäche':
      return `Du hast ${themaLabel} angegeben.${dauerContext} Supramaximale Kontraktionen durch das Magnetfeld erreichen Muskelfasern, die aktives Training oft nicht aktiviert – messbare Verbesserung nach einer 6er-Kur.`;
    case 'praevention':
      return `Du hast Prävention & Vorsorge als Grund angegeben. Der Beckenbodenstuhl hält die neuromuskuläre Kontrolle auf hohem Niveau – eine Investition, die spätere Inkontinenz oder Operationen verhindert.`;
    default:
      return `Du hast dich für den Beckenboden-Fokus entschieden. Das fokussierte Magnetfeld trainiert die Muskulatur mit bis zu 11.000 Kontraktionen pro Session – voll bekleidet im Sitzen.`;
  }
}

function biohackingExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const fokus = chamber['fokus'] ?? '';
  const protokoll = chamber['protokoll'] ?? '';

  const nutztKaelte = protokoll.includes('kalt');
  const nutztLicht = protokoll.includes('licht');
  const nutztSauna = protokoll.includes('sauna');
  const nutztNichts = protokoll.includes('nichts') && protokoll.split(',').filter((p) => p !== 'nichts').length === 0;

  const fokusLabel = FOKUS_TEXT[fokus] ?? fokus;
  const protokollLabel = joinList(
    protokoll.split(',').filter((p) => p !== 'nichts').join(','),
    PROTOKOLL_TEXT,
  );

  switch (slug) {
    case 'eisbox':
      if (nutztKaelte)
        return `Du nutzt bereits Kältetherapie und fokussierst dich auf ${fokusLabel}. Die Eisbox hebt das auf professionelles Niveau: −110 °C statt Kaltdusche, systemische Hormesis statt lokalem Reiz, messbare Biomarker.`;
      if (nutztNichts)
        return `Du hast ${fokusLabel} als Fokus angegeben und noch kein Protokoll. Ganzkörperkryotherapie ist der direkteste Einstieg: −110 °C, 2–3 Minuten, messbare Wirkung auf HRV, Entzündung und Energie.`;
      if (fokus === 'longevity')
        return `Du fokussierst dich auf ${fokusLabel}${protokollLabel ? ` und nutzt bereits ${protokollLabel}` : ''}. Ganzkörperkryotherapie ist der stärkste validierte Stimulus für HRV-Verbesserung – ein zentraler Marker für biologisches Alter.`;
      if (fokus === 'performance')
        return `Du hast ${fokusLabel} als Fokus angegeben${protokollLabel ? ` und nutzt bereits ${protokollLabel}` : ''}. Kryotherapie nach dem Training maximiert den Trainingsstimulus: Muskelkater sinkt, Noradrenalin steigt 2–4-fach.`;
      if (fokus === 'recovery')
        return `Du hast ${fokusLabel} als Fokus angegeben. 2–3 Minuten bei −110 °C normalisieren pro-entzündliche Zytokine systemisch – die effektivste Einzelmaßnahme zur tiefen Geweberestaurierung.`;
      if (fokus === 'immunsystem')
        return `Du möchtest dein Immunsystem stärken. Kälte-Hormesis aktiviert anti-inflammatorisches IL-10 und trainiert die Immunregulation – regelmäßige Anwendung konditioniert auf Stressresilienz.`;
      return `Du fokussierst dich auf ${fokusLabel}. Ganzkörperkryotherapie ist das effektivste Tool für kardiovaskuläre Konditionierung, Entzündungsreduktion und HRV-Verbesserung.`;

    case 'redlight':
      if (nutztLicht)
        return `Du nutzt bereits Lichttherapie und fokussierst dich auf ${fokusLabel}. Die 630–850 nm-Bandbreite unseres Systems entspricht exakt dem therapeutischen Fenster für Cytochrom c Oxidase – maximaler Wirkungsgrad.`;
      if (fokus === 'longevity')
        return `Du fokussierst dich auf ${fokusLabel}${protokollLabel ? ` und nutzt bereits ${protokollLabel}` : ''}. Photobiomodulation ist in aktuellen Longevity-Protokollen zentrales Element – Mitochondrienfunktion ist der entscheidende Faktor für Zelllanglebigkeit.`;
      if (fokus === 'performance')
        return `Du hast ${fokusLabel} als Fokus angegeben. Rotlicht erhöht vor dem Training die Muskelleistung (ATP-Synthese ↑); danach beschleunigt es die Gewebereparatur – Dual-Use für Peak Performance.`;
      if (fokus === 'immunsystem')
        return `Du möchtest dein Immunsystem stärken. Photobiomodulation moduliert Entzündungsmarker systemisch und verbessert die Differenzierung von Immunzellen – evidenzbasiertes Protokoll.`;
      return `Du fokussierst dich auf ${fokusLabel}. Photobiomodulation moduliert die Mitochondrienfunktion – zentraler Mechanismus in aktuellen Longevity-Protokollen.`;

    case 'infrarotsauna':
      if (nutztSauna)
        return `Du nutzt bereits Sauna / Wärme und fokussierst dich auf ${fokusLabel}. Infrarot ergänzt ideal: tiefere Gewebewirkung bei niedrigerer Raumtemperatur – bessere Verträglichkeit für längere Sessions.`;
      if (fokus === 'longevity')
        return `Du fokussierst dich auf ${fokusLabel}${protokollLabel ? ` und nutzt bereits ${protokollLabel}` : ''}. Regelmäßige Sauna-Sessions sind mit 40 % geringerer kardiovaskulärer Mortalität assoziiert (Laukkanen et al., JAMA) – Infrarot erreicht denselben Effekt.`;
      if (fokus === 'recovery')
        return `Du hast ${fokusLabel} als Fokus angegeben. Ferninfrarot senkt Cortisol messbar, aktiviert Hitzeschockproteine und führt zu parasympathischer Dominanz – tiefer Recovery-Zustand nach 30–45 Minuten.`;
      if (fokus === 'immunsystem')
        return `Du möchtest dein Immunsystem stärken. Hitzeschockproteine (HSP70) werden durch Infrarot-Exposition stark induziert – sie reparieren fehlgefaltete Proteine und modulieren die Immunantwort direkt.`;
      return `Du fokussierst dich auf ${fokusLabel}. Regelmäßige Infrarot-Sessions sind mit signifikanter Reduktion kardiovaskulärer Risikofaktoren assoziiert.`;

    case 'boa-lymphmassage':
      if (fokus === 'recovery')
        return `Du hast ${fokusLabel} als Fokus angegeben. Pneumatische Kompressionsmassage reduziert systemische Entzündungsmarker nach Belastung und beschleunigt die Lymphclearance von Metaboliten – wissenschaftlich validierter Recovery-Stack.`;
      return `Du fokussierst dich auf ${fokusLabel}. Lymphdrainage als Recovery-Tool reduziert systemische Entzündungsmarker messbar.`;

    case 'armstrong':
      if (fokus === 'performance')
        return `Du hast ${fokusLabel} als Fokus angegeben. HIFEM steigert die Muskelfaser-Rekrutierungseffizienz und maximiert das Kraft-zu-Gewicht-Verhältnis – der direkteste Weg zu mehr Leistung ohne erhöhtes Trainingsvolumen.`;
      return `Du fokussierst dich auf ${fokusLabel}. HIFEM-Technologie steigert die Muskelkraft messbar ohne Gelenkbelastung.`;

    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Haupt-Funktion
// ---------------------------------------------------------------------------

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

  return merged.map((slug) => {
    const sessions =
      slug === 'cryoshaper'
        ? getCryoshaperSessions(chamber2, chamber2b)
        : (SESSIONS[slug] ?? '1–2x pro Woche');

    const explanation =
      generateExplanation(slug, mainFocus, chamber2) ||
      (mainFocus2 ? generateExplanation(slug, mainFocus2, chamber2b) : '');

    return { slug, sessions, explanation };
  });
}
