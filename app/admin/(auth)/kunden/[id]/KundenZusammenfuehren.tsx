'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerHit {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
}

interface Props {
  keepId: string;
  keepName: string;
  keepEmail: string;
}

export default function KundenZusammenfuehren({ keepId, keepName, keepEmail }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerHit[]>([]);
  const [selected, setSelected] = useState<CustomerHit | null>(null);
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function suchen(q: string) {
    setQuery(q);
    setSelected(null);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`);
    const data: CustomerHit[] = await res.json();
    setResults(data.filter((c) => c.id !== keepId));
    setSearching(false);
  }

  async function zusammenfuehren() {
    if (!selected) return;
    setError(null);
    const res = await fetch('/api/admin/customers/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keepId, mergeId: selected.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? 'Fehler beim Zusammenführen');
      return;
    }
    startTransition(() => router.refresh());
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
      >
        Zusammenführen
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl border border-orange-200 bg-orange-50 space-y-3">
      <p className="text-xs font-medium text-orange-800">Kunden zusammenführen</p>
      <p className="text-xs text-orange-700">
        <strong>{keepName}</strong> bleibt erhalten. Der unten ausgewählte Kunde wird aufgelöst — alle seine Daten (Anamnesen, Notizen, Aufgaben) werden übernommen.
      </p>

      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => suchen(e.target.value)}
          placeholder="Name, E-Mail oder Telefon suchen …"
          autoFocus
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis bg-white"
        />
        {searching && <p className="text-xs text-gray-400 mt-1">Suche …</p>}
        {!searching && results.length > 0 && !selected && (
          <ul className="mt-1 border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => { setSelected(c); setResults([]); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-800">{c.vorname} {c.nachname}</span>
                  <span className="text-xs text-gray-500 ml-2">{c.email} · {c.telefon}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="rounded-lg border border-orange-300 bg-white p-3 text-xs space-y-1">
          <p className="font-medium text-gray-700">Vorschau nach Zusammenführung:</p>
          <p className="text-gray-600">Name: <strong>{keepName}</strong></p>
          <p className="text-gray-600">Haupt-E-Mail: <strong>{keepEmail}</strong></p>
          <p className="text-gray-600">Weitere E-Mail: <strong>{selected.email}</strong></p>
          <p className="text-gray-500 mt-1">
            Wird aufgelöst: {selected.vorname} {selected.nachname} ({selected.email})
          </p>
          <button
            onClick={() => setSelected(null)}
            className="text-gray-400 hover:text-gray-600 underline text-xs"
          >
            Andere Auswahl
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => { setOpen(false); setSelected(null); setQuery(''); setResults([]); setError(null); }}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          onClick={zusammenfuehren}
          disabled={!selected || pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {pending ? 'Zusammenführen …' : 'Jetzt zusammenführen'}
        </button>
      </div>
    </div>
  );
}
