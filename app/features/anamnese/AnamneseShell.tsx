'use client';

import { useEffect, type ReactNode } from 'react';
import { StepProgress } from '@/components/ui/StepProgress';
import { useAnamnese } from './store';
import { COUNTED_STEPS } from './types';

interface AnamneseShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AnamneseShell({ title, subtitle, children }: AnamneseShellProps) {
  const { currentStep, stepCount } = useAnamnese();
  const stepIndex = useAnamnese((s) => s.stepIndex());
  const showProgress = currentStep !== 'plan';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-cp-beige/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container-cp py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-cp-tuerkis uppercase">CRYOPOINT</p>
              <p className="text-[10px] text-cp-braun tracking-[0.2em] uppercase">LONGEVITY SPA · AUGSBURG</p>
            </div>
            {showProgress && (
              <span className="text-xs text-cp-braun font-medium">
                Schritt {stepIndex} / {COUNTED_STEPS.length}
              </span>
            )}
          </div>
          {showProgress && (
            <StepProgress current={stepIndex} total={COUNTED_STEPS.length} className="mt-3" label="Schritt" />
          )}
        </div>
      </header>

      <main className="flex-1 container-cp py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cp-blau">{title}</h1>
          {subtitle && <p className="mt-1.5 text-cp-braun">{subtitle}</p>}
        </div>
        {children}
      </main>

      <footer className="container-cp py-6 text-center text-xs text-cp-braun/60">
        © {new Date().getFullYear()} Cryopoint Augsburg · Longevity Spa
      </footer>
    </div>
  );
}
