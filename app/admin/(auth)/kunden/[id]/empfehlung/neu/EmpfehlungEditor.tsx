'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ANWENDUNGEN, type AnwendungSlug, getAnwendung } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';
import { DETAIL_FRAGEN } from '@/features/anamnese/fragen';
import { computeEmpfehlungen } from '@/features/anamnese/empfehlung';
import type { MainFocus } from '@/features/anamnese/types';
import { KATEGORIEN } from '@/features/anamnese/kategorien';
import { FrageBlock } from '@/features/anamnese/FrageBlock';
import { ERKRANKUNGEN, anwendungenFuerErkrankungen, einleitungFuerErkrankungen } from '@/data/erkrankungen';
import { MITGLIEDSCHAFTEN } from '@/data/preise';

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
  initialMainFocus?: MainFocus | null;
  initialMainFocus2?: MainFocus | null;
  initialChamber2?: Record<string, string>;
  initialChamber2b?: Record<string, string>;
  initialErkrankungen?: string[];
  initialMitgliedschaft?: string;
  initialGueltigBis?: string;
}

export default function EmpfehlungEditor({
  customerId,
  typ,
  initial,
  initialEinleitung = '',
  initialMainFocus = null,
  initialMainFocus2 = null,
  initialChamber2 = {},
  initialChamber2b = {},
  initialErkrankungen = [],
  initialMitgliedschaft = '',
  initialGueltigBis = '',
}: Props) {
  const router = useRouter();

  // --- Editor-State ---
  const [eintraege, setEintraege] = useState<AnwendungEintrag[]>(initial);
  const [einleitung, setEinleitung] = useState(initialEinleitung);
  const [zusatzhinweis, setZusatzhinweis] = useState('');
  const [addSlug, setAddSlug] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Konfig-Panel-State ---
  const [konfigOffen, setKonfigOffen] = useState(true);
  const [mainFocus, setMainFocus] = useState<MainFocus | null>(initialMainFocus);
  const [mainFocus2, setMainFocus2] = useState<MainFocus | null>(initialMainFocus2);
  const [chamber2, setChamber2] = useState<Record<string, string>>(initialChamber2);
  const [chamber2b, setChamber2b] = useState<Record<string, string>>(initialChamber2b);
  const [erkrankungen, setErkrankungen] = useState<string[]>(initialErkrankungen);
  const [mitgliedschaft, setMitgliedschaft] = useState<string>(initialMitgliedschaft);
  const [gueltigBis, setGueltigBis] = useState<string>(initialGueltigBis);

  const verfuegbar = ANWENDUNGEN.filter((a) => !eintraege.some((e) => e.slug === a.slug));

  function setChamberAnswer(id: string, val: string, isSecond: boolean) {
    if (isSecond) {
      setChamber2b((prev) => ({ ...prev, [id]: val }));
    } else {
      setChamber2((prev) => ({ ...prev, [id]: val }));
    }
  }

  function handleRecompute() {
    const vorschlag = computeEmpfehlungen(mainFocus, chamber2, mainFocus2, chamber2b);
    const erkrankungsAnwendungen = anwendungenFuerErkrankungen(erkrankungen);

    const merged: AnwendungSlug[] = [];
    for (const slug of [...erkrankungsAnwendungen, ...vorschlag.map((e) => e.slug)]) {
      if (!merged.includes(slug)) merged.push(slug);
    }

    setEintraege(
      merged.map((slug) => {
        const bestehend = eintraege.find((e) => e.slug === slug);
        if (bestehend) return bestehend;
        return {
          slug,
          haeufigkeitText: RESEARCH[slug]?.sessions ?? vorschlag.find((v) => v.slug === slug)?.sessions ?? '',
          begruendung: '',
        };
      })
    );
  }

  function handleEinleitungPrefill() {
    const erkrankungsText = einleitungFuerErkrankungen(erkrankungen);
    const fokusText = mainFocus
      ? `Fokus: ${KATEGORIEN.find((k) => k.value === mainFocus)?.title ?? mainFocus}${mainFocus2 ? ` + ${KATEGORIEN.find((k) => k.value === mainFocus2)?.title ?? mainFocus2}` : ''}.`
      : '';

    const parts = [fokusText, erkrankungsText].filter(Boolean);
    setEinleitung(parts.join(' '));
  }

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

  function moveEintrag(index: number, dir: -1 | 1) {
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= eintraege.length) return;
    const current = eintraege[index];
    const target = eintraege[targetIndex];
    try {
      if (getAnwendung(current.slug).kategorie !== getAnwendung(target.slug).kategorie) return;
    } catch {
      return;
    }
    setEintraege((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
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
          erkrankungen: erkrankungen.length > 0 ? erkrankungen : undefined,
          mitgliedschaft: typ === 'folge' && mitgliedschaft ? mitgliedschaft : undefined,
          gueltigBis: gueltigBis || undefined,
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
    const gruppe = eintraege.filter((e) => {
      try { return getAnwendung(e.slug).kategorie === anwendung.kategorie; } catch { return false; }
    });
    const gruppenIndex = gruppe.findIndex((e) => e.slug === eintrag.slug);

    return (
      <div key={eintrag.slug} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>{anwendung.emoji}</span>
            <div>
              <h3 className="font-semibold text-cp-blau">{anwendung.name}</h3>
              <p className="text-xs text-gray-500">{anwendung.dauer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => moveEintrag(index, -1)}
                disabled={gruppenIndex === 0}
                className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-cp-blau hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Nach oben"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveEintrag(index, 1)}
                disabled={gruppenIndex === gruppe.length - 1}
                className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-cp-blau hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Nach unten"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => entfernen(index)}
              className="text-sm text-gray-400 hover:text-red-600 transition-colors"
            >
              Entfernen
            </button>
          </div>
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

  const fragen1 = mainFocus ? (DETAIL_FRAGEN[mainFocus] ?? []) : [];
  const fragen2 = mainFocus2 ? (DETAIL_FRAGEN[mainFocus2] ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Konfig-Panel */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setKonfigOffen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold text-cp-blau">Konfiguration (Fokus, Erkrankungen, Mitgliedschaft)</span>
          <span className="text-gray-400 text-sm">{konfigOffen ? '▲' : '▼'}</span>
        </button>

        {konfigOffen && (
          <div className="px-5 pb-5 space-y-6 border-t border-gray-100 pt-5">
            {/* Hauptziel */}
            <div>
              <p className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wider mb-3">Hauptziel</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {KATEGORIEN.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => {
                      setMainFocus(k.value);
                      if (mainFocus2 === k.value) setMainFocus2(null);
                    }}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      mainFocus === k.value
                        ? 'border-cp-tuerkis bg-cp-tuerkis/10 text-cp-blau font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {k.emoji} {k.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Zweitziel */}
            {mainFocus && (
              <div>
                <p className="text-xs font-semibold text-cp-braun uppercase tracking-wider mb-3">
                  Zweitziel <span className="font-normal normal-case">(optional)</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {KATEGORIEN.filter((k) => k.value !== mainFocus).map((k) => (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => setMainFocus2((prev) => (prev === k.value ? null : k.value))}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        mainFocus2 === k.value
                          ? 'border-cp-braun bg-cp-braun/10 text-cp-blau font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {k.emoji} {k.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Detailfragen Hauptziel */}
            {fragen1.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wider">Detailfragen – Hauptziel</p>
                {fragen1.map((frage) => {
                  const raw = chamber2[frage.id] ?? '';
                  const val = frage.type === 'chips' ? (raw ? raw.split(',') : []) : raw;
                  return (
                    <FrageBlock
                      key={frage.id}
                      frage={frage}
                      value={val}
                      onChange={(next) => {
                        const serialized = Array.isArray(next) ? next.join(',') : next;
                        setChamberAnswer(frage.id, serialized, false);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Detailfragen Zweitziel */}
            {mainFocus2 && fragen2.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-cp-braun uppercase tracking-wider">Detailfragen – Zweitziel</p>
                {fragen2.map((frage) => {
                  const raw = chamber2b[frage.id] ?? '';
                  const val = frage.type === 'chips' ? (raw ? raw.split(',') : []) : raw;
                  return (
                    <FrageBlock
                      key={frage.id}
                      frage={frage}
                      value={val}
                      onChange={(next) => {
                        const serialized = Array.isArray(next) ? next.join(',') : next;
                        setChamberAnswer(frage.id, serialized, true);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Erkrankungen */}
            <div>
              <p className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wider mb-3">
                Erkrankungen / Beschwerden <span className="font-normal normal-case">(Mehrfachauswahl)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {ERKRANKUNGEN.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() =>
                      setErkrankungen((prev) =>
                        prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                      erkrankungen.includes(e.id)
                        ? 'border-cp-tuerkis bg-cp-tuerkis text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mitgliedschaft (nur Folge) */}
            {typ === 'folge' && (
              <div>
                <p className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wider mb-1">
                  Empfohlene Mitgliedschaft
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Vom System aus dem Protokoll vorgeschlagen – bei Bedarf anpassen.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MITGLIEDSCHAFTEN.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMitgliedschaft((prev) => (prev === m.id ? '' : m.id))}
                      className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                        mitgliedschaft === m.id
                          ? 'border-cp-tuerkis bg-cp-tuerkis/10 text-cp-blau'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.inkludierteSessions}</p>
                      {m.zusatzSession !== null && (
                        <p className="text-xs text-gray-400">+ {m.zusatzSession.toFixed(2).replace('.', ',')} € / weitere</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recompute-Button */}
            <button
              type="button"
              onClick={handleRecompute}
              className="px-4 py-2 text-sm font-medium bg-cp-blau text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Anwendungs-Vorschläge aktualisieren
            </button>
          </div>
        )}
      </div>

      {/* Einleitung */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">
            Individuelle Analyse / Zielsetzung
            <span className="ml-1 text-gray-400 font-normal">(erscheint im PDF als „Deine individuelle Strategie")</span>
          </label>
          <button
            type="button"
            onClick={handleEinleitungPrefill}
            className="text-xs text-cp-tuerkis hover:underline shrink-0 ml-3"
            title="Einleitung aus aktueller Auswahl generieren"
          >
            ↻ Vorschlag aus Auswahl
          </button>
        </div>
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

      {/* Gültig bis */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Angebot gültig bis
          <span className="ml-1 text-gray-400 font-normal">(erzeugt Dringlichkeit im Angebot)</span>
        </label>
        <input
          type="date"
          value={gueltigBis}
          onChange={(e) => setGueltigBis(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
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
