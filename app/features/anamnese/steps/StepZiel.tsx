'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';

type Tab = 'text' | 'audio';
type RecordingState = 'idle' | 'recording' | 'done';

const MAX_SECONDS = 60;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function StepZiel() {
  const { data, setZiel, next, back } = useAnamnese();

  const [tab, setTab] = useState<Tab>(data.zielAudioDataUrl ? 'audio' : 'text');
  const [text, setText] = useState(data.zielText);

  const [recordingState, setRecordingState] = useState<RecordingState>(
    data.zielAudioDataUrl ? 'done' : 'idle',
  );
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(data.zielAudioDataUrl);
  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopRecording() {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  useEffect(() => {
    return () => {
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function switchTab(newTab: Tab) {
    if (newTab === tab) return;
    if (recordingState === 'recording') stopRecording();
    setTab(newTab);
    if (newTab === 'text') {
      setAudioDataUrl(null);
      setRecordingState('idle');
      setElapsed(0);
      setZiel(text, null);
    } else {
      setText('');
      setZiel('', audioDataUrl);
    }
  }

  function handleTextChange(val: string) {
    setText(val);
    setZiel(val, null);
  }

  async function startRecording() {
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = await blobToDataUrl(blob);
        setAudioDataUrl(url);
        setZiel('', url);
        setRecordingState('done');
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(250);
      setElapsed(0);
      setRecordingState('recording');

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setMicError('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinem Browser.');
    }
  }

  function handleStopRecording() {
    stopRecording();
  }

  function handleReset() {
    setAudioDataUrl(null);
    setRecordingState('idle');
    setElapsed(0);
    setZiel('', null);
  }

  function navigate(direction: 'next' | 'back') {
    if (recordingState === 'recording') stopRecording();
    if (direction === 'next') next();
    else back();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cp-braun leading-relaxed">
        Was wäre für dich ein guter Mehrwert, oder ein gutes Ergebnis, wenn du unsere Anwendungen
        nutzt — und in welchem Zeitraum siehst du es als realistisch an?
      </p>

      {/* Tab-Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-medium">
        <button
          type="button"
          onClick={() => switchTab('text')}
          className={`flex-1 py-2.5 transition-colors ${
            tab === 'text'
              ? 'bg-cp-braun text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Schreiben
        </button>
        <button
          type="button"
          onClick={() => switchTab('audio')}
          className={`flex-1 py-2.5 transition-colors ${
            tab === 'audio'
              ? 'bg-cp-braun text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Sprechen
        </button>
      </div>

      {/* Text-Tab */}
      {tab === 'text' && (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="z. B. Weniger Rückenschmerzen in 3 Monaten …"
          rows={5}
          className="w-full rounded-xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp-braun/30 resize-none"
        />
      )}

      {/* Audio-Tab */}
      {tab === 'audio' && (
        <div className="space-y-4">
          {micError && (
            <p className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {micError}
            </p>
          )}

          {recordingState === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-500 hover:border-cp-braun hover:text-cp-braun transition-colors"
            >
              <span className="text-2xl">🎙</span>
              <span className="text-sm font-medium">Aufnahme starten</span>
            </button>
          )}

          {recordingState === 'recording' && (
            <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-700">Aufnahme läuft …</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-red-600">
                  {fmtTime(elapsed)} / {fmtTime(MAX_SECONDS)}
                </span>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="rounded-lg bg-red-600 text-white text-xs px-3 py-1.5 font-medium hover:bg-red-700 transition-colors"
                >
                  Stopp
                </button>
              </div>
            </div>
          )}

          {recordingState === 'done' && audioDataUrl && (
            <div className="space-y-3">
              <audio controls src={audioDataUrl} className="w-full h-10" />
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-cp-braun underline transition-colors"
              >
                Neu aufnehmen
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate('back')} className="flex-1">
          Zurück
        </Button>
        <Button onClick={() => navigate('next')} className="flex-[2]">
          Weiter
        </Button>
      </div>
    </div>
  );
}
