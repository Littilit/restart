import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string; noteId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id, noteId } = await params;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.customerId !== id) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    await prisma.note.delete({ where: { id: noteId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/customers/[id]/notizen/[noteId]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
