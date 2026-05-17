import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ladeAngebot } from '@/features/angebot/angebot-data';
import { AngebotView } from '@/features/angebot/AngebotView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dein persönliches Angebot – Cryopoint Augsburg',
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ token: string }> };

export default async function AngebotSeite({ params }: Params) {
  const { token } = await params;
  const angebot = await ladeAngebot(token);
  if (!angebot) notFound();

  return <AngebotView angebot={angebot} token={token} />;
}
