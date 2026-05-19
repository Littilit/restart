'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LeadStatus } from '@prisma/client';

interface LeadData {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  status: LeadStatus;
  erreichtAm: Date | null;
  terminVereinbartAm: Date | null;
  notiz: string | null;
  customer: { id: string } | null;
  createdAt: Date;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  neu: 'Neu',
  erreicht: 'Erreicht',
  termin_vereinbart: 'Termin',
  kein_interesse: 'Kein Interesse',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  neu: 'bg-green-100 text-green-700',
  erreicht: 'bg-blue-100 text-blue-700',
  termin_vereinbart: 'bg-cp-tuerkis/10 text-cp-tuerkis',
  kein_interesse: 'bg-gray-100 text-gray-500',
};

export default function LeadZeile({ lead }: { lead: LeadData }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notiz, setNotiz] = useState(lead.notiz ?? '');
  const [notizOpen, setNotizOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function patch(data: Record<string, unknown>) {
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    startTransition(() => router.refresh());
  }

  async function handleStatusChange(newStatus: LeadStatus) {
    setStatus(newStatus);
    const extra: Record<string, unknown> = {};
    if (newStatus === 'erreicht' && !lead.erreichtAm) extra.erreichtAm = new Date().toISOString();
    if (newStatus === 'termin_vereinbart' && !lead.terminVereinbartAm) extra.terminVereinbartAm = new Date().toISOString();
    await patch({ status: newStatus, ...extra });
  }

  async function saveNotiz() {
    await patch({ notiz: notiz || null });
    setNotizOpen(false);
  }

  const isDimmed = status === 'kein_interesse';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3.5 ${isDimmed ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {lead.customer ? (
              <Link href={`/admin/kunden/${lead.customer.id}`} className="font-medium text-cp-blau hover:text-cp-tuerkis transition-colors text-sm">
                {lead.vorname} {lead.nachname}
              </Link>
            ) : (
              <span className="font-medium text-gray-700 text-sm">{lead.vorname} {lead.nachname}</span>
            )}
            {lead.telefon && (
              <a href={`tel:${lead.telefon}`} className="text-xs text-cp-tuerkis hover:underline">{lead.telefon}</a>
            )}
            {lead.email && <span className="text-xs text-gray-400">{lead.email}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
            {lead.erreichtAm && <span>Erreicht: {new Date(lead.erreichtAm).toLocaleDateString('de-DE')}</span>}
            {lead.terminVereinbartAm && <span>Termin: {new Date(lead.terminVereinbartAm).toLocaleDateString('de-DE')}</span>}
            {lead.notiz && (
              <span className="text-gray-500 italic truncate max-w-[200px]">{lead.notiz}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNotizOpen((v) => !v)}
            className="text-xs text-gray-400 hover:text-cp-blau transition-colors underline"
          >
            Notiz
          </button>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className={`text-xs rounded-full px-2.5 py-1 font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cp-tuerkis ${STATUS_COLORS[status]}`}
          >
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {notizOpen && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder="Notiz hinzufügen…"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
            onKeyDown={(e) => e.key === 'Enter' && saveNotiz()}
          />
          <button onClick={saveNotiz} className="text-xs px-3 py-1.5 rounded-lg bg-cp-tuerkis text-white hover:opacity-90">
            OK
          </button>
          <button onClick={() => setNotizOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">×</button>
        </div>
      )}
    </div>
  );
}
