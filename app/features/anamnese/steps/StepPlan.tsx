'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAnwendung } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';
import { useAnamnese } from '../store';

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
  const { recommendations, vorname, mainFocus, mainFocus2 } = data;

  const focusLabel = mainFocus ? FOKUS_LABELS[mainFocus] : '';
  const focus2Label = mainFocus2 ? FOKUS_LABELS[mainFocus2] : null;

  const waLink = `https://wa.me/4982188998881?text=${encodeURIComponent(
    `Hallo, ich habe gerade den Anamnesebogen ausgefüllt (${vorname}) und würde gerne einen Termin vereinbaren.`,
  )}`;

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
          Deine Anmeldung ist angekommen. Hier ist dein persönlicher Anwendungsplan:
        </p>
        <div className="inline-flex flex-wrap justify-center gap-2 text-xs font-semibold text-cp-braun/70">
          <span className="rounded-full bg-cp-creme px-3 py-1">{focusLabel}</span>
          {focus2Label && <span className="rounded-full bg-cp-creme px-3 py-1">{focus2Label}</span>}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wider">
            Dein optimaler Plan · {recommendations.length} Anwendung{recommendations.length > 1 ? 'en' : ''}
          </p>
          {recommendations.map((rec) => {
            let anwendung;
            try { anwendung = getAnwendung(rec.slug); } catch { return null; }
            const research = RESEARCH[rec.slug];
            return (
              <Card key={rec.slug} accent className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none">{anwendung.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-cp-blau">{anwendung.kurzName}</p>
                    <p className="text-xs text-cp-braun mt-0.5">{anwendung.dauer} · {rec.sessions}</p>
                  </div>
                </div>
                {rec.explanation && (
                  <p className="text-sm text-cp-blau/80 leading-relaxed">{rec.explanation}</p>
                )}
                {research && (
                  <div className="rounded-xl bg-cp-creme/60 p-3">
                    <p className="text-xs font-semibold text-cp-braun mb-1.5">Wissenschaftlicher Hintergrund</p>
                    <p className="text-xs text-cp-blau/70 leading-relaxed">{research.mechanism}</p>
                    <ul className="mt-2 space-y-1">
                      {research.topEffects.map((e) => (
                        <li key={e} className="text-xs text-cp-blau/80 flex gap-1.5">
                          <span className="text-cp-tuerkis shrink-0">✓</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl bg-cp-blau text-white p-5 space-y-3">
        <p className="font-bold">Dein nächster Schritt</p>
        <p className="text-sm text-white/80">
          Wir melden uns bei dir, um einen Termin zu vereinbaren. Oder schreib uns direkt:
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white text-cp-blau font-semibold px-5 py-2.5 text-sm hover:bg-cp-creme transition-colors"
        >
          <span>💬</span> WhatsApp – Termin anfragen
        </a>
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
