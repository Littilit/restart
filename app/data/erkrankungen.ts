import type { AnwendungSlug } from './anwendungen';

export interface Erkrankung {
  id: string;
  label: string;
  anwendungen: AnwendungSlug[];
  einleitungstext: string;
}

export const ERKRANKUNGEN: Erkrankung[] = [
  {
    id: 'rheuma',
    label: 'Rheuma',
    anwendungen: ['eisbox', 'redlight', 'infrarotsauna'],
    einleitungstext:
      'Viele unserer Kunden mit rheumatischen Beschwerden berichten nach regelmäßiger Kryotherapie von spürbar weniger Morgensteifigkeit und Schmerzen – Kälte hemmt pro-entzündliche Zytokine messbar.',
  },
  {
    id: 'arthrose',
    label: 'Arthrose',
    anwendungen: ['eisbox', 'redlight', 'infrarotsauna'],
    einleitungstext:
      'Viele unserer Kunden mit Arthrose nutzen erfolgreich die Kombination aus Kryotherapie und Photobiomodulation – beide Anwendungen wirken entzündungshemmend und fördern die Gelenkgesundheit ohne Belastung.',
  },
  {
    id: 'fibromyalgie',
    label: 'Fibromyalgie',
    anwendungen: ['eisbox', 'infrarotsauna', 'redlight'],
    einleitungstext:
      'Viele unserer Kunden mit Fibromyalgie erleben durch regelmäßige Kryotherapie-Sessions eine Reduktion der Schmerzintensität und eine deutliche Verbesserung des Schlafs – beides zentrale Herausforderungen der Erkrankung.',
  },
  {
    id: 'neurodermitis',
    label: 'Neurodermitis',
    anwendungen: ['redlight', 'eisbox'],
    einleitungstext:
      'Viele unserer Kunden mit Neurodermitis berichten von weniger Juckreiz und ruhigerer Haut nach Rotlicht-Sessionen – Photobiomodulation moduliert die Entzündungsantwort direkt im Gewebe.',
  },
  {
    id: 'brainfog',
    label: 'Brain Fog / Konzentrationsprobleme',
    anwendungen: ['eisbox', 'redlight'],
    einleitungstext:
      'Viele unserer Kunden mit Brain Fog nutzen erfolgreich die Kryotherapie als täglichen Reset – 2–3 Minuten bei −110 °C steigern Noradrenalin messbar und bringen innerhalb von Minuten mehr mentale Klarheit.',
  },
  {
    id: 'post-covid',
    label: 'Post-Covid / Long Covid',
    anwendungen: ['eisbox', 'boa-lymphmassage', 'infrarotsauna'],
    einleitungstext:
      'Viele unserer Kunden mit Post-Covid-Symptomen berichten von verbesserter Belastbarkeit und weniger Fatigue nach einem kombinierten Protokoll aus Kryotherapie und Lymphmassage – schonende Stimulation des Immunsystems ohne Überforderung.',
  },
  {
    id: 'morbus-bechterew',
    label: 'Morbus Bechterew',
    anwendungen: ['eisbox', 'armstrong', 'infrarotsauna'],
    einleitungstext:
      'Viele unserer Kunden mit Morbus Bechterew nutzen erfolgreich Kryotherapie zur Entzündungshemmung und Muskelstimulation zum Erhalt der Rumpfstabilität – beides ergänzt physio- und medikamentöse Therapie sinnvoll.',
  },
  {
    id: 'gicht',
    label: 'Gicht',
    anwendungen: ['eisbox', 'redlight'],
    einleitungstext:
      'Viele unserer Kunden mit Gicht-Anfällen berichten, dass regelmäßige Kryotherapie die Häufigkeit und Intensität der Attacken reduziert – systemische Kälte senkt pro-entzündliche Mediatoren, die Gichtanfälle triggern.',
  },
  {
    id: 'tendinopathie',
    label: 'Tendinopathie / Sehnenbeschwerden',
    anwendungen: ['redlight', 'eisbox'],
    einleitungstext:
      'Viele unserer Kunden mit Sehnenproblematiken nutzen erfolgreich Photobiomodulation – Rotlicht fördert die Kollagensynthese in Sehnen und beschleunigt die Heilung chronischer Überlastungsschäden.',
  },
  {
    id: 'multiple-sklerose',
    label: 'Multiple Sklerose',
    anwendungen: ['eisbox', 'redlight', 'boa-lymphmassage'],
    einleitungstext:
      'Viele unserer Kunden mit MS nutzen erfolgreich die Kryotherapie – Kälte reduziert Fatigue und Spastik und verbessert vorübergehend die neuronale Übertragungsgeschwindigkeit.',
  },
  {
    id: 'migraene',
    label: 'Migräne',
    anwendungen: ['eisbox', 'infrarotsauna'],
    einleitungstext:
      'Viele unserer Kunden mit Migräne berichten von weniger häufigen und weniger intensiven Anfällen durch regelmäßige Kryotherapie – Kälte moduliert die trigeminovaskuläre Reaktionskette.',
  },
  {
    id: 'restless-legs',
    label: 'Restless Legs',
    anwendungen: ['eisbox', 'boa-lymphmassage'],
    einleitungstext:
      'Viele unserer Kunden mit Restless-Legs-Syndrom berichten von ruhigeren Nächten nach Kryotherapie und BOA-Lymphmassage – Kälte und Druckwelle normalisieren die periphere Durchblutung und reduzieren den Bewegungsdrang.',
  },
  {
    id: 'schlafstoerungen',
    label: 'Schlafstörungen',
    anwendungen: ['infrarotsauna', 'redlight', 'eisbox'],
    einleitungstext:
      'Viele unserer Kunden mit Schlafproblemen nutzen erfolgreich abendliche Infrarot- und Rotlicht-Sessions – die reaktive Absenkung der Körperkerntemperatur nach der Wärme ist das präziseste Einschlafsignal des Körpers, und Rotlicht fördert zusätzlich die Melatoninproduktion.',
  },
  {
    id: 'burnout',
    label: 'Burnout / Erschöpfung',
    anwendungen: ['infrarotsauna', 'eisbox', 'boa-lymphmassage'],
    einleitungstext:
      'Viele unserer Kunden in der Burnout-Erholung nutzen erfolgreich den kombinierten Ansatz aus Infrarotsauna, Kryotherapie und Lymphmassage – das Trio senkt Cortisol, aktiviert Endorphine und schaltet das Nervensystem in echte Erholung.',
  },
  {
    id: 'depressive-verstimmung',
    label: 'Depressive Verstimmung',
    anwendungen: ['eisbox', 'redlight'],
    einleitungstext:
      'Viele unserer Kunden mit depressiven Verstimmungen berichten von deutlichem Stimmungslift nach Kryotherapie-Sessions – Kälte steigert Noradrenalin und Endorphine auf das 2–4-fache, vergleichbar mit intensivem Sport.',
  },
  {
    id: 'psoriasis',
    label: 'Schuppenflechte (Psoriasis)',
    anwendungen: ['redlight', 'eisbox'],
    einleitungstext:
      'Viele unserer Kunden mit Psoriasis berichten von ruhigerer Haut und weniger Schüben durch regelmäßige Photobiomodulation – Rotlicht hemmt die überschießende Entzündungsreaktion direkt im Hautgewebe.',
  },
  {
    id: 'rueckenschmerzen',
    label: 'Chronische Rückenschmerzen',
    anwendungen: ['infrarotsauna', 'armstrong', 'eisbox'],
    einleitungstext:
      'Viele unserer Kunden mit chronischen Rückenschmerzen nutzen erfolgreich die Kombination aus Infrarotsauna, Muskelstimulation und Kryotherapie – Tiefenwärme löst Verspannungen, Armstrong stärkt die tiefe Rückenmuskulatur, Kälte bremst Entzündungen.',
  },
  {
    id: 'lip-lymphoedem',
    label: 'Lip- / Lymphödem',
    anwendungen: ['boa-lymphmassage', 'eisbox', 'redlight'],
    einleitungstext:
      'Viele unserer Kunden mit Lip- oder Lymphödem nutzen erfolgreich die Kombination aus BOA-Druckwellenmassage und Kryotherapie – die maschinelle Kompressionsmassage mobilisiert die Lymphe systematisch, Kälte verengt die Gefäße und reduziert das Ödem zusätzlich.',
  },
];

export function anwendungenFuerErkrankungen(ids: string[]): AnwendungSlug[] {
  const result: AnwendungSlug[] = [];
  for (const id of ids) {
    const e = ERKRANKUNGEN.find((e) => e.id === id);
    if (!e) continue;
    for (const slug of e.anwendungen) {
      if (!result.includes(slug)) result.push(slug);
    }
  }
  return result;
}

export function einleitungFuerErkrankungen(ids: string[]): string {
  const selected = ids
    .map((id) => ERKRANKUNGEN.find((e) => e.id === id))
    .filter((e): e is Erkrankung => e !== undefined);

  if (selected.length === 0) return '';

  const labels = selected.map((e) => e.label);
  let labelText: string;
  if (labels.length === 1) {
    labelText = labels[0];
  } else {
    labelText = labels.slice(0, -1).join(', ') + ' und ' + labels[labels.length - 1];
  }

  const texte = selected.map((e) => e.einleitungstext).join(' ');
  return `Du hast mit ${labelText} zu kämpfen. ${texte}`;
}
