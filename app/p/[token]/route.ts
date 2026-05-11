import { NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { AngebotPdf, type AnwendungItem, type PreisEntry } from '@/features/angebot/AngebotPdf';
import { ExpertenPdf } from '@/features/angebot/ExpertenPdf';
import type { AnwendungSlug } from '@/data/anwendungen';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;

  const empfehlung = await prisma.empfehlung.findUnique({
    where: { shareToken: token },
    include: { customer: true },
  });

  if (!empfehlung) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  const rawAnwendungen = Array.isArray(empfehlung.anwendungen)
    ? empfehlung.anwendungen
    : [];

  const anwendungen: AnwendungItem[] = rawAnwendungen
    .filter(
      (a): a is { slug: AnwendungSlug; haeufigkeitText: string; begruendung: string } =>
        typeof a === 'object' &&
        a !== null &&
        typeof (a as Record<string, unknown>).slug === 'string' &&
        typeof (a as Record<string, unknown>).haeufigkeitText === 'string' &&
        typeof (a as Record<string, unknown>).begruendung === 'string'
    )
    .map((a) => ({
      slug: a.slug,
      haeufigkeitText: a.haeufigkeitText,
      begruendung: a.begruendung,
    }));

  const kundenName = `${empfehlung.customer.vorname} ${empfehlung.customer.nachname}`;
  const safeName = empfehlung.customer.nachname.toLowerCase().replace(/[^a-z0-9]/g, '-');

  let element: React.ReactElement<{ children?: React.ReactNode }>;

  if (empfehlung.typ === 'experte') {
    element = React.createElement(ExpertenPdf, {
      kundenName,
      erstelltAm: empfehlung.createdAt,
      anwendungen,
      einleitung: empfehlung.einleitung,
      zusatzhinweis: empfehlung.zusatzhinweis,
    }) as unknown as React.ReactElement<{ children?: React.ReactNode }>;
  } else {
    const preisSnapshot =
      typeof empfehlung.preisSnapshot === 'object' &&
      empfehlung.preisSnapshot !== null &&
      !Array.isArray(empfehlung.preisSnapshot)
        ? (empfehlung.preisSnapshot as unknown as Record<string, PreisEntry>)
        : {};

    element = React.createElement(AngebotPdf, {
      kundenName,
      erstelltAm: empfehlung.createdAt,
      typ: empfehlung.typ,
      anwendungen,
      preisSnapshot,
      zusatzhinweis: empfehlung.zusatzhinweis,
    }) as unknown as React.ReactElement<{ children?: React.ReactNode }>;
  }

  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );

  const filePrefix = empfehlung.typ === 'experte' ? 'expertenempfehlung' : 'angebot';

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filePrefix}-${safeName}.pdf"`,
      'Cache-Control': 'private, no-cache',
    },
  });
}
