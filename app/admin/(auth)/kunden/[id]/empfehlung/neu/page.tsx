import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { computeEmpfehlungen } from '@/features/anamnese/empfehlung';
import type { MainFocus } from '@/features/anamnese/types';
import EmpfehlungEditor from './EmpfehlungEditor';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ typ?: string }>;
}

export default async function NeueEmpfehlung({ params, searchParams }: Props) {
  const { id } = await params;
  const { typ: typParam } = await searchParams;
  const typ: 'neukunde' | 'folge' = typParam === 'folge' ? 'folge' : 'neukunde';

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      anamnesen: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!customer) notFound();

  const anamnese = customer.anamnesen[0];
  const chamber2 = (anamnese?.chamber2 ?? {}) as Record<string, string>;
  const chamber2b = (anamnese?.chamber2b ?? {}) as Record<string, string>;
  const mainFocus = (anamnese?.mainFocus ?? null) as MainFocus | null;
  const mainFocus2 = (anamnese?.mainFocus2 ?? null) as MainFocus | null;

  const vorschlag = computeEmpfehlungen(mainFocus, chamber2, mainFocus2, chamber2b);
  const initial = vorschlag.map((entry) => ({
    slug: entry.slug,
    haeufigkeitText: entry.sessions,
    begruendung: entry.explanation,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/kunden/${id}?tab=empfehlungen`}
          className="text-sm text-gray-500 hover:text-cp-tuerkis mb-1 inline-block"
        >
          ← Zurück
        </Link>
        <h1 className="text-2xl font-semibold text-cp-blau">
          Neue Empfehlung für {customer.vorname} {customer.nachname}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {typ === 'neukunde' ? 'Neukunden-Angebot' : 'Folgeangebot'}
        </p>
      </div>

      <EmpfehlungEditor customerId={id} typ={typ} initial={initial} />
    </div>
  );
}
