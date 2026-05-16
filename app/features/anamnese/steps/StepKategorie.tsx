'use client';

import { RadioCard } from '@/components/ui/RadioCard';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import type { MainFocus } from '../types';
import { KATEGORIEN } from '../kategorien';

export function StepKategorie() {
  const { data, setMainFocus, next } = useAnamnese();

  function handleFirst(value: string) {
    setMainFocus(value as MainFocus, false);
  }

  function handleSecond(value: string) {
    if (data.mainFocus2 === value) {
      useAnamnese.getState().clearMainFocus2();
    } else {
      setMainFocus(value as MainFocus, true);
    }
  }

  const available2 = KATEGORIEN.filter((k) => k.value !== data.mainFocus);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-semibold text-cp-tuerkis uppercase tracking-wider">Dein Hauptziel</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KATEGORIEN.map((k) => (
            <RadioCard
              key={k.value}
              name="mainFocus"
              value={k.value}
              checked={data.mainFocus === k.value}
              onChange={handleFirst}
              emoji={k.emoji}
              title={k.title}
              description={k.description}
            />
          ))}
        </div>
      </div>

      {data.mainFocus && (
        <div>
          <p className="mb-1 text-sm font-semibold text-cp-braun uppercase tracking-wider">
            Noch ein zweites Ziel? <span className="normal-case font-normal">(optional)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {available2.map((k) => (
              <RadioCard
                key={k.value}
                name="mainFocus2"
                value={k.value}
                checked={data.mainFocus2 === k.value}
                onChange={handleSecond}
                emoji={k.emoji}
                title={k.title}
                description={k.description}
              />
            ))}
          </div>
        </div>
      )}

      <Button fullWidth disabled={!data.mainFocus} onClick={next}>
        Weiter
      </Button>
    </div>
  );
}
