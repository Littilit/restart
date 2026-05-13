'use client';

import { useState } from 'react';

type ErledigungsTyp = 'termin_vereinbart' | 'feedback_eingeholt' | 'neuer_termin';

export interface ErledigungData {
  typ: ErledigungsTyp;
  notiz?: string;
}

interface Props {
  /** Wird aufgerufen wenn der Nutzer bestätigt — soll den aktuellen Eintrag als erledigt markieren */
  onBestaetigen: (data: ErledigungData) => Promise<void>;
  onErledigt: () => void;
  onAbbrechen: () => void;
  /** Wird benötigt für „Auf neuen Termin verlegen" — neue Task wird diesem Kunden zugeordnet */
  customerId?: string;
}

const NOTIZ_PLACEHOLDER: Record<ErledigungsTyp, string> = {
  termin_vereinbart: 'Termin-Details (optional) …',
  feedback_eingeholt: 'Feedback-Text (optional) …',
  neuer_termin: 'Aufgabe / Anweisung für den neuen Termin …',
};

export default function AufgabeErledigtForm({ onBestaetigen, onErledigt, onAbbrechen, customerId }: Props) {
  const [typ, setTyp] = useState<ErledigungsTyp | null>(null);
  const [notiz, setNotiz] = useState('');
  const [neuerTermin, setNeuerTermin] = useState('');
  const [pending, setPending] = useState(false);

  const neuerTerminRequired = typ === 'neuer_termin';
  const canSubmit = typ !== null && (!neuerTerminRequired || neuerTermin !== '');

  async function bestaetigen() {
    if (!typ || !canSubmit) return;
    setPending(true);

    await onBestaetigen({ typ, notiz: notiz.trim() || undefined });

    if (typ === 'neuer_termin' && customerId && neuerTermin) {
      await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          anweisung: notiz.trim() || 'Nachfass-Gespräch',
          faelligAm: new Date(neuerTermin).toISOString(),
        }),
      });
    }

    onErledigt();
  }

  const optionen: [ErledigungsTyp, string][] = [
    ['termin_vereinbart', 'Weiterer Termin vereinbart'],
    ['feedback_eingeholt', 'Feedback / Rückmeldung eingeholt'],
    ...(customerId ? [['neuer_termin', 'Auf neuen Termin verlegen'] as [ErledigungsTyp, string]] : []),
  ];

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <p className="text-xs font-medium text-gray-600">Was wurde erledigt?</p>
      <div className="flex flex-col gap-2">
        {optionen.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`erledigung-${Math.random()}`}
              value={value}
              checked={typ === value}
              onChange={() => { setTyp(value); setNotiz(''); setNeuerTermin(''); }}
              className="accent-cp-tuerkis"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {typ && (
        <>
          {neuerTerminRequired && (
            <input
              type="date"
              value={neuerTermin}
              onChange={(e) => setNeuerTermin(e.target.value)}
              min={new Date().toISOString().substring(0, 10)}
              required
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            />
          )}
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={2}
            placeholder={NOTIZ_PLACEHOLDER[typ]}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
          />
        </>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onAbbrechen}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          onClick={bestaetigen}
          disabled={!canSubmit || pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {pending ? 'Speichern …' : 'Bestätigen'}
        </button>
      </div>
    </div>
  );
}
