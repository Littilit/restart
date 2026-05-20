'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AnamneseData, type AnamneseStep, type MainFocus, type Kontraindikation, STEP_ORDER, COUNTED_STEPS, INITIAL_DATA } from './types';
import { computeEmpfehlungen } from './empfehlung';
import type { AnwendungSlug } from '@/data/anwendungen';

interface AnamneseStore {
  data: AnamneseData;
  currentStep: AnamneseStep;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  submitError: string | null;
  submittedId: string | null;

  setGewaehlteAnwendung: (slug: AnwendungSlug) => void;
  setMainFocus: (focus: MainFocus, isSecond?: boolean) => void;
  clearMainFocus2: () => void;
  setChamber2Answer: (questionId: string, answerId: string, isSecond?: boolean) => void;
  setKontraindikation: (key: Kontraindikation, value: boolean) => void;
  setKeineKontraindikationen: (value: boolean) => void;
  updateContact: (patch: Partial<Pick<AnamneseData, 'vorname' | 'nachname' | 'email' | 'telefon' | 'geburtsdatum' | 'adresse' | 'herkunft'>>) => void;
  setConsent: (patch: Partial<Pick<AnamneseData, 'consentDsgvo' | 'consentGesundheitsdaten' | 'consentMarketing'>>) => void;
  setZiel: (text: string, audioDataUrl: string | null) => void;
  setSignature: (dataUrl: string | null) => void;
  goTo: (step: AnamneseStep) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  setSubmitState: (state: { submitStatus: 'submitting' | 'success' | 'error'; submitError?: string; submittedId?: string }) => void;

  stepIndex: () => number;
  stepCount: number;
}

export const useAnamnese = create<AnamneseStore>()(
  persist(
    (set, get) => ({
      data: { ...INITIAL_DATA },
      currentStep: 'anwendung',
      submitStatus: 'idle',
      submitError: null,
      submittedId: null,
      stepCount: COUNTED_STEPS.length,

      setGewaehlteAnwendung: (slug) =>
        set((s) => ({ data: { ...s.data, gewaehlteAnwendung: slug } })),

      setMainFocus: (focus, isSecond = false) =>
        set((s) => {
          const data = isSecond
            ? { ...s.data, mainFocus2: focus, chamber2b: {} }
            : { ...s.data, mainFocus: focus, chamber2: {}, mainFocus2: null, chamber2b: {} };
          const recs = computeEmpfehlungen(data.mainFocus, data.chamber2, data.mainFocus2, data.chamber2b);
          return { data: { ...data, recommendations: recs } };
        }),

      clearMainFocus2: () =>
        set((s) => {
          const data = { ...s.data, mainFocus2: null, chamber2b: {} };
          const recs = computeEmpfehlungen(data.mainFocus, data.chamber2, null, {});
          return { data: { ...data, recommendations: recs } };
        }),

      setChamber2Answer: (questionId, answerId, isSecond = false) =>
        set((s) => {
          const data = isSecond
            ? { ...s.data, chamber2b: { ...s.data.chamber2b, [questionId]: answerId } }
            : { ...s.data, chamber2: { ...s.data.chamber2, [questionId]: answerId } };
          const recs = computeEmpfehlungen(data.mainFocus, data.chamber2, data.mainFocus2, data.chamber2b);
          return { data: { ...data, recommendations: recs } };
        }),

      setKontraindikation: (key, value) =>
        set((s) => ({
          data: {
            ...s.data,
            kontraindikationen: { ...s.data.kontraindikationen, [key]: value },
            keineKontraindikationen: false,
          },
        })),

      setKeineKontraindikationen: (value) =>
        set((s) => ({
          data: {
            ...s.data,
            keineKontraindikationen: value,
            kontraindikationen: value ? {} : s.data.kontraindikationen,
          },
        })),

      updateContact: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),

      setConsent: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),

      setZiel: (text, audioDataUrl) =>
        set((s) => ({ data: { ...s.data, zielText: text, zielAudioDataUrl: audioDataUrl } })),

      setSignature: (dataUrl) =>
        set((s) => ({ data: { ...s.data, signatureDataUrl: dataUrl } })),

      goTo: (step) => set({ currentStep: step }),

      next: () =>
        set((s) => {
          const idx = STEP_ORDER.indexOf(s.currentStep);
          if (idx < STEP_ORDER.length - 1) return { currentStep: STEP_ORDER[idx + 1] };
          return {};
        }),

      back: () =>
        set((s) => {
          const idx = STEP_ORDER.indexOf(s.currentStep);
          if (idx > 0) return { currentStep: STEP_ORDER[idx - 1] };
          return {};
        }),

      reset: () =>
        set({ data: { ...INITIAL_DATA }, currentStep: 'anwendung', submitStatus: 'idle', submitError: null, submittedId: null }),

      setSubmitState: ({ submitStatus, submitError, submittedId }) =>
        set({ submitStatus, submitError: submitError ?? null, submittedId: submittedId ?? null }),

      stepIndex: () => {
        const step = get().currentStep;
        const idx = COUNTED_STEPS.indexOf(step as typeof COUNTED_STEPS[number]);
        return idx === -1 ? COUNTED_STEPS.length : idx + 1;
      },
    }),
    {
      name: 'restart-anamnese-draft',
      partialize: (s) => ({ data: s.data, currentStep: s.currentStep }),
    },
  ),
);
