import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ type: z.enum(['geoeffnet', 'zusage']) });

type Params = { params: Promise<{ token: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }

    const empfehlung = await prisma.empfehlung.findUnique({
      where: { shareToken: token },
      include: { customer: true },
    });
    if (!empfehlung) {
      return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    }

    if (parsed.data.type === 'geoeffnet') {
      if (!empfehlung.geoeffnetAm) {
        await prisma.empfehlung.update({
          where: { id: empfehlung.id },
          data: { geoeffnetAm: new Date() },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // type === 'zusage'
    if (!empfehlung.zugesagtAm) {
      const typLabel = empfehlung.typ === 'neukunde' ? 'Neukunden-Special' : 'Mitgliedschaft';
      const name = `${empfehlung.customer.vorname} ${empfehlung.customer.nachname}`;
      await prisma.$transaction([
        prisma.empfehlung.update({
          where: { id: empfehlung.id },
          data: { zugesagtAm: new Date() },
        }),
        prisma.task.create({
          data: {
            customerId: empfehlung.customerId,
            anweisung:
              `${name} hat dem Angebot zugesagt (${typLabel}). ` +
              'Beim nächsten Besuch den Abschluss vorbereiten und eintragen.',
          },
        }),
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/p/[token]/event]', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
