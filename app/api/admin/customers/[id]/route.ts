import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { CustomerStatus } from '@prisma/client';


const patchSchema = z.object({
  status: z.enum(['neukunde', 'startangebot', 'mitglied', 'karten_kunde', 'aggregator', 'angebot_nachfassen', 'kein_kauf']).optional(),
  tags: z.array(z.string()).optional(),
  erstTermin: z.string().datetime().nullable().optional(),
  servicegesprachErledigt: z.boolean().optional(),
  monatsKontingent: z.number().int().min(0).optional(),
  unbegrenzt: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        anamnesen: { orderBy: { createdAt: 'desc' } },
        empfehlungen: { orderBy: { createdAt: 'desc' } },
        notizen: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    return NextResponse.json(customer);
  } catch (err) {
    console.error('[GET /api/admin/customers/[id]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;

    const data: {
      status?: CustomerStatus;
      tags?: string[];
      erstTermin?: Date | null;
      servicegesprachAm?: Date | null;
      monatsKontingent?: number;
      unbegrenzt?: boolean;
    } = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.tags !== undefined) data.tags = body.tags;
    if ('erstTermin' in body) data.erstTermin = body.erstTermin ? new Date(body.erstTermin) : null;
    if (body.servicegesprachErledigt === true) data.servicegesprachAm = new Date();
    else if (body.servicegesprachErledigt === false) data.servicegesprachAm = null;
    if (body.monatsKontingent !== undefined) data.monatsKontingent = body.monatsKontingent;
    if (body.unbegrenzt !== undefined) data.unbegrenzt = body.unbegrenzt;

    const customer = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json(customer);
  } catch (err) {
    console.error('[PATCH /api/admin/customers/[id]]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
