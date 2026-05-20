import type { AnwendungSlug } from '@/data/anwendungen';

export type MainFocus =
  | 'schmerzen'
  | 'sport'
  | 'vitalitaet'
  | 'bodyforming'
  | 'beckenboden'
  | 'biohacking';

export type Kontraindikation =
  | 'herzschrittmacher'
  | 'blutverduenner'
  | 'epilepsie'
  | 'metallimplantate'
  | 'krebs'
  | 'herzerkrankungen'
  | 'operation'
  | 'schwangerschaft';

export interface EmpfehlungEntry {
  slug: AnwendungSlug;
  sessions: string;
  explanation: string;
}

export interface AnamneseData {
  version: 2;
  gewaehlteAnwendung: AnwendungSlug | null;
  mainFocus: MainFocus | null;
  mainFocus2: MainFocus | null;
  chamber2: Record<string, string>;
  chamber2b: Record<string, string>;
  recommendations: EmpfehlungEntry[];
  kontraindikationen: Partial<Record<Kontraindikation, boolean>>;
  keineKontraindikationen: boolean;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  geburtsdatum: string;
  adresse: string;
  consentDsgvo: boolean;
  consentGesundheitsdaten: boolean;
  consentMarketing: boolean;
  signatureDataUrl: string | null;
  zielText: string;
  zielAudioDataUrl: string | null;
  herkunft: string;
}

export type AnamneseStep =
  | 'anwendung'
  | 'kategorie'
  | 'details'
  | 'ziel'
  | 'kontraindikationen'
  | 'daten'
  | 'consent'
  | 'signatur'
  | 'plan';

export const STEP_ORDER: AnamneseStep[] = [
  'anwendung',
  'kategorie',
  'details',
  'ziel',
  'kontraindikationen',
  'daten',
  'consent',
  'signatur',
  'plan',
];

export const COUNTED_STEPS = STEP_ORDER.filter((s) => s !== 'plan');

export const INITIAL_DATA: AnamneseData = {
  version: 2,
  gewaehlteAnwendung: null,
  mainFocus: null,
  mainFocus2: null,
  chamber2: {},
  chamber2b: {},
  recommendations: [],
  kontraindikationen: {},
  keineKontraindikationen: false,
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  geburtsdatum: '',
  adresse: '',
  consentDsgvo: false,
  consentGesundheitsdaten: false,
  consentMarketing: false,
  signatureDataUrl: null,
  zielText: '',
  zielAudioDataUrl: null,
  herkunft: '',
};
