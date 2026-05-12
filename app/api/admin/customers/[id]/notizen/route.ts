import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json() as { body?: unknown };

    if (typeof body.body !== 'string' || body.body.trim() === '') {
      return NextResponse.json({ error: 'Notiz darf nicht leer sein' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: { customerId: id, body: body.body.trim() },
    });

    return NextResponse.json({ id: note.id });
  } catch (err) {
    console.error('[POST /api/admin/customers/[id]/notizen]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
