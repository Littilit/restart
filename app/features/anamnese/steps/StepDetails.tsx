'use client';

import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import { DETAIL_FRAGEN, type Frage } from '../fragen';
import type { MainFocus } from '../types';
import { FrageBlock } from '../FrageBlock';

function isAnswered(frage: Frage, val: string | string[]): boolean {
  if (!frage.required) return true;
  if (Array.isArray(val)) return val.length > 0;
  return val.trim().length > 0;
}

function BlockGroup({
  focus,
  chamber,
  isSecond,
  label,
}: {
  focus: MainFocus;
  chamber: Record<string, string>;
  isSecond: boolean;
  label: string;
}) {
  const { setChamber2Answer } = useAnamnese();
  const fragen = DETAIL_FRAGEN[focus] ?? [];

  if (fragen.length === 0) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-cp-tuerkis uppercase tracking-wider">{label}</p>
      {fragen.map((frage) => {
        const raw = chamber[frage.id] ?? '';
        const val = frage.type === 'chips' ? (raw ? raw.split(',') : []) : raw;
        return (
          <FrageBlock
            key={frage.id}
            frage={frage}
            value={val}
            onChange={(next) => {
              const serialized = Array.isArray(next) ? next.join(',') : next;
              setChamber2Answer(frage.id, serialized, isSecond);
            }}
          />
        );
      })}
    </div>
  );
}

export function StepDetails() {
  const { data, next, back } = useAnamnese();
  const { mainFocus, mainFocus2, chamber2, chamber2b } = data;

  if (!mainFocus) return null;

  const fragen1 = DETAIL_FRAGEN[mainFocus] ?? [];
  const fragen2 = mainFocus2 ? DETAIL_FRAGEN[mainFocus2] ?? [] : [];

  const allAnswered =
    fragen1.filter((f) => f.required).every((f) => {
      const raw = chamber2[f.id] ?? '';
      return isAnswered(f, f.type === 'chips' ? raw.split(',').filter(Boolean) : raw);
    }) &&
    fragen2.filter((f) => f.required).every((f) => {
      const raw = chamber2b[f.id] ?? '';
      return isAnswered(f, f.type === 'chips' ? raw.split(',').filter(Boolean) : raw);
    });

  return (
    <div className="space-y-10">
      <BlockGroup
        focus={mainFocus}
        chamber={chamber2}
        isSecond={false}
        label="Zu deinem Hauptziel"
      />
      {mainFocus2 && (
        <BlockGroup
          focus={mainFocus2}
          chamber={chamber2b}
          isSecond={true}
          label="Zu deinem zweiten Ziel"
        />
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={back} className="flex-1">
          Zurück
        </Button>
        <Button disabled={!allAnswered} onClick={next} className="flex-[2]">
          Weiter
        </Button>
      </div>
    </div>
  );
}
