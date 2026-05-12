import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AufgabeNeuForm from './AufgabeNeuForm';

export default async function AufgabeNeuPage() {
  const kunden = await prisma.customer.findMany({
    select: { id: true, vorname: true, nachname: true },
    orderBy: { nachname: 'asc' },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold text-cp-blau mt-2">Neue Aufgabe erstellen</h1>
      </div>
      <AufgabeNeuForm kunden={kunden} />
    </div>
  );
}
