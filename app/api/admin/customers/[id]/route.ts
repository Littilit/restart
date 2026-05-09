import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { CustomerStatus } from '@prisma/client';

const VALID_STATUS: CustomerStatus[] = [
  'neukunde', 'startangebot', 'mitglied', 'karten_kunde', 'aggregator', 'angebot_nachfassen',
];

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
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
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json() as { status?: string; tags?: unknown };

  const data: { status?: CustomerStatus; tags?: string[] } = {};
  if (typeof body.status === 'string' && VALID_STATUS.includes(body.status as CustomerStatus)) {
    data.status = body.status as CustomerStatus;
  }
  if (Array.isArray(body.tags)) {
    data.tags = body.tags.filter((t): t is string => typeof t === 'string');
  }

  const customer = await prisma.customer.update({ where: { id }, data });
  return NextResponse.json(customer);
}
