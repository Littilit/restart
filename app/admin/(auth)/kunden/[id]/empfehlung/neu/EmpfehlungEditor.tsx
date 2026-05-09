'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ANWENDUNGEN, type AnwendungSlug, getAnwendung } from '@/data/anwendungen';

interface AnwendungEintrag {
  slug: AnwendungSlug;
  haeufigkeitText: string;
  begruendung: string;
}

interface Props {
  customerId: string;
  typ: 'neukunde' | 'folge';
  initial: AnwendungEintrag[];
}

export default function EmpfehlungEditor({ customerId, typ, initial }: Props) {
  const router = useRouter();
  const [eintraege, setEintraege] = useState<AnwendungEintrag[]>(initial);
  const [zusatzhinweis, setZusatzhinweis] = useState('');
  const [addSlug, setAddSlug] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verfuegbar = ANWENDUNGEN.filter((a) => !eintraege.some((e) => e.slug === a.slug));

  function updateEintrag(index: number, patch: Partial<AnwendungEintrag>) {
    setEintraege((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function entfernen(index: number) {
    setEintraege((prev) => prev.filter((_, i) => i !== index));
  }

  function hinzufuegen() {
    if (!addSlug) return;
    const a = ANWENDUNGEN.find((x) => x.slug === addSlug);
    if (!a) return;
    setEintraege((prev) => [
      ...prev,
      { slug: a.slug, haeufigkeitText: '', begruendung: '' },
    ]);
    setAddSlug('');
  }

  async function speichern() {
    setError(null);

    if (eintraege.length === 0) {
      setError('Mindestens eine Anwendung erforderlich.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/empfehlungen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typ,
          anwendungen: eintraege,
          zusatzhinweis: zusatzhinweis.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Speichern fehlgeschlagen');
      }

      router.push(`/admin/kunden/${customerId}?tab=empfehlungen`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {eintraege.map((eintrag, index) => {
        const anwendung = getAnwendung(eintrag.slug);
        return (
          <div
            key={eintrag.slug}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{anwendung.emoji}</span>
                <div>
                  <h3 className="font-semibold text-cp-blau">{anwendung.name}</h3>
                  <p className="text-xs text-gray-500">{anwendung.dauer}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => entfernen(index)}
                className="text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                Entfernen
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Häufigkeit
                </label>
                <input
                  type="text"
                  value={eintrag.haeufigkeitText}
                  onChange={(e) => updateEintrag(index, { haeufigkeitText: e.target.value })}
                  placeholder="z. B. 2–3x pro Woche"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Begründung
                </label>
                <textarea
                  value={eintrag.begruendung}
                  onChange={(e) => updateEintrag(index, { begruendung: e.target.value })}
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
                />
              </div>
            </div>
          </div>
        );
      })}

      {verfuegbar.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-5">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Anwendung hinzufügen
          </label>
          <div className="flex gap-2">
            <select
              value={addSlug}
              onChange={(e) => setAddSlug(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            >
              <option value="">— wählen —</option>
              {verfuegbar.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.emoji} {a.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={hinzufuegen}
              disabled={!addSlug}
              className="px-4 py-2 text-sm font-medium bg-cp-grauweis text-cp-blau rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              + Hinzufügen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Zusatzhinweis (optional)
        </label>
        <textarea
          value={zusatzhinweis}
          onChange={(e) => setZusatzhinweis(e.target.value)}
          rows={3}
          placeholder="Persönliche Empfehlung, Hinweis zur Reihenfolge, …"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push(`/admin/kunden/${customerId}?tab=empfehlungen`)}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onClick={speichern}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium bg-cp-tuerkis text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
