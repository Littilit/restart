import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  anweisung:  z.string().min(1),
  skript:     z.string().optional(),
  customerId: z.string().optional(),
  faelligAm:  z.string().datetime().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }

    const { customerId, ...rest } = parsed.data;

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
      if (!customer) {
        return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
      }
    }

    const task = await prisma.task.create({
      data: {
        ...rest,
        customerId: customerId ?? null,
        faelligAm: rest.faelligAm ? new Date(rest.faelligAm) : null,
      },
    });

    return NextResponse.json({ id: task.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/tasks]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
