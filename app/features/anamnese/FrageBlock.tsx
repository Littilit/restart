'use client';

import { ChipSelect } from '@/components/ui/ChipSelect';
import { RadioCard } from '@/components/ui/RadioCard';
import { Textarea } from '@/components/ui/Textarea';
import type { Frage } from './fragen';

export function FrageBlock({
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
