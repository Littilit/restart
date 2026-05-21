'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';

export function StepZiel() {
  const { data, setZiel, next, back } = useAnamnese();
  const [text, setText] = useState(data.zielText);

  function handleChange(val: string) {
    setText(val);
    setZiel(val);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cp-braun leading-relaxed">
        Was wäre für dich ein guter Mehrwert, oder ein gutes Ergebnis, wenn du unsere Anwendungen
        nutzt — und in welchem Zeitraum siehst du es als realistisch an?
      </p>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="z. B. Weniger Rückenschmerzen in 3 Monaten …"
        rows={5}
        className="w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp-braun/30 resize-none"
      />

      <div className="flex gap-3">
        <Button variant="ghost" onClick={back} className="flex-1">
          Zurück
        </Button>
        <Button onClick={next} className="flex-[2]">
          Weiter
        </Button>
      </div>
    </div>
  );
}
