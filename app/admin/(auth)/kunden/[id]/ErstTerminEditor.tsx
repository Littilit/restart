'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ErstTerminEditor({
  customerId,
  erstTermin,
}: {
  customerId: string;
  erstTermin: Date | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const currentValue = erstTermin
    ? new Date(erstTermin).toISOString().substring(0, 10)
    : '';

  async function handleSave(value: string) {
    await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ erstTermin: value || null }),
    });
    setEditing(false);
    startTransition(() => router.refresh());
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="date"
          defaultValue={currentValue}
          disabled={pending}
          autoFocus
          onBlur={(e) => handleSave(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave((e.target as HTMLInputElement).value);
            if (e.key === 'Escape') setEditing(false);
          }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cp-tuerkis disabled:opacity-50"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 text-sm text-gray-800 hover:text-cp-tuerkis transition-colors text-left group"
    >
      {erstTermin
        ? new Date(erstTermin).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : <span className="text-gray-400 italic">Kein Termin gesetzt</span>}
      <svg
        className="w-3.5 h-3.5 text-gray-300 group-hover:text-cp-tuerkis transition-colors shrink-0"
        fill="none" stroke="currentColor" strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
      </svg>
    </button>
  );
}
