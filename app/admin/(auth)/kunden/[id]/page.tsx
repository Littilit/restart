import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StatusBadge from '../../../StatusBadge';
import StatusEditor from './StatusEditor';
import TagsEditor from './TagsEditor';

type Tab = 'uebersicht' | 'empfehlungen' | 'notizen';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function KundeDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: Tab = (tab === 'empfehlungen' || tab === 'notizen') ? tab : 'uebersicht';

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      anamnesen: { orderBy: { createdAt: 'desc' }, take: 5 },
      empfehlungen: { orderBy: { createdAt: 'desc' } },
      notizen: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!customer) notFound();

  const latestAnamnese = customer.anamnesen[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-cp-tuerkis mb-1 inline-block">
            ← Zurück
          </Link>
          <h1 className="text-2xl font-semibold text-cp-blau">
            {customer.vorname} {customer.nachname}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{customer.email}</p>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['uebersicht', 'empfehlungen', 'notizen'] as Tab[]).map((t) => (
          <Link
            key={t}
            href={`/admin/kunden/${id}?tab=${t}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? 'border-cp-tuerkis text-cp-tuerkis'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'uebersicht' ? 'Übersicht' : t === 'empfehlungen' ? 'Empfehlungen' : 'Notizen'}
            {t === 'empfehlungen' && customer.empfehlungen.length > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {customer.empfehlungen.length}
              </span>
            )}
            {t === 'notizen' && customer.notizen.length > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {customer.notizen.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Tab-Inhalte */}
      {activeTab === 'uebersicht' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stammdaten */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Stammdaten</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={`${customer.vorname} ${customer.nachname}`} />
              <Row label="E-Mail" value={customer.email} />
              <Row label="Telefon" value={customer.telefon} />
              <Row label="Geburtsdatum" value={customer.geburtsdatum} />
              <Row label="Adresse" value={customer.adresse} />
              {customer.herkunft && <Row label="Herkunft" value={customer.herkunft} />}
              <Row
                label="Kunde seit"
                value={new Date(customer.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              />
              <Row label="Anamnesen" value={String(customer.anamnesen.length)} />
            </dl>
          </div>

          {/* Status & Tags */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Status</h2>
              <StatusEditor customerId={customer.id} current={customer.status} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Tags</h2>
              <TagsEditor customerId={customer.id} initial={customer.tags} />
            </div>
          </div>

          {/* Letzte Anamnese */}
          {latestAnamnese && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Letzte Anamnese{' '}
                <span className="font-normal text-gray-400">
                  {new Date(latestAnamnese.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })}
                </span>
              </h2>
              <dl className="space-y-2 text-sm">
                {latestAnamnese.gewaehlteAnwendung && (
                  <Row label="Gewählte Anwendung" value={latestAnamnese.gewaehlteAnwendung} />
                )}
                {latestAnamnese.mainFocus && (
                  <Row label="Hauptfokus" value={latestAnamnese.mainFocus} />
                )}
                {latestAnamnese.mainFocus2 && (
                  <Row label="2. Fokus" value={latestAnamnese.mainFocus2} />
                )}
                <Row
                  label="Kontraindikationen"
                  value={latestAnamnese.keineKontraindikationen ? 'Keine' : 'Vorhanden (s. Akte)'}
                />
                <Row label="Marketing-Einwilligung" value={latestAnamnese.consentMarketing ? 'Ja' : 'Nein'} />
              </dl>
            </div>
          )}
        </div>
      )}

      {activeTab === 'empfehlungen' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/kunden/${id}/empfehlung/neu?typ=neukunde`}
              className="px-4 py-2 text-sm font-medium bg-cp-tuerkis text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              + Neukunden-Angebot
            </Link>
            <Link
              href={`/admin/kunden/${id}/empfehlung/neu?typ=folge`}
              className="px-4 py-2 text-sm font-medium bg-cp-grauweis text-cp-blau rounded-lg hover:bg-gray-200 transition-colors"
            >
              + Folgeangebot
            </Link>
          </div>

          {customer.empfehlungen.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
              Noch keine Empfehlungen vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {customer.empfehlungen.map((e) => {
                const anwendungen = Array.isArray(e.anwendungen) ? e.anwendungen : [];
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          e.typ === 'neukunde'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {e.typ === 'neukunde' ? 'Neukunden-Angebot' : 'Folgeangebot'}
                      </span>
                      <div className="text-sm">
                        <div className="text-gray-800">
                          {anwendungen.length} Anwendung{anwendungen.length === 1 ? '' : 'en'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(e.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/empfehlung/${e.shareToken}`}
                      className="text-sm text-cp-tuerkis hover:underline"
                    >
                      PDF / Link
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notizen' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          Notizen folgen in Phase 7.
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-44 shrink-0 text-gray-500">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}
