'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadList } from '@prisma/client';

interface Props {
  list: Pick<LeadList, 'id' | 'name' | 'aktiv' | 'nameModus' | 'spalteName' | 'spalteVorname' | 'spalteNachname' | 'spalteEmail' | 'spalteTelefon'>;
}

export default function MappingEditor({ list }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(list.name);
  const [aktiv, setAktiv] = useState(list.aktiv);
  const [nameModus, setNameModus] = useState<'getrennt' | 'kombiniert'>(list.nameModus as 'getrennt' | 'kombiniert');
  const [spalteName, setSpalteName] = useState(list.spalteName ?? '');
  const [spalteVorname, setSpalteVorname] = useState(list.spalteVorname ?? '');
  const [spalteNachname, setSpalteNachname] = useState(list.spalteNachname ?? '');
  const [spalteEmail, setSpalteEmail] = useState(list.spalteEmail ?? '');
  const [spalteTelefon, setSpalteTelefon] = useState(list.spalteTelefon ?? '');
  const [, startTransition] = useTransition();

  async function save() {
    await fetch(`/api/admin/lead-lists/${list.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        aktiv,
        nameModus,
        spalteName: spalteName || null,
        spalteVorname: spalteVorname || null,
        spalteNachname: spalteNachname || null,
        spalteEmail: spalteEmail || null,
        spalteTelefon: spalteTelefon || null,
      }),
    });
    setOpen(false);
    startTransition(() => router.refresh());
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-500 hover:text-cp-blau underline transition-colors">
        Einstellungen
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cp-blau">Listen-Einstellungen</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Schließen</button>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="aktiv" checked={aktiv} onChange={(e) => setAktiv(e.target.checked)} />
        <label htmlFor="aktiv" className="text-sm text-gray-700">Auto-Sync aktiv</label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name-Format</label>
        <div className="flex gap-3">
          {(['getrennt', 'kombiniert'] as const).map((m) => (
            <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="radio" checked={nameModus === m} onChange={() => setNameModus(m)} />
              {m === 'getrennt' ? 'Getrennt' : 'Ein Feld'}
            </label>
          ))}
        </div>
      </div>
      {nameModus === 'kombiniert' ? (
        <Field label="Name (Feld)" value={spalteName} onChange={setSpalteName} />
      ) : (
        <>
          <Field label="Vorname-Spalte" value={spalteVorname} onChange={setSpalteVorname} />
          <Field label="Nachname-Spalte" value={spalteNachname} onChange={setSpalteNachname} />
        </>
      )}
      <Field label="E-Mail-Spalte" value={spalteEmail} onChange={setSpalteEmail} />
      <Field label="Telefon-Spalte" value={spalteTelefon} onChange={setSpalteTelefon} />
      <button onClick={save} className="px-4 py-2 rounded-lg bg-cp-tuerkis text-white text-sm font-medium hover:opacity-90 transition-opacity">
        Speichern
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Spaltenbezeichnung aus dem Sheet" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis" />
    </div>
  );
}
