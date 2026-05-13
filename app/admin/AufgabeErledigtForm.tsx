'use client';

import { useState } from 'react';

type ErledigungsTyp = 'termin_vereinbart' | 'feedback_eingeholt';

interface Props {
  taskId: string;
  onErledigt: () => void;
  onAbbrechen: () => void;
}

export default function AufgabeErledigtForm({ taskId, onErledigt, onAbbrechen }: Props) {
  const [typ, setTyp] = useState<ErledigungsTyp | null>(null);
  const [notiz, setNotiz] = useState('');
  const [pending, setPending] = useState(false);

  async function bestaetigen() {
    if (!typ) return;
    setPending(true);
    await fetch(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ erledigungsTyp: typ, notiz: notiz.trim() || undefined }),
    });
    onErledigt();
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <p className="text-xs font-medium text-gray-600">Was wurde erledigt?</p>
      <div className="flex flex-col gap-2">
        {([
          ['termin_vereinbart', 'Weiterer Termin vereinbart'],
          ['feedback_eingeholt', 'Feedback / Rückmeldung eingeholt'],
        ] as [ErledigungsTyp, string][]).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`erledigung-${taskId}`}
              value={value}
              checked={typ === value}
              onChange={() => setTyp(value)}
              className="accent-cp-tuerkis"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {typ && (
        <textarea
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          rows={2}
          placeholder={typ === 'termin_vereinbart' ? 'Termin-Details (optional) …' : 'Feedback-Text (optional) …'}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
        />
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
          disabled={!typ || pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {pending ? 'Speichern …' : 'Bestätigen'}
        </button>
      </div>
    </div>
  );
}
