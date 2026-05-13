import { getTermine } from '@/lib/shore-calendar';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function KalenderPage() {
  const heute = startOfDay(new Date());
  const ende = addDays(heute, 7);
  const tage = Array.from({ length: 7 }, (_, i) => addDays(heute, i));

  let termine: Awaited<ReturnType<typeof getTermine>> = [];
  let fehler: string | null = null;
  try {
    termine = await getTermine(heute, ende);
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error('[Shore-Kalender] Fetch fehlgeschlagen:', e);
    fehler = `Shore-Kalender konnte nicht geladen werden — ${msg}`;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-800">Kalender</h1>
        <Link
          href="/admin/kalender"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cp-tuerkis transition-colors"
        >
          <RefreshCw size={12} />
          Aktualisieren
        </Link>
      </div>

      {fehler && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {fehler}
        </p>
      )}

      {tage.map((tag) => {
        const tagesTermine = termine.filter((t) => isSameDay(t.start, tag));
        const istHeute = isSameDay(tag, heute);

        return (
          <div key={tag.toISOString()}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
              istHeute ? 'text-cp-tuerkis' : 'text-neutral-400'
            }`}>
              {istHeute ? 'Heute' : format(tag, 'EEEE, d. MMMM', { locale: de })}
            </p>
            {tagesTermine.length === 0 ? (
              <p className="text-sm text-neutral-300 px-1">Keine Termine</p>
            ) : (
              <ul className="space-y-2">
                {tagesTermine.map((t) => (
                  <li key={t.uid} className="flex gap-3 bg-white border border-neutral-100 rounded-lg px-4 py-3">
                    <span className="text-xs text-neutral-400 shrink-0 pt-0.5 w-11">
                      {format(t.start, 'HH:mm')}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{t.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
