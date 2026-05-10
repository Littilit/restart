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

      // Rücken → MMS-Geräte (armstrong + beckenbodenstuhl) sind hier besonders relevant
      if (loc.includes('ruecken')) {
        if (dauer === 'chronisch' || dauer === 'lang') {
          return ['infrarotsauna', 'armstrong', 'beckenbodenstuhl'];
        }
        return ['eisbox', 'infrarotsauna', 'armstrong'];
      }
      // Gelenke chronisch → Rotlicht priorisieren (Zellebene)
      if (
        (loc.includes('gelenke') || loc.includes('knie') || loc.includes('huefte')) &&
        (dauer === 'chronisch' || dauer === 'lang')
      ) {
        return ['redlight', 'infrarotsauna', 'eisbox'];
      }
      // Akut oder muskulär → Eisbox zuerst
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
        // Arme ohne typische Cryo-Zonen → armstrong besser
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
        // Mehrere Zonen oder Doppelkinn → Cryoshaper zuerst
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
      // longevity + default
      return ['eisbox', 'infrarotsauna', 'redlight'];
    }
  }
}

// ---------------------------------------------------------------------------
// Sessions (realistisch: die meisten Kunden kommen 1–2x/Woche)
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

  switch (slug) {
    case 'eisbox':
      if (isAkut)
        return 'Kälte blockiert Schmerzsignale innerhalb von Sekunden und bremst die akute Entzündungskaskade — sofortige Linderung, ohne Medikamente.';
      if (isChronisch)
        return 'Bei lang andauernden Beschwerden zählt der systemische Effekt: Pro-entzündliche Zytokine (IL-6, TNF-α) sinken messbar, das Immunsystem schaltet in den Reparatur-Modus.';
      return 'Kälte hemmt Entzündungsmediatoren und blockiert Schmerzsignale — direkte Linderung mit messbarer Wirkung auf Hormon- und Immunsystem.';

    case 'redlight':
      if (loc.includes('gelenke') || loc.includes('knie') || loc.includes('huefte'))
        return 'Gelenkentzündungen reagieren besonders gut auf Photobiomodulation: Knorpel und Synovialgewebe werden auf Zellebene regeneriert — ohne Belastung, ohne Ausfallzeit.';
      if (isChronisch)
        return 'Chronische Schmerzen entstehen oft dort, wo Zellen zu wenig Energie haben. Rotlicht erhöht die ATP-Produktion direkt in den Mitochondrien und reduziert Entzündungsmediatoren dauerhaft.';
      return 'Photobiomodulation stimuliert die Zellenergie und reduziert Entzündungen im Gewebe genau dort, wo die Beschwerden entstehen.';

    case 'infrarotsauna':
      if (loc.includes('ruecken') || loc.includes('muskeln'))
        return 'Ferninfrarot dringt 4–5 cm ins Gewebe ein und löst muskuläre Verspannungen auf — wirksamer als Wärmepflaster, ohne Nebenwirkungen.';
      if (isChronisch)
        return 'Regelmäßige Infrarot-Sessions sind bei chronischen Schmerzbildern klinisch belegt. Der Effekt kumuliert — jede Session baut auf der vorherigen auf.';
      return 'Tiefenwärme löst Verspannungen, verbessert die Durchblutung und lindert Schmerzen auf natürliche Weise.';

    case 'armstrong':
      if (loc.includes('ruecken'))
        return 'Armstrong stärkt die tiefe Rückenmuskulatur mit bis zu 20.000 fokussierten Kontraktionen — ohne Gelenkbelastung. Ein stabiler Rumpf ist die effektivste Prophylaxe gegen Rückenschmerzen.';
      return 'Magnetische Muskelstimulation stärkt die Muskulatur rund um belastete Strukturen und reduziert so den Druck auf Gelenke und Nerven.';

    case 'beckenbodenstuhl':
      if (loc.includes('ruecken'))
        return 'Rücken und Beckenboden bilden funktionell eine Einheit — eine schwache Beckenbodenmuskulatur belastet direkt die Lendenwirbelsäule. Gezieltes Training dieser tiefen Struktur lindert Rückenschmerzen nachhaltig.';
      return 'Beckenboden und Rumpfmuskulatur stabilisieren gemeinsam die Wirbelsäule. Training dieser tiefen Einheit verbessert die Gesamtstabilität.';

    default:
      return '';
  }
}

function sportExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const ziel = chamber['ziel'] ?? '';
  const sportart = chamber['sportart'] ?? '';

  switch (slug) {
    case 'eisbox':
      if (ziel === 'leistung')
        return 'Kryotherapie nach dem Training senkt DOMS messbar und verkürzt die Regenerationszeit — in Leistungssportstudien belegt. Du kannst schneller wieder voll trainieren.';
      if (ziel === 'praevention')
        return 'Kälte reduziert Mikro-Entzündungen nach dem Training bevor sie sich zu Überlastungsschäden aufbauen — präventive Maßnahme mit messbarem Effekt.';
      if (sportart.includes('ausdauer'))
        return 'Nach langen Ausdauerbelastungen normalisiert Kryotherapie die Herzfrequenz und reduziert systemische Entzündung — schnellere Erholung, mehr Trainingsvolumen möglich.';
      return 'Kryotherapie nach dem Training beschleunigt die Muskelregeneration messbar — DOMS sinkt, du bist schneller wieder einsatzbereit.';

    case 'redlight':
      if (ziel === 'leistung')
        return 'Rotlicht vor dem Training erhöht die Muskelkraft und Ausdauer (ATP-Synthese ↑); danach beschleunigt es die Reparatur von Muskelschäden auf Zellebene.';
      if (ziel === 'praevention')
        return 'Photobiomodulation stärkt Kollagen in Sehnen und Gelenken — die häufigsten Verletzungspunkte werden belastbarer. Ideal als präventive Maßnahme.';
      return 'Photobiomodulation verbessert die Kraftausdauer vor dem Training und beschleunigt die Regeneration danach.';

    case 'boa-lymphmassage':
      if (sportart.includes('ausdauer'))
        return 'Nach Ausdauerbelastungen transportiert die BOA-Druckwellenmassage venöses Blut und Laktat effizienter zurück — leichtere Beine, schnellere Erholung.';
      return 'Druckwellenmassage transportiert Stoffwechselprodukte ab und beschleunigt die Erholung nach intensiver Belastung.';

    case 'armstrong':
      if (sportart.includes('kraft'))
        return 'HIFEM erzeugt supramaximale Muskelkontraktionen — Reize, die kein Training erreicht. Für Kraftsportler: Muskelfasern werden effizienter rekrutiert, das Fundament für mehr Leistung.';
      if (ziel === 'leistung')
        return 'HIFEM steigert die Muskelkraft messbar ohne Gelenkbelastung — ideal als Ergänzung zum Training wenn du nah an deiner Leistungsgrenze trainierst.';
      return 'HIFEM-Technologie steigert die Muskelkraft ohne Gelenkbelastung — sinnvolle Ergänzung zum Sporttraining.';

    case 'infrarotsauna':
      if (sportart.includes('yoga'))
        return 'Infrarotsauna und Yoga teilen das Ziel: Tiefenentspannung und Mobilität. FIR-Wärme löst Faszien und erhöht die Gewebeflexibilität — eine ideale Kombination.';
      return 'Infrarot-Sessions nach dem Training senken Cortisol und beschleunigen die parasympathische Erholung.';

    default:
      return '';
  }
}

function vitalitaetExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const wunsch = chamber['wunsch'] ?? '';
  const raeube = chamber['raeube'] ?? '';

  switch (slug) {
    case 'eisbox':
      if (wunsch === 'energie')
        return 'In 2–3 Minuten steigt Noradrenalin auf das 2–4-fache, Endorphine fluten das System — ein Energieschub der Stunden anhält, ohne Koffein-Crash.';
      if (wunsch === 'schlaf')
        return 'Die reaktive Erwärmung nach der Kälte führt zu einer messbaren Absenkung der Kerntemperatur am Abend — das natürlichste Einschlafsignal des Körpers.';
      if (wunsch === 'klarheit')
        return 'Noradrenalin-Ausschüttung durch Kälte verbessert Aufmerksamkeit und kognitiven Fokus nachweislich — 2 Minuten, volle Wirkung.';
      return 'Kälte aktiviert das Hormonsystem: Adrenalin, Noradrenalin und Endorphine sorgen für anhaltende Energie und Stimmungslift.';

    case 'redlight':
      if (wunsch === 'energie')
        return 'Rotlicht aktiviert Cytochrom c Oxidase direkt in den Mitochondrien — die Zellen produzieren mehr ATP. Chronische Erschöpfung hat oft eine mitochondriale Ursache.';
      if (wunsch === 'klarheit')
        return 'Photobiomodulation verbessert die zerebrale Durchblutung und Mitochondrienfunktion — mentale Schärfe von innen heraus.';
      return 'Lichtwellen aktivieren die Mitochondrien direkt — die Zellen produzieren mehr ATP, dein Energieakku wird voller.';

    case 'infrarotsauna':
      if (wunsch === 'schlaf')
        return 'Abendliche Infrarot-Sessions erhöhen kurz die Körperkerntemperatur — beim Abkühlen danach sinkt sie unter den Ausgangswert. Das ist das präziseste Einschlafsignal, das du dem Körper geben kannst.';
      if (wunsch === 'stress')
        return 'Ferninfrarot senkt Cortisol messbar und aktiviert den Parasympathikus — der Körper schaltet aus dem Alarm-Modus in echte Erholung.';
      if (wunsch === 'energie' && raeube.includes('schlaf'))
        return 'Wenn schlechter Schlaf deine Energie kostet: Infrarot verbessert die Schlaftiefe nachhaltig — die Basis für dauerhaft mehr Energie.';
      return 'Infrarot-Sessions senken Cortisol und verbessern die Schlafqualität — die Basis für dauerhafte Vitalität.';

    case 'boa-lymphmassage':
      if (wunsch === 'stress')
        return 'Pneumatische Kompression aktiviert den Parasympathikus direkt — du spürst nach der Session wie du buchstäblich aus dem Stress-Modus herausfällst.';
      if (raeube.includes('bewegung'))
        return 'BOA bewegt Lymphe und venöses Blut ohne eigene Muskelaktivität — ideal wenn Bewegungsmangel den Lymphfluss bremst und du dich schwer und müde fühlst.';
      return 'Lymphdrainage aktiviert den Parasympathikus — du wechselst aus dem Stress-Modus in echte Entspannung.';

    default:
      return '';
  }
}

function bodyformingExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const ziel = chamber['ziel'] ?? '';
  const zone = chamber['zone'] ?? '';

  switch (slug) {
    case 'armstrong':
      if (ziel === 'muskelaufbau')
        return 'HIFEM erzeugt bis zu 20.000 supramaximale Kontraktionen pro Session — im normalen Training physisch unmöglich. MRT-Studien belegen +15–20 % Muskelvolumen nach einer Kur.';
      if (ziel === 'fettabbau')
        return 'Die extreme metabolische Belastung durch HIFEM löst parallel zur Muskelhypertrophie eine lokale Lipolyse aus — Muskelaufbau und Fettreduktion gleichzeitig, MRT-belegt (+15–30 %).';
      if (ziel === 'straff')
        return 'Armstrong stimuliert die Muskulatur unter dem Gewebe — straffere Körperkontur durch mehr Muskelvolumen, nicht nur durch Haut.';
      if (ziel === 'kontur')
        return 'HIFEM formt Körperkonturen von innen: Mehr Muskel bedeutet besser definierte Form — ohne OP, ohne Ausfallzeit.';
      return 'HIFEM erzeugt bis zu 20.000 Muskelkontraktionen pro Session — mehr als im normalen Training je möglich wäre.';

    case 'cryoshaper':
      if (zone.includes('doppelkinn'))
        return 'Das Doppelkinn ist für Kryolipolyse ideal geeignet. Die Gesichtsapplikator-Technologie kühlt das Fettgewebe gezielt auf 0 bis −11 °C — 10 Sessions, dauerhaftes Ergebnis ohne OP.';
      if (zone.includes('bauch'))
        return 'Bauchfett reagiert besonders kälteempfindlich. Kryolipolyse löst die programmierte Apoptose der Fettzellen aus — der Körper baut sie über 8–12 Wochen natürlich ab. Klinisch: 19–25 % Reduktion nach 10 Sessions.';
      if (zone.includes('oberschenkel') || zone.includes('huefte'))
        return 'Oberschenkel und Hüfte sind klassische Problemzonen für Kryolipolyse — Fettzellen reagieren auf kontrollierte Kälte mit Apoptose. Ca. 5 Sessions reichen hier oft aus.';
      return 'Kryolipolyse bringt Fettzellen in Problemzonen gezielt zur Apoptose — der Körper baut sie über Wochen natürlich ab. Klinisch belegt: 19–25 % Fettreduktion.';

    case 'redlight':
      if (ziel === 'straff')
        return 'Photobiomodulation stimuliert Fibroblasten zur Kollagenproduktion — sichtbar strafferes Gewebe nach mehreren Sessions, besonders effektiv bei Hauterschlaffung.';
      return 'Photobiomodulation unterstützt die Kollagenproduktion und strafft das Gewebe sichtbar nach mehreren Sessions.';

    default:
      return '';
  }
}

function beckenbodenExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const thema = chamber['thema'] ?? '';

  if (slug !== 'beckenbodenstuhl') return '';

  switch (thema) {
    case 'inkontinenz':
      return 'In klinischen Studien berichten 65–75 % der Patientinnen mit Belastungsinkontinenz von signifikanter Besserung nach einer 6er-Kur. Das fokussierte Magnetfeld trainiert die Beckenbodenmuskulatur mit ~11.000 Kontraktionen pro Session — sitzend, voll bekleidet.';
    case 'drang':
      return 'Dranginkontinenz entsteht oft durch neuromuskuläre Fehlfunktionen. Das Magnetfeld re-edukiert die motorischen Nervenbahnen und trainiert gezielt die Typ-I-Fasern für bessere Haltekontrolle.';
    case 'postpartum':
      return 'Für die Rückbildung nach der Schwangerschaft ist der Beckenbodenstuhl besonders wertvoll: Er trainiert Levator ani und tiefe Stabilisierungsmuskulatur ohne eigene Bewegungsleistung — ideal wenn Erschöpfung das aktive Training erschwert.';
    case 'schwäche':
      return 'Allgemeine Beckenbodenschwäche verbessert sich nach einer 6er-Kur messbar. Supramaximale Kontraktionen durch das Magnetfeld erreichen Muskelfasern, die aktives Training oft nicht aktiviert.';
    case 'praevention':
      return 'Präventiv eingesetzt hält der Beckenbodenstuhl die neuromuskuläre Kontrolle auf hohem Niveau — eine Investition, die spätere Inkontinenz oder Operationen verhindert.';
    default:
      return 'Das fokussierte Magnetfeld trainiert die Beckenbodenmuskulatur mit bis zu 11.000 Kontraktionen pro Session — voll bekleidet im Sitzen.';
  }
}

