'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Cpu,
  Droplets,
  Flame,
  HeartPulse,
  Info,
  Radiation,
  ShieldAlert,
  Sparkles,
  Trophy,
  Wrench,
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
    toggleRoutineTask,
    setActiveTab,
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
      icon: <Droplets className="h-4 w-4 text-cyan-400" />,
      tab: 'survival' as const,
    },
    {
      label: 'Radiación Acumulada',
      value: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
      sub: `Límite misión: ${mission.missionLimitMsv} mSv`,
      why: 'Controla la exposición ionizante acumulada (dosimetría CSA).',
      status: systemStatuses.immune,
      icon: <Radiation className="h-4 w-4 text-amber-400" />,
      tab: 'survival' as const,
    },
    {
      label: 'Oxígeno y Pulso',
      value: `${biomarkers.spo2Percent}% SpO₂`,
      sub: `${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · ${biomarkers.heartRateBpm} bpm`,
      why: 'Supervisa aire de cabina y respuesta cardiovascular en misión.',
      status: systemStatuses.cardiovascular,
      icon: <HeartPulse className="h-4 w-4 text-emerald-400" />,
      tab: 'sensors' as const,
    },
    {
      label: 'Conservación Ósea',
      value: `${biomarkers.boneDensityRetentionPercent}%`,
      sub: `Músculo: ${biomarkers.muscleMassRetentionPercent}% · ${mission.gravityLabel}`,
      why: 'Previene descalcificación por baja o nula gravedad.',
      status: systemStatuses.musculoskeletal,
      icon: <Sparkles className="h-4 w-4 text-sky-400" />,
      tab: 'musculoskeletal' as const,
    },
  ];

  const statusBorder = (s: 'nominal' | 'warning' | 'critical') =>
    s === 'critical'
      ? 'border-rose-500/50 bg-rose-950/20'
      : s === 'warning'
        ? 'border-amber-500/40 bg-amber-950/15'
        : 'border-slate-800 bg-slate-900/70';

  return (
    <div className="space-y-6">
      {/* Top KPI Strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(card.tab)}
            className={`group text-left rounded-2xl border p-4 transition hover:border-cyan-400/50 ${statusBorder(
              card.status
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              {card.icon}
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-snug text-slate-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
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
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Motivación y Adherencia Médica
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-white">
                  Racha de Misión y Estado Operativo
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15">
                <Flame className="h-6 w-6 text-amber-400" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400 block">Racha Activa</span>
                <span className="mt-1 block text-lg font-bold text-amber-300">
                  {streakDays} días
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400 block">Puntos Salud</span>
                <span className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-cyan-300">
                  <Trophy className="h-4 w-4" />
                  {healthPoints}
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400 block">Aptitud Hoy</span>
                <span className="mt-1 block text-lg font-bold text-emerald-300">
                  {readinessScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Daily Routines & Pending Scans */}
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Rutinas del Día y Escaneos Pendientes
                </h2>
                <p className="text-xs text-slate-400">
                  Adaptadas a <span className="text-cyan-300">{mission.shortName}</span> y a los{' '}
                  {devices.length - disconnectedCount}/{devices.length} sensores conectados.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  pendingCount === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {pendingCount === 0 ? '¡Todo Completo!' : `${pendingCount} pendientes`}
              </span>
            </div>

            {disconnectedCount > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <span className="font-semibold">
                    {disconnectedCount} herramienta(s) desconectada(s):
                  </span>{' '}
                  el sistema adaptó automáticamente esos escaneos a protocolos clínicos manuales sin
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
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    task.completed
                      ? 'border-emerald-500/30 bg-emerald-950/20 opacity-85'
                      : 'border-slate-800 bg-slate-950/75 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {task.usesManualFallback && (
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                            Modo Manual
                          </span>
                        )}
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                          +{task.points} pts
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{task.reason}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlertCircle className="h-3.5 w-3.5 text-cyan-400" />
                {astronaut.clinicalHistory.immuneStatus !== 'Normal'
                  ? 'EHR: Alerta inmune temprana activa'
                  : 'EHR: Parámetros base sincronizados'}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('sensors')}
                className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200"
              >
                <Cpu className="h-3.5 w-3.5" />
                Gestionar sensores
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EHR Clinical Context Banner */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div className="text-xs">
            <p className="font-semibold text-white">
              Expediente Clínico Pre-Misión Activo: {astronaut.name} ({astronaut.bloodType})
            </p>
            <p className="mt-0.5 text-slate-400">
              {astronaut.clinicalHistory.notes}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] shrink-0">
          {astronaut.clinicalHistory.priorSurgeries.map((surg, i) => (
            <span
              key={i}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300"
            >
              {surg}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
