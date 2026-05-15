import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const postSchema = z.object({
  anwendung: z.string(),
  groesse: z.number().int().positive(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const karten = await prisma.card.findMany({
      where: { customerId: id },
      orderBy: { gekauftAm: 'desc' },
    });
    return NextResponse.json(karten);
  } catch (err) {
    console.error('[GET /api/admin/customers/[id]/karten]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });

    const card = await prisma.card.create({
      data: { customerId: id, ...parsed.data },
    });
    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/customers/[id]/karten]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
