import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PREISE, SLUG_KATEGORIE } from '@/data/preise';

const VALID_SLUGS = ['eisbox', 'redlight', 'infrarotsauna', 'boa-lymphmassage', 'armstrong', 'beckenbodenstuhl', 'cryoshaper'] as const;

const postSchema = z.object({
  typ: z.enum(['neukunde', 'folge']),
  anwendungen: z.array(z.object({
    slug: z.enum(VALID_SLUGS),
    haeufigkeitText: z.string(),
    begruendung: z.string(),
  })).min(1),
  einleitung: z.string().optional(),
  zusatzhinweis: z.string().optional(),
  erkrankungen: z.array(z.string()).optional(),
  mitgliedschaft: z.enum(['flex', 'premium', 'longevity']).optional(),
  gueltigBis: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }
    const { typ, anwendungen, einleitung, zusatzhinweis, erkrankungen, mitgliedschaft, gueltigBis } = parsed.data;

    const gueltigBisDate = gueltigBis ? new Date(gueltigBis) : null;
    if (gueltigBisDate && Number.isNaN(gueltigBisDate.getTime())) {
      return NextResponse.json({ error: 'Ungültiges Datum' }, { status: 400 });
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

    const empfehlung = await prisma.empfehlung.create({
      data: {
        customerId: id,
        typ,
        anwendungen: anwendungen as Prisma.InputJsonValue,
        einleitung: einleitung?.trim() || null,
        zusatzhinweis: zusatzhinweis?.trim() || null,
        erkrankungen: (erkrankungen ?? []) as Prisma.InputJsonValue,
        mitgliedschaft: typ === 'folge' ? (mitgliedschaft ?? null) : null,
        preisSnapshot: preisSnapshotRaw as Prisma.InputJsonValue,
        gueltigBis: gueltigBisDate,
      },
    });

    return NextResponse.json({ id: empfehlung.id, shareToken: empfehlung.shareToken });
  } catch (err) {
    console.error('[POST /api/admin/customers/[id]/empfehlungen]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
