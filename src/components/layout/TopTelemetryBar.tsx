'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  Droplets,
  Gauge,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { DemoScenario, useMission } from '@/context/MissionContext';
import { TriageLevel } from '@/data/medicalKnowledge';

const TRIAGE_BADGE: Record<
  TriageLevel,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  nominal: {
    label: 'ESTADO NOMINAL',
    classes: 'border-primary/30 bg-primary-container text-on-primary-container',
    icon: <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
  },
  warning: {
    label: 'PRECAUCIÓN ACTIVA',
    classes: 'border-warning/35 bg-warning-container text-on-warning-container',
    icon: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
  },
  critical: {
    label: 'ALERTA CRÍTICA',
    classes: 'border-danger/45 bg-danger-container text-on-danger-container animate-pulse',
    icon: <ShieldAlert className="h-3.5 w-3.5 text-danger" />,
  },
};

export function TopTelemetryBar() {
  const {
    mission,
    astronaut,
    missionDay,
    globalTriage,
    reopenOnboarding,
    triggerDemoAnomaly,
    resetDemoData,
  } = useMission();

  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTestDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTestDrawerOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerContainerRef.current &&
        !drawerContainerRef.current.contains(event.target as Node)
      ) {
        setIsTestDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTestDrawerOpen]);

  const badge = TRIAGE_BADGE[globalTriage];
  const hasLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

  const scenarios: { id: DemoScenario; label: string; style: string }[] = [
    {
      id: 'nominal',
      label: 'Nominal',
      style:
        'border-primary/30 bg-primary-container/60 text-on-primary-container hover:bg-primary-container',
    },
    {
      id: 'solar_storm',
      label: 'Tormenta Solar',
      style:
        'border-danger/35 bg-danger-container/70 text-on-danger-container hover:bg-danger-container',
    },
    {
      id: 'hypoglycemia_immune',
      label: 'Glucosa + Defensas',
      style:
        'border-warning/35 bg-warning-container/70 text-on-warning-container hover:bg-warning-container',
    },
    {
      id: 'isolation_fatigue',
      label: 'Fatiga Mental',
      style:
        'border-telemetry/35 bg-telemetry-container/70 text-on-telemetry-container hover:bg-telemetry-container',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-surface-container/95 backdrop-blur-md">
      <div className="relative flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
        {/* Left: Clean Inline Mission & Astronaut Summary */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mission Pill */}
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span className="truncate text-xs font-bold text-on-surface font-display">
              {mission.shortName}
            </span>
            <span className="text-xs text-outline">|</span>
            <span className="shrink-0 font-mono text-xs font-semibold text-primary">
              DÍA {missionDay}/{mission.durationDays}
            </span>
          </div>

          {/* Subtle Inline Clinical Metadata (no noisy boxes) */}
          <div className="hidden items-center gap-2.5 text-xs text-on-surface-variant md:flex">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              <span>{mission.gravityLabel}</span>
            </span>

            <span className="hidden h-3.5 w-px bg-outline xl:inline-block" />

            <span className="hidden items-center gap-1.5 xl:inline-flex">
              <Radio className="h-3.5 w-3.5 text-telemetry" />
              <span>Enlace: {mission.commDelay}</span>
            </span>

            <span className="h-3.5 w-px bg-outline" />

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-on-surface font-display">{astronaut.name}</span>
              <span className="inline-flex items-center gap-0.5 rounded-md border border-danger/30 bg-danger-container px-1.5 py-0.5 font-mono text-[11px] font-bold text-on-danger-container">
                <Droplets className="h-2.5 w-2.5 text-danger" />
                {astronaut.bloodType}
              </span>
              {hasLowImmune && (
                <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 text-[11px] font-semibold text-on-warning-container">
                  Defensas Bajas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Global Triage + Slide-Out Test Navbar Toggle */}
        <div ref={drawerContainerRef} className="flex shrink-0 items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold font-display sm:px-3 sm:text-xs ${badge.classes}`}
          >
            {badge.icon}
            <span className="hidden sm:inline">{badge.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTestDrawerOpen((prev) => !prev)}
            aria-expanded={isTestDrawerOpen}
            aria-controls="deeptrau-test-drawer"
            title="Desplegar controles de pruebas y cambio de misión"
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:px-3 ${
              isTestDrawerOpen
                ? 'border-primary/40 bg-primary-container text-on-primary-container'
                : 'border-outline bg-surface-container-low text-on-surface hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-high'
            }`}
          >
            <ChevronLeft
              className={`h-3.5 w-3.5 dt-transition transition-transform ${
                isTestDrawerOpen ? '-rotate-90 text-primary' : 'text-on-surface-variant'
              }`}
            />
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Pruebas</span>
          </button>

          {/* Slide-Out Test & Mission Controls Navbar */}
          <div
            id="deeptrau-test-drawer"
            aria-hidden={!isTestDrawerOpen}
            inert={!isTestDrawerOpen}
            className={`absolute right-4 top-[calc(100%+8px)] z-40 w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-outline bg-surface-container p-3.5 shadow-[0_14px_32px_-12px_rgba(26,36,30,0.18)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-auto sm:min-w-[440px] sm:max-w-[580px] lg:right-6 ${
              isTestDrawerOpen
                ? 'translate-y-0 translate-x-0 opacity-100 scale-100 pointer-events-auto'
                : '-translate-y-1 translate-x-4 opacity-0 scale-[0.97] pointer-events-none'
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Header row inside slide-out panel */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface font-display">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Simulador de Pruebas y Misión
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={resetDemoData}
                    title="Reiniciar métricas de demostración"
                    className="group inline-flex cursor-pointer items-center gap-1 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:-translate-y-px hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RotateCcw className="h-3.5 w-3.5 dt-transition group-hover:-rotate-45" />
                    <span>Reiniciar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTestDrawerOpen(false);
                      reopenOnboarding();
                    }}
                    className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RefreshCw className="h-3.5 w-3.5 dt-transition group-hover:rotate-90" />
                    <span>Cambiar Misión / Astronauta</span>
                  </button>
                </div>
              </div>

              {/* Simulation scenario buttons */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low p-1.5">
                <span className="px-1.5 text-[11px] font-semibold text-on-surface-variant">
                  Simular:
                </span>
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => triggerDemoAnomaly(sc.id)}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${sc.style}`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {/* Compact Clinical & Local-First Autonomy Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2 text-[11px] text-on-surface-variant">
                <div className="flex flex-wrap items-center gap-2 md:hidden">
                  <span className="font-semibold text-on-surface">{astronaut.name}</span>
                  <span>· {astronaut.bloodType}</span>
                  <span>· {mission.gravityLabel}</span>
                </div>
                {mission.commDelayMinutes >= 1 ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-warning" />
                    <span>
                      Autonomía Médica Offline activa · Enlace con Tierra: {mission.commDelay}.
                    </span>
                  </div>
                ) : (
                  <span>Enlace en tiempo real con Tierra ({mission.commDelay}).</span>
                )}
                <span className="font-mono text-[10px] tracking-wide text-on-surface-variant">
                  LOCAL-FIRST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
