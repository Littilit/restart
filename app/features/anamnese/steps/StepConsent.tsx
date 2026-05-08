'use client';

import { ConsentBox } from '@/components/ui/ConsentBox';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';

export function StepConsent() {
  const { data, setConsent, next, back } = useAnamnese();

  const canProceed = data.consentDsgvo && data.consentGesundheitsdaten;

  return (
    <div className="space-y-4">
      <ConsentBox
        required
        checked={data.consentDsgvo}
        onChange={(v) => setConsent({ consentDsgvo: v })}
        label="Datenschutzerklärung (DSGVO)"
        detail={
          <span>
            Ich bin mit der DSGVO-konformen Datenspeicherung durch Cryopoint Augsburg einverstanden.
            Meine Daten werden ausschließlich zur Betreuung meiner Anwendungen genutzt und auf einem
            Server in Deutschland gespeichert.
          </span>
        }
      />
      <ConsentBox
        required
        checked={data.consentGesundheitsdaten}
        onChange={(v) => setConsent({ consentGesundheitsdaten: v })}
        label="Verarbeitung von Gesundheitsdaten (Art. 9 DSGVO)"
        detail={
          <span>
            Ich willige in die Verarbeitung meiner besonderen personenbezogenen Daten
            (Gesundheitsdaten gem. Art. 9 DSGVO) ein. Diese werden ausschließlich zur
            Auswahl geeigneter Anwendungen und zur Prüfung auf Kontraindikationen genutzt.
          </span>
        }
      />
      <ConsentBox
        checked={data.consentMarketing}
        onChange={(v) => setConsent({ consentMarketing: v })}
        label="Newsletter & Angebote (optional)"
        detail={
          <span>
            Ich möchte max. 1–2 Mal im Monat über neue Angebote und Aktionen von Cryopoint
            Augsburg informiert werden. Abmeldung jederzeit möglich.
          </span>
        }
      />

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={back} className="flex-1">
          Zurück
        </Button>
        <Button disabled={!canProceed} onClick={next} className="flex-[2]">
          Weiter
        </Button>
      </div>
    </div>
  );
}
