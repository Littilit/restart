import type { Kontraindikation } from '@/features/anamnese/types';

export const KONTRAINDIKATION_LABEL: Record<Kontraindikation, string> = {
  herzschrittmacher: 'Herzschrittmacher, Defibrillator oder implantierte elektronische Geräte',
  metallimplantate: 'Metallimplantate, Prothesen oder Schrauben im Körper',
  herzerkrankungen: 'Bekannte Herzerkrankungen oder Herzrhythmusstörungen',
  blutverduenner: 'Blutverdünner oder gerinnungshemmende Medikamente',
  epilepsie: 'Epilepsie oder Anfallserkrankungen',
  krebs: 'Aktive Krebserkrankung oder laufende Chemotherapie',
  operation: 'Operation in den letzten 3 Monaten',
  schwangerschaft: 'Schwangerschaft',
};
