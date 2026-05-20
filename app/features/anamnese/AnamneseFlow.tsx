'use client';

import { useAnamnese } from './store';
import { AnamneseShell } from './AnamneseShell';
import { StepAnwendung } from './steps/StepAnwendung';
import { StepKategorie } from './steps/StepKategorie';
import { StepDetails } from './steps/StepDetails';
import { StepZiel } from './steps/StepZiel';
import { StepKontraindikationen } from './steps/StepKontraindikationen';
import { StepDaten } from './steps/StepDaten';
import { StepConsent } from './steps/StepConsent';
import { StepSignatur } from './steps/StepSignatur';
import { StepPlan } from './steps/StepPlan';

const STEP_META = {
  anwendung: {
    title: 'Für welche Anwendung kommst du zu uns?',
    subtitle: 'Wähle die Anwendung, für die du heute einen Termin hast.',
  },
  kategorie: {
    title: 'Was bringt dich zu uns?',
    subtitle: 'Wähle deinen Hauptfokus – du kannst auch ein zweites Ziel angeben.',
  },
  details: {
    title: 'Erzähl uns mehr',
    subtitle: 'Damit wir deinen Plan optimal auf dich abstimmen können.',
  },
  ziel: {
    title: 'Dein persönliches Ziel',
    subtitle: 'Diese Frage ist optional — du kannst sie auch überspringen.',
  },
  kontraindikationen: {
    title: 'Sicherheits-Check',
    subtitle: 'Deine Angaben helfen uns, die richtigen Anwendungen für dich auszuwählen.',
  },
  daten: {
    title: 'Deine Kontaktdaten',
    subtitle: 'Wir verwenden sie ausschließlich für die Terminabstimmung.',
  },
  consent: {
    title: 'Einwilligungen',
    subtitle: 'Bitte bestätige die erforderlichen Zustimmungen.',
  },
  signatur: {
    title: 'Fast geschafft!',
    subtitle: 'Unterschreibe, um deine Angaben zu bestätigen und deinen Plan zu erhalten.',
  },
  plan: {
    title: '',
    subtitle: '',
  },
} as const;

export function AnamneseFlow() {
  const currentStep = useAnamnese((s) => s.currentStep);
  const meta = STEP_META[currentStep];

  if (currentStep === 'plan') {
    return (
      <AnamneseShell title="">
        <StepPlan />
      </AnamneseShell>
    );
  }

  return (
    <AnamneseShell title={meta.title} subtitle={meta.subtitle}>
      {currentStep === 'anwendung' && <StepAnwendung />}
      {currentStep === 'kategorie' && <StepKategorie />}
      {currentStep === 'details' && <StepDetails />}
      {currentStep === 'ziel' && <StepZiel />}
      {currentStep === 'kontraindikationen' && <StepKontraindikationen />}
      {currentStep === 'daten' && <StepDaten />}
      {currentStep === 'consent' && <StepConsent />}
      {currentStep === 'signatur' && <StepSignatur />}
    </AnamneseShell>
  );
}
