import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  aktiv: z.boolean().optional(),
  nameModus: z.enum(['getrennt', 'kombiniert']).optional(),
  spalteName: z.string().nullable().optional(),
  spalteVorname: z.string().nullable().optional(),
  spalteNachname: z.string().nullable().optional(),
  spalteEmail: z.string().nullable().optional(),
  spalteTelefon: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    const list = await prisma.leadList.update({ where: { id }, data: parsed.data });
    return NextResponse.json(list);
  } catch (err) {
    console.error('[PATCH /api/admin/lead-lists/:id]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.leadList.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/admin/lead-lists/:id]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
