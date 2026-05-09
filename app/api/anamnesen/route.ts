import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const schema = z.object({
  version: z.number().optional(),
  gewaehlteAnwendung: z.string().nullable().optional(),
  mainFocus: z.string().nullable().optional(),
  mainFocus2: z.string().nullable().optional(),
  chamber2: z.record(z.string(), z.string()).optional().default({}),
  chamber2b: z.record(z.string(), z.string()).optional().default({}),
  recommendations: z.array(z.object({ slug: z.string(), sessions: z.string(), explanation: z.string() })).optional().default([]),
  kontraindikationen: z.record(z.string(), z.boolean()).optional().default({}),
  keineKontraindikationen: z.boolean().optional().default(false),
  vorname: z.string().min(1),
  nachname: z.string().min(1),
  email: z.string().email(),
  telefon: z.string().min(1),
  geburtsdatum: z.string().min(1),
  adresse: z.string().min(1),
  consentDsgvo: z.boolean(),
  consentGesundheitsdaten: z.boolean(),
  consentMarketing: z.boolean().optional().default(false),
  signatureDataUrl: z.string().nullable().optional(),
  herkunft: z.string().optional().default(''),
  userAgent: z.string().optional().default(''),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validierungsfehler' }, { status: 422 });
  }

  const d = parsed.data;

  if (!d.consentDsgvo || !d.consentGesundheitsdaten) {
    return NextResponse.json({ error: 'Erforderliche Einwilligungen fehlen' }, { status: 422 });
  }

  try {
    const anamnese = await prisma.anamnese.create({
      data: {
        version: 2,
        gewaehlteAnwendung: d.gewaehlteAnwendung ?? null,
        mainFocus: d.mainFocus ?? null,
        mainFocus2: d.mainFocus2 ?? null,
        chamber2: d.chamber2 as Prisma.InputJsonValue,
        chamber2b: d.chamber2b as Prisma.InputJsonValue,
        recommendations: d.recommendations as Prisma.InputJsonValue,
        kontraindikationen: d.kontraindikationen as Prisma.InputJsonValue,
        keineKontraindikationen: d.keineKontraindikationen,
        vorname: d.vorname,
        nachname: d.nachname,
        email: d.email,
        telefon: d.telefon,
        geburtsdatum: d.geburtsdatum,
        adresse: d.adresse,
        consentDsgvo: d.consentDsgvo,
        consentGesundheitsdaten: d.consentGesundheitsdaten,
        consentMarketing: d.consentMarketing,
        signatureDataUrl: d.signatureDataUrl ?? null,
        herkunft: d.herkunft,
        userAgent: d.userAgent,
      },
    });

    return NextResponse.json({ id: anamnese.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/anamnesen]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
