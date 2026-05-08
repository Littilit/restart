'use client';

import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';
import type { Kontraindikation } from '../types';

const KONTRAINDIKATIONEN: { id: Kontraindikation; label: string; hint?: string }[] = [
  { id: 'herzschrittmacher', label: 'Herzschrittmacher, Defibrillator oder implantierte elektronische Geräte' },
  { id: 'metallimplantate', label: 'Metallimplantate, Prothesen oder Schrauben im Körper' },
  { id: 'herzerkrankungen', label: 'Bekannte Herzerkrankungen oder Herzrhythmusstörungen' },
  { id: 'blutverduenner', label: 'Blutverdünner oder gerinnungshemmende Medikamente' },
  { id: 'epilepsie', label: 'Epilepsie oder Anfallserkrankungen' },
  { id: 'krebs', label: 'Aktive Krebserkrankung oder laufende Chemotherapie' },
  { id: 'operation', label: 'Operation in den letzten 3 Monaten' },
  { id: 'schwangerschaft', label: 'Schwangerschaft' },
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
              label={k.label}
              hint={k.hint}
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
