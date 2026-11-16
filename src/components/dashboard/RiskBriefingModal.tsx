'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { MissionRiskItem } from '@/utils/missionRiskAnalysis';

interface RiskBriefingModalProps {
  isOpen: boolean;
  risks: MissionRiskItem[];
  astronautName: string;
  missionShortName: string;
  missionDay: number;
  commDelay: string;
  hasRoutineStepAfter: boolean;
  onConfirm: () => void;
}

export function RiskBriefingModal({
  isOpen,
  risks,
  astronautName,
  missionShortName,
  missionDay,
  commDelay,
  hasRoutineStepAfter,
  onConfirm,
}: RiskBriefingModalProps) {
  const { language } = useMission();

  useEffect(() => {
    if (!isOpen || risks.length === 0) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, risks.length, onConfirm]);

  if (!isOpen || risks.length === 0 || typeof document === 'undefined') return null;

  const criticalCount = risks.filter((r) => r.severity === 'critical').length;
  const warningCount = risks.filter((r) => r.severity === 'warning').length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/45 p-3 backdrop-blur-[3px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-briefing-title"
      aria-describedby="risk-briefing-desc"
    >
      <div className="dt-animate-panel flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-outline bg-surface-container shadow-[0_24px_64px_-24px_rgba(26,36,30,0.42)]">
        {/* Header */}
        <header className="border-b border-outline-variant bg-surface-container-low/65 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-warning/35 bg-warning-container px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-on-warning-container">
                  <Activity className="h-3 w-3 text-warning" />
                  {language === 'es'
                    ? `Briefing de Riesgos · Día ${missionDay}`
                    : `Risk Briefing · Day ${missionDay}`}
                </span>
                {hasRoutineStepAfter && (
                  <span className="rounded-lg border border-outline bg-surface-container px-2 py-0.5 font-mono text-[11px] font-medium text-on-surface-variant">
                    {language === 'es' ? 'Paso 1 de 2 · Prevención' : 'Step 1 of 2 · Prevention'}
                  </span>
                )}
              </div>
              <h2
                id="risk-briefing-title"
                className="text-[20px] leading-[26px] font-bold tracking-[-0.015em] text-on-surface font-display sm:text-[22px]"
              >
                {language === 'es'
                  ? 'Briefing de Riesgos y Prevención del Turno'
                  : 'Shift Risk & Prevention Briefing'}
              </h2>
              <p id="risk-briefing-desc" className="text-xs text-on-surface-variant sm:text-sm">
                {language === 'es' ? (
                  <>
                    Cruce clínico de <span className="font-semibold text-on-surface">{astronautName}</span>{' '}
                    con las condiciones activas de{' '}
                    <span className="font-semibold text-primary">{missionShortName}</span>.
                  </>
                ) : (
                  <>
                    Clinical cross-reference for{' '}
                    <span className="font-semibold text-on-surface">{astronautName}</span> under active{' '}
                    <span className="font-semibold text-primary">{missionShortName}</span> hazards.
                  </>
                )}
              </p>
            </div>

            {/* Severity Summary Counters */}
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-danger/45 bg-danger-container px-2.5 py-1 font-mono text-[11px] font-bold text-on-danger-container">
                  <ShieldAlert className="h-3.5 w-3.5 text-danger" />
                  {criticalCount}{' '}
                  {language === 'es'
                    ? `Crítico${criticalCount > 1 ? 's' : ''}`
                    : 'Critical'}
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-container px-2.5 py-1 font-mono text-[11px] font-bold text-on-warning-container">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  {warningCount}{' '}
                  {language === 'es'
                    ? `Precaución${warningCount > 1 ? 'es' : ''}`
                    : `Caution${warningCount > 1 ? 's' : ''}`}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Risk Cards Body */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className={`grid gap-3.5 ${risks.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {risks.map((risk) => {
              const isCritical = risk.severity === 'critical';
              return (
                <article
                  key={risk.id}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 ${
                    isCritical
                      ? 'border-danger/50 bg-danger-container/35'
                      : 'border-warning/45 bg-warning-container/35'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            isCritical
                              ? 'bg-danger text-on-primary'
                              : 'bg-warning text-on-primary'
                          }`}
                        >
                          {isCritical ? (
                            <ShieldAlert className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] ${
                            isCritical
                              ? 'border-danger/45 bg-danger-container text-on-danger-container'
                              : 'border-warning/45 bg-warning-container text-on-warning-container'
                          }`}
                        >
                          {isCritical
                            ? language === 'es'
                              ? 'Crítico'
                              : 'Critical'
                            : language === 'es'
                              ? 'Precaución'
                              : 'Caution'}
                        </span>
                      </div>
                      <span className="rounded-md border border-outline bg-surface-container px-2 py-0.5 font-mono text-[10px] font-semibold text-on-surface-variant">
                        {risk.category}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                        {language === 'es' ? 'Problema / Riesgo hoy' : 'Issue / Risk today'}
                      </p>
                      <h3 className="mt-0.5 text-sm font-bold leading-snug text-on-surface font-display">
                        {risk.problem}
                      </h3>
                    </div>

                    <div
                      className={`rounded-lg border px-2.5 py-2 ${
                        isCritical
                          ? 'border-danger/30 bg-surface-container/90'
                          : 'border-warning/30 bg-surface-container/90'
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                        {language === 'es' ? 'Dato detectado' : 'Detected metric'}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] font-medium leading-snug text-on-surface">
                        {risk.detectedMetric}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/80 pt-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-primary font-display">
                      {language === 'es'
                        ? 'Qué tener en cuenta y cómo actuar'
                        : 'What to watch & how to act'}
                    </p>
                    <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-on-surface">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{risk.action}</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low/65 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {language === 'es' ? (
                <>
                  Análisis autónomo local ({commDelay}).{' '}
                  {hasRoutineStepAfter
                    ? 'A continuación verás tu rutina priorizada para hoy.'
                    : 'Puedes consultar estos riesgos en cualquier momento.'}
                </>
              ) : (
                <>
                  Local autonomous analysis ({commDelay}).{' '}
                  {hasRoutineStepAfter
                    ? 'Next you will review your prioritized daily routine.'
                    : 'You can reopen this risk briefing at any time.'}
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:text-sm"
          >
            <span>{language === 'es' ? 'Entendido, continuar' : 'Understood, continue'}</span>
            <ArrowRight className="h-4 w-4 dt-transition group-hover:translate-x-0.5" />
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
