'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  body: string;
  createdAt: Date;
}

interface Props {
  customerId: string;
  initial: Note[];
}

function formatDatum(d: Date): string {
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotizenEditor({ customerId, initial }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initial);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function hinzufuegen() {
    if (!text.trim()) return;
    setError(null);

    const response = await fetch(`/api/admin/customers/${customerId}/notizen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text.trim() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? 'Speichern fehlgeschlagen');
      return;
    }

    setText('');
    startTransition(() => router.refresh());
  }

  async function loeschen(id: string) {
    setDeletingId(id);
    const response = await fetch(
      `/api/admin/customers/${customerId}/notizen/${id}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Neue Notiz */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Neue Notiz</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Notiz eingeben …"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            onClick={hinzufuegen}
            disabled={isPending || !text.trim()}
            className="px-4 py-2 text-sm font-medium bg-cp-tuerkis text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Notizen-Liste */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          Noch keine Notizen vorhanden.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">{n.body}</p>
                <button
                  onClick={() => loeschen(n.id)}
                  disabled={deletingId === n.id}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-40"
                >
                  Löschen
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">{formatDatum(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
