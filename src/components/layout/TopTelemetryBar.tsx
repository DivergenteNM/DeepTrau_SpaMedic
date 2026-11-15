'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Droplets,
  Gauge,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
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
    icon: <ShieldCheck className="h-4 w-4 text-primary" />,
  },
  warning: {
    label: 'PRECAUCIÓN ACTIVA',
    classes: 'border-warning/35 bg-warning-container text-on-warning-container',
    icon: <AlertTriangle className="h-4 w-4 text-warning" />,
  },
  critical: {
    label: 'ALERTA CRÍTICA',
    classes: 'border-danger/45 bg-danger-container text-on-danger-container animate-pulse',
    icon: <ShieldAlert className="h-4 w-4 text-danger" />,
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
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        {/* Left: Mission & Astronaut Clinical Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-on-surface font-display">
              {mission.shortName}
            </span>
            <span className="text-xs text-outline">|</span>
            <span className="font-mono text-xs font-semibold text-primary">
              DÍA {missionDay}/{mission.durationDays}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{mission.gravityLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
            <Radio className="h-3.5 w-3.5 text-telemetry" />
            <span>Retraso Tierra: {mission.commDelay}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-outline bg-surface-container px-3 py-1.5 text-xs">
            <span className="font-semibold text-on-surface font-display">{astronaut.name}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-danger/30 bg-danger-container px-1.5 py-0.5 font-bold text-on-danger-container font-mono">
              <Droplets className="h-3 w-3 text-danger" />
              {astronaut.bloodType}
            </span>
            {hasLowImmune && (
              <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 font-semibold text-on-warning-container">
                Defensas Bajas
              </span>
            )}
          </div>
        </div>

        {/* Right: Global Triage + Quick Pitch Simulator + Switch Mission */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold font-display ${badge.classes}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          {/* Demo Pitch Scenarios */}
          <div className="flex items-center gap-1 rounded-xl border border-outline bg-surface-container-low p-1">
            <span className="hidden items-center gap-1 px-2 text-[11px] font-semibold text-on-surface-variant xl:inline-flex">
              <Sparkles className="h-3 w-3 text-primary" />
              Simular:
            </span>
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => triggerDemoAnomaly(sc.id)}
                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold dt-transition ${sc.style}`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            title="Reiniciar métricas de demostración"
            className="inline-flex items-center gap-1 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:bg-surface-container-high hover:text-on-surface"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={reopenOnboarding}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary dt-transition hover:bg-primary-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Cambiar Misión / Astronauta
          </button>
        </div>
      </div>

      {/* Subtle Asynchronous Comm Notice when delay >= 1 min */}
      {mission.commDelayMinutes >= 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-4 py-1.5 text-[11px] text-on-surface-variant lg:px-6">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-warning" />
            <span>
              Modo de Autonomía Médica Activo: las alertas y contramedidas funcionan offline aunque el
              enlace con Tierra tarde {mission.commDelay}.
            </span>
          </div>
          <span className="hidden font-mono text-on-surface-variant sm:inline">
            DEEPTRAU TELEMETRY OS · LOCAL-FIRST
          </span>
        </div>
      )}
    </header>
  );
}
