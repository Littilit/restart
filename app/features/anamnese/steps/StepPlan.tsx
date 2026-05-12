'use client';

import { CheckCircle2, CalendarDays, FlaskConical } from 'lucide-react';
import type { AnwendungSlug } from '@/data/anwendungen';
import { getAnwendung } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';
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
    softHint:
      'Tipp: Wer viel trinkt, ausgewogen isst und sich bewegt, holt langfristig mehr raus. Kein Muss – aber es macht den Unterschied.',
  },
  beckenbodenstuhl: {
    text: 'Keine Vorbereitung nötig – du kannst in normaler Alltagskleidung kommen, auch in Jeans.',
  },
  cryoshaper: {
    text: 'Zur Anwendung brauchst du nichts Besonderes beachten.',
    softHint:
      'Tipp: Trink viel Wasser – das unterstützt deinen Körper beim natürlichen Abbau der Fettzellen. Ausgewogene Ernährung und Bewegung im Alltag helfen zusätzlich. Kein Muss, aber es wirkt.',
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
  const { vorname, mainFocus, mainFocus2, gewaehlteAnwendung, recommendations } = data;

  const focusLabel = mainFocus ? FOKUS_LABELS[mainFocus] : '';
  const focus2Label = mainFocus2 ? FOKUS_LABELS[mainFocus2] : null;
  const naechsterSchritt = gewaehlteAnwendung ? NAECHSTER_SCHRITT[gewaehlteAnwendung] : null;

  return (
    <div className="space-y-8">
      {/* Begrüßung */}
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cp-tuerkis/10 mx-auto">
          <CheckCircle2 className="h-9 w-9 text-cp-tuerkis" />
        </div>
        <h2 className="text-2xl font-bold text-cp-blau">Danke, {vorname}!</h2>
        <p className="text-cp-braun">
          Deine Anmeldung ist bei uns eingegangen. Wir freuen uns auf deinen Besuch.
        </p>
        <div className="inline-flex flex-wrap justify-center gap-2 text-xs font-semibold text-cp-braun/70">
          <span className="rounded-full bg-cp-creme px-3 py-1">{focusLabel}</span>
          {focus2Label && (
            <span className="rounded-full bg-cp-creme px-3 py-1">{focus2Label}</span>
          )}
        </div>
      </div>

      {/* Empfehlungskarten */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-cp-braun/50 text-center">
            Dein persönlicher Protokollvorschlag
          </p>
          {recommendations.map((rec, idx) => {
            const anwendung = getAnwendung(rec.slug);
            const research = RESEARCH[rec.slug];
            return (
              <div
                key={rec.slug}
                className="rounded-2xl border border-cp-blau/10 bg-white overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                  <span className="text-2xl leading-none">{anwendung.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-cp-tuerkis">
                      Empfehlung {idx + 1}
                    </p>
                    <p className="font-bold text-cp-blau leading-tight">{anwendung.name}</p>
                  </div>
                </div>

                {/* Personalisierte Begründung */}
                {rec.explanation && (
                  <p className="px-5 pb-3 text-sm text-cp-braun leading-relaxed">
                    {rec.explanation}
                  </p>
                )}

                {/* Wissenschaftlicher Wirkungsmechanismus */}
                {research?.shortClaim && (
                  <div className="mx-5 mb-3 flex gap-2 rounded-xl bg-cp-blau/5 px-3 py-2.5">
                    <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cp-tuerkis" />
                    <p className="text-xs text-cp-braun/70 leading-relaxed">{research.shortClaim}</p>
                  </div>
                )}

                {/* Sessions */}
                <div className="flex items-center gap-1.5 px-5 pb-4">
                  <CalendarDays className="h-3.5 w-3.5 text-cp-braun/40" />
                  <span className="text-xs font-medium text-cp-braun/60">{rec.sessions}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nächster Schritt */}
      <div className="rounded-2xl bg-cp-blau text-white p-5 space-y-2">
        <p className="font-bold">Dein nächster Schritt</p>
        {naechsterSchritt ? (
          <>
            <p className="text-sm text-white/90 leading-relaxed">{naechsterSchritt.text}</p>
            {naechsterSchritt.softHint && (
              <p className="text-sm text-white/60 leading-relaxed pt-1">
                {naechsterSchritt.softHint}
              </p>
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
