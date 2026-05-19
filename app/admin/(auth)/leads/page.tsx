import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LeadListeForm from './LeadListeForm';
import LeadAutoSync from '@/admin/LeadAutoSync';

export default async function LeadsPage() {
  const lists = await prisma.leadList.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { leads: true } } },
  });

  const listsWithNew = await Promise.all(
    lists.map(async (l) => ({
      ...l,
      newCount: await prisma.lead.count({ where: { leadListId: l.id, status: 'neu' } }),
    }))
  );

  return (
    <div>
      <LeadAutoSync />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-cp-blau">Lead-Listen</h1>
        <LeadListeForm />
      </div>

      {listsWithNew.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Listen angelegt.</p>
      )}

      <div className="grid gap-3">
        {listsWithNew.map((list) => (
          <Link
            key={list.id}
            href={`/admin/leads/${list.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-cp-tuerkis transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cp-blau">{list.name}</span>
                  {!list.aktiv && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Pausiert</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{list.sheetUrl}</p>
                {list.syncFehler && (
                  <p className="text-xs text-red-600 mt-1">⚠ {list.syncFehler}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right">
                {list.newCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-green-500 text-white text-xs font-bold">
                    {list.newCount} neu
                  </span>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{list._count.leads} Leads</p>
                  {list.lastSyncedAt && (
                    <p className="text-xs text-gray-400">
                      Sync: {new Date(list.lastSyncedAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
