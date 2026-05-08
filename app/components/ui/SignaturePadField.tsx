'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface SignaturePadFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (dataUrl: string | null) => void;
}

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  getDataUrl: () => string | null;
}

export const SignaturePadField = forwardRef<SignaturePadHandle, SignaturePadFieldProps>(
  function SignaturePadField({ label, hint, error, onChange }, ref) {
    const sigRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigRef.current?.clear();
        onChange?.(null);
      },
      isEmpty: () => sigRef.current?.isEmpty() ?? true,
      getDataUrl: () => {
        if (!sigRef.current || sigRef.current.isEmpty()) return null;
        return sigRef.current.getCanvas().toDataURL('image/png');
      },
    }));

    function handleEnd() {
      if (!sigRef.current || sigRef.current.isEmpty()) {
        onChange?.(null);
      } else {
        onChange?.(sigRef.current.getCanvas().toDataURL('image/png'));
      }
    }

    function clear() {
      sigRef.current?.clear();
      onChange?.(null);
    }

    return (
      <div className="w-full">
        {label && (
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-cp-blau">{label}</label>
            <Button type="button" variant="ghost" size="sm" onClick={clear} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
              Löschen
            </Button>
          </div>
        )}
        <div className={`rounded-xl border-2 border-dashed bg-white ${error ? 'border-red-500' : 'border-cp-beige/80'}`}>
          <SignatureCanvas
            ref={sigRef}
            penColor="#002343"
            canvasProps={{ className: 'w-full h-44 md:h-52 rounded-xl touch-none' }}
            onEnd={handleEnd}
          />
        </div>
        <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-cp-braun'}`}>
          {error ?? hint ?? 'Unterschrift mit Finger oder Maus'}
        </p>
      </div>
    );
  },
);
