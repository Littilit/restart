'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function SyncButton({ listId }: { listId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function sync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/lead-lists/${listId}/sync`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Fehler: ${data.error}`);
      } else {
        setResult(data.newLeads === 0 ? 'Keine neuen Leads' : `${data.newLeads} neuer Lead${data.newLeads !== 1 ? 's' : ''}`);
        startTransition(() => router.refresh());
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-gray-500">{result}</span>}
      <button
        onClick={sync}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-cp-tuerkis hover:text-cp-tuerkis transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Synchronisiere…' : 'Synchronisieren'}
      </button>
    </div>
  );
}
