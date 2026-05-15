import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { LONGEVITY_ANWENDUNGEN, KARTEN_ANWENDUNGEN } from '@/data/anwendungen';
import type { AnwendungSlug } from '@/data/anwendungen';

const postSchema = z.object({
  anwendung: z.string(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const checkIns = await prisma.checkIn.findMany({
      where: { customerId: id },
      include: { card: { select: { anwendung: true, groesse: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(checkIns);
  } catch (err) {
    console.error('[GET /api/admin/customers/[id]/check-ins]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    const { anwendung } = parsed.data;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });

    if (LONGEVITY_ANWENDUNGEN.includes(anwendung as AnwendungSlug)) {
      if (!customer.unbegrenzt && customer.monatsKontingent > 0) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const used = await prisma.checkIn.count({
          where: {
            customerId: id,
            anwendung: { in: LONGEVITY_ANWENDUNGEN },
            createdAt: { gte: monthStart },
          },
        });
        if (used >= customer.monatsKontingent) {
          return NextResponse.json(
            { error: `Monatliches Kontingent (${customer.monatsKontingent}) ausgeschöpft` },
            { status: 409 }
          );
        }
      } else if (!customer.unbegrenzt && customer.monatsKontingent === 0) {
        return NextResponse.json(
          { error: 'Kein Mitgliedskontingent hinterlegt' },
          { status: 409 }
        );
      }

      const checkIn = await prisma.checkIn.create({
        data: { customerId: id, anwendung },
      });
      return NextResponse.json(checkIn, { status: 201 });
    }

    if (KARTEN_ANWENDUNGEN.includes(anwendung as AnwendungSlug)) {
      const cards = await prisma.card.findMany({
        where: { customerId: id, anwendung },
        orderBy: { gekauftAm: 'asc' },
      });
      const card = cards.find((c) => c.verbraucht < c.groesse);

      if (!card) {
        return NextResponse.json(
          { error: 'Keine aktive Karte für diese Anwendung vorhanden' },
          { status: 409 }
        );
      }

      const [checkIn] = await prisma.$transaction([
        prisma.checkIn.create({ data: { customerId: id, anwendung, cardId: card.id } }),
        prisma.card.update({ where: { id: card.id }, data: { verbraucht: { increment: 1 } } }),
      ]);
      return NextResponse.json(checkIn, { status: 201 });
    }

    return NextResponse.json({ error: 'Unbekannte Anwendung' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/customers/[id]/check-ins]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
