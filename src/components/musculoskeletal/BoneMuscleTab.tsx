'use client';

import React from 'react';
import {
  AlertTriangle,
  Bone,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Info,
  Pill,
  ShieldCheck,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { MEDICAL_TOOLTIPS } from '@/data/medicalKnowledge';

export function BoneMuscleTab() {
  const {
    mission,
    astronaut,
    biomarkers,
    history,
    exercises,
    supplementsChecked,
    toggleExerciseTask,
    toggleSupplement,
  } = useMission();

  const adaptedCount = exercises.filter((e) => e.isAdaptedForSurgery).length;
  const completedCount = exercises.filter((e) => e.completed).length;

  // Native SVG Bone & Muscle Retention Chart
  const chartW = 620;
  const chartH = 220;
  const padL = 42;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const minVal = 90;
  const maxVal = 100;
  const toX = (idx: number) =>
    padL + (history.length <= 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
  const toY = (val: number) =>
    padT + plotH - ((Math.min(maxVal, Math.max(minVal, val)) - minVal) / (maxVal - minVal)) * plotH;

  const bonePath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.boneRetention).toFixed(1)}`)
    .join(' ');
  const musclePath = history
    .map(
      (pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.muscleRetention).toFixed(1)}`
    )
    .join(' ');
  // Projected unmitigated space loss (-1.5% / 30 days)
  const unmitigatedPath = history
    .map((pt, i) => {
      const projected = Math.max(minVal, 100 - (pt.day / 30) * 1.5);
      return `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(projected).toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header + Surgical Adaptation Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Contramedida Gravitatoria · {mission.gravityLabel}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-cyan-400" />
              Densidad Ósea, Masa Muscular y Plan de Ejercicio
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Rutinas diarias y semanales adaptadas a la gravedad de{' '}
              <span className="text-slate-200 font-semibold">{mission.name}</span> y al historial
              quirúrgico de <span className="text-cyan-300">{astronaut.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">Retención Ósea (BMD)</span>
              <span className="font-mono text-lg font-bold text-emerald-300">
                {biomarkers.boneDensityRetentionPercent}%
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-center">
              <span className="block text-[10px] text-slate-400">Masa Muscular</span>
              <span className="font-mono text-lg font-bold text-cyan-300">
                {biomarkers.muscleMassRetentionPercent}%
              </span>
            </div>
          </div>
        </div>

        {adaptedCount > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-bold text-amber-200">
                Adaptación Automática por Cirugías Previas Activa ({adaptedCount} ejercicios
                ajustados)
              </p>
              <p className="mt-0.5 text-amber-100/80">
                Debido al antecedente registrado (
                {astronaut.clinicalHistory.priorSurgeries.join(', ')}), AstroHealth reemplazó las
                cargas de alto impacto articular por alternativas seguras sin perder estímulo óseo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Sin restricciones quirúrgicas para la gravedad actual ({mission.gravityLabel}). Protocolo
            completo habilitado.
          </div>
        )}
      </div>

      {/* Main Content: Exercise Checklist + Nutrition Supplements */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily & Weekly Exercise Planner */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Rutina de Ejercicio Diaria y Semanal
              </h3>
              <p className="text-xs text-slate-400">
                Completa tus bloques para sumar +0.2% de conservación proyectada y +30 pts.
              </p>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              {completedCount}/{exercises.length} completados
            </span>
          </div>

          <div className="space-y-3">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleExerciseTask(ex.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  ex.completed
                    ? 'border-emerald-500/35 bg-emerald-950/20'
                    : ex.isAdaptedForSurgery
                      ? 'border-amber-500/35 bg-slate-950/85 hover:border-amber-400'
                      : 'border-slate-800 bg-slate-950/75 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    {ex.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-sm font-bold ${
                          ex.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {ex.isAdaptedForSurgery ? ex.alternativeName : ex.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                          {ex.frequency}
                        </span>
                        <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300">
                          {ex.durationMin} min
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Equipo: <span className="text-slate-200">{ex.machine}</span> · Objetivo:{' '}
                      {ex.targetSystem}
                    </p>

                    {ex.isAdaptedForSurgery && (
                      <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-200">
                        <span className="font-bold">
                          Adaptado por {ex.matchedSurgery}:
                        </span>{' '}
                        {ex.alternativeDescription} (Reemplaza a: <em>{ex.name}</em>)
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bone Nutrition, Supplements & Medical Explanation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-400" />
              Suplementación Ósea e Hidratación
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  key: 'vitaminD' as const,
                  title: 'Vitamina D3 (800 – 1,000 UI/día)',
                  desc: 'Esencial sin luz solar directa para absorber calcio en cabina.',
                  icon: <Bone className="h-4 w-4 text-amber-300" />,
                },
                {
                  key: 'calcium' as const,
                  title: 'Calcio Biodisponible (1,000 mg)',
                  desc: 'Compensa la reabsorción ósea inducida por microgravedad.',
                  icon: <Pill className="h-4 w-4 text-cyan-300" />,
                },
                {
                  key: 'hydration' as const,
                  title: 'Hidratación Post-Ejercicio (600 ml + Electrolitos)',
                  desc: 'Previene cálculos renales por liberación de calcio óseo a la sangre.',
                  icon: <Droplets className="h-4 w-4 text-sky-300" />,
                },
              ].map((sup) => {
                const checked = supplementsChecked[sup.key];
                return (
                  <button
                    key={sup.key}
                    type="button"
                    onClick={() => toggleSupplement(sup.key)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                      checked
                        ? 'border-emerald-500/35 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/75 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        checked ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-xs font-semibold flex items-center gap-1.5 ${
                          checked ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {sup.icon}
                        {sup.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{sup.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-2.5 text-xs">
            <p className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              ¿Por qué importa en esta misión?
            </p>
            <p className="leading-relaxed text-slate-300">{MEDICAL_TOOLTIPS.boneMuscle.why}</p>
            <p className="pt-1 font-semibold text-emerald-300">Qué hacer ahora:</p>
            <p className="leading-relaxed text-slate-300">{MEDICAL_TOOLTIPS.boneMuscle.how}</p>
          </div>
        </div>
      </div>

      {/* Bone & Muscle Retention SVG Chart */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">
              Curva de Conservación Ósea y Muscular vs. Deterioro sin Ejercicio
            </h3>
            <p className="text-xs text-slate-400">
              Porcentaje retenido respecto al Día 1 previo al despegue (línea punteada roja = pérdida
              estimada de -1.5%/mes sin contramedidas NASA).
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Densidad Ósea (BMD %)
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-300">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Masa Muscular (%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-300">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Sin Ejercicio (Riesgo)
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full min-w-[460px] h-56"
            role="img"
            aria-label="Gráfica de conservación de densidad ósea y masa muscular"
          >
            {[90, 92.5, 95, 97.5, 100].map((v) => {
              const y = toY(v);
              return (
                <g key={v}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text x={4} y={y + 4} fill="#64748b" fontSize="10">
                    {v}%
                  </text>
                </g>
              );
            })}

            <path
              d={unmitigatedPath}
              fill="none"
              stroke="#fb7185"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <path d={bonePath} fill="none" stroke="#34d399" strokeWidth="2.5" />
            <path d={musclePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toY(pt.boneRetention)} r="3.5" fill="#34d399" />
                <circle cx={toX(i)} cy={toY(pt.muscleRetention)} r="3.5" fill="#22d3ee" />
                <text
                  x={toX(i)}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  D{pt.day}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>
    </div>
  );
}
