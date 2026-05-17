import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { AngebotPdf } from '@/features/angebot/AngebotPdf';
import { ladeAngebot } from '@/features/angebot/angebot-data';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;

  const angebot = await ladeAngebot(token);
  if (!angebot) {
    return new Response('Nicht gefunden', { status: 404 });
  }

  const safeName = angebot.kundenNachname.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const element = React.createElement(AngebotPdf, {
    kundenName: angebot.kundenName,
    erstelltAm: angebot.erstelltAm,
    typ: angebot.typ,
    anwendungen: angebot.anwendungen,
    preisSnapshot: angebot.preisSnapshot,
    einleitung: angebot.einleitung,
    zusatzhinweis: angebot.zusatzhinweis,
    mitgliedschaft: angebot.mitgliedschaft,
    gueltigBis: angebot.gueltigBis,
  }) as unknown as React.ReactElement<{ children?: React.ReactNode }>;

  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="angebot-${safeName}.pdf"`,
      'Cache-Control': 'private, no-cache',
    },
  });
}
