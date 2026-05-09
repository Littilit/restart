'use client';

import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import type { Kontraindikation } from '../types';
import { KONTRAINDIKATION_LABEL } from '@/data/kontraindikationen';

const KONTRAINDIKATIONEN: { id: Kontraindikation }[] = [
  { id: 'herzschrittmacher' },
  { id: 'metallimplantate' },
  { id: 'herzerkrankungen' },
  { id: 'blutverduenner' },
  { id: 'epilepsie' },
  { id: 'krebs' },
  { id: 'operation' },
  { id: 'schwangerschaft' },
];

export function StepKontraindikationen() {
  const { data, setKontraindikation, setKeineKontraindikationen, next, back } = useAnamnese();

  const hasAny = Object.values(data.kontraindikationen).some(Boolean);
  const canProceed = data.keineKontraindikationen || hasAny !== undefined;

  return (
    <div className="space-y-5">
      <p className="text-sm text-cp-braun">
        Bitte gib an, ob eine der folgenden Erkrankungen oder Situationen auf dich zutrifft.
        Diese Information ist wichtig für deine Sicherheit.
      </p>

      <div className="space-y-3">
        {KONTRAINDIKATIONEN.map((k) => (
          <div key={k.id} className="rounded-xl border border-cp-beige/60 bg-white p-4">
            <Checkbox
              checked={!!data.kontraindikationen[k.id]}
              onChange={(e) => setKontraindikation(k.id, e.target.checked)}
              label={KONTRAINDIKATION_LABEL[k.id]}
              disabled={data.keineKontraindikationen}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-cp-tuerkis/40 bg-cp-tuerkis/5 p-4">
        <Checkbox
          checked={data.keineKontraindikationen}
          onChange={(e) => setKeineKontraindikationen(e.target.checked)}
          label={<span className="font-semibold">Nichts davon trifft auf mich zu</span>}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={back} className="flex-1">
          Zurück
        </Button>
        <Button
          disabled={!data.keineKontraindikationen && !hasAny}
          onClick={next}
          className="flex-[2]"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
