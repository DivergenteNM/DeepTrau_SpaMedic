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

  // Radiation SVG chart dimensions
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

  // Glucose SVG chart dimensions
  const minGluc = 50;
  const maxGluc = 180;
  const toYGluc = (val: number) =>
    padT + plotH - ((Math.min(maxGluc, Math.max(minGluc, val)) - minGluc) / (maxGluc - minGluc)) * plotH;

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
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Dosimetría Operacional CSA & Límites NASA HRP
            </p>
            <h2 className="mt-1 text-xl font-bold text-white flex items-center gap-2">
              <Radiation className="h-5 w-5 text-amber-400" />
              Supervivencia de Misión y Radiación Acumulada (mSv)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Seguimiento continuo de la dosis acumulada en {mission.name} frente al límite seguro
              de misión ({mission.missionLimitMsv} mSv).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
              <span className="block text-[10px] text-slate-400">Dosis Acumulada</span>
              <span className="font-mono text-lg font-bold text-amber-300">
                {biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
              <span className="block text-[10px] text-slate-400">Tasa Actual</span>
              <span className="font-mono text-lg font-bold text-cyan-300">
                {biomarkers.dailyRadiationMsv.toFixed(2)} mSv/d
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
              <span className="block text-[10px] text-slate-400">Margen de Supervivencia</span>
              <span
                className={`font-mono text-lg font-bold ${
                  survivalMarginPct <= 15
                    ? 'text-rose-400'
                    : survivalMarginPct <= 35
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {survivalMarginPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Radiation Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Consumo del Presupuesto Seguro de Radiación ({radPct}%)
            </span>
            <span className="text-slate-400">
              Alerta: {mission.warningLimitMsv} mSv · Crítico: {mission.missionLimitMsv} mSv
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                radPct >= 95
                  ? 'bg-rose-500'
                  : radPct >= 70
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
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
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Critical & Warning threshold lines */}
            <line
              x1={padL}
              y1={toYRad(mission.missionLimitMsv)}
              x2={chartW - padR}
              y2={toYRad(mission.missionLimitMsv)}
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={chartW - padR - 4}
              y={toYRad(mission.missionLimitMsv) - 5}
              textAnchor="end"
              fill="#fb7185"
              fontSize="10"
            >
              Límite Crítico ({mission.missionLimitMsv} mSv)
            </text>

            <line
              x1={padL}
              y1={toYRad(mission.warningLimitMsv)}
              x2={chartW - padR}
              y2={toYRad(mission.warningLimitMsv)}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {[0, Math.round(maxRadY * 0.33), Math.round(maxRadY * 0.66), Math.round(maxRadY)].map(
              (v) => {
                const y = toYRad(v);
                return (
                  <g key={v}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#1e293b" />
                    <text x={4} y={y + 4} fill="#64748b" fontSize="10">
                      {v}
                    </text>
                  </g>
                );
              }
            )}

            <path d={radArea} fill="url(#radAreaGrad)" />
            <path d={radPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toYRad(pt.radiationMsv)} r="3.5" fill="#fbbf24" />
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

        {/* Shielding Protocol Info */}
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5">
            <p className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              ¿Por qué importa la radiación (mSv)?
            </p>
            <p className="mt-1 leading-relaxed text-slate-300">{MEDICAL_TOOLTIPS.radiation.why}</p>
          </div>
          <div
            className={`rounded-xl border p-3.5 ${
              biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv ||
              biomarkers.dailyRadiationMsv >= 5
                ? 'border-rose-500/40 bg-rose-500/15'
                : 'border-slate-800 bg-slate-950/75'
            }`}
          >
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Protocolo de Blindaje y Tormenta Solar
            </p>
            <p className="mt-1 leading-relaxed text-slate-300">
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
        {/* Blood Glucose Panel */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-400" />
                Panel Detallado de Glucosa en Sangre (mg/dL)
              </h3>
              <p className="text-xs text-slate-400">
                Comparado contra tu línea base pre-misión ({astronaut.clinicalHistory.baselineGlucose}{' '}
                mg/dL).
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 font-mono text-sm font-bold ${
                systemStatuses.metabolic === 'critical'
                  ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
                  : systemStatuses.metabolic === 'warning'
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
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
                fill="rgba(16, 185, 129, 0.1)"
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
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                    <text x={4} y={y + 4} fill="#64748b" fontSize="10">
                      {v}
                    </text>
                  </g>
                );
              })}

              {/* Baseline line */}
              <line
                x1={padL}
                y1={toYGluc(astronaut.clinicalHistory.baselineGlucose)}
                x2={chartW - padR}
                y2={toYGluc(astronaut.clinicalHistory.baselineGlucose)}
                stroke="#38bdf8"
                strokeDasharray="3 3"
              />

              <path d={glucosePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

              {history.map((pt, i) => (
                <g key={pt.day}>
                  <circle cx={toX(i)} cy={toYGluc(pt.glucoseMgDl)} r="3.5" fill="#22d3ee" />
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

          <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 text-xs space-y-1.5">
            <p className="font-semibold text-white">{glucoseStatusText}</p>
            <p className="text-slate-400">{MEDICAL_TOOLTIPS.glucose.why}</p>
          </div>
        </div>

        {/* Immune Defense & Clinical Cross-Reference */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-400" />
                  Inmunidad y Sangre
                </h3>
                <p className="text-xs text-slate-400">
                  Cruce de leucocitos con expediente médico ({astronaut.bloodType}).
                </p>
              </div>
              <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-bold text-xs text-rose-300">
                Sangre {astronaut.bloodType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-slate-400 block">Leucocitos Actuales</span>
                <span className="mt-1 block font-mono text-lg font-bold text-white">
                  {biomarkers.wbcCount.toLocaleString('es-ES')}
                </span>
                <span className="text-[10px] text-slate-500">células/µL</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-slate-400 block">Condición Pre-Misión</span>
                <span
                  className={`mt-1 block text-xs font-bold ${
                    isLowImmune ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {isLowImmune ? 'Defensas Bajas' : 'Inmunidad Normal'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isLowImmune ? 'Umbral alerta: <4,500' : 'Umbral alerta: <4,100'}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                systemStatuses.immune === 'critical'
                  ? 'border-rose-500/45 bg-rose-500/15'
                  : systemStatuses.immune === 'warning'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-emerald-500/30 bg-emerald-500/10'
              }`}
            >
              <p className="font-bold text-white flex items-center gap-1.5">
                {systemStatuses.immune === 'nominal' ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                Diagnóstico Inmunitario Autónomo
              </p>
              <p className="leading-relaxed text-slate-200">
                {systemStatuses.immune === 'critical'
                  ? 'Alerta Crítica: Leucocitos deprimidos combinados con estrés radiativo o historial de defensas bajas. Inicia protocolo de aislamiento preventivo y envía paquete al cirujano de vuelo.'
                  : systemStatuses.immune === 'warning'
                    ? 'Precaución Inmune: Se observa descenso progresivo de glóbulos blancos. Refuerza descanso nocturno, suplementación y control de cabina.'
                    : 'Conteo inmunológico estable dentro del margen seguro para tu historial clínico.'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 text-xs">
              <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                ¿Por qué importa en el espacio?
              </p>
              <p className="mt-1 text-slate-400 leading-relaxed">{MEDICAL_TOOLTIPS.immune.why}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('sensors')}
            className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/25"
          >
            Simular Nueva Muestra de Sangre / Dosimetría →
          </button>
        </div>
      </section>
    </div>
  );
}
