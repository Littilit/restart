'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export interface NeuerLead {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  createdAt: Date;
  customer: { id: string } | null;
  leadList: { id: string; name: string };
}

function LeadKarte({ lead }: { lead: NeuerLead }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  async function aktion(status: 'erreicht' | 'termin_vereinbart') {
    setLoading(true);
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        ...(status === 'erreicht' ? { erreichtAm: new Date().toISOString() } : { terminVereinbartAm: new Date().toISOString() }),
      }),
    });
    setLoading(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />
          <div className="min-w-0">
            {lead.customer ? (
              <Link
                href={`/admin/kunden/${lead.customer.id}`}
                className="font-medium text-cp-blau hover:text-cp-tuerkis transition-colors"
              >
                {lead.vorname} {lead.nachname}
              </Link>
            ) : (
              <span className="font-medium text-cp-blau">{lead.vorname} {lead.nachname}</span>
            )}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {lead.telefon && (
                <a href={`tel:${lead.telefon}`} className="text-xs text-cp-tuerkis hover:underline">
                  {lead.telefon}
                </a>
              )}
              {lead.email && <span className="text-xs text-gray-500">{lead.email}</span>}
              <span className="text-xs text-gray-400">via {lead.leadList.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/leads/${lead.leadList.id}`}
            className="text-xs text-gray-400 hover:text-cp-blau transition-colors"
          >
            Details
          </Link>
          <button
            onClick={() => aktion('termin_vereinbart')}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg border border-cp-tuerkis text-cp-tuerkis hover:bg-cp-tuerkis hover:text-white transition-colors disabled:opacity-50"
          >
            Termin
          </button>
          <button
            onClick={() => aktion('erreicht')}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg bg-cp-tuerkis text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Erreicht
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NeueLeadsSektion({ leads }: { leads: NeuerLead[] }) {
  if (leads.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">
          {leads.length}
        </span>
        <h2 className="text-sm font-semibold text-green-700">Neue Leads kontaktieren</h2>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <LeadKarte key={l.id} lead={l} />
        ))}
      </div>
    </div>
  );
}
