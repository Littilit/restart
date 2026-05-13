import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { samePersonByName } from '@/lib/name-similarity';

const createSchema = z.object({
  vorname:          z.string().min(2),
  nachname:         z.string().min(2),
  email:            z.string().email(),
  telefon:          z.string().min(6),
  geburtsdatum:     z.string().optional().default(''),
  adresse:          z.string().optional().default(''),
  herkunft:         z.string().optional().default(''),
  consentMarketing: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.customer.findMany({ where: { email: parsed.data.email } });
    const duplicate = existing.find((c) => samePersonByName(c.vorname, parsed.data.vorname));
    if (duplicate) {
      return NextResponse.json({ error: 'Kunde existiert bereits' }, { status: 409 });
    }

    const customer = await prisma.customer.create({ data: parsed.data });
    return NextResponse.json({ id: customer.id }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/admin/customers]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
