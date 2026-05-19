import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseSheetUrl } from '@/lib/sheets';
import { syncLeadList } from '@/lib/lead-sync';

const createSchema = z.object({
  name: z.string().min(1),
  sheetUrl: z.string().url(),
  nameModus: z.enum(['getrennt', 'kombiniert']).default('getrennt'),
  spalteName: z.string().optional(),
  spalteVorname: z.string().optional(),
  spalteNachname: z.string().optional(),
  spalteEmail: z.string().optional(),
  spalteTelefon: z.string().optional(),
});

export async function GET() {
  const lists = await prisma.leadList.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { leads: true } },
    },
  });

  const withNewCount = await Promise.all(
    lists.map(async (list) => {
      const newCount = await prisma.lead.count({ where: { leadListId: list.id, status: 'neu' } });
      return { ...list, newCount };
    })
  );

  return NextResponse.json(withNewCount);
}

export async function POST(request: Request) {
  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const sheetParsed = parseSheetUrl(data.sheetUrl);
    if (!sheetParsed) {
      return NextResponse.json({ error: 'Ungültige Google-Sheets-URL' }, { status: 400 });
    }

    const list = await prisma.leadList.create({
      data: {
        name: data.name,
        sheetUrl: data.sheetUrl,
        sheetId: sheetParsed.sheetId,
        gid: sheetParsed.gid ?? null,
        nameModus: data.nameModus,
        spalteName: data.spalteName ?? null,
        spalteVorname: data.spalteVorname ?? null,
        spalteNachname: data.spalteNachname ?? null,
        spalteEmail: data.spalteEmail ?? null,
        spalteTelefon: data.spalteTelefon ?? null,
      },
    });

    // Erstbefüllung
    await syncLeadList(list.id);

    return NextResponse.json({ id: list.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/lead-lists]', err);
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
  }
}
