'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Header {
  name: string;
  index: number;
}

type Step = 'url' | 'mapping';

export default function LeadListeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [nameModus, setNameModus] = useState<'getrennt' | 'kombiniert'>('getrennt');
  const [spalteName, setSpalteName] = useState('');
  const [spalteVorname, setSpalteVorname] = useState('');
  const [spalteNachname, setSpalteNachname] = useState('');
  const [spalteEmail, setSpalteEmail] = useState('');
  const [spalteTelefon, setSpalteTelefon] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep('url');
    setUrl('');
    setName('');
    setHeaders([]);
    setNameModus('getrennt');
    setSpalteName('');
    setSpalteVorname('');
    setSpalteNachname('');
    setSpalteEmail('');
    setSpalteTelefon('');
    setError('');
    setLoading(false);
    setOpen(false);
  }

  async function fetchPreview() {
    if (!url || !name) { setError('Name und URL erforderlich'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/lead-lists/preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Fehler'); setLoading(false); return; }
      setHeaders(data.headers);
      // Auto-Map bekannte Spaltennamen
      for (const h of data.headers as Header[]) {
        const lower = h.name.toLowerCase();
        if (['vorname', 'first name', 'firstname'].includes(lower)) setSpalteVorname(h.name);
        if (['nachname', 'last name', 'lastname', 'name'].includes(lower)) setSpalteNachname(h.name);
        if (['full name', 'fullname', 'name'].includes(lower)) setSpalteName(h.name);
        if (lower.includes('email') || lower.includes('mail')) setSpalteEmail(h.name);
        if (lower.includes('phone') || lower.includes('telefon') || lower.includes('tel') || lower.includes('mobil')) setSpalteTelefon(h.name);
      }
      setStep('mapping');
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/lead-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sheetUrl: url,
          nameModus,
          spalteName: spalteName || undefined,
          spalteVorname: spalteVorname || undefined,
          spalteNachname: spalteNachname || undefined,
          spalteEmail: spalteEmail || undefined,
          spalteTelefon: spalteTelefon || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Fehler'); setLoading(false); return; }
      reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cp-tuerkis text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        + Liste hinzufügen
      </button>
    );
  }

  const headerOptions = [{ name: '', index: -1 }, ...headers];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-cp-blau">
          {step === 'url' ? 'Neue Lead-Liste' : `Spalten zuordnen – ${name}`}
        </h3>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Abbrechen</button>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {step === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name der Liste</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Instagram Januar 2025"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Google-Sheets-URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            />
            <p className="text-xs text-gray-400 mt-1">Sheet muss auf "Jeder mit dem Link kann ansehen" gestellt sein.</p>
          </div>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-cp-tuerkis text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Lädt…' : 'Weiter →'}
          </button>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name-Format</label>
            <div className="flex gap-3">
              {(['getrennt', 'kombiniert'] as const).map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" checked={nameModus === m} onChange={() => setNameModus(m)} />
                  {m === 'getrennt' ? 'Vorname + Nachname (getrennt)' : 'Vollständiger Name (ein Feld)'}
                </label>
              ))}
            </div>
          </div>

          {nameModus === 'kombiniert' ? (
            <Select label="Name (Feld)" value={spalteName} onChange={setSpalteName} options={headerOptions} />
          ) : (
            <>
              <Select label="Vorname" value={spalteVorname} onChange={setSpalteVorname} options={headerOptions} />
              <Select label="Nachname" value={spalteNachname} onChange={setSpalteNachname} options={headerOptions} />
            </>
          )}
          <Select label="E-Mail" value={spalteEmail} onChange={setSpalteEmail} options={headerOptions} />
          <Select label="Telefon" value={spalteTelefon} onChange={setSpalteTelefon} options={headerOptions} />

          <div className="flex gap-2 pt-1">
            <button onClick={() => setStep('url')} className="text-xs text-gray-500 hover:text-gray-700 underline">Zurück</button>
            <button
              onClick={create}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cp-tuerkis text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Erstelle…' : 'Liste anlegen & synchronisieren'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { name: string; index: number }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
      >
        {options.map((o) => (
          <option key={o.index} value={o.name}>{o.name || '— nicht zuordnen —'}</option>
        ))}
      </select>
    </div>
  );
}
