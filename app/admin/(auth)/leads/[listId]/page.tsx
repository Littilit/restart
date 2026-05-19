import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SyncButton from './SyncButton';
import MappingEditor from './MappingEditor';
import LeadZeile from './LeadZeile';
import DeleteListButton from './DeleteListButton';

export default async function LeadListDetailPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;

  const list = await prisma.leadList.findUnique({
    where: { id: listId },
    include: {
      leads: {
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true } } },
      },
    },
  });

  if (!list) notFound();

  const grouped = {
    neu: list.leads.filter((l) => l.status === 'neu'),
    erreicht: list.leads.filter((l) => l.status === 'erreicht'),
    termin_vereinbart: list.leads.filter((l) => l.status === 'termin_vereinbart'),
    kein_interesse: list.leads.filter((l) => l.status === 'kein_interesse'),
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/admin/leads" className="text-sm text-gray-400 hover:text-cp-blau transition-colors">
          ← Lead-Listen
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-cp-blau">{list.name}</h1>
          {list.syncFehler && (
            <p className="text-xs text-red-600 mt-1">⚠ {list.syncFehler}</p>
          )}
          {list.lastSyncedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Letzter Sync: {new Date(list.lastSyncedAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <MappingEditor list={list} />
          <DeleteListButton listId={list.id} listName={list.name} />
          <SyncButton listId={list.id} />
        </div>
      </div>

      {list.leads.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Leads in dieser Liste.</p>
      )}

      {grouped.neu.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
            Neu ({grouped.neu.length})
          </h2>
          <div className="space-y-2">
            {grouped.neu.map((l) => <LeadZeile key={l.id} lead={l} />)}
          </div>
        </section>
      )}

      {grouped.erreicht.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
            Erreicht ({grouped.erreicht.length})
          </h2>
          <div className="space-y-2">
            {grouped.erreicht.map((l) => <LeadZeile key={l.id} lead={l} />)}
          </div>
        </section>
      )}

      {grouped.termin_vereinbart.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-cp-tuerkis uppercase tracking-wide mb-2">
            Termin vereinbart ({grouped.termin_vereinbart.length})
          </h2>
          <div className="space-y-2">
            {grouped.termin_vereinbart.map((l) => <LeadZeile key={l.id} lead={l} />)}
          </div>
        </section>
      )}

      {grouped.kein_interesse.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Kein Interesse ({grouped.kein_interesse.length})
          </h2>
          <div className="space-y-2">
            {grouped.kein_interesse.map((l) => <LeadZeile key={l.id} lead={l} />)}
          </div>
        </section>
      )}
    </div>
  );
}
