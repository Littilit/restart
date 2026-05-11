'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CustomerStatus } from '@prisma/client';
import { STATUS_CONFIG } from './StatusBadge';

const HAT_GEKAUFT: CustomerStatus[] = ['mitglied', 'startangebot', 'karten_kunde'];

const SKRIPT_KAUF = `Hi [Name], hier ist [...] von Cryopoint Augsburg. Du hattest vor einer Woche deinen ersten Termin bei uns – ich wollte kurz nachfragen, wie du dich danach gefühlt hast und was dir besonders gut gefallen hat?

→ Zufriedenheit abfragen, Fragen klären

Wie läuft es, kommst du gut in den Rhythmus? Hast du schon deinen nächsten Termin eingeplant?`;

const SKRIPT_KEIN_KAUF = `Hi [Name], hier ist [...] von Cryopoint Augsburg. Du hattest vor einer Woche deinen ersten Termin bei uns, richtig – ich wollte kurz nachfragen, wie du dich danach gefühlt hast und was dir besonders gut gefallen hat?

→ Wie war die Erfahrung? Hat sich körperlich etwas verändert?

Wir haben dir ein Angebot gemacht – hast du darüber nachgedacht, wie du weitermachen möchtest?

→ Termin vereinbaren / Angebot-Link nochmal schicken`;

export interface AlarmKunde {
  id: string;
  vorname: string;
  nachname: string;
  status: CustomerStatus;
  erstTermin: Date;
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function AlarmKarte({ kunde }: { kunde: AlarmKunde }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const tage = daysSince(kunde.erstTermin);
  const hatGekauft = HAT_GEKAUFT.includes(kunde.status);
  const skript = hatGekauft ? SKRIPT_KAUF : SKRIPT_KEIN_KAUF;
  const cfg = STATUS_CONFIG[kunde.status];

  async function erledigen() {
    await fetch(`/api/admin/customers/${kunde.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicegesprachErledigt: true }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-1" />
          <div className="min-w-0">
            <Link
              href={`/admin/kunden/${kunde.id}`}
              className="font-medium text-cp-blau hover:text-cp-tuerkis transition-colors"
            >
              {kunde.vorname} {kunde.nachname}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-gray-500">
                Termin: {new Date(kunde.erstTermin).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {' '}
                <span className="text-orange-600 font-medium">(vor {tage} Tagen)</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-gray-500 hover:text-cp-blau transition-colors underline"
          >
            {open ? 'Skript schließen' : 'Telefonskript'}
          </button>
          <button
            onClick={erledigen}
            disabled={pending}
            className="text-xs px-2.5 py-1 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Erledigt
          </button>
        </div>
      </div>

      {open && (
        <pre className="mt-3 text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans border border-gray-100">
          {skript.replace('[Name]', kunde.vorname)}
        </pre>
      )}
    </div>
  );
}

export default function ServicegesprachAlarmSektion({ kunden }: { kunden: AlarmKunde[] }) {
  if (kunden.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">
          {kunden.length}
        </span>
        <h2 className="text-sm font-semibold text-orange-700">Servicegespräche fällig</h2>
      </div>
      <div className="space-y-2">
        {kunden.map((k) => (
          <AlarmKarte key={k.id} kunde={k} />
        ))}
      </div>
    </div>
  );
}
