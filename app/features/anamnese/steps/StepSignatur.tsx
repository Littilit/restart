'use client';

import { useRef, useState } from 'react';
import { SignaturePadField, type SignaturePadHandle } from '@/components/ui/SignaturePadField';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';

async function submitAnamnese(data: object): Promise<{ id: string }> {
  const res = await fetch('/api/anamnesen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Fehler beim Speichern');
  }
  return res.json();
}

export function StepSignatur() {
  const { data, setSignature, next, back, setSubmitState, submitStatus } = useAnamnese();
  const sigRef = useRef<SignaturePadHandle>(null);
  const [sigError, setSigError] = useState('');

  async function handleSubmit() {
    const dataUrl = sigRef.current?.getDataUrl() ?? data.signatureDataUrl;
    if (!dataUrl) {
      setSigError('Bitte unterschreibe, um fortzufahren.');
      return;
    }
    setSigError('');
    setSignature(dataUrl);
    setSubmitState({ submitStatus: 'submitting' });

    try {
      const { id } = await submitAnamnese({ ...data, signatureDataUrl: dataUrl, userAgent: navigator.userAgent });
      setSubmitState({ submitStatus: 'success', submittedId: id });
      next();
    } catch (err) {
      setSubmitState({ submitStatus: 'error', submitError: (err as Error).message });
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cp-braun">
        Bitte unterschreibe, um deine Angaben zu bestätigen. Danach erhältst du deinen
        persönlichen Anwendungsplan.
      </p>

      <SignaturePadField
        ref={sigRef}
        label="Unterschrift"
        error={sigError}
        onChange={() => setSigError('')}
      />

      {submitStatus === 'error' && (
        <p className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          Etwas ist schiefgelaufen. Bitte versuche es erneut.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={back} disabled={submitStatus === 'submitting'} className="flex-1">
          Zurück
        </Button>
        <Button
          onClick={handleSubmit}
          loading={submitStatus === 'submitting'}
          className="flex-[2]"
        >
          Anmeldung abschließen
        </Button>
      </div>
    </div>
  );
}
