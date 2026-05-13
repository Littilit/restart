import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const mergeSchema = z.object({
  keepId: z.string().cuid(),
  mergeId: z.string().cuid(),
});

export async function POST(request: Request) {
  try {
    const parsed = mergeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    const { keepId, mergeId } = parsed.data;
    if (keepId === mergeId) {
      return NextResponse.json({ error: 'Kunden sind identisch' }, { status: 400 });
    }

    const [keep, merge] = await Promise.all([
      prisma.customer.findUnique({ where: { id: keepId } }),
      prisma.customer.findUnique({ where: { id: mergeId } }),
    ]);
    if (!keep || !merge) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    const newEmails = [...new Set([...keep.alternativeEmails, merge.email, ...merge.alternativeEmails])].filter(
      (e) => e !== keep.email
    );
    const newTelefone = [...new Set([...keep.alternativeTelefone, merge.telefon, ...merge.alternativeTelefone])].filter(
      (t) => t !== keep.telefon
    );

    await prisma.$transaction([
      prisma.anamnese.updateMany({ where: { customerId: mergeId }, data: { customerId: keepId } }),
      prisma.empfehlung.updateMany({ where: { customerId: mergeId }, data: { customerId: keepId } }),
      prisma.note.updateMany({ where: { customerId: mergeId }, data: { customerId: keepId } }),
      prisma.task.updateMany({ where: { customerId: mergeId }, data: { customerId: keepId } }),
      prisma.customer.update({
        where: { id: keepId },
        data: { alternativeEmails: newEmails, alternativeTelefone: newTelefone },
      }),
      prisma.customer.delete({ where: { id: mergeId } }),
    ]);

    return NextResponse.json({ ok: true, keepId });
  } catch (err) {
    console.error('[POST /api/admin/customers/merge]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
