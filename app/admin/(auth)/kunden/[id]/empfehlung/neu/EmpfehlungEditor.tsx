'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ANWENDUNGEN, type AnwendungSlug, getAnwendung } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';

interface AnwendungEintrag {
  slug: AnwendungSlug;
  haeufigkeitText: string;
  begruendung: string;
}

interface Props {
  customerId: string;
  typ: 'neukunde' | 'folge';
  initial: AnwendungEintrag[];
  initialEinleitung?: string;
}

export default function EmpfehlungEditor({ customerId, typ, initial, initialEinleitung = '' }: Props) {
  const router = useRouter();
  const [eintraege, setEintraege] = useState<AnwendungEintrag[]>(initial);
  const [einleitung, setEinleitung] = useState(initialEinleitung);
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
      {
        slug: a.slug,
        haeufigkeitText: RESEARCH[a.slug as AnwendungSlug]?.sessions ?? '',
        begruendung: '',
      },
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
          einleitung: einleitung.trim() || undefined,
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

  const coreEintraege = eintraege.filter((e) => {
    try { return getAnwendung(e.slug).kategorie === 'longevity'; } catch { return false; }
  });
  const upsellEintraege = eintraege.filter((e) => {
    try { return getAnwendung(e.slug).kategorie === 'bodyforming'; } catch { return false; }
  });

  function renderEintrag(eintrag: AnwendungEintrag) {
    const index = eintraege.findIndex((e) => e.slug === eintrag.slug);
    const anwendung = getAnwendung(eintrag.slug);
    const research = RESEARCH[eintrag.slug];
    return (
      <div
        key={eintrag.slug}
        className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
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

        {research && (
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-cp-blau uppercase tracking-wide">Wirkmechanismus</p>
            <p className="text-xs text-gray-600 leading-relaxed">{research.mechanism}</p>
            {research.studien.length > 0 && (
              <div className="pt-1 space-y-1">
                <p className="text-xs font-semibold text-cp-blau uppercase tracking-wide">
                  Studienlage ({research.studien.length} Quellen)
                </p>
                {research.studien.map((s, si) => (
                  <p key={si} className="text-xs text-gray-500">
                    [{si + 1}] {s.autoren} ({s.jahr}): {s.ergebnis}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Protokoll / Häufigkeit</label>
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
              Individuelle Begründung
              <span className="ml-1 text-gray-400 font-normal">(optional, kundenbezogen)</span>
            </label>
            <textarea
              value={eintrag.begruendung}
              onChange={(e) => updateEintrag(index, { begruendung: e.target.value })}
              rows={2}
              placeholder="z. B. Besonders relevant aufgrund chronischer Rückenschmerzen …"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Einleitung / Individuelle Analyse */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Individuelle Analyse / Zielsetzung
          <span className="ml-1 text-gray-400 font-normal">(erscheint im PDF als „Deine individuelle Strategie")</span>
        </label>
        <textarea
          value={einleitung}
          onChange={(e) => setEinleitung(e.target.value)}
          rows={5}
          placeholder="Beschreibe kurz die Ausgangssituation des Kunden und warum diese Kombination empfohlen wird …"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
        />
      </div>

      {/* Core-Regenerations-Stack */}
      {coreEintraege.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-cp-blau uppercase tracking-wide">
            Core-Regenerations-Stack
          </h2>
          {coreEintraege.map(renderEintrag)}
        </div>
      )}

      {/* Bodyforming-Upsell */}
      {upsellEintraege.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-cp-blau uppercase tracking-wide">
            Bodyforming- &amp; Funktions-Block (Upsell)
          </h2>
          {upsellEintraege.map(renderEintrag)}
        </div>
      )}

      {/* Anwendung hinzufügen */}
      {verfuegbar.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-5">
          <label className="block text-xs font-medium text-gray-600 mb-2">Anwendung hinzufügen</label>
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

      {/* Zusatzhinweis */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Zusatzhinweis (optional)
        </label>
        <textarea
          value={zusatzhinweis}
          onChange={(e) => setZusatzhinweis(e.target.value)}
          rows={3}
          placeholder="Hinweise zur Reihenfolge, Kontraindikationen, ergänzende Empfehlungen …"
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
