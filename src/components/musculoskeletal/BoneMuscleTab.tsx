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
  const unmitigatedPath = history
    .map((pt, i) => {
      const projected = Math.max(minVal, 100 - (pt.day / 30) * 1.5);
      return `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(projected).toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header + Surgical Adaptation Banner */}
      <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
              Contramedida Gravitatoria · {mission.gravityLabel}
            </p>
            <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
              <Dumbbell className="h-5 w-5 text-primary" />
              Densidad Ósea, Masa Muscular y Plan de Ejercicio
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Rutinas diarias y semanales adaptadas a la gravedad de{' '}
              <span className="text-on-surface font-semibold">{mission.name}</span> y al historial
              quirúrgico de <span className="font-semibold text-primary">{astronaut.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-primary/25 bg-primary-container px-4 py-2.5 text-center">
              <span className="block text-[10px] font-medium text-on-primary-container">
                Retención Ósea (BMD)
              </span>
              <span className="font-mono text-lg font-bold text-on-primary-container">
                {biomarkers.boneDensityRetentionPercent}%
              </span>
            </div>
            <div className="rounded-xl border border-telemetry/25 bg-telemetry-container px-4 py-2.5 text-center">
              <span className="block text-[10px] font-medium text-on-telemetry-container">
                Masa Muscular
              </span>
              <span className="font-mono text-lg font-bold text-on-telemetry-container">
                {biomarkers.muscleMassRetentionPercent}%
              </span>
            </div>
          </div>
        </div>

        {adaptedCount > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-warning/35 bg-warning-container p-3.5 text-xs text-on-warning-container">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-bold font-display">
                Adaptación Automática por Cirugías Previas Activa ({adaptedCount} ejercicios
                ajustados)
              </p>
              <p className="mt-0.5">
                Debido al antecedente registrado (
                {astronaut.clinicalHistory.priorSurgeries.join(', ')}), DeepTrau reemplazó las
                cargas de alto impacto articular por alternativas seguras sin perder estímulo óseo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-container p-3 text-xs font-medium text-on-primary-container">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Sin restricciones quirúrgicas para la gravedad actual ({mission.gravityLabel}). Protocolo
            completo habilitado.
          </div>
        )}
      </div>

      {/* Main Content: Exercise Checklist + Nutrition Supplements */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily & Weekly Exercise Planner */}
        <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-on-surface font-display">
                Rutina de Ejercicio Diaria y Semanal
              </h3>
              <p className="text-xs text-on-surface-variant">
                Completa tus bloques para sumar +0.2% de conservación proyectada y +30 pts.
              </p>
            </div>
            <span className="rounded-full border border-primary/25 bg-primary-container px-2.5 py-1 text-xs font-semibold text-on-primary-container font-mono">
              {completedCount}/{exercises.length} completados
            </span>
          </div>

          <div className="space-y-3">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleExerciseTask(ex.id)}
                className={`w-full rounded-xl border p-4 text-left dt-transition ${
                  ex.completed
                    ? 'border-primary/30 bg-primary-container/55'
                    : ex.isAdaptedForSurgery
                      ? 'border-warning/40 bg-surface-container-low hover:border-warning'
                      : 'border-outline bg-surface-container-low hover:border-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    {ex.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-on-surface-variant" />
                    )}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-sm font-bold font-display ${
                          ex.completed
                            ? 'line-through text-on-surface-variant'
                            : 'text-on-surface'
                        }`}
                      >
                        {ex.isAdaptedForSurgery ? ex.alternativeName : ex.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold font-mono">
                        <span className="rounded-md border border-outline bg-surface-container px-2 py-0.5 text-on-surface-variant">
                          {ex.frequency}
                        </span>
                        <span className="rounded-md border border-primary/25 bg-primary-container px-2 py-0.5 text-on-primary-container">
                          {ex.durationMin} min
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant">
                      Equipo: <span className="font-semibold text-on-surface">{ex.machine}</span> ·
                      Objetivo: {ex.targetSystem}
                    </p>

                    {ex.isAdaptedForSurgery && (
                      <div className="mt-2 rounded-lg border border-warning/30 bg-warning-container p-2.5 text-[11px] text-on-warning-container">
                        <span className="font-bold">Adaptado por {ex.matchedSurgery}:</span>{' '}
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
          <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Pill className="h-5 w-5 text-primary" />
              Suplementación Ósea e Hidratación
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  key: 'vitaminD' as const,
                  title: 'Vitamina D3 (800 – 1,000 UI/día)',
                  desc: 'Esencial sin luz solar directa para absorber calcio en cabina.',
                  icon: <Bone className="h-4 w-4 text-warning" />,
                },
                {
                  key: 'calcium' as const,
                  title: 'Calcio Biodisponible (1,000 mg)',
                  desc: 'Compensa la reabsorción ósea inducida por microgravedad.',
                  icon: <Pill className="h-4 w-4 text-primary" />,
                },
                {
                  key: 'hydration' as const,
                  title: 'Hidratación Post-Ejercicio (600 ml + Electrolitos)',
                  desc: 'Previene cálculos renales por liberación de calcio óseo a la sangre.',
                  icon: <Droplets className="h-4 w-4 text-telemetry" />,
                },
              ].map((sup) => {
                const checked = supplementsChecked[sup.key];
                return (
                  <button
                    key={sup.key}
                    type="button"
                    onClick={() => toggleSupplement(sup.key)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left dt-transition ${
                      checked
                        ? 'border-primary/30 bg-primary-container/55'
                        : 'border-outline bg-surface-container-low hover:border-primary'
                    }`}
                  >
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        checked ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-xs font-semibold flex items-center gap-1.5 font-display ${
                          checked
                            ? 'line-through text-on-surface-variant'
                            : 'text-on-surface'
                        }`}
                      >
                        {sup.icon}
                        {sup.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant">{sup.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-2.5 text-xs">
            <p className="font-bold text-primary flex items-center gap-1.5 font-display">
              <Info className="h-4 w-4" />
              ¿Por qué importa en esta misión?
            </p>
            <p className="leading-relaxed text-on-surface-variant">
              {MEDICAL_TOOLTIPS.boneMuscle.why}
            </p>
            <p className="pt-1 font-semibold text-on-surface font-display">Qué hacer ahora:</p>
            <p className="leading-relaxed text-on-surface-variant">
              {MEDICAL_TOOLTIPS.boneMuscle.how}
            </p>
          </div>
        </div>
      </div>

      {/* Bone & Muscle Retention SVG Chart */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-on-surface font-display">
              Curva de Conservación Ósea y Muscular vs. Deterioro sin Ejercicio
            </h3>
            <p className="text-xs text-on-surface-variant">
              Porcentaje retenido respecto al Día 1 previo al despegue (línea punteada roja = pérdida
              estimada de -1.5%/mes sin contramedidas NASA).
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Densidad Ósea (BMD %)
            </span>
            <span className="inline-flex items-center gap-1.5 text-telemetry">
              <span className="h-2.5 w-2.5 rounded-full bg-telemetry" /> Masa Muscular (%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-danger">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Sin Ejercicio (Riesgo)
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
                    stroke="#E6E2D8"
                    strokeDasharray="4 4"
                  />
                  <text x={4} y={y + 4} fill="#55635B" fontSize="10">
                    {v}%
                  </text>
                </g>
              );
            })}

            <path
              d={unmitigatedPath}
              fill="none"
              stroke="#B42318"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <path d={bonePath} fill="none" stroke="#2F5D46" strokeWidth="2.5" />
            <path d={musclePath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toY(pt.boneRetention)} r="3.5" fill="#2F5D46" />
                <circle cx={toX(i)} cy={toY(pt.muscleRetention)} r="3.5" fill="#2B5B6C" />
                <text
                  x={toX(i)}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="#55635B"
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
