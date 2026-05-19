import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['neu', 'erreicht', 'termin_vereinbart', 'kein_interesse']).optional(),
  erreichtAm: z.string().datetime().nullable().optional(),
  terminVereinbartAm: z.string().datetime().nullable().optional(),
  notiz: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };

    // Status automatisch koppeln
    if (data.erreichtAm && !data.status) {
      const lead = await prisma.lead.findUnique({ where: { id }, select: { status: true } });
      if (lead?.status === 'neu') data.status = 'erreicht';
    }
    if (data.terminVereinbartAm && !data.status) {
      data.status = 'termin_vereinbart';
    }

    // Datumswerte konvertieren
    if (data.erreichtAm) data.erreichtAm = new Date(data.erreichtAm as string);
    else if (data.erreichtAm === null) data.erreichtAm = null;
    if (data.terminVereinbartAm) data.terminVereinbartAm = new Date(data.terminVereinbartAm as string);
    else if (data.terminVereinbartAm === null) data.terminVereinbartAm = null;

    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json(lead);
  } catch (err) {
    console.error('[PATCH /api/admin/leads/:id]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
