'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteListButton({ listId, listName }: { listId: string; listName: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  async function del() {
    await fetch(`/api/admin/lead-lists/${listId}`, { method: 'DELETE' });
    router.push('/admin/leads');
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Leads werden gelöscht. Kunden bleiben.</span>
        <button onClick={del} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          Löschen
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-gray-400 hover:text-gray-600">Abbrechen</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title={`Liste "${listName}" löschen`}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 size={15} />
    </button>
  );
}
