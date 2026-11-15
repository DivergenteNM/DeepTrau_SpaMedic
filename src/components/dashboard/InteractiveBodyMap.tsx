'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bone,
  Brain,
  Droplets,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { BODY_SYSTEM_GUIDES, BodySystemId, TriageLevel } from '@/data/medicalKnowledge';

const STATUS_STYLE: Record<
  TriageLevel,
  {
    fill: string;
    stroke: string;
    glow: string;
    badge: string;
    label: string;
  }
> = {
  nominal: {
    fill: 'rgba(16, 185, 129, 0.28)',
    stroke: '#34d399',
    glow: 'drop-shadow(0 0 10px rgba(52,211,153,0.45))',
    badge: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    label: 'Verde · Óptimo',
  },
  warning: {
    fill: 'rgba(245, 158, 11, 0.34)',
    stroke: '#fbbf24',
    glow: 'drop-shadow(0 0 12px rgba(251,191,36,0.55))',
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    label: 'Amarillo · Precaución',
  },
  critical: {
    fill: 'rgba(244, 63, 94, 0.42)',
    stroke: '#fb7185',
    glow: 'drop-shadow(0 0 14px rgba(251,113,133,0.75))',
    badge: 'border-rose-500/50 bg-rose-500/20 text-rose-300',
    label: 'Rojo · Atención Inmediata',
  },
};

const SYSTEM_ICONS: Record<BodySystemId, React.ReactNode> = {
  brain: <Brain className="h-4 w-4" />,
  cardiovascular: <HeartPulse className="h-4 w-4" />,
  immune: <Droplets className="h-4 w-4" />,
  metabolic: <Activity className="h-4 w-4" />,
  musculoskeletal: <Bone className="h-4 w-4" />,
};

