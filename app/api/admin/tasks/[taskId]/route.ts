import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const patchSchema = z.object({
  erledigungsTyp: z.enum(['termin_vereinbart', 'feedback_eingeholt', 'neuer_termin']),
  notiz: z.string().optional(),
});

type Params = { params: Promise<{ taskId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { taskId } = await params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    const { erledigungsTyp, notiz } = parsed.data;

    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { customerId: true } });
    if (!task) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

    const notizTrimmed = notiz?.trim();

    if (notizTrimmed && task.customerId) {
      await prisma.$transaction([
        prisma.task.update({
          where: { id: taskId },
          data: { erledigtAm: new Date(), erledigungsTyp },
        }),
        prisma.note.create({
          data: { customerId: task.customerId, body: notizTrimmed },
        }),
      ]);
    } else {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          erledigtAm: new Date(),
          erledigungsTyp,
          ...(notizTrimmed ? { erledigungsNotiz: notizTrimmed } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/admin/tasks/[taskId]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
