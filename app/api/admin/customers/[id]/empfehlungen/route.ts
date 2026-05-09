import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PREISE, SLUG_KATEGORIE } from '@/data/preise';
import type { AnwendungSlug } from '@/data/anwendungen';
import type { EmpfehlungTyp } from '@prisma/client';

const VALID_TYP: EmpfehlungTyp[] = ['neukunde', 'folge'];

const VALID_SLUGS: AnwendungSlug[] = [
  'eisbox', 'redlight', 'infrarotsauna', 'boa-lymphmassage',
  'armstrong', 'beckenbodenstuhl', 'cryoshaper',
];

interface AnwendungInput {
  slug: AnwendungSlug;
  haeufigkeitText: string;
  begruendung: string;
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json() as {
    typ?: string;
    anwendungen?: unknown;
    zusatzhinweis?: string;
  };

  if (typeof body.typ !== 'string' || !VALID_TYP.includes(body.typ as EmpfehlungTyp)) {
    return NextResponse.json({ error: 'Ungültiger Typ' }, { status: 400 });
  }

  if (!Array.isArray(body.anwendungen) || body.anwendungen.length === 0) {
    return NextResponse.json({ error: 'Mindestens eine Anwendung erforderlich' }, { status: 400 });
  }

  const anwendungen: AnwendungInput[] = [];
  for (const raw of body.anwendungen) {
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Ungültige Anwendung' }, { status: 400 });
    }
    const a = raw as Record<string, unknown>;
    if (
      typeof a.slug !== 'string' ||
      !VALID_SLUGS.includes(a.slug as AnwendungSlug) ||
      typeof a.haeufigkeitText !== 'string' ||
      typeof a.begruendung !== 'string'
    ) {
      return NextResponse.json({ error: 'Ungültige Anwendung' }, { status: 400 });
    }
    anwendungen.push({
      slug: a.slug as AnwendungSlug,
      haeufigkeitText: a.haeufigkeitText,
      begruendung: a.begruendung,
    });
  }

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
  }

  const usedKategorien = new Set(anwendungen.map((a) => SLUG_KATEGORIE[a.slug]));
  const preisSnapshotRaw: Record<string, unknown> = {};
  for (const kat of usedKategorien) {
    preisSnapshotRaw[kat] = PREISE[kat];
  }
  const preisSnapshot = preisSnapshotRaw as Prisma.InputJsonValue;

  const empfehlung = await prisma.empfehlung.create({
    data: {
      customerId: id,
      typ: body.typ as EmpfehlungTyp,
      anwendungen: anwendungen as unknown as Prisma.InputJsonValue,
      zusatzhinweis: typeof body.zusatzhinweis === 'string' && body.zusatzhinweis.trim() !== ''
        ? body.zusatzhinweis
        : null,
      preisSnapshot,
    },
  });

  return NextResponse.json({ id: empfehlung.id, shareToken: empfehlung.shareToken });
}
