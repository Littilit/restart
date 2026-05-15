import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIns = await prisma.checkIn.findMany({
      where: { createdAt: { gte: today } },
      include: {
        customer: { select: { id: true, vorname: true, nachname: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Gruppieren nach Kunde, neueste zuerst (letzter Check-in bestimmt Reihenfolge)
    const map = new Map<string, { id: string; vorname: string; nachname: string; checkIns: { anwendung: string; createdAt: string }[] }>();

    for (const ci of checkIns) {
      const cId = ci.customer.id;
      if (!map.has(cId)) {
        map.set(cId, { id: cId, vorname: ci.customer.vorname, nachname: ci.customer.nachname, checkIns: [] });
      }
      map.get(cId)!.checkIns.push({ anwendung: ci.anwendung, createdAt: ci.createdAt.toISOString() });
    }

    // Neuester Check-in zuerst
    const result = Array.from(map.values()).sort(
      (a, b) => b.checkIns[b.checkIns.length - 1].createdAt.localeCompare(a.checkIns[a.checkIns.length - 1].createdAt)
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/admin/check-in/heute]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
