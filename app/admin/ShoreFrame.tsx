'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ShoreFrame({ shoreUrl }: { shoreUrl: string | null }) {
  const pathname = usePathname();
  const visible = pathname.startsWith('/admin/kalender');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible && !mounted) setMounted(true);
  }, [visible, mounted]);

  if (!mounted) return null;

  return (
    <div
      style={{ display: visible ? 'flex' : 'none' }}
      className="fixed top-0 bottom-0 left-56 right-0 z-30 flex-col bg-cp-grauweis"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white">
        <h1 className="text-sm font-semibold text-neutral-700">Shore-Kalender</h1>
        {shoreUrl && (
          <a
            href={shoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-cp-tuerkis hover:underline"
          >
            <ExternalLink size={14} />
            In neuem Tab öffnen
          </a>
        )}
      </div>

      {shoreUrl ? (
        <iframe
          src={shoreUrl}
          className="flex-1 w-full border-0"
          title="Shore Kalender"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-3">
            <p className="text-sm font-medium text-neutral-700">
              Shore-Kalender ist nicht konfiguriert
            </p>
            <p className="text-xs text-neutral-500">
              Setze die Umgebungsvariable <code className="bg-neutral-100 px-1 py-0.5 rounded">SHORE_CALENDAR_URL</code> in <code className="bg-neutral-100 px-1 py-0.5 rounded">.env.local</code> (lokal) bzw. in Coolify (Dev/Prod).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
