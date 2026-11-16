'use client';

import React from 'react';
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Circle,
  Cpu,
  Droplets,
  Flame,
  HeartPulse,
  Info,
  Radiation,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { InteractiveBodyMap } from './InteractiveBodyMap';

export function CommandDashboard() {
  const {
    mission,
    astronaut,
    biomarkers,
    routines,
    devices,
    streakDays,
    healthPoints,
    readinessScore,
    systemStatuses,
    globalTriage,
    activeCrisisScenario,
    crisisAlertBanner,
    toggleRoutineTask,
    setActiveTab,
    openSosOverlay,
    simulateLiveCrisis,
    restoreNominalVitals,
  } = useMission();

  const completedCount = routines.filter((r) => r.completed).length;
  const pendingCount = routines.length - completedCount;
  const disconnectedCount = devices.filter((d) => !d.connected).length;

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

      {/* Main Grid: Interactive Human Figure + Dynamic Daily Routines & Gamification */}
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

          {/* Dynamic Daily Routines & Pending Scans */}
          <div className="flex-1 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[18px] leading-[24px] font-bold text-on-surface font-display">
                  Rutinas del Día y Escaneos Pendientes
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Adaptadas a <span className="font-semibold text-primary">{mission.shortName}</span>{' '}
                  y a los {devices.length - disconnectedCount}/{devices.length} sensores conectados.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold font-mono ${
                  pendingCount === 0
                    ? 'bg-primary-container text-on-primary-container border-primary/30'
                    : 'bg-warning-container text-on-warning-container border-warning/30'
                }`}
              >
                {pendingCount === 0 ? '¡Completo!' : `${pendingCount} pend.`}
              </span>
            </div>

            {disconnectedCount > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-warning/35 bg-warning-container p-3 text-xs text-on-warning-container">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <span className="font-semibold">
                    {disconnectedCount} herramienta(s) desconectada(s):
                  </span>{' '}
                  DeepTrau adaptó automáticamente esos escaneos a protocolos clínicos manuales sin
                  hardware.
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {routines.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleRoutineTask(task.id)}
                  className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    task.completed
                      ? 'border-primary/30 bg-primary-container/55 hover:bg-primary-container/75'
                      : 'border-outline bg-surface-container-low hover:border-primary hover:bg-surface-container'
                  }`}
                >
                  <span className="mt-0.5 shrink-0 dt-transition group-hover:scale-110">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-on-surface-variant" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold font-display ${
                          task.completed
                            ? 'line-through text-on-surface-variant'
                            : 'text-on-surface'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {task.usesManualFallback && (
                          <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 text-[10px] font-semibold text-on-warning-container">
                            Modo Manual
                          </span>
                        )}
                        <span className="rounded-md border border-outline bg-surface-container px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                          +{task.points} pts
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-on-surface-variant">{task.reason}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
                {astronaut.clinicalHistory.immuneStatus !== 'Normal'
                  ? 'EHR: Alerta inmune temprana activa'
                  : 'EHR: Parámetros base sincronizados'}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('sensors')}
                className="group inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary dt-transition hover:-translate-y-px hover:bg-primary-container/60 hover:text-primary-hover active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                <Cpu className="h-3.5 w-3.5 dt-transition group-hover:rotate-12" />
                Gestionar sensores
              </button>
            </div>
          </div>
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
        <div className="flex flex-wrap gap-1.5 text-[11px] shrink-0">
          {astronaut.clinicalHistory.priorSurgeries.map((surg, i) => (
            <span
              key={i}
              className="rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 font-medium text-on-surface-variant"
            >
              {surg}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