export function InteractiveBodyMap() {
  const { systemStatuses, biomarkers, astronaut, mission, setActiveTab } = useMission();
  const [selectedSystem, setSelectedSystem] = useState<BodySystemId>('brain');

  const activeGuide = BODY_SYSTEM_GUIDES[selectedSystem];
  const activeStatus = systemStatuses[selectedSystem];
  const activeStyle = STATUS_STYLE[activeStatus];

  const getMetricSummary = (sys: BodySystemId) => {
    switch (sys) {
      case 'brain':
        return [
          { label: 'Ánimo actual', value: `${biomarkers.moodScore}/10` },
          { label: 'Sueño nocturno', value: `${biomarkers.sleepHours} h` },
          { label: 'Estrés percibido', value: `${biomarkers.stressLevel}/10` },
          { label: 'Ultrasonido SANS', value: biomarkers.ultrasoundStatus },
        ];
      case 'cardiovascular':
        return [
          { label: 'Oxígeno SpO₂', value: `${biomarkers.spo2Percent}%` },
          {
            label: 'Presión Arterial',
            value: `${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg`,
          },
          { label: 'Frecuencia Cardíaca', value: `${biomarkers.heartRateBpm} bpm` },
          { label: 'Base en Tierra', value: astronaut.clinicalHistory.baselineBP },
        ];
      case 'immune':
        return [
          {
            label: 'Leucocitos (Defensas)',
            value: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
          },
          {
            label: 'Radiación Acumulada',
            value: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} / ${mission.missionLimitMsv} mSv`,
          },
          {
            label: 'Historial Pre-vuelo',
            value:
              astronaut.clinicalHistory.immuneStatus === 'Normal' ? 'Normal' : 'Defensas Bajas',
          },
          { label: 'Tipo de Sangre', value: astronaut.bloodType },
        ];
      case 'metabolic':
        return [
          { label: 'Glucosa Capilar', value: `${biomarkers.glucoseMgDl} mg/dL` },
          {
            label: 'Glucosa Basal EHR',
            value: `${astronaut.clinicalHistory.baselineGlucose} mg/dL`,
          },
          { label: 'Rango Seguro', value: '75 – 125 mg/dL' },
          { label: 'Demanda energética', value: mission.id === 'planetary-habitat' ? 'Alta (EVA)' : 'Estándar' },
        ];
      case 'musculoskeletal':
        return [
          { label: 'Retención Ósea (BMD)', value: `${biomarkers.boneDensityRetentionPercent}%` },
          { label: 'Masa Muscular', value: `${biomarkers.muscleMassRetentionPercent}%` },
          { label: 'Gravedad Entorno', value: mission.gravityLabel },
          {
            label: 'Cirugía Previa',
            value: astronaut.clinicalHistory.priorSurgeries[0] ?? 'Sin cirugías',
          },
        ];
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Mapa Corporal Interactivo de Salud Espacial
          </h2>
          <p className="text-xs text-slate-400">
            Haz clic en cualquier zona del cuerpo para inspeccionar su estado (Verde / Amarillo /
            Rojo) y recibir medidas preventivas.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Óptimo
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Precaución
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Crítico
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive SVG Human Figure */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-800/90 bg-slate-950/90 p-4 relative overflow-hidden">
          {/* HUD Grid Backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(56,189,248,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            viewBox="0 0 280 430"
            className="relative z-10 h-[360px] w-full max-w-[260px] select-none"
            role="img"
            aria-label="Figura humana interactiva de monitoreo espacial"
          >
            {/* Outer Silhouette */}
            <g
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#334155"
              strokeWidth="2"
              strokeLinejoin="round"
            >
              {/* Head & Neck */}
              <circle cx="140" cy="48" r="28" />
              <rect x="128" y="75" width="24" height="16" rx="6" />
              {/* Torso */}
              <path d="M90 96 C90 88, 190 88, 190 96 L182 225 C180 238, 100 238, 98 225 Z" />
              {/* Left Arm */}
              <path d="M88 98 L62 175 L52 232 C50 242, 66 245, 70 234 L84 180 L96 125 Z" />
              {/* Right Arm */}
              <path d="M192 98 L218 175 L228 232 C230 242, 214 245, 210 234 L196 180 L184 125 Z" />
              {/* Left Leg */}
              <path d="M100 230 L94 320 L88 402 C87 412, 112 414, 114 402 L124 322 L134 235 Z" />
              {/* Right Leg */}
              <path d="M180 230 L186 320 L192 402 C193 412, 168 414, 166 402 L156 322 L146 235 Z" />
            </g>

            {/* Zone 1: Brain / Head */}
            <g
              onClick={() => setSelectedSystem('brain')}
              className="cursor-pointer transition-all"
              style={{
                filter: selectedSystem === 'brain' ? STATUS_STYLE[systemStatuses.brain].glow : undefined,
              }}
            >
              <circle
                cx="140"
                cy="46"
                r="22"
                fill={STATUS_STYLE[systemStatuses.brain].fill}
                stroke={STATUS_STYLE[systemStatuses.brain].stroke}
                strokeWidth={selectedSystem === 'brain' ? 3 : 2}
              />
              <circle cx="140" cy="46" r="5" fill={STATUS_STYLE[systemStatuses.brain].stroke} />
            </g>

            {/* Zone 2: Cardiovascular / Chest Heart & Lungs */}
            <g
              onClick={() => setSelectedSystem('cardiovascular')}
              className="cursor-pointer transition-all"
              style={{
                filter:
                  selectedSystem === 'cardiovascular'
                    ? STATUS_STYLE[systemStatuses.cardiovascular].glow
                    : undefined,
              }}
            >
              <rect
                x="104"
                y="102"
                width="72"
                height="46"
                rx="14"
                fill={STATUS_STYLE[systemStatuses.cardiovascular].fill}
                stroke={STATUS_STYLE[systemStatuses.cardiovascular].stroke}
                strokeWidth={selectedSystem === 'cardiovascular' ? 3 : 2}
              />
              <path
                d="M114 126 L127 126 L133 114 L141 136 L148 122 L154 126 L166 126"
                fill="none"
                stroke={STATUS_STYLE[systemStatuses.cardiovascular].stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Zone 3: Immune / Blood Vessels (Right/Center Lymph & Circulatory Nodes) */}
            <g
              onClick={() => setSelectedSystem('immune')}
              className="cursor-pointer transition-all"
              style={{
                filter:
                  selectedSystem === 'immune' ? STATUS_STYLE[systemStatuses.immune].glow : undefined,
              }}
            >
              <rect
                x="102"
                y="154"
                width="34"
                height="36"
                rx="10"
                fill={STATUS_STYLE[systemStatuses.immune].fill}
                stroke={STATUS_STYLE[systemStatuses.immune].stroke}
                strokeWidth={selectedSystem === 'immune' ? 3 : 2}
              />
              <circle cx="119" cy="172" r="6" fill={STATUS_STYLE[systemStatuses.immune].stroke} />
            </g>

            {/* Zone 4: Metabolic / Glucose (Abdomen / Liver / Pancreas) */}
            <g
              onClick={() => setSelectedSystem('metabolic')}
              className="cursor-pointer transition-all"
              style={{
                filter:
                  selectedSystem === 'metabolic'
                    ? STATUS_STYLE[systemStatuses.metabolic].glow
                    : undefined,
              }}
            >
              <rect
                x="144"
                y="154"
                width="34"
                height="36"
                rx="10"
                fill={STATUS_STYLE[systemStatuses.metabolic].fill}
                stroke={STATUS_STYLE[systemStatuses.metabolic].stroke}
                strokeWidth={selectedSystem === 'metabolic' ? 3 : 2}
              />
              <circle cx="161" cy="172" r="6" fill={STATUS_STYLE[systemStatuses.metabolic].stroke} />
            </g>

            {/* Zone 5: Musculoskeletal (Femur / Knee / Limbs) */}
            <g
              onClick={() => setSelectedSystem('musculoskeletal')}
              className="cursor-pointer transition-all"
              style={{
                filter:
                  selectedSystem === 'musculoskeletal'
                    ? STATUS_STYLE[systemStatuses.musculoskeletal].glow
                    : undefined,
              }}
            >
              <rect
                x="100"
                y="244"
                width="26"
                height="130"
                rx="11"
                fill={STATUS_STYLE[systemStatuses.musculoskeletal].fill}
                stroke={STATUS_STYLE[systemStatuses.musculoskeletal].stroke}
                strokeWidth={selectedSystem === 'musculoskeletal' ? 3 : 2}
              />
              <rect
                x="154"
                y="244"
                width="26"
                height="130"
                rx="11"
                fill={STATUS_STYLE[systemStatuses.musculoskeletal].fill}
                stroke={STATUS_STYLE[systemStatuses.musculoskeletal].stroke}
                strokeWidth={selectedSystem === 'musculoskeletal' ? 3 : 2}
              />
              {/* Knee Joint Highlight Ring */}
              <circle
                cx="167"
                cy="318"
                r="8"
                fill="none"
                stroke={STATUS_STYLE[systemStatuses.musculoskeletal].stroke}
                strokeWidth="2.5"
              />
            </g>
          </svg>

          {/* Quick System Selector Pills under SVG */}
          <div className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5">
            {(Object.keys(BODY_SYSTEM_GUIDES) as BodySystemId[]).map((sysId) => {
              const guide = BODY_SYSTEM_GUIDES[sysId];
              const status = systemStatuses[sysId];
              const isSelected = selectedSystem === sysId;
              const dotColor =
                status === 'nominal'
                  ? 'bg-emerald-400'
                  : status === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-rose-400';

              return (
                <button
                  key={sysId}
                  type="button"
                  onClick={() => setSelectedSystem(sysId)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  {guide.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Diagnostic & Preventive Explanation Card */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-cyan-300">
                  {SYSTEM_ICONS[selectedSystem]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeGuide.title}</h3>
                  <p className="text-xs text-slate-400">
                    Evaluación en tiempo real · {astronaut.name}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${activeStyle.badge}`}
              >
                {activeStatus === 'nominal' ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : activeStatus === 'warning' ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" />
                )}
                {activeStyle.label}
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {getMetricSummary(selectedSystem).map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5"
                >
                  <span className="block text-[11px] text-slate-400">{m.label}</span>
                  <span className="mt-0.5 block text-sm font-bold text-white">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Plain-Language Medical Education */}
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                <p className="font-semibold text-cyan-300">
                  ¿Por qué importa este sistema en {mission.shortName}?
                </p>
                <p className="mt-1 leading-relaxed text-slate-300">
                  {activeGuide.whySpaceAffectsIt}
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 ${
                  activeStatus === 'nominal'
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : activeStatus === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-rose-500/40 bg-rose-500/15'
                }`}
              >
                <p className="font-semibold text-white">
                  {activeStatus === 'nominal'
                    ? 'Estado y Prevención Continua:'
                    : 'Qué hacer ahora (Medida Preventiva Autónoma):'}
                </p>
                <p className="mt-1 leading-relaxed text-slate-200">
                  {activeStatus === 'nominal'
                    ? activeGuide.nominalSummary
                    : activeStatus === 'warning'
                      ? activeGuide.warningAction
                      : activeGuide.criticalAction}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Basado en NASA HRP & Dosimetría CSA
            </span>
            <button
              type="button"
              onClick={() => setActiveTab(activeGuide.linkedTab)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
            >
              Abrir módulo especializado
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
