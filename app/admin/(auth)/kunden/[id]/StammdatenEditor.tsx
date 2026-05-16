'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  customerId: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  geburtsdatum: string;
  adresse: string;
  herkunft: string;
  alternativeEmails: string[];
  alternativeTelefone: string[];
}

export default function StammdatenEditor({
  customerId,
  vorname,
  nachname,
  email,
  telefon,
  geburtsdatum,
  adresse,
  herkunft,
  alternativeEmails,
  alternativeTelefone,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vorname,
    nachname,
    email,
    telefon,
    geburtsdatum,
    adresse,
    herkunft,
    alternativeEmailsRaw: alternativeEmails.join('\n'),
    alternativeTelefoneRaw: alternativeTelefone.join('\n'),
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: form.vorname.trim(),
          nachname: form.nachname.trim(),
          email: form.email.trim(),
          telefon: form.telefon.trim(),
          geburtsdatum: form.geburtsdatum.trim(),
          adresse: form.adresse.trim(),
          herkunft: form.herkunft.trim(),
          alternativeEmails: form.alternativeEmailsRaw.split('\n').map((s) => s.trim()).filter(Boolean),
          alternativeTelefone: form.alternativeTelefoneRaw.split('\n').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Speichern fehlgeschlagen');
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      vorname,
      nachname,
      email,
      telefon,
      geburtsdatum,
      adresse,
      herkunft,
      alternativeEmailsRaw: alternativeEmails.join('\n'),
      alternativeTelefoneRaw: alternativeTelefone.join('\n'),
    });
    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-cp-tuerkis hover:underline"
      >
        Bearbeiten
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Vorname">
          <input value={form.vorname} onChange={(e) => set('vorname', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Nachname">
          <input value={form.nachname} onChange={(e) => set('nachname', e.target.value)} className={inputCls} />
        </Field>
      </div>
      <Field label="E-Mail">
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
      </Field>
      <Field label="Alternative E-Mails" hint="eine pro Zeile">
        <textarea
          value={form.alternativeEmailsRaw}
          onChange={(e) => set('alternativeEmailsRaw', e.target.value)}
          rows={2}
          className={inputCls}
        />
      </Field>
      <Field label="Telefon">
        <input value={form.telefon} onChange={(e) => set('telefon', e.target.value)} className={inputCls} />
      </Field>
      <Field label="Alternative Telefone" hint="eine pro Zeile">
        <textarea
          value={form.alternativeTelefoneRaw}
          onChange={(e) => set('alternativeTelefoneRaw', e.target.value)}
          rows={2}
          className={inputCls}
        />
      </Field>
      <Field label="Geburtsdatum">
        <input value={form.geburtsdatum} onChange={(e) => set('geburtsdatum', e.target.value)} placeholder="z. B. 01.01.1990" className={inputCls} />
      </Field>
      <Field label="Adresse">
        <input value={form.adresse} onChange={(e) => set('adresse', e.target.value)} className={inputCls} />
      </Field>
      <Field label="Herkunft">
        <input value={form.herkunft} onChange={(e) => set('herkunft', e.target.value)} placeholder="z. B. Walk-in, Instagram" className={inputCls} />
      </Field>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-medium bg-cp-tuerkis text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

const inputCls =
  'w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
