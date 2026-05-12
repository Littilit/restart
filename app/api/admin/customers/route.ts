import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  vorname:          z.string().min(2),
  nachname:         z.string().min(2),
  email:            z.string().email(),
  telefon:          z.string().min(6),
  geburtsdatum:     z.string().min(1),
  adresse:          z.string().min(3),
  herkunft:         z.string().optional().default(''),
  consentMarketing: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }

    const customer = await prisma.customer.create({ data: parsed.data });
    return NextResponse.json({ id: customer.id }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'E-Mail bereits vergeben' }, { status: 409 });
    }
    console.error('[POST /api/admin/customers]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