function biohackingExplanation(slug: AnwendungSlug, chamber: Chamber): string {
  const fokus = chamber['fokus'] ?? '';
  const protokoll = chamber['protokoll'] ?? '';
  const nutztKaelte = protokoll.includes('kalt');
  const nutztLicht = protokoll.includes('licht');
  const nutztSauna = protokoll.includes('sauna');

  switch (slug) {
    case 'eisbox':
      if (nutztKaelte)
        return 'Du nutzt bereits Kälte — die Eisbox bringt das auf professionelles Niveau: −110 °C statt Kaltdusche, systemische Hormesis statt lokaler Reiz, messbare Biomarker statt Gefühl.';
      if (fokus === 'longevity')
        return 'Ganzkörperkryotherapie ist der stärkste validierte Stimulus für HRV-Verbesserung und kardiovaskuläre Konditionierung — beides zentrale Marker für biologisches Alter.';
      if (fokus === 'performance')
        return 'Kryotherapie nach dem Training maximiert den Trainingsstimulus: DOMS sinkt, Noradrenalin steigt 2–4-fach, du bist schneller wieder auf maximalem Level.';
      if (fokus === 'recovery')
        return '2–3 Minuten bei −110 °C normalisieren pro-entzündliche Zytokine systemisch — die effektivste Einzelmaßnahme zur tiefen Geweberestaurierung nach intensiver Belastung.';
      if (fokus === 'immunsystem')
        return 'Kältehoresis aktiviert anti-inflammatorisches IL-10 und trainiert die Immunregulation — regelmäßige Anwendung konditioniert das Immunsystem auf Stressresilienz.';
      return 'Ganzkörperkryotherapie ist das effektivste Tool für kardiovaskuläre Konditionierung, Entzündungsreduktion und HRV-Verbesserung.';

    case 'redlight':
      if (nutztLicht)
        return 'Du kennst Lichttherapie bereits. Die 630–850 nm-Bandbreite unseres Systems entspricht exakt dem therapeutischen Fenster für Cytochrom c Oxidase — maximaler Wirkungsgrad pro Session.';
      if (fokus === 'longevity')
        return 'Photobiomodulation ist in aktuellen Longevity-Protokollen zentrales Element: Mitochondrienfunktion ist der entscheidende Faktor für Zelllanglebigkeit.';
      if (fokus === 'performance')
        return 'Rotlicht vor dem Training erhöht die Muskelleistung durch gesteigerte ATP-Synthese; danach beschleunigt es die Gewebereparatur. Dual-use für Peak Performance.';
      if (fokus === 'immunsystem')
        return 'Photobiomodulation moduliert Entzündungsmarker systemisch und verbessert die Differenzierung von Immunzellen — evidenzbasiertes Protokoll für Immunresilience.';
      return 'Photobiomodulation moduliert die Mitochondrienfunktion — zentraler Mechanismus in aktuellen Longevity-Protokollen.';

    case 'infrarotsauna':
      if (nutztSauna)
        return 'Du nutzt bereits Sauna — Infrarot ergänzt ideal: tiefere Gewebewirkung, niedrigere Raumtemperatur, bessere Verträglichkeit für längere Sessions.';
      if (fokus === 'longevity')
        return 'Regelmäßige Sauna-Sessions sind in Kohortenstudien mit 40 % geringerer kardiovaskulärer Mortalität assoziiert (Laukkanen et al., JAMA). Infrarot erreicht denselben Effekt.';
      if (fokus === 'recovery')
        return 'Ferninfrarot senkt Cortisol messbar, aktiviert Hitzeschockproteine und führt zu parasympathischer Dominanz — tiefer Recovery-Zustand nach 30–45 Minuten.';
      if (fokus === 'immunsystem')
        return 'Hitzeschockproteine (HSP70) werden durch Infrarot-Exposition stark induziert — sie reparieren fehlgefaltete Proteine und modulieren die Immunantwort direkt.';
      return 'Regelmäßige Infrarot-Sessions sind mit signifikanter Reduktion kardiovaskulärer Risikofaktoren assoziiert.';

    case 'boa-lymphmassage':
      if (fokus === 'recovery')
        return 'Pneumatische Kompressionsmassage reduziert systemische Entzündungsmarker nach Belastung und beschleunigt die Lymphclearance von Metaboliten — wissenschaftlich validierter Recovery-Stack.';
      return 'Lymphdrainage als Recovery-Tool reduziert systemische Entzündungsmarker messbar.';

    case 'armstrong':
      if (fokus === 'performance')
        return 'HIFEM steigert die Muskelfaser-Rekrutierungseffizienz und maximiert das Kraft-zu-Gewicht-Verhältnis — für Peak Performance der direkteste Weg zu mehr Leistung ohne Trainingsvolumen-Erhöhung.';
      return 'HIFEM-Technologie steigert die Muskelkraft messbar ohne Gelenkbelastung.';

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

    // Begründung: primärer Fokus zuerst, Fallback auf sekundären
    const explanation =
      generateExplanation(slug, mainFocus, chamber2) ||
      (mainFocus2 ? generateExplanation(slug, mainFocus2, chamber2b) : '');

    return { slug, sessions, explanation };
  });
}
