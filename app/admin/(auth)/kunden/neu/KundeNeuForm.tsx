'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  vorname:          z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname:         z.string().min(2, 'Mindestens 2 Zeichen'),
  email:            z.string().email('Ungültige E-Mail-Adresse'),
  telefon:          z.string().min(6, 'Mindestens 6 Zeichen'),
  herkunft:         z.string().optional(),
  consentMarketing: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function KundeNeuForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const { id } = await res.json() as { id: string };
      startTransition(() => router.push(`/admin/kunden/${id}`));
    } else {
      const json = await res.json().catch(() => ({})) as { error?: string };
      setServerError(json.error ?? 'Speichern fehlgeschlagen');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Vorname"
          error={errors.vorname?.message}
          {...register('vorname')}
        />
        <Input
          label="Nachname"
          error={errors.nachname?.message}
          {...register('nachname')}
        />
      </div>

      <Input
        label="E-Mail"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Telefon"
        type="tel"
        error={errors.telefon?.message}
        {...register('telefon')}
      />

      <Input
        label="Herkunft (optional)"
        placeholder="z. B. Instagram, Empfehlung …"
        {...register('herkunft')}
      />

      <label className="flex items-center gap-2 text-sm text-cp-blau cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-cp-tuerkis"
          {...register('consentMarketing')}
        />
        Marketing-Einwilligung erteilt
      </label>

      {serverError && (
        <p className="text-sm text-red-600 font-medium">{serverError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium bg-cp-tuerkis text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Wird gespeichert …' : 'Kunde anlegen'}
        </button>
      </div>
    </form>
  );
}
