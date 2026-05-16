import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { computeEmpfehlungen } from '@/features/anamnese/empfehlung';
import type { MainFocus } from '@/features/anamnese/types';
import { ANWENDUNGEN, type AnwendungSlug } from '@/data/anwendungen';
import { RESEARCH } from '@/data/research';
import EmpfehlungEditor from './EmpfehlungEditor';

const VALID_SLUGS = new Set<string>(ANWENDUNGEN.map((a) => a.slug));

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
      empfehlungen: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!customer) notFound();

  const anamnese = customer.anamnesen[0];
  const chamber2 = (anamnese?.chamber2 ?? {}) as Record<string, string>;
  const chamber2b = (anamnese?.chamber2b ?? {}) as Record<string, string>;
  const mainFocus = (anamnese?.mainFocus ?? null) as MainFocus | null;
  const mainFocus2 = (anamnese?.mainFocus2 ?? null) as MainFocus | null;

  const vorschlag = computeEmpfehlungen(mainFocus, chamber2, mainFocus2, chamber2b);

  let initial: { slug: AnwendungSlug; haeufigkeitText: string; begruendung: string }[];

  let initialErkrankungen: string[] = [];
  let initialMitgliedschaft = '';

  if (typ === 'folge' && customer.empfehlungen.length > 0) {
    const letzteEmpfehlung = customer.empfehlungen[0];
    const raw = Array.isArray(letzteEmpfehlung.anwendungen)
      ? letzteEmpfehlung.anwendungen
      : [];
    initial = raw
      .filter((a) => {
        if (typeof a !== 'object' || a === null) return false;
        const o = a as Record<string, unknown>;
        return (
          VALID_SLUGS.has(o.slug as string) &&
          typeof o.haeufigkeitText === 'string' &&
          typeof o.begruendung === 'string'
        );
      })
      .map((a) => {
        const o = a as Record<string, unknown>;
        return {
          slug: o.slug as AnwendungSlug,
          haeufigkeitText: o.haeufigkeitText as string,
          begruendung: o.begruendung as string,
        };
      });

    const rawErkrankungen = letzteEmpfehlung.erkrankungen;
    if (Array.isArray(rawErkrankungen)) {
      initialErkrankungen = rawErkrankungen.filter((e): e is string => typeof e === 'string');
    }
    if (typeof letzteEmpfehlung.mitgliedschaft === 'string') {
      initialMitgliedschaft = letzteEmpfehlung.mitgliedschaft;
    }
  } else {
    initial = vorschlag.map((entry) => ({
      slug: entry.slug,
      haeufigkeitText: RESEARCH[entry.slug]?.sessions ?? entry.sessions,
      begruendung: '',
    }));
  }

  const initialEinleitung = mainFocus
    ? `${customer.vorname} ${customer.nachname} hat im Fokus: ${mainFocus}${mainFocus2 ? ` und ${mainFocus2}` : ''}. Die folgende Empfehlung basiert auf den Anamnese-Daten und der wissenschaftlichen Studienlage zu den ausgewählten Anwendungen.`
    : '';

  const typLabel = typ === 'neukunde' ? 'Neukunden-Angebot' : 'Folgeangebot';

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
        <p className="text-sm text-gray-500 mt-0.5">{typLabel}</p>
      </div>

      <EmpfehlungEditor
        customerId={id}
        typ={typ}
        initial={initial}
        initialEinleitung={initialEinleitung}
        initialMainFocus={mainFocus}
        initialMainFocus2={mainFocus2}
        initialChamber2={chamber2}
        initialChamber2b={chamber2b}
        initialErkrankungen={initialErkrankungen}
        initialMitgliedschaft={initialMitgliedschaft}
      />
    </div>
  );
}
