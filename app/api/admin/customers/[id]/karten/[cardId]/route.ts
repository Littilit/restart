import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string; cardId: string }> };

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id, cardId } = await params;
    const card = await prisma.card.findFirst({ where: { id: cardId, customerId: id } });
    if (!card) return NextResponse.json({ error: 'Karte nicht gefunden' }, { status: 404 });
    await prisma.card.delete({ where: { id: cardId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/admin/customers/[id]/karten/[cardId]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
