import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StatusBadge from '../../../StatusBadge';
import StatusEditor from './StatusEditor';
import TagsEditor from './TagsEditor';
import NotizenEditor from './NotizenEditor';
import ErstTerminEditor from './ErstTerminEditor';
import KundenAufgaben from './KundenAufgaben';
import KundenZusammenfuehren from './KundenZusammenfuehren';
import StammdatenEditor from './StammdatenEditor';
import KundenCheckIns from '../../../KundenCheckIns';
import { KONTRAINDIKATION_LABEL } from '@/data/kontraindikationen';
import { DETAIL_FRAGEN } from '@/features/anamnese/fragen';
import { KATEGORIEN } from '@/features/anamnese/kategorien';
import { Verkaufsleitfaden } from '@/features/angebot/Verkaufsleitfaden';
import type { Kontraindikation, MainFocus } from '@/features/anamnese/types';
import type { Frage } from '@/features/anamnese/fragen';

type Tab = 'uebersicht' | 'empfehlungen' | 'notizen' | 'check_ins';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://restart.recovery-augsburg.dev';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0049')) return digits.slice(2);
  if (digits.startsWith('49')) return digits;
  if (digits.startsWith('0')) return '49' + digits.slice(1);
  return digits;
}

function waUrl(phone: string, text?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${normalizePhone(phone)}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function KundeDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: Tab = (tab === 'empfehlungen' || tab === 'notizen' || tab === 'check_ins') ? tab : 'uebersicht';

  const [customer, allCustomers] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: {
        anamnesen: { orderBy: { createdAt: 'desc' }, take: 5 },
        empfehlungen: { orderBy: { createdAt: 'desc' } },
        notizen: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.customer.findMany({ select: { tags: true } }),
  ]);

  if (!customer) notFound();

  const allTags = [...new Set(allCustomers.flatMap((c) => c.tags))].sort();
  const latestAnamnese = customer.anamnesen[0];
  const fokusLabel = latestAnamnese?.mainFocus
    ? KATEGORIEN.find((k) => k.value === latestAnamnese.mainFocus)?.title ?? null
    : null;

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
        {(['uebersicht', 'check_ins', 'empfehlungen', 'notizen'] as Tab[]).map((t) => (
          <Link
            key={t}
            href={`/admin/kunden/${id}?tab=${t}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? 'border-cp-tuerkis text-cp-tuerkis'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'uebersicht' ? 'Übersicht'
              : t === 'check_ins' ? 'Check-ins'
              : t === 'empfehlungen' ? 'Empfehlungen'
              : 'Notizen'}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Stammdaten</h2>
              <StammdatenEditor
                customerId={customer.id}
                vorname={customer.vorname}
                nachname={customer.nachname}
                email={customer.email}
                telefon={customer.telefon}
                geburtsdatum={customer.geburtsdatum}
                adresse={customer.adresse}
                herkunft={customer.herkunft}
                alternativeEmails={customer.alternativeEmails}
                alternativeTelefone={customer.alternativeTelefone}
              />
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={`${customer.vorname} ${customer.nachname}`} />
              <div className="flex gap-2 text-sm">
                <dt className="w-44 shrink-0 text-gray-500">E-Mail</dt>
                <dd className="space-y-0.5">
                  <span className="text-gray-800">{customer.email}</span>
                  {customer.alternativeEmails.map((e) => (
                    <div key={e} className="text-xs text-gray-400">(auch: {e})</div>
                  ))}
                </dd>
              </div>
              <div className="flex gap-2 text-sm">
                <dt className="w-44 shrink-0 text-gray-500">Telefon</dt>
                <dd className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800">{customer.telefon}</span>
                    <a
                      href={waUrl(customer.telefon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-1.5 py-0.5 rounded bg-[#25d366] text-white hover:opacity-90 transition-opacity"
                    >
                      WhatsApp
                    </a>
                  </div>
                  {customer.alternativeTelefone.map((t) => (
                    <div key={t} className="text-xs text-gray-400">(auch: {t})</div>
                  ))}
                </dd>
              </div>
              {customer.geburtsdatum && <Row label="Geburtsdatum" value={customer.geburtsdatum} />}
              {customer.adresse && <Row label="Adresse" value={customer.adresse} />}
              {customer.herkunft && <Row label="Herkunft" value={customer.herkunft} />}
              <Row
                label="Kunde seit"
                value={new Date(customer.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              />
              <Row label="Anamnesen" value={String(customer.anamnesen.length)} />
              <div className="flex gap-2 text-sm">
                <dt className="w-44 shrink-0 text-gray-500">Erster Termin</dt>
                <dd><ErstTerminEditor customerId={customer.id} erstTermin={customer.erstTermin} /></dd>
              </div>
            </dl>
            <KundenZusammenfuehren
              keepId={customer.id}
              keepName={`${customer.vorname} ${customer.nachname}`}
              keepEmail={customer.email}
            />
          </div>

          {/* Status & Tags */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Status</h2>
              <StatusEditor customerId={customer.id} current={customer.status} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Tags</h2>
              <TagsEditor customerId={customer.id} initial={customer.tags} allTags={allTags} />
            </div>
          </div>

          {/* Aufgaben */}
          <KundenAufgaben tasks={customer.tasks} customerId={customer.id} />

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
                {latestAnamnese.mainFocus && (
                  <ChamberDetails
                    mainFocus={latestAnamnese.mainFocus}
                    chamber={latestAnamnese.chamber2 as Record<string, string>}
                  />
                )}
                {latestAnamnese.mainFocus2 && (
                  <Row label="2. Fokus" value={latestAnamnese.mainFocus2} />
                )}
                {latestAnamnese.mainFocus2 && (
                  <ChamberDetails
                    mainFocus={latestAnamnese.mainFocus2}
                    chamber={latestAnamnese.chamber2b as Record<string, string>}
                  />
                )}
                <div className="flex gap-2 text-sm">
                  <dt className="w-44 shrink-0 text-gray-500">Kontraindikationen</dt>
                  <dd>
                    {latestAnamnese.keineKontraindikationen ? (
                      <span className="text-gray-800">Keine</span>
                    ) : (() => {
                      const aktive = Object.entries(
                        (latestAnamnese.kontraindikationen ?? {}) as Record<string, boolean>
                      )
                        .filter(([, v]) => v)
                        .map(([k]) => KONTRAINDIKATION_LABEL[k as Kontraindikation] ?? k);
                      return aktive.length > 0 ? (
                        <ul className="space-y-0.5">
                          {aktive.map((label) => (
                            <li key={label} className="flex gap-1.5 text-red-700">
                              <span className="shrink-0 mt-0.5">⚠</span>
                              <span>{label}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">Keine Angabe</span>
                      );
                    })()}
                  </dd>
                </div>
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
                const anwendungenRaw = Array.isArray(e.anwendungen) ? e.anwendungen : [];
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
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
                            {anwendungenRaw.length} Anwendung{anwendungenRaw.length === 1 ? '' : 'en'}
                          </div>
                          <div className="text-xs text-gray-500">
                            erstellt {fmtDatum(e.createdAt)}
                            {e.gueltigBis ? ` · gültig bis ${fmtDatum(e.gueltigBis)}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <a
                          href={`/p/${e.shareToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cp-tuerkis hover:underline"
                        >
                          Angebotsseite
                        </a>
                        <a
                          href={`/p/${e.shareToken}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 hover:underline"
                        >
                          PDF
                        </a>
                        <a
                          href={waUrl(
                            customer.telefon,
                            `Dein persönliches Angebot von Cryopoint Augsburg: ${SITE_URL}/p/${e.shareToken}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-1.5 py-0.5 rounded bg-[#25d366] text-white hover:opacity-90 transition-opacity"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div>
                      {e.zugesagtAm ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          ● Zugesagt am {fmtDatum(e.zugesagtAm)}
                        </span>
                      ) : e.geoeffnetAm ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                          ● Geöffnet am {fmtDatum(e.geoeffnetAm)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          ○ Noch nicht geöffnet
                        </span>
                      )}
                    </div>

                    <Verkaufsleitfaden
                      typ={e.typ}
                      kundenVorname={customer.vorname}
                      fokusLabel={fokusLabel}
                      mitgliedschaftId={e.mitgliedschaft}
                      sessionsProMonat={e.sessionsProMonat}
                      gueltigBis={e.gueltigBis}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notizen' && (
        <NotizenEditor customerId={customer.id} initial={customer.notizen} />
      )}

      {activeTab === 'check_ins' && (
        <KundenCheckIns
          customerId={customer.id}
          status={customer.status}
          monatsKontingent={customer.monatsKontingent}
          unbegrenzt={customer.unbegrenzt}
        />
      )}
    </div>
  );
}

function fmtDatum(d: Date | string): string {
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-44 shrink-0 text-gray-500">{label}</dt>
      <dd className="text-gray-800">{value}</dd>
    </div>
  );
}

function resolveChamberwert(frage: Frage, value: string): string {
  if (frage.type === 'freetext') return value;
  const ids = value.split(',').filter(Boolean);
  return ids.map((id) => frage.options.find((o) => o.id === id)?.label ?? id).join(', ');
}

function ChamberDetails({ mainFocus, chamber }: { mainFocus: string; chamber: Record<string, string> }) {
  const fragen = DETAIL_FRAGEN[mainFocus as MainFocus] ?? [];
  const rows = fragen.filter((f) => chamber[f.id]);
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map((f) => (
        <Row key={f.id} label={f.frage} value={resolveChamberwert(f, chamber[f.id])} />
      ))}
    </>
  );
}
