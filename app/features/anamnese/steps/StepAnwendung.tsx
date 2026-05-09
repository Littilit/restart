'use client';

import { RadioCard } from '@/components/ui/RadioCard';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import { ANWENDUNGEN } from '@/data/anwendungen';
import type { AnwendungSlug } from '@/data/anwendungen';

export function StepAnwendung() {
  const { data, setGewaehlteAnwendung, next } = useAnamnese();

  function handleSelect(value: string) {
    setGewaehlteAnwendung(value as AnwendungSlug);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ANWENDUNGEN.map((a) => (
          <RadioCard
            key={a.slug}
            name="gewaehlteAnwendung"
            value={a.slug}
            checked={data.gewaehlteAnwendung === a.slug}
            onChange={handleSelect}
            emoji={a.emoji}
            title={a.kurzName}
            description={a.teaser}
          />
        ))}
      </div>
      <Button fullWidth disabled={!data.gewaehlteAnwendung} onClick={next}>
        Weiter
      </Button>
    </div>
  );
}
