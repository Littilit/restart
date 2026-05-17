'use client';

import { useEffect, useState } from 'react';

interface Props {
  token: string;
  typ: 'neukunde' | 'folge';
  bereitsZugesagt: boolean;
  studioTelefon: string;
}

function telDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0049')) return digits.slice(2);
  if (digits.startsWith('49')) return digits;
  if (digits.startsWith('0')) return '49' + digits.slice(1);
  return digits;
}

export function AngebotZusage({ token, typ, bereitsZugesagt, studioTelefon }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>(
    bereitsZugesagt ? 'done' : 'idle',
  );

  // Öffnungs-Tracking: einmalig beim Laden der Seite.
  useEffect(() => {
    fetch(`/api/p/${token}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'geoeffnet' }),
    }).catch(() => {});
  }, [token]);

  async function zusagen() {
    setStatus('sending');
    try {
      const res = await fetch(`/api/p/${token}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'zusage' }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const digits = telDigits(studioTelefon);
  const waUrl = `https://api.whatsapp.com/send?phone=${digits}`;
  const telUrl = `tel:+${digits}`;

  const buttonLabel =
    typ === 'neukunde'
      ? 'Ja – ich sichere mir das Special'
      : 'Ja – ich will Mitglied werden';

  return (
    <div className="rounded-2xl bg-cp-blau text-white p-6 space-y-4">
      {status === 'done' ? (
        <div className="space-y-2 text-center">
          <p className="text-lg font-bold">Stark – wir haben deine Zusage!</p>
          <p className="text-sm text-white/80 leading-relaxed">
            Du musst jetzt nichts weiter tun. Wir melden uns bei dir und schließen
            alles in Ruhe vor Ort ab – beim nächsten Besuch.
          </p>
        </div>
      ) : (
        <>
          <div className="text-center space-y-1">
            <p className="text-lg font-bold">Bereit für deinen nächsten Schritt?</p>
            <p className="text-sm text-white/70 leading-relaxed">
              Ein Klick genügt – kein Vertrag, keine Zahlungsdaten. Du sagst uns nur
              Bescheid, dass du dabei bist. Den Rest machen wir gemeinsam vor Ort.
            </p>
          </div>
          <button
            type="button"
            onClick={zusagen}
            disabled={status === 'sending'}
            className="w-full rounded-xl bg-cp-tuerkis px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === 'sending' ? 'Einen Moment …' : buttonLabel}
          </button>
          {status === 'error' && (
            <p className="text-center text-sm text-red-200">
              Das hat nicht geklappt. Versuch es bitte erneut oder melde dich direkt bei uns.
            </p>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-white/15 pt-4 sm:flex-row sm:justify-center">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25d366] px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Per WhatsApp schreiben
        </a>
        <a
          href={telUrl}
          className="rounded-lg bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Anrufen: {studioTelefon}
        </a>
      </div>
    </div>
  );
}
