'use client';

import { ChipSelect } from '@/components/ui/ChipSelect';
import { RadioCard } from '@/components/ui/RadioCard';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import { DETAIL_FRAGEN, type Frage } from '../fragen';
import type { MainFocus } from '../types';

function FrageBlock({
  frage,
  value,
  onChange,
}: {
  frage: Frage;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  if (frage.type === 'chips') {
    return (
      <div>
        <p className="mb-3 font-semibold text-cp-blau">{frage.frage}</p>
        <ChipSelect
          options={frage.options.map((o) => ({ value: o.id, label: o.label, emoji: o.emoji }))}
          value={Array.isArray(value) ? value : value ? [value] : []}
          onChange={(next) => onChange(next)}
          ariaLabel={frage.frage}
        />
      </div>
    );
  }

  if (frage.type === 'radio') {
    const strVal = Array.isArray(value) ? value[0] ?? '' : value;
    return (
      <div>
        <p className="mb-3 font-semibold text-cp-blau">{frage.frage}</p>
        <div className="grid grid-cols-1 gap-2">
          {frage.options.map((opt) => (
            <RadioCard
              key={opt.id}
              name={frage.id}
              value={opt.id}
              checked={strVal === opt.id}
              onChange={(v) => onChange(v)}
              emoji={opt.emoji}
              title={opt.label}
            />
          ))}
        </div>
      </div>
    );
  }

  if (frage.type === 'freetext') {
    const strVal = Array.isArray(value) ? value[0] ?? '' : value;
    return (
      <Textarea
        label={frage.frage}
        placeholder={frage.placeholder}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  return null;
}

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
