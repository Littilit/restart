import Link from 'next/link';
import KundeNeuForm from './KundeNeuForm';

export default function KundeNeuPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold text-cp-blau mt-2">Neuen Kunden anlegen</h1>
      </div>
      <KundeNeuForm />
    </div>
  );
}
