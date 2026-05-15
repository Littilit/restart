import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LONGEVITY_ANWENDUNGEN, KARTEN_ANWENDUNGEN } from '@/data/anwendungen';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';

    if (q.length < 2) return NextResponse.json([]);

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { vorname: { contains: q, mode: 'insensitive' } },
          { nachname: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { telefon: { contains: q } },
        ],
      },
      take: 10,
      select: {
        id: true,
        vorname: true,
        nachname: true,
        email: true,
        telefon: true,
        status: true,
        monatsKontingent: true,
        unbegrenzt: true,
        karten: { orderBy: { gekauftAm: 'asc' } },
        checkIns: {
          where: {
            anwendung: { in: LONGEVITY_ANWENDUNGEN },
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
          select: { id: true },
        },
      },
    });

    const result = customers.map((c) => {
      const longevityGenutzt = c.checkIns.length;

      const kartenByAnwendung: Record<string, { remaining: number; total: number }> = {};
      for (const slug of KARTEN_ANWENDUNGEN) {
        const relevantCards = c.karten.filter((k) => k.anwendung === slug);
        const total = relevantCards.reduce((sum, k) => sum + k.groesse, 0);
        const used = relevantCards.reduce((sum, k) => sum + k.verbraucht, 0);
        kartenByAnwendung[slug] = { remaining: total - used, total };
      }

      return {
        id: c.id,
        vorname: c.vorname,
        nachname: c.nachname,
        email: c.email,
        telefon: c.telefon,
        status: c.status,
        monatsKontingent: c.monatsKontingent,
        unbegrenzt: c.unbegrenzt,
        longevityGenutzt,
        karten: kartenByAnwendung,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/admin/check-in/search]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
