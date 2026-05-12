import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { CustomerStatus } from '@prisma/client';
import StatusBadge, { STATUS_CONFIG } from '../StatusBadge';
import ServicegesprachAlarmSektion from '../ServicegesprachAlarmSektion';

const STATUS_ORDER: CustomerStatus[] = [
  'neukunde',
  'startangebot',
  'mitglied',
  'karten_kunde',
  'aggregator',
  'angebot_nachfassen',
  'kein_kauf',
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

interface Props {
  searchParams: Promise<{ status?: string; q?: string; tag?: string }>;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const { status, q, tag } = await searchParams;

  const filterStatus = STATUS_ORDER.includes(status as CustomerStatus)
    ? (status as CustomerStatus)
    : undefined;

  const siebenTageVor = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const alarmKunden = await prisma.customer.findMany({
    where: {
      erstTermin: { lte: siebenTageVor },
      servicegesprachAm: null,
      status: { not: 'aggregator' },
    },
    select: { id: true, vorname: true, nachname: true, status: true, erstTermin: true },
    orderBy: { erstTermin: 'asc' },
  });

  const customers = await prisma.customer.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(q
        ? {
            OR: [
              { vorname: { contains: q, mode: 'insensitive' } },
              { nachname: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { telefon: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { anamnesen: true, empfehlungen: true } } },
  });

  const counts = await prisma.customer.groupBy({
    by: ['status'],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  const tagParam = tag ? `&tag=${encodeURIComponent(tag)}` : '';

  return (
    <div>
      <ServicegesprachAlarmSektion kunden={alarmKunden.filter((k) => k.erstTermin !== null) as import('../ServicegesprachAlarmSektion').AlarmKunde[]} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-cp-blau">
          {tag ? <>Kunden <span className="text-base font-normal text-gray-400">— Tag: {tag}</span></> : 'Kunden'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{customers.length} Einträge</p>
      </div>

      {/* Filter-Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterTab href={`/admin${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`} label="Alle" active={!filterStatus} count={Object.values(countMap).reduce((a, b) => a + b, 0)} />
        {STATUS_ORDER.map((s) => (
          <FilterTab
            key={s}
            href={`/admin?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}${tagParam}`}
            label={STATUS_CONFIG[s].label}
            active={filterStatus === s}
            count={countMap[s] ?? 0}
          />
        ))}
      </div>

      {/* Suche */}
      <form className="mb-4">
        {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Name, E-Mail oder Telefon suchen…"
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cp-tuerkis"
        />
      </form>

      {/* Tabelle */}
      {customers.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Keine Kunden gefunden.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">E-Mail</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Telefon</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Anamnesen</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Angebote</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Seit</th>
              </tr>
            </thead>
            <tbody>
              {customers.flatMap((c, i) => {
                const curr = new Date(c.createdAt);
                const prev = i > 0 ? new Date(customers[i - 1].createdAt) : null;
                const newMonth = !prev || monthKey(prev) !== monthKey(curr);
                const rows = [];
                if (newMonth) {
                  rows.push(
                    <tr key={`sep-${monthKey(curr)}`} className="bg-gray-50 border-t-2 border-gray-300">
                      <td colSpan={7} className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {monthLabel(curr)}
                      </td>
                    </tr>
                  );
                }
                rows.push(
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors border-t border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/kunden/${c.id}`}
                        className="font-medium text-cp-blau hover:text-cp-tuerkis transition-colors"
                      >
                        {c.vorname} {c.nachname}
                      </Link>
                      {c.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.telefon}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-center hidden sm:table-cell">
                      {c._count.anamnesen}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-center hidden sm:table-cell">
                      {c._count.empfehlungen}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden xl:table-cell">
                      {curr.toLocaleDateString('de-DE')}
                    </td>
                  </tr>
                );
                return rows;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTab({
  href,
  label,
  active,
  count,
}: {
  href: string;
  label: string;
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-cp-blau text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-cp-tuerkis hover:text-cp-tuerkis'
      }`}
    >
      {label}
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
