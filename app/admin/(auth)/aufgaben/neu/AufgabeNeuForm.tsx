'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Kunde {
  id: string;
  vorname: string;
  nachname: string;
}

interface Props {
  kunden: Kunde[];
}

export default function AufgabeNeuForm({ kunden }: Props) {
  const router = useRouter();
  const [anweisung, setAnweisung] = useState('');
  const [skript, setSkript] = useState('');
  const [kundenInput, setKundenInput] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const kundenMap = useMemo(
    () => new Map(kunden.map((k) => [`${k.vorname} ${k.nachname}`, k.id])),
    [kunden],
  );

  function onKundenInputChange(val: string) {
    setKundenInput(val);
    setCustomerId(kundenMap.get(val));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!anweisung.trim()) return;
    setServerError(null);

    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anweisung: anweisung.trim(),
        skript: skript.trim() || undefined,
        customerId: customerId ?? undefined,
      }),
    });

    if (res.ok) {
      startTransition(() => router.push('/admin'));
    } else {
      const json = await res.json().catch(() => ({})) as { error?: string };
      setServerError(json.error ?? 'Speichern fehlgeschlagen');
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-cp-blau">
          Anweisung
        </label>
        <textarea
          value={anweisung}
          onChange={(e) => setAnweisung(e.target.value)}
          rows={4}
          placeholder="Was sollen die Mitarbeiter tun?"
          required
          className="w-full text-sm border border-cp-beige/70 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-cp-tuerkis transition-colors text-cp-blau placeholder:text-cp-braun/60"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-cp-blau">
          Kundenbezug <span className="font-normal text-cp-braun/70">(optional)</span>
        </label>
        <input
          type="text"
          list="kunden-list"
          value={kundenInput}
          onChange={(e) => onKundenInputChange(e.target.value)}
          placeholder="Name eingeben …"
          className="w-full h-11 text-sm border border-cp-beige/70 rounded-xl px-3.5 focus:outline-none focus:border-cp-tuerkis transition-colors text-cp-blau placeholder:text-cp-braun/60"
        />
        <datalist id="kunden-list">
          {kunden.map((k) => (
            <option key={k.id} value={`${k.vorname} ${k.nachname}`} />
          ))}
        </datalist>
        {customerId && (
          <p className="mt-1.5 text-xs text-cp-tuerkis">Kunde zugeordnet ✓</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-cp-blau">
          Telefonskript <span className="font-normal text-cp-braun/70">(optional)</span>
        </label>
        <textarea
          value={skript}
          onChange={(e) => setSkript(e.target.value)}
          rows={5}
          placeholder="Skript für das Telefonat …"
          className="w-full text-sm border border-cp-beige/70 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-cp-tuerkis transition-colors text-cp-blau placeholder:text-cp-braun/60"
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 font-medium">{serverError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isPending || !anweisung.trim()}
          className="px-5 py-2 text-sm font-medium bg-cp-tuerkis text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Wird gespeichert …' : 'Aufgabe erstellen'}
        </button>
      </div>
    </form>
  );
}
