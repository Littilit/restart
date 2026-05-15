'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LONGEVITY_ANWENDUNGEN, KARTEN_ANWENDUNGEN, getAnwendung } from '@/data/anwendungen';
import type { AnwendungSlug } from '@/data/anwendungen';

interface SearchResult {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  status: string;
  monatsKontingent: number;
  unbegrenzt: boolean;
  longevityGenutzt: number;
  karten: Record<string, { remaining: number; total: number }>;
}

function AnwendungButton({
  slug,
  remaining,
  type,
  onCheckIn,
}: {
  slug: AnwendungSlug;
  remaining?: number;
  type: 'longevity' | 'karte';
  onCheckIn: (slug: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const a = getAnwendung(slug);
  const disabled = type === 'karte' && remaining !== undefined && remaining <= 0;

  async function handleClick() {
    if (disabled) return;
    setLoading(true);
    await onCheckIn(slug);
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
        disabled
          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 hover:border-cp-tuerkis hover:text-cp-tuerkis'
      } ${loading ? 'opacity-50' : ''}`}
    >
      <span>{a.emoji}</span>
      <span>{a.kurzName}</span>
      {type === 'karte' && remaining !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          remaining > 0 ? 'bg-cp-tuerkis/10 text-cp-tuerkis' : 'bg-gray-100 text-gray-400'
        }`}>
          {remaining} übrig
        </span>
      )}
    </button>
  );
}

function KundenKarte({
  customer,
  onCheckIn,
}: {
  customer: SearchResult;
  onCheckIn: (customerId: string, anwendung: string) => Promise<string | null>;
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localCustomer, setLocalCustomer] = useState(customer);

  useEffect(() => { setLocalCustomer(customer); }, [customer]);

  async function handleCheckIn(slug: string) {
    setErrorMsg('');
    const err = await onCheckIn(localCustomer.id, slug);
    if (err) {
      setErrorMsg(err);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(`${getAnwendung(slug as AnwendungSlug).kurzName} eingecheckt`);
      setTimeout(() => setSuccessMsg(''), 2000);
      // Optimistisch lokalen State updaten
      if (LONGEVITY_ANWENDUNGEN.includes(slug as AnwendungSlug)) {
        setLocalCustomer((prev) => ({ ...prev, longevityGenutzt: prev.longevityGenutzt + 1 }));
      } else {
        setLocalCustomer((prev) => ({
          ...prev,
          karten: {
            ...prev.karten,
            [slug]: { ...prev.karten[slug], remaining: (prev.karten[slug]?.remaining ?? 0) - 1 },
          },
        }));
      }
    }
  }

  const isMitglied = localCustomer.status === 'mitglied';
  const hasLongevityKontingent = isMitglied && (localCustomer.unbegrenzt || localCustomer.monatsKontingent > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <Link
            href={`/admin/kunden/${localCustomer.id}?tab=check_ins`}
            className="font-medium text-cp-blau hover:underline"
          >
            {localCustomer.vorname} {localCustomer.nachname}
          </Link>
          <p className="text-xs text-gray-400">{localCustomer.telefon} · {localCustomer.email}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
          localCustomer.status === 'mitglied' ? 'bg-cp-tuerkis/10 text-cp-tuerkis' : 'bg-gray-100 text-gray-500'
        }`}>
          {localCustomer.status.replace('_', ' ')}
        </span>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">{successMsg}</p>
      )}

      {hasLongevityKontingent && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">
            Longevity {localCustomer.unbegrenzt ? '(unbegrenzt)' : `${localCustomer.longevityGenutzt}/${localCustomer.monatsKontingent} diesen Monat`}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LONGEVITY_ANWENDUNGEN.map((slug) => (
              <AnwendungButton key={slug} slug={slug} type="longevity" onCheckIn={handleCheckIn} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 mb-2">Mehrfachkarten</p>
        <div className="flex flex-wrap gap-1.5">
          {KARTEN_ANWENDUNGEN.map((slug) => (
            <AnwendungButton
              key={slug}
              slug={slug}
              type="karte"
              remaining={localCustomer.karten[slug]?.remaining ?? 0}
              onCheckIn={handleCheckIn}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/check-in/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleCheckIn(customerId: string, anwendung: string): Promise<string | null> {
    const res = await fetch(`/api/admin/customers/${customerId}/check-ins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anwendung }),
    });
    if (res.ok) return null;
    const body = await res.json();
    return body.error ?? 'Fehler beim Check-in';
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-cp-blau mb-6">Check-in</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Name, E-Mail oder Telefonnummer..."
        autoFocus
        className="w-full max-w-lg px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-cp-tuerkis mb-6"
      />

      {loading && <p className="text-sm text-gray-400">Suche...</p>}

      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-sm text-gray-400">Keine Kunden gefunden.</p>
      )}

      <div className="space-y-3 max-w-2xl">
        {results.map((c) => (
          <KundenKarte key={c.id} customer={c} onCheckIn={handleCheckIn} />
        ))}
      </div>
    </div>
  );
}
