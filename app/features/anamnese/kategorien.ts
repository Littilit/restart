import type { MainFocus } from './types';

export const KATEGORIEN: { value: MainFocus; emoji: string; title: string; description: string }[] = [
  { value: 'schmerzen', emoji: '🩹', title: 'Schmerzen & Beschwerden', description: 'Rücken, Gelenke, Muskeln, chronische Schmerzen lindern' },
  { value: 'sport', emoji: '🏃', title: 'Sport & Regeneration', description: 'Schneller erholen, mehr Leistung, Verletzungen vorbeugen' },
  { value: 'vitalitaet', emoji: '⚡', title: 'Vitalität & Energie', description: 'Mehr Energie, besserer Schlaf, weniger Stress' },
  { value: 'bodyforming', emoji: '💪', title: 'Bodyforming', description: 'Figur formen, Muskeln aufbauen, Fett reduzieren' },
  { value: 'beckenboden', emoji: '🌸', title: 'Beckenboden', description: 'Beckenboden stärken, Inkontinenz, Rückbildung' },
  { value: 'biohacking', emoji: '🧬', title: 'Biohacking & Prävention', description: 'Langlebigkeit, Peak Performance, Immunsystem' },
];
