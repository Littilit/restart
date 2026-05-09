'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AnwendungSlug } from '@/data/anwendungen';
import { useAnamnese } from '../store';

interface NaechsterSchrittInfo {
  text: string;
  softHint?: string;
}

const NAECHSTER_SCHRITT: Record<AnwendungSlug, NaechsterSchrittInfo> = {
  eisbox: {
    text: 'Kümmer dich um nichts – wir stellen dir alles. Du kannst eigene Handschuhe, eine Mütze oder eine Atemmaske mitbringen, musst es aber nicht.',
  },
  redlight: {
    text: 'Keine Vorbereitung nötig – komm einfach so, wie du bist.',
  },
  infrarotsauna: {
    text: 'Du bekommst ein Handtuch von uns. Möchtest du ein zweites? Bring gerne deins mit.',
  },
  'boa-lymphmassage': {
    text: 'Trag bitte eine lange, bequeme Hose – z. B. eine Leggings oder eine Jogginghose. Das Oberteil ist egal.',
  },
  armstrong: {
    text: 'Zur Anwendung brauchst du nichts Besonderes mitbringen.',
    softHint: 'Tipp: Wer viel trinkt, ausgewogen isst und sich bewegt, holt langfristig mehr raus. Kein Muss – aber es macht den Unterschied.',
  },
  beckenbodenstuhl: {
    text: 'Keine Vorbereitung nötig – du kannst in normaler Alltagskleidung kommen, auch in Jeans.',
  },
  cryoshaper: {
    text: 'Zur Anwendung brauchst du nichts Besonderes beachten.',
    softHint: 'Tipp: Trink viel Wasser – das unterstützt deinen Körper beim natürlichen Abbau der Fettzellen. Ausgewogene Ernährung und Bewegung im Alltag helfen zusätzlich. Kein Muss, aber es wirkt.',
  },
};

const FOKUS_LABELS: Record<string, string> = {
  schmerzen: 'Schmerzen & Beschwerden',
  sport: 'Sport & Regeneration',
  vitalitaet: 'Vitalität & Energie',
  bodyforming: 'Bodyforming',
  beckenboden: 'Beckenboden',
  biohacking: 'Biohacking & Prävention',
};

export function StepPlan() {
  const { data, reset } = useAnamnese();
  const { vorname, mainFocus, mainFocus2, gewaehlteAnwendung } = data;

  const focusLabel = mainFocus ? FOKUS_LABELS[mainFocus] : '';
  const focus2Label = mainFocus2 ? FOKUS_LABELS[mainFocus2] : null;
  const naechsterSchritt = gewaehlteAnwendung ? NAECHSTER_SCHRITT[gewaehlteAnwendung] : null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cp-tuerkis/10 mx-auto">
          <CheckCircle2 className="h-9 w-9 text-cp-tuerkis" />
        </div>
        <h2 className="text-2xl font-bold text-cp-blau">
          Danke, {vorname}!
        </h2>
        <p className="text-cp-braun">
          Deine Anmeldung ist bei uns eingegangen. Wir freuen uns auf deinen Besuch.
        </p>
        <div className="inline-flex flex-wrap justify-center gap-2 text-xs font-semibold text-cp-braun/70">
          <span className="rounded-full bg-cp-creme px-3 py-1">{focusLabel}</span>
          {focus2Label && <span className="rounded-full bg-cp-creme px-3 py-1">{focus2Label}</span>}
        </div>
      </div>

      <div className="rounded-2xl bg-cp-blau text-white p-5 space-y-2">
        <p className="font-bold">Dein nächster Schritt</p>
        {naechsterSchritt ? (
          <>
            <p className="text-sm text-white/90 leading-relaxed">{naechsterSchritt.text}</p>
            {naechsterSchritt.softHint && (
              <p className="text-sm text-white/60 leading-relaxed pt-1">{naechsterSchritt.softHint}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/80">
            Wir melden uns bei dir zur Bestätigung deines Termins.
          </p>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={reset}
          className="text-xs text-cp-braun underline hover:text-cp-blau"
        >
          Neuen Anamnesebogen ausfüllen
        </button>
      </div>
    </div>
  );
}
