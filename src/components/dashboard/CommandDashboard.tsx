'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertOctagon,
  AlertTriangle,
  Droplets,
  Flame,
  HeartPulse,
  Info,
  Radiation,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { InteractiveBodyMap } from './InteractiveBodyMap';
import { RoutineDashboardWidget } from './RoutineDashboardWidget';
import { RoutineFocusModal } from './RoutineFocusModal';
import { RiskBriefingModal } from './RiskBriefingModal';

interface DockFlightState {
  fromRect: DOMRect;
  toRect: DOMRect;
  isTargetVisible: boolean;
}

export function CommandDashboard() {
  const {
    mission,
    astronaut,
    missionDay,
    biomarkers,
    streakDays,
    healthPoints,
    readinessScore,
    systemStatuses,
    globalTriage,
    activeCrisisScenario,
    crisisAlertBanner,
    detectedRisks,
    shouldShowRiskBriefing,
    shouldShowRoutineModal,
    hasPendingRoutineModal,
    acknowledgeRiskBriefing,
    acknowledgeRoutineModal,
    reopenRiskBriefing,
    reopenRoutineModal,
    setActiveTab,
    openSosOverlay,
    simulateLiveCrisis,
    restoreNominalVitals,
  } = useMission();

  const dashboardSlotRef = useRef<HTMLDivElement>(null);
  const flightBackdropRef = useRef<HTMLDivElement>(null);
  const flightModalShellRef = useRef<HTMLDivElement>(null);
  const flightTargetMirrorRef = useRef<HTMLDivElement>(null);

  const [dockFlight, setDockFlight] = useState<DockFlightState | null>(null);
  const [justDocked, setJustDocked] = useState(false);
  const [wasChainedAfterBriefing, setWasChainedAfterBriefing] = useState(false);

  const ackRoutineRef = useRef(acknowledgeRoutineModal);
  ackRoutineRef.current = acknowledgeRoutineModal;

  useEffect(() => {
    if (shouldShowRiskBriefing) {
      setWasChainedAfterBriefing(true);
    }
  }, [shouldShowRiskBriefing]);

  useEffect(() => {
    if (!justDocked) return;
    const timer = window.setTimeout(() => setJustDocked(false), 520);
    return () => window.clearTimeout(timer);
  }, [justDocked]);

  const handleRequestDock = useCallback((fromRect: DOMRect | null) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toRect = dashboardSlotRef.current?.getBoundingClientRect() ?? null;

    if (prefersReducedMotion || !fromRect || !toRect || toRect.width < 10) {
      setWasChainedAfterBriefing(false);
      ackRoutineRef.current();
      return;
    }

    const isTargetVisible = toRect.top < window.innerHeight - 36 && toRect.bottom > 36;
    setDockFlight({ fromRect, toRect, isTargetVisible });
  }, []);

  useLayoutEffect(() => {
    if (!dockFlight) return;

    const { fromRect, toRect, isTargetVisible } = dockFlight;
    const animations: Animation[] = [];
    const easeDock = 'cubic-bezier(0.16, 1, 0.3, 1)';
    let cancelled = false;

    if (flightBackdropRef.current) {
      animations.push(
        flightBackdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 280,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        })
      );
    }

    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + fromRect.height / 2;
    const destLeft = toRect.left;
    const destTop = isTargetVisible
      ? toRect.top
      : Math.min(toRect.top, window.innerHeight - Math.min(toRect.height, 220) - 20);
    const destCenterX = destLeft + toRect.width / 2;
    const destCenterY = destTop + toRect.height / 2;

    if (flightModalShellRef.current) {
      const leaveDx = destCenterX - fromCenterX;
      const leaveDy = destCenterY - fromCenterY;
      const leaveScale = Math.max(0.48, Math.min(0.92, toRect.width / Math.max(1, fromRect.width)));

      animations.push(
        flightModalShellRef.current.animate(
          [
            { transform: 'translate3d(0px, 0px, 0) scale(1)', opacity: 1 },
            {
              transform: `translate3d(${leaveDx * 0.72}px, ${leaveDy * 0.72}px, 0) scale(${leaveScale})`,
              opacity: 0,
            },
          ],
          { duration: 240, easing: easeDock, fill: 'forwards' }
        )
      );
    }

    if (flightTargetMirrorRef.current) {
      const arrRect = flightTargetMirrorRef.current.getBoundingClientRect();
      const arrCenterX = arrRect.left + arrRect.width / 2;
      const arrCenterY = arrRect.top + arrRect.height / 2;
      const invDx = fromCenterX - arrCenterX;
      const invDy = fromCenterY - arrCenterY;
      const invScale = Math.min(
        1.34,
        Math.max(0.85, fromRect.width / Math.max(1, arrRect.width))
      );

      const mainFlight = flightTargetMirrorRef.current.animate(
        isTargetVisible
          ? [
              {
                transform: `translate3d(${invDx}px, ${invDy}px, 0) scale(${invScale})`,
                opacity: 0,
                boxShadow: '0 24px 64px -24px rgba(26, 36, 30, 0.38)',
              },
              {
                transform: `translate3d(${invDx * 0.64}px, ${invDy * 0.64}px, 0) scale(${
                  1 + (invScale - 1) * 0.64
                })`,
                opacity: 1,
                offset: 0.25,
                boxShadow: '0 18px 44px -18px rgba(26, 36, 30, 0.28)',
              },
              {
                transform: 'translate3d(0px, 0px, 0) scale(1)',
                opacity: 1,
                boxShadow: '0 0 0 0 rgba(26, 36, 30, 0)',
              },
            ]
          : [
              {
                transform: `translate3d(${invDx}px, ${invDy}px, 0) scale(${invScale})`,
                opacity: 0,
                boxShadow: '0 24px 64px -24px rgba(26, 36, 30, 0.38)',
              },
              {
                transform: `translate3d(${invDx * 0.4}px, ${invDy * 0.4}px, 0) scale(0.95)`,
                opacity: 1,
                offset: 0.35,
                boxShadow: '0 16px 36px -18px rgba(26, 36, 30, 0.24)',
              },
              {
                transform: 'translate3d(0px, 24px, 0) scale(0.84)',
                opacity: 0,
                boxShadow: '0 0 0 0 rgba(26, 36, 30, 0)',
              },
            ],
        { duration: isTargetVisible ? 460 : 400, easing: easeDock, fill: 'forwards' }
      );

      animations.push(mainFlight);
      mainFlight.onfinish = () => {
        if (cancelled) return;
        setWasChainedAfterBriefing(false);
        setDockFlight(null);
        ackRoutineRef.current();
        setJustDocked(true);
      };
    } else {
      setWasChainedAfterBriefing(false);
      setDockFlight(null);
      ackRoutineRef.current();
    }

    return () => {
      cancelled = true;
      animations.forEach((anim) => anim.cancel());
    };
  }, [dockFlight]);

  const kpiCards = [
    {
      label: 'Glucosa Capilar',
      value: `${biomarkers.glucoseMgDl} mg/dL`,
      sub: `Base EHR: ${astronaut.clinicalHistory.baselineGlucose} mg/dL`,
      why: 'Evita hipoglucemia en tareas EVA y detecta resistencia insulínica en 0g.',
      status: systemStatuses.metabolic,
      icon: <Droplets className="h-4 w-4 text-telemetry" />,
      tab: 'survival' as const,
    },
    {
      label: 'Radiación Acumulada',
      value: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
      sub: `Límite misión: ${mission.missionLimitMsv} mSv`,
      why: 'Controla la exposición ionizante acumulada (dosimetría CSA).',
      status: systemStatuses.immune,
      icon: <Radiation className="h-4 w-4 text-warning" />,
      tab: 'survival' as const,
    },
    {
      label: 'Oxígeno y Pulso',
      value: `${biomarkers.spo2Percent}% SpO₂`,
      sub: `${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · ${biomarkers.heartRateBpm} bpm`,
      why: 'Supervisa aire de cabina y respuesta cardiovascular en misión.',
      status: systemStatuses.cardiovascular,
      icon: <HeartPulse className="h-4 w-4 text-primary" />,
      tab: 'sensors' as const,
    },
    {
      label: 'Conservación Ósea',
      value: `${biomarkers.boneDensityRetentionPercent}%`,
      sub: `Músculo: ${biomarkers.muscleMassRetentionPercent}% · ${mission.gravityLabel}`,
      why: 'Previene descalcificación por baja o nula gravedad.',
      status: systemStatuses.musculoskeletal,
      icon: <Sparkles className="h-4 w-4 text-secondary" />,
      tab: 'musculoskeletal' as const,
    },
  ];

  const statusBorder = (s: 'nominal' | 'warning' | 'critical') =>
    s === 'critical'
      ? 'border-danger/45 bg-danger-container/50'
      : s === 'warning'
        ? 'border-warning/40 bg-warning-container/50'
        : 'border-outline bg-surface-container';

  const criticalRiskCount = detectedRisks.filter((r) => r.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Active Crisis Alert Banner (when a live crisis is triggered) */}
      {crisisAlertBanner && (
        <section className="dt-animate-panel flex flex-col gap-3 rounded-2xl border-2 border-danger bg-danger-container p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger text-on-primary animate-pulse">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <p className="text-sm font-bold text-on-danger-container font-display">
                {crisisAlertBanner.title}
              </p>
              <p className="mt-0.5 text-on-danger-container/95">{crisisAlertBanner.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openSosOverlay()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-danger px-3.5 py-2 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-danger-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Abrir Panel SOS</span>
            </button>
            <button
              type="button"
              onClick={restoreNominalVitals}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-danger/35 bg-surface-container px-3 py-2 text-xs font-semibold text-on-danger-container font-display dt-transition hover:-translate-y-px hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer Signos Nominales</span>
            </button>
          </div>
        </section>
      )}

      {/* Discrete Jury Demo Strip: Simular Crisis en Vivo */}
      <section className="rounded-2xl border border-outline bg-surface-container px-4 py-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-warning/35 bg-warning-container text-warning">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <div>
            <span className="font-bold text-on-surface font-display">
              Simular Crisis en Vivo (Demo):
            </span>{' '}
            <span className="text-on-surface-variant">
              Prueba alertas en cabina, cambio de sistemas a Rojo en el mapa corporal y guía SOS.
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => simulateLiveCrisis('syncope_hypoglycemic')}
            className="cursor-pointer rounded-xl border border-danger/35 bg-danger-container/65 px-2.5 py-1.5 text-xs font-semibold text-on-danger-container font-display dt-transition hover:-translate-y-px hover:border-danger hover:bg-danger-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
          >
            Escenario 1: Síncope / Hipoglucemia
          </button>
          <button
            type="button"
            onClick={() => simulateLiveCrisis('microgravity_seizure')}
            className="cursor-pointer rounded-xl border border-warning/40 bg-warning-container/70 px-2.5 py-1.5 text-xs font-semibold text-on-warning-container font-display dt-transition hover:-translate-y-px hover:border-warning hover:bg-warning-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
          >
            Escenario 2: Crisis Convulsiva 0g
          </button>
          {(activeCrisisScenario || globalTriage !== 'nominal') && (
            <button
              type="button"
              onClick={restoreNominalVitals}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-primary/35 bg-primary-container px-2.5 py-1.5 text-xs font-bold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restablecer Signos Nominales</span>
            </button>
          )}
        </div>
      </section>

      {/* Top KPI Strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(card.tab)}
            className={`group cursor-pointer text-left rounded-2xl border p-4 dt-transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_24px_-14px_rgba(47,93,70,0.24)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${statusBorder(
              card.status
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant font-display">
                {card.label}
              </span>
              <span className="dt-transition group-hover:scale-110">{card.icon}</span>
            </div>
            <p className="mt-2 text-[22px] leading-[28px] font-bold tracking-tight text-on-surface font-mono">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{card.sub}</p>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-snug text-on-surface-variant">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{card.why}</span>
            </p>
          </button>
        ))}
      </section>

      {/* Main Grid: Interactive Human Figure + Gamification & Compact Routine Widget */}
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <InteractiveBodyMap />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Gamification Streak & Mission Readiness */}
          <div className="rounded-2xl border border-outline bg-surface-container p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
                  Motivación y Adherencia Médica
                </p>
                <h2 className="mt-0.5 text-[18px] leading-[24px] font-bold text-on-surface font-display">
                  Racha de Misión y Estado Operativo
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-warning/30 bg-warning-container">
                <Flame className="h-6 w-6 text-warning" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl border border-warning/25 bg-warning-container p-3">
                <span className="text-[11px] font-medium text-on-warning-container block">
                  Racha Activa
                </span>
                <span className="mt-1 block text-base font-bold text-on-warning-container font-mono">
                  {streakDays} días
                </span>
              </div>
              <div className="rounded-xl border border-primary/25 bg-primary-container p-3">
                <span className="text-[11px] font-medium text-on-primary-container block">
                  Puntos Salud
                </span>
                <span className="mt-1 flex items-center justify-center gap-1 text-base font-bold text-on-primary-container font-mono">
                  <Trophy className="h-4 w-4 text-primary" />
                  {healthPoints}
                </span>
              </div>
              <div className="rounded-xl border border-telemetry/25 bg-telemetry-container p-3">
                <span className="text-[11px] font-medium text-on-telemetry-container block">
                  Aptitud Hoy
                </span>
                <span className="mt-1 block text-base font-bold text-on-telemetry-container font-mono">
                  {readinessScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Compact & Expandable Routine Widget (dock target for Focus Modal) */}
          <RoutineDashboardWidget
            containerRef={dashboardSlotRef}
            isHiddenForFlight={Boolean(dockFlight)}
            justDocked={justDocked}
            onOpenFocusMode={reopenRoutineModal}
          />
        </div>
      </section>

      {/* EHR Clinical Context Banner */}
      <section className="rounded-2xl border border-outline bg-surface-container p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-semibold text-on-surface font-display">
              Expediente Clínico Pre-Misión Activo: {astronaut.name} ({astronaut.bloodType})
            </p>
            <p className="mt-0.5 text-on-surface-variant">{astronaut.clinicalHistory.notes}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] shrink-0">
          {astronaut.clinicalHistory.priorSurgeries.map((surg, i) => (
            <span
              key={i}
              className="rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 font-medium text-on-surface-variant"
            >
              {surg}
            </span>
          ))}
          {detectedRisks.length > 0 && (
            <button
              type="button"
              onClick={reopenRiskBriefing}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold font-display dt-transition hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40 ${
                criticalRiskCount > 0
                  ? 'border-danger/45 bg-danger-container text-on-danger-container hover:border-danger'
                  : 'border-warning/40 bg-warning-container text-on-warning-container hover:border-warning'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Briefing de riesgos ({detectedRisks.length})</span>
            </button>
          )}
        </div>
      </section>

      {/* Step 1 Startup Modal (Conditional: only when risks exist) */}
      <RiskBriefingModal
        isOpen={shouldShowRiskBriefing}
        risks={detectedRisks}
        astronautName={astronaut.name}
        missionShortName={mission.shortName}
        missionDay={missionDay}
        commDelay={mission.commDelay}
        hasRoutineStepAfter={hasPendingRoutineModal}
        onConfirm={acknowledgeRiskBriefing}
      />

      {/* Step 2 (or Step 1 if 0 risks) Startup Focus Modal */}
      <RoutineFocusModal
        isOpen={shouldShowRoutineModal && !dockFlight}
        showStepIndicator={wasChainedAfterBriefing}
        onRequestDock={handleRequestDock}
      />

      {/* Native FLIP Docking Flight Layer (Modal -> Dashboard Routine Widget) */}
      {dockFlight &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
            <div
              ref={flightBackdropRef}
              className="absolute inset-0 bg-on-surface/45 backdrop-blur-[3px]"
            />

            <div
              ref={flightModalShellRef}
              style={{
                position: 'fixed',
                left: dockFlight.fromRect.left,
                top: dockFlight.fromRect.top,
                width: dockFlight.fromRect.width,
                height: dockFlight.fromRect.height,
              }}
              className="rounded-2xl border border-outline bg-surface-container shadow-[0_24px_64px_-24px_rgba(26,36,30,0.42)]"
            />

            <div
              ref={flightTargetMirrorRef}
              style={{
                position: 'fixed',
                left: dockFlight.toRect.left,
                top: dockFlight.isTargetVisible
                  ? dockFlight.toRect.top
                  : Math.min(
                      dockFlight.toRect.top,
                      window.innerHeight - Math.min(dockFlight.toRect.height, 220) - 20
                    ),
                width: dockFlight.toRect.width,
              }}
            >
              <RoutineDashboardWidget isStaticPreview />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
