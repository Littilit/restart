'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import AufgabeErledigtForm from '@/admin/AufgabeErledigtForm';

interface Task {
  id: string;
  anweisung: string;
  skript: string | null;
  erledigtAm: Date | null;
  erledigungsTyp: string | null;
  createdAt: Date;
}

const ERLEDIGT_LABEL: Record<string, string> = {
  termin_vereinbart: 'Termin vereinbart',
  feedback_eingeholt: 'Feedback eingeholt',
};

function AufgabeKarte({ task }: { task: Task }) {
  const router = useRouter();
  const [skriptOpen, setSkriptOpen] = useState(false);
  const [erledigtFormOpen, setErledigtFormOpen] = useState(false);
  const [, startTransition] = useTransition();

  const erledigt = !!task.erledigtAm;

  function onErledigt() {
    setErledigtFormOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className={`rounded-xl border p-4 ${erledigt ? 'border-gray-100 bg-gray-50' : 'border-blue-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${erledigt ? 'bg-gray-300' : 'bg-blue-400'}`} />
          <div className="min-w-0">
            <p className={`text-sm ${erledigt ? 'text-gray-400 line-through' : 'text-cp-blau'}`}>
              {task.anweisung}
            </p>
            {erledigt && task.erledigungsTyp && (
              <p className="text-xs text-gray-400 mt-0.5">
                {ERLEDIGT_LABEL[task.erledigungsTyp] ?? task.erledigungsTyp}
                {task.erledigtAm && ` · ${new Date(task.erledigtAm).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
              </p>
            )}
          </div>
        </div>
        {!erledigt && (
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
        )}
      </div>

      {!erledigt && skriptOpen && task.skript && (
        <pre className="mt-3 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans border border-gray-100">
          {task.skript}
        </pre>
      )}

      {erledigtFormOpen && (
        <AufgabeErledigtForm
          taskId={task.id}
          onErledigt={onErledigt}
          onAbbrechen={() => setErledigtFormOpen(false)}
        />
      )}
    </div>
  );
}

export default function KundenAufgaben({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  const offen = tasks.filter((t) => !t.erledigtAm);
  const erledigt = tasks.filter((t) => t.erledigtAm);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Aufgaben
        {offen.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-xs font-bold">
            {offen.length}
          </span>
        )}
      </h2>
      <div className="space-y-2">
        {offen.map((t) => <AufgabeKarte key={t.id} task={t} />)}
        {erledigt.map((t) => <AufgabeKarte key={t.id} task={t} />)}
      </div>
    </div>
  );
}
