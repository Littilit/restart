'use client';

import { useState, useEffect, useTransition } from 'react';
import { LONGEVITY_ANWENDUNGEN, KARTEN_ANWENDUNGEN, getAnwendung } from '@/data/anwendungen';
import type { AnwendungSlug } from '@/data/anwendungen';

interface CheckIn {
  id: string;
  anwendung: string;
  cardId: string | null;
  createdAt: string;
  card: { anwendung: string; groesse: number } | null;
}

interface Card {
  id: string;
  anwendung: string;
  groesse: number;
  verbraucht: number;
  gekauftAm: string;
}

interface Props {
  customerId: string;
  status: string;
  monatsKontingent: number;
  unbegrenzt: boolean;
}

const KARTEN_SIZES = [3, 5, 10];

export default function KundenCheckIns({ customerId, status, monatsKontingent, unbegrenzt }: Props) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [karten, setKarten] = useState<Card[]>([]);
  const [kontingent, setKontingent] = useState(monatsKontingent);
  const [isUnbegrenzt, setIsUnbegrenzt] = useState(unbegrenzt);
  const [kontingentInput, setKontingentInput] = useState(String(monatsKontingent));
  const [newKarteAnwendung, setNewKarteAnwendung] = useState<AnwendungSlug>(KARTEN_ANWENDUNGEN[0]);
  const [newKarteGroesse, setNewKarteGroesse] = useState(3);
  const [customGroesse, setCustomGroesse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const isMitglied = status === 'mitglied';

  async function load() {
    const [ciRes, kRes] = await Promise.all([
      fetch(`/api/admin/customers/${customerId}/check-ins`),
      fetch(`/api/admin/customers/${customerId}/karten`),
    ]);
    if (ciRes.ok) setCheckIns(await ciRes.json());
    if (kRes.ok) setKarten(await kRes.json());
  }

  useEffect(() => { load(); }, []);

  function flash(msg: string, isError = false) {
    if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); }
    else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); }
  }

  async function saveKontingent() {
    const val = parseInt(kontingentInput, 10);
    if (isNaN(val) || val < 0) return flash('Ungültige Zahl', true);
    startTransition(async () => {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monatsKontingent: val, unbegrenzt: isUnbegrenzt }),
      });
      if (res.ok) { setKontingent(val); flash('Kontingent gespeichert'); }
      else flash('Fehler beim Speichern', true);
    });
  }

  async function toggleUnbegrenzt(checked: boolean) {
    setIsUnbegrenzt(checked);
    startTransition(async () => {
      await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unbegrenzt: checked }),
      });
    });
  }

  async function checkIn(anwendung: string) {
    setErrorMsg('');
    const res = await fetch(`/api/admin/customers/${customerId}/check-ins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anwendung }),
    });
    if (res.ok) { flash(`${getAnwendung(anwendung as AnwendungSlug).kurzName} eingecheckt`); load(); }
    else {
      const body = await res.json();
      flash(body.error ?? 'Fehler beim Check-in', true);
    }
  }

  async function karteHinzufuegen() {
    const groesse = newKarteGroesse === 0 ? parseInt(customGroesse, 10) : newKarteGroesse;
    if (!groesse || groesse < 1) return flash('Ungültige Kartengröße', true);
    const res = await fetch(`/api/admin/customers/${customerId}/karten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anwendung: newKarteAnwendung, groesse }),
    });
    if (res.ok) { flash('Karte angelegt'); setCustomGroesse(''); load(); }
    else flash('Fehler beim Anlegen', true);
  }

  async function karteLoeschen(cardId: string) {
    const res = await fetch(`/api/admin/customers/${customerId}/karten/${cardId}`, { method: 'DELETE' });
    if (res.ok) { flash('Karte gelöscht'); load(); }
    else flash('Fehler beim Löschen', true);
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const longevityGenutzt = checkIns.filter(
    (ci) => LONGEVITY_ANWENDUNGEN.includes(ci.anwendung as AnwendungSlug) &&
      new Date(ci.createdAt) >= monthStart
  ).length;

  const aktivKarten = karten.filter((k) => k.verbraucht < k.groesse);
  const verbrauchtKarten = karten.filter((k) => k.verbraucht >= k.groesse);

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">{successMsg}</div>
      )}

      {/* Mitglieds-Kontingent */}
      {isMitglied && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Longevity-Monatskontingent</h3>
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnbegrenzt}
                onChange={(e) => toggleUnbegrenzt(e.target.checked)}
                className="rounded"
              />
              Unbegrenzt
            </label>
          </div>
          {!isUnbegrenzt && (
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[2, 4, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setKontingentInput(String(n)); }}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      kontingentInput === String(n)
                        ? 'bg-cp-tuerkis text-white border-cp-tuerkis'
                        : 'border-gray-200 text-gray-600 hover:border-cp-tuerkis'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  value={kontingentInput}
                  onChange={(e) => setKontingentInput(e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center"
                  placeholder="eigener"
                />
              </div>
              <button
                onClick={saveKontingent}
                disabled={isPending}
                className="px-4 py-1.5 text-sm bg-cp-tuerkis text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          )}
          <div className="mt-3 text-sm text-gray-500">
            Dieser Monat: <span className="font-medium text-cp-blau">{longevityGenutzt}</span>
            {!isUnbegrenzt && kontingent > 0 && (
              <span> / {kontingent}</span>
            )}
            {isUnbegrenzt && <span className="ml-1 text-xs bg-cp-tuerkis/10 text-cp-tuerkis px-1.5 py-0.5 rounded-full">Unbegrenzt</span>}
          </div>

          {/* Longevity Check-in Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {LONGEVITY_ANWENDUNGEN.map((slug) => {
              const a = getAnwendung(slug);
              return (
                <button
                  key={slug}
                  onClick={() => checkIn(slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-cp-tuerkis hover:text-cp-tuerkis transition-colors"
                >
                  <span>{a.emoji}</span> {a.kurzName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mehrfachkarten */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Mehrfachkarten</h3>

        {aktivKarten.length === 0 ? (
          <p className="text-sm text-gray-400 mb-4">Keine aktiven Karten vorhanden.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {KARTEN_ANWENDUNGEN.map((slug) => {
              const slug_karten = aktivKarten.filter((k) => k.anwendung === slug);
              if (slug_karten.length === 0) return null;
              const a = getAnwendung(slug);
              return (
                <div key={slug}>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">{a.emoji} {a.kurzName}</p>
                  <div className="space-y-1.5">
                    {slug_karten.map((k) => (
                      <div key={k.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-cp-blau">
                            {k.verbraucht}/{k.groesse} verbraucht
                          </span>
                          <span className="text-xs text-gray-400">
                            Gekauft {new Date(k.gekauftAm).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => checkIn(slug)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity"
                          >
                            Einchecken
                          </button>
                          <button
                            onClick={() => karteLoeschen(k.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Karte hinzufügen */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Karte hinzufügen</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newKarteAnwendung}
              onChange={(e) => setNewKarteAnwendung(e.target.value as AnwendungSlug)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            >
              {KARTEN_ANWENDUNGEN.map((slug) => {
                const a = getAnwendung(slug);
                return <option key={slug} value={slug}>{a.kurzName}</option>;
              })}
            </select>
            <div className="flex gap-1">
              {KARTEN_SIZES.map((n) => (
                <button
                  key={n}
                  onClick={() => { setNewKarteGroesse(n); setCustomGroesse(''); }}
                  className={`px-2.5 py-1.5 text-sm rounded-lg border transition-colors ${
                    newKarteGroesse === n && !customGroesse
                      ? 'bg-cp-tuerkis text-white border-cp-tuerkis'
                      : 'border-gray-200 text-gray-600 hover:border-cp-tuerkis'
                  }`}
                >
                  {n}er
                </button>
              ))}
              <input
                type="number"
                min={1}
                value={customGroesse}
                onChange={(e) => { setCustomGroesse(e.target.value); setNewKarteGroesse(0); }}
                placeholder="eigene"
                className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center"
              />
            </div>
            <button
              onClick={karteHinzufuegen}
              className="px-3 py-1.5 text-sm bg-cp-tuerkis text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Anlegen
            </button>
          </div>
        </div>

        {/* Verbrauchte Karten */}
        {verbrauchtKarten.length > 0 && (
          <details className="mt-4">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              {verbrauchtKarten.length} verbrauchte Karte{verbrauchtKarten.length !== 1 ? 'n' : ''} anzeigen
            </summary>
            <div className="mt-2 space-y-1">
              {verbrauchtKarten.map((k) => {
                const a = getAnwendung(k.anwendung as AnwendungSlug);
                return (
                  <div key={k.id} className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span>{a.emoji} {a.kurzName} — {k.groesse}er vollständig verbraucht</span>
                    <span>{new Date(k.gekauftAm).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>

      {/* Check-in-Historie */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Check-in-Historie</h3>
        {checkIns.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Check-ins vorhanden.</p>
        ) : (
          <div className="space-y-1">
            {checkIns.map((ci) => {
              const a = getAnwendung(ci.anwendung as AnwendungSlug);
              return (
                <div key={ci.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{a.emoji}</span>
                    <span className="text-gray-700">{a.kurzName}</span>
                    {ci.cardId ? (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Karte</span>
                    ) : (
                      <span className="text-xs text-cp-tuerkis/80 bg-cp-tuerkis/10 px-1.5 py-0.5 rounded">Mitgliedschaft</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ci.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
