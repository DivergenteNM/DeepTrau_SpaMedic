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
    classes: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
  },
  warning: {
    label: 'PRECAUCIÓN ACTIVA',
    classes: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  },
  critical: {
    label: 'ALERTA CRÍTICA',
    classes: 'border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse',
    icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
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
      style: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15',
    },
    {
      id: 'solar_storm',
      label: 'Tormenta Solar',
      style: 'border-rose-500/30 text-rose-300 hover:bg-rose-500/15',
    },
    {
      id: 'hypoglycemia_immune',
      label: 'Glucosa + Defensas',
      style: 'border-amber-500/30 text-amber-300 hover:bg-amber-500/15',
    },
    {
      id: 'isolation_fatigue',
      label: 'Fatiga Mental',
      style: 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        {/* Left: Mission & Astronaut Clinical Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-bold text-white">{mission.shortName}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="font-mono text-xs font-semibold text-cyan-300">
              DÍA {missionDay}/{mission.durationDays}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
            <span>{mission.gravityLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
            <Radio className="h-3.5 w-3.5 text-sky-400" />
            <span>Retraso Tierra: {mission.commDelay}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
            <span className="font-semibold text-white">{astronaut.name}</span>
            <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300 border border-rose-500/30">
              <Droplets className="h-3 w-3" />
              {astronaut.bloodType}
            </span>
            {hasLowImmune && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-300 border border-amber-500/30">
                Defensas Bajas
              </span>
            )}
          </div>
        </div>

        {/* Right: Global Triage + Quick Pitch Simulator + Switch Mission */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${badge.classes}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          {/* Demo Pitch Scenarios */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <span className="hidden items-center gap-1 px-2 text-[11px] font-medium text-slate-400 xl:inline-flex">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Simular:
            </span>
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => triggerDemoAnomaly(sc.id)}
                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${sc.style}`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            title="Reiniciar métricas de demostración"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={reopenOnboarding}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Cambiar Misión / Astronauta
          </button>
        </div>
      </div>

      {/* Subtle Asynchronous Comm Notice when delay > 1 min */}
      {mission.commDelayMinutes >= 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-900/50 px-4 py-1 text-[11px] text-slate-400 lg:px-6">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>
              Modo de Autonomía Médica Activo: las alertas y contramedidas funcionan offline aunque el
              enlace con Tierra tarde {mission.commDelay}.
            </span>
          </div>
          <span className="hidden font-mono text-slate-500 sm:inline">
            ASTROHEALTH TELEMETRY OS · LOCAL-FIRST
          </span>
        </div>
      )}
    </header>
  );
}
