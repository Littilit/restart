'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AufgabeErledigtForm, { type ErledigungData } from './AufgabeErledigtForm';

export interface AdminTask {
  id: string;
  anweisung: string;
  skript: string | null;
  createdAt: Date;
  customer: {
    id: string;
    vorname: string;
    nachname: string;
    telefon: string;
  } | null;
}

function AufgabeKarte({ task }: { task: AdminTask }) {
  const router = useRouter();
  const [skriptOpen, setSkriptOpen] = useState(false);
  const [erledigtFormOpen, setErledigtFormOpen] = useState(false);

  async function onBestaetigen(data: ErledigungData) {
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function onErledigt() {
    setErledigtFormOpen(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
          <div className="min-w-0">
            <p className="text-sm text-cp-blau">{task.anweisung}</p>
            {task.customer && (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Link
                  href={`/admin/kunden/${task.customer.id}`}
                  className="text-xs font-medium text-cp-tuerkis hover:underline"
                >
                  {task.customer.vorname} {task.customer.nachname}
                </Link>
                <span className="text-xs text-gray-500">{task.customer.telefon}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {task.skript && (
            <button
              onClick={() => setSkriptOpen((v) => !v)}
              className="text-xs text-gray-500 hover:text-cp-blau transition-colors underline"
            >
              {skriptOpen ? 'Skript schließen' : 'Telefonskript'}
            </button>
          )}
          {!erledigtFormOpen && (
            <button
              onClick={() => setErledigtFormOpen(true)}
              className="text-xs px-2.5 py-1 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity"
            >
              Erledigt
            </button>
          )}
        </div>
      </div>

      {skriptOpen && task.skript && (
        <pre className="mt-3 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans border border-gray-100">
          {task.skript}
        </pre>
      )}

      {erledigtFormOpen && (
        <AufgabeErledigtForm
          onBestaetigen={onBestaetigen}
          onErledigt={onErledigt}
          onAbbrechen={() => setErledigtFormOpen(false)}
          customerId={task.customer?.id}
        />
      )}
    </div>
  );
}

export default function AufgabenSektion({ tasks }: { tasks: AdminTask[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold shrink-0">
          {tasks.length}
        </span>
        <h2 className="text-sm font-semibold text-blue-700">Offene Aufgaben</h2>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <AufgabeKarte key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}
