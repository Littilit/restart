import type { MainFocus } from './types';

export interface FrageOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface ChipFrage {
  type: 'chips';
  id: string;
  frage: string;
  options: FrageOption[];
  required?: boolean;
}

export interface RadioFrage {
  type: 'radio';
  id: string;
  frage: string;
  options: FrageOption[];
  required?: boolean;
}

export interface FreetextFrage {
  type: 'freetext';
  id: string;
  frage: string;
  placeholder?: string;
  required?: boolean;
}

export type Frage = ChipFrage | RadioFrage | FreetextFrage;

export const DETAIL_FRAGEN: Record<MainFocus, Frage[]> = {
  schmerzen: [
    {
      type: 'chips',
      id: 'location',
      frage: 'Wo hast du Beschwerden?',
      options: [
        { id: 'ruecken', label: 'Rücken / Nacken' },
        { id: 'gelenke', label: 'Gelenke' },
        { id: 'knie', label: 'Knie' },
        { id: 'huefte', label: 'Hüfte' },
        { id: 'muskeln', label: 'Muskeln' },
        { id: 'kopf', label: 'Kopfschmerzen' },
        { id: 'ganzkörper', label: 'Ganzköper' },
        { id: 'sonstiges', label: 'Sonstiges' },
      ],
      required: true,
    },
    {
      type: 'radio',
      id: 'dauer',
      frage: 'Seit wann bestehen die Beschwerden?',
      options: [
        { id: 'akut', label: 'Akut (< 2 Wochen)' },
        { id: 'kurz', label: 'Kurzfristig (2–6 Wochen)' },
        { id: 'lang', label: 'Länger (2–6 Monate)' },
        { id: 'chronisch', label: 'Chronisch (> 6 Monate)' },
      ],
      required: true,
    },
  ],

  sport: [
    {
      type: 'chips',
      id: 'sportart',
      frage: 'Welche Sportarten betreibst du?',
      options: [
        { id: 'kraft', label: 'Kraft / Gym' },
        { id: 'ausdauer', label: 'Ausdauer / Laufen' },
        { id: 'ballsport', label: 'Ballsport' },
        { id: 'kampfsport', label: 'Kampfsport' },
        { id: 'yoga', label: 'Yoga / Pilates' },
        { id: 'functional', label: 'Functional Training' },
        { id: 'sonstiges', label: 'Sonstiges' },
      ],
      required: true,
    },
    {
      type: 'radio',
      id: 'ziel',
      frage: 'Was ist dein sportliches Hauptziel?',
      options: [
        { id: 'regeneration', label: 'Schnellere Regeneration' },
        { id: 'leistung', label: 'Mehr Leistung' },
        { id: 'praevention', label: 'Verletzungsprävention' },
        { id: 'wohlbefinden', label: 'Allgemeines Wohlbefinden' },
      ],
      required: true,
    },
  ],

  vitalitaet: [
    {
      type: 'radio',
      id: 'wunsch',
      frage: 'Was möchtest du am meisten verbessern?',
      options: [
        { id: 'energie', label: 'Mehr Energie & Antrieb' },
        { id: 'schlaf', label: 'Besseren Schlaf' },
        { id: 'stress', label: 'Weniger Stress' },
        { id: 'klarheit', label: 'Mentale Klarheit & Fokus' },
      ],
      required: true,
    },
    {
      type: 'chips',
      id: 'raeube',
      frage: 'Was raubt dir gerade am meisten Energie?',
      options: [
        { id: 'arbeit', label: 'Stress bei der Arbeit' },
        { id: 'schlaf', label: 'Schlechter Schlaf' },
        { id: 'schmerzen', label: 'Körperliche Schmerzen' },
        { id: 'bewegung', label: 'Zu wenig Bewegung' },
        { id: 'ernaehrung', label: 'Unausgewogene Ernährung' },
        { id: 'familie', label: 'Familiäre Belastung' },
      ],
    },
  ],

  bodyforming: [
    {
      type: 'radio',
      id: 'ziel',
      frage: 'Was ist dein primäres Ziel?',
      options: [
        { id: 'fettabbau', label: 'Lokalen Fettabbau' },
        { id: 'muskelaufbau', label: 'Muskelaufbau & Definierung' },
        { id: 'straff', label: 'Straffung & Hautbild' },
        { id: 'kontur', label: 'Körperkontur verbessern' },
      ],
      required: true,
    },
    {
      type: 'chips',
      id: 'zone',
      frage: 'Welche Körperzonen beschäftigen dich?',
      options: [
        { id: 'bauch', label: 'Bauch' },
        { id: 'po', label: 'Po' },
        { id: 'oberschenkel', label: 'Oberschenkel' },
        { id: 'huefte', label: 'Hüfte / Love Handles' },
        { id: 'arme', label: 'Arme' },
        { id: 'ruecken', label: 'Rücken' },
        { id: 'doppelkinn', label: 'Doppelkinn' },
      ],
      required: true,
    },
  ],

  beckenboden: [
    {
      type: 'radio',
      id: 'thema',
      frage: 'Was führt dich zu uns?',
      options: [
        { id: 'inkontinenz', label: 'Belastungsinkontinenz (Niesen, Husten, Sport)' },
        { id: 'drang', label: 'Dranginkontinenz (Das Halten fällt mir schwer)' },
        { id: 'postpartum', label: 'Rückbildung nach Schwangerschaft' },
        { id: 'schwäche', label: 'Allgemeine Beckenbodenschwäche' },
        { id: 'praevention', label: 'Prävention & Vorsorge' },
      ],
      required: true,
    },
    {
      type: 'radio',
      id: 'dauer',
      frage: 'Seit wann beschäftigt dich das Thema?',
      options: [
        { id: 'kurz', label: 'Wenige Wochen' },
        { id: 'mittel', label: 'Einige Monate' },
        { id: 'lang', label: 'Mehr als ein Jahr' },
        { id: 'praventiv', label: 'Präventiv – noch kein Problem' },
      ],
    },
  ],

  biohacking: [
    {
      type: 'radio',
      id: 'fokus',
      frage: 'Was ist dein Longevity-Fokus?',
      options: [
        { id: 'longevity', label: 'Langlebigkeit & Prävention' },
        { id: 'performance', label: 'Peak Performance' },
        { id: 'recovery', label: 'Optimale Erholung' },
        { id: 'immunsystem', label: 'Immunsystem stärken' },
      ],
      required: true,
    },
    {
      type: 'chips',
      id: 'protokoll',
      frage: 'Was nutzt du bereits?',
      options: [
        { id: 'kalt', label: 'Kältetherapie' },
        { id: 'sauna', label: 'Sauna / Wärme' },
        { id: 'licht', label: 'Lichttherapie' },
        { id: 'ernaehrung', label: 'Spezielle Ernährung' },
        { id: 'sport', label: 'Gezieltes Training' },
        { id: 'nichts', label: 'Noch nichts' },
      ],
    },
  ],
};
