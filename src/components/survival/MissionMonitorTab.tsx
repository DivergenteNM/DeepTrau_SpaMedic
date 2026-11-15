'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Droplets,
  Info,
  Radiation,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { MEDICAL_TOOLTIPS } from '@/data/medicalKnowledge';

export function MissionMonitorTab() {
  const {
    mission,
    astronaut,
    biomarkers,
    history,
    systemStatuses,
    setActiveTab,
  } = useMission();

  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';
  const radPct = Math.min(
    100,
    Math.round((biomarkers.cumulativeRadiationMsv / mission.missionLimitMsv) * 100)
  );
  const survivalMarginPct = Math.max(0, 100 - radPct);

  const chartW = 620;
  const chartH = 220;
  const padL = 46;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const maxRadY = Math.max(mission.missionLimitMsv + 25, biomarkers.cumulativeRadiationMsv + 15);
  const toX = (idx: number) =>
    padL + (history.length <= 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
  const toYRad = (val: number) =>
    padT + plotH - (Math.min(maxRadY, Math.max(0, val)) / maxRadY) * plotH;

  const radPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toYRad(pt.radiationMsv).toFixed(1)}`)
    .join(' ');
  const radArea = `${radPath} L ${toX(history.length - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${toX(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  const minGluc = 50;
  const maxGluc = 180;
  const toYGluc = (val: number) =>
    padT +
    plotH -
    ((Math.min(maxGluc, Math.max(minGluc, val)) - minGluc) / (maxGluc - minGluc)) * plotH;

  const glucosePath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toYGluc(pt.glucoseMgDl).toFixed(1)}`)
    .join(' ');

  const glucoseStatusText =
    biomarkers.glucoseMgDl < 65
      ? 'Hipoglucemia Crítica: Riesgo de síncope y fallo cognitivo en EVA/Rover.'
      : biomarkers.glucoseMgDl < 75
        ? 'Glucosa Baja (Precaución): Ingiere 15g de carbohidratos rápidos.'
        : biomarkers.glucoseMgDl >= 175
          ? 'Hiperglucemia Crítica: Hidratar y notificar a médico de vuelo.'
          : biomarkers.glucoseMgDl >= 135
            ? 'Glucosa Elevada: Posible resistencia insulínica por estrés o microgravedad.'
            : 'Glucemia Óptima: Metabolismo energético estable respecto a tu línea base.';

  return (
    <div className="space-y-6">
      {/* Section 1: Cumulative Radiation & Mission Survival */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-outline-variant pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-warning font-display">
              Dosimetría Operacional CSA & Límites NASA HRP
            </p>
            <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
              <Radiation className="h-5 w-5 text-warning" />
              Supervivencia de Misión y Radiación Acumulada (mSv)
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Seguimiento continuo de la dosis acumulada en {mission.name} frente al límite seguro
              de misión ({mission.missionLimitMsv} mSv).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-warning/30 bg-warning-container px-4 py-2 text-center">
              <span className="block text-[10px] font-medium text-on-warning-container">
                Dosis Acumulada
              </span>
              <span className="font-mono text-lg font-bold text-on-warning-container">
                {biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv
              </span>
            </div>
            <div className="rounded-xl border border-telemetry/25 bg-telemetry-container px-4 py-2 text-center">
              <span className="block text-[10px] font-medium text-on-telemetry-container">
                Tasa Actual
              </span>
              <span className="font-mono text-lg font-bold text-on-telemetry-container">
                {biomarkers.dailyRadiationMsv.toFixed(2)} mSv/d
              </span>
            </div>
            <div
              className={`rounded-xl border px-4 py-2 text-center ${
                survivalMarginPct <= 15
                  ? 'border-danger/35 bg-danger-container text-on-danger-container'
                  : survivalMarginPct <= 35
                    ? 'border-warning/35 bg-warning-container text-on-warning-container'
                    : 'border-primary/30 bg-primary-container text-on-primary-container'
              }`}
            >
              <span className="block text-[10px] font-medium">Margen de Supervivencia</span>
              <span className="font-mono text-lg font-bold">{survivalMarginPct}%</span>
            </div>
          </div>
        </div>

        {/* Radiation Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface font-semibold font-display">
              Consumo del Presupuesto Seguro de Radiación ({radPct}%)
            </span>
            <span className="text-on-surface-variant font-mono">
              Alerta: {mission.warningLimitMsv} mSv · Crítico: {mission.missionLimitMsv} mSv
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className={`h-full rounded-full dt-transition ${
                radPct >= 95
                  ? 'bg-danger'
                  : radPct >= 70
                    ? 'bg-warning'
                    : 'bg-primary'
              }`}
              style={{ width: `${radPct}%` }}
            />
          </div>
        </div>

        {/* Radiation Survival SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full min-w-[460px] h-56"
            role="img"
            aria-label="Gráfica de radiación acumulada en milisieverts"
          >
            <defs>
              <linearGradient id="radAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B54708" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#B54708" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <line
              x1={padL}
              y1={toYRad(mission.missionLimitMsv)}
              x2={chartW - padR}
              y2={toYRad(mission.missionLimitMsv)}
              stroke="#B42318"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={chartW - padR - 4}
              y={toYRad(mission.missionLimitMsv) - 5}
              textAnchor="end"
              fill="#B42318"
              fontSize="10"
              fontWeight="600"
            >
              Límite Crítico ({mission.missionLimitMsv} mSv)
            </text>

            <line
              x1={padL}
              y1={toYRad(mission.warningLimitMsv)}
              x2={chartW - padR}
              y2={toYRad(mission.warningLimitMsv)}
              stroke="#B54708"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {[0, Math.round(maxRadY * 0.33), Math.round(maxRadY * 0.66), Math.round(maxRadY)].map(
              (v) => {
                const y = toYRad(v);
                return (
                  <g key={v}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#E6E2D8" />
                    <text x={4} y={y + 4} fill="#55635B" fontSize="10">
                      {v}
                    </text>
                  </g>
                );
              }
            )}

            <path d={radArea} fill="url(#radAreaGrad)" />
            <path d={radPath} fill="none" stroke="#B54708" strokeWidth="2.5" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toYRad(pt.radiationMsv)} r="3.5" fill="#B54708" />
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

        {/* Shielding Protocol Info */}
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="rounded-xl border border-outline bg-surface-container-low p-3.5">
            <p className="font-bold text-primary flex items-center gap-1.5 font-display">
              <Info className="h-4 w-4" />
              ¿Por qué importa la radiación (mSv)?
            </p>
            <p className="mt-1 leading-relaxed text-on-surface-variant">
              {MEDICAL_TOOLTIPS.radiation.why}
            </p>
          </div>
          <div
            className={`rounded-xl border p-3.5 ${
              biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv ||
              biomarkers.dailyRadiationMsv >= 5
                ? 'border-danger/40 bg-danger-container text-on-danger-container'
                : 'border-outline bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <p className="font-bold text-on-surface flex items-center gap-1.5 font-display">
              <ShieldAlert className="h-4 w-4 text-warning" />
              Protocolo de Blindaje y Tormenta Solar
            </p>
            <p className="mt-1 leading-relaxed">
              {biomarkers.dailyRadiationMsv >= 2.8 ||
              biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv
                ? '¡ALERTA ACTIVA! Suspende caminatas EVA, trasládate al núcleo blindado con tanques de agua/polietileno y repite dosimetría cada 2 horas.'
                : MEDICAL_TOOLTIPS.radiation.how}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Blood Glucose (mg/dL) & Immune Defense Cross-Analysis */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <Droplets className="h-5 w-5 text-telemetry" />
                Panel Detallado de Glucosa en Sangre (mg/dL)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Comparado contra tu línea base pre-misión ({astronaut.clinicalHistory.baselineGlucose}{' '}
                mg/dL).
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 font-mono text-sm font-bold ${
                systemStatuses.metabolic === 'critical'
                  ? 'border-danger/40 bg-danger-container text-on-danger-container'
                  : systemStatuses.metabolic === 'warning'
                    ? 'border-warning/35 bg-warning-container text-on-warning-container'
                    : 'border-primary/30 bg-primary-container text-on-primary-container'
              }`}
            >
              {biomarkers.glucoseMgDl} mg/dL
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[440px] h-52"
              role="img"
              aria-label="Gráfica histórica de glucosa capilar"
            >
              {/* Safe Corridor 75 - 125 mg/dL */}
              <rect
                x={padL}
                y={toYGluc(125)}
                width={plotW}
                height={toYGluc(75) - toYGluc(125)}
                fill="rgba(47, 93, 70, 0.12)"
              />

              {[60, 90, 125, 160].map((v) => {
                const y = toYGluc(v);
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
                      {v}
                    </text>
                  </g>
                );
              })}

              <line
                x1={padL}
                y1={toYGluc(astronaut.clinicalHistory.baselineGlucose)}
                x2={chartW - padR}
                y2={toYGluc(astronaut.clinicalHistory.baselineGlucose)}
                stroke="#2F5D46"
                strokeDasharray="3 3"
              />

              <path d={glucosePath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />

              {history.map((pt, i) => (
                <g key={pt.day}>
                  <circle cx={toX(i)} cy={toYGluc(pt.glucoseMgDl)} r="3.5" fill="#2B5B6C" />
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

          <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 text-xs space-y-1.5">
            <p className="font-semibold text-on-surface font-display">{glucoseStatusText}</p>
            <p className="text-on-surface-variant">{MEDICAL_TOOLTIPS.glucose.why}</p>
          </div>
        </div>

        {/* Immune Defense & Clinical Cross-Reference */}
        <div className="lg:col-span-5 rounded-2xl border border-outline bg-surface-container p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                  <Activity className="h-5 w-5 text-danger" />
                  Inmunidad y Sangre
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Cruce de leucocitos con expediente médico ({astronaut.bloodType}).
                </p>
              </div>
              <span className="rounded-lg border border-danger/30 bg-danger-container px-2.5 py-1 font-bold text-xs text-on-danger-container font-mono">
                Sangre {astronaut.bloodType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-outline bg-surface-container-low p-3">
                <span className="text-on-surface-variant block">Leucocitos Actuales</span>
                <span className="mt-1 block font-mono text-lg font-bold text-on-surface">
                  {biomarkers.wbcCount.toLocaleString('es-ES')}
                </span>
                <span className="text-[10px] text-on-surface-variant">células/µL</span>
              </div>
              <div className="rounded-xl border border-outline bg-surface-container-low p-3">
                <span className="text-on-surface-variant block">Condición Pre-Misión</span>
                <span
                  className={`mt-1 block text-xs font-bold font-display ${
                    isLowImmune ? 'text-warning' : 'text-primary'
                  }`}
                >
                  {isLowImmune ? 'Defensas Bajas' : 'Inmunidad Normal'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {isLowImmune ? 'Umbral alerta: <4,500' : 'Umbral alerta: <4,100'}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                systemStatuses.immune === 'critical'
                  ? 'border-danger/40 bg-danger-container text-on-danger-container'
                  : systemStatuses.immune === 'warning'
                    ? 'border-warning/35 bg-warning-container text-on-warning-container'
                    : 'border-primary/30 bg-primary-container text-on-primary-container'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5 font-display">
                {systemStatuses.immune === 'nominal' ? (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                Diagnóstico Inmunitario Autónomo
              </p>
              <p className="leading-relaxed">
                {systemStatuses.immune === 'critical'
                  ? 'Alerta Crítica: Leucocitos deprimidos combinados con estrés radiativo o historial de defensas bajas. Inicia protocolo de aislamiento preventivo y envía paquete al cirujano de vuelo.'
                  : systemStatuses.immune === 'warning'
                    ? 'Precaución Inmune: Se observa descenso progresivo de glóbulos blancos. Refuerza descanso nocturno, suplementación y control de cabina.'
                    : 'Conteo inmunológico estable dentro del margen seguro para tu historial clínico.'}
              </p>
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 text-xs">
              <p className="font-semibold text-primary flex items-center gap-1.5 font-display">
                <Sparkles className="h-3.5 w-3.5" />
                ¿Por qué importa en el espacio?
              </p>
              <p className="mt-1 text-on-surface-variant leading-relaxed">
                {MEDICAL_TOOLTIPS.immune.why}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('sensors')}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary dt-transition hover:bg-primary-hover font-display"
          >
            Simular Nueva Muestra de Sangre / Dosimetría →
          </button>
        </div>
      </section>
    </div>
  );
}
