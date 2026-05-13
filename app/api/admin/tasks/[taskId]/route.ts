import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ taskId: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { taskId } = await params;
    await prisma.task.update({
      where: { id: taskId },
      data: { erledigtAm: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/admin/tasks/[taskId]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
