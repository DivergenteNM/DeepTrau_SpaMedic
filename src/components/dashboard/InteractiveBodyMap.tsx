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
    ring: string;
    badge: string;
    label: string;
  }
> = {
  nominal: {
    fill: 'rgba(47, 93, 70, 0.20)',
    stroke: '#2F5D46',
    ring: 'drop-shadow(0 0 6px rgba(47, 93, 70, 0.35))',
    badge: 'border-primary/35 bg-primary-container text-on-primary-container',
    label: 'Verde · Óptimo',
  },
  warning: {
    fill: 'rgba(181, 71, 8, 0.20)',
    stroke: '#B54708',
    ring: 'drop-shadow(0 0 7px rgba(181, 71, 8, 0.38))',
    badge: 'border-warning/35 bg-warning-container text-on-warning-container',
    label: 'Amarillo · Precaución',
  },
  critical: {
    fill: 'rgba(180, 35, 24, 0.22)',
    stroke: '#B42318',
    ring: 'drop-shadow(0 0 8px rgba(180, 35, 24, 0.45))',
    badge: 'border-danger/45 bg-danger-container text-on-danger-container',
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
          {
            label: 'Demanda energética',
            value: mission.id === 'planetary-habitat' ? 'Alta (EVA)' : 'Estándar',
          },
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

  const handleZoneKeyDown = (event: React.KeyboardEvent<SVGGElement>, sys: BodySystemId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedSystem(sys);
    }
  };

  return (
    <div className="rounded-2xl border border-outline bg-surface-container p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[18px] leading-[24px] font-bold text-on-surface flex items-center gap-2 font-display">
            <Sparkles className="h-5 w-5 text-primary" />
            Mapa Corporal Interactivo de Salud Espacial
          </h2>
          <p className="text-xs text-on-surface-variant">
            Haz clic en cualquier zona del cuerpo para inspeccionar su estado (Verde / Amarillo /
            Rojo) y recibir medidas preventivas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-container px-2.5 py-0.5 text-on-primary-container">
            <span className="h-2 w-2 rounded-full bg-primary" /> Óptimo
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning-container px-2.5 py-0.5 text-on-warning-container">
            <span className="h-2 w-2 rounded-full bg-warning" /> Precaución
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-danger/25 bg-danger-container px-2.5 py-0.5 text-on-danger-container">
            <span className="h-2 w-2 rounded-full bg-danger" /> Crítico
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive SVG Human Figure */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-outline bg-surface-container-low p-4 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(to right, #E6E2D8 1px, transparent 1px), linear-gradient(to bottom, #E6E2D8 1px, transparent 1px)',
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
            <g fill="#FFFFFF" stroke="#D8D3C8" strokeWidth="2.5" strokeLinejoin="round">
              <circle cx="140" cy="48" r="28" />
              <rect x="128" y="75" width="24" height="16" rx="6" />
              <path d="M90 96 C90 88, 190 88, 190 96 L182 225 C180 238, 100 238, 98 225 Z" />
              <path d="M88 98 L62 175 L52 232 C50 242, 66 245, 70 234 L84 180 L96 125 Z" />
              <path d="M192 98 L218 175 L228 232 C230 242, 214 245, 210 234 L196 180 L184 125 Z" />
              <path d="M100 230 L94 320 L88 402 C87 412, 112 414, 114 402 L124 322 L134 235 Z" />
              <path d="M180 230 L186 320 L192 402 C193 412, 168 414, 166 402 L156 322 L146 235 Z" />
            </g>

            {/* Zone 1: Brain / Head */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Inspeccionar cerebro y salud mental"
              aria-pressed={selectedSystem === 'brain'}
              data-selected={selectedSystem === 'brain'}
              onClick={() => setSelectedSystem('brain')}
              onKeyDown={(e) => handleZoneKeyDown(e, 'brain')}
              className="dt-body-zone"
              style={{
                filter:
                  selectedSystem === 'brain' ? STATUS_STYLE[systemStatuses.brain].ring : undefined,
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

            {/* Zone 2: Cardiovascular */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Inspeccionar sistema cardiovascular y oxigenación"
              aria-pressed={selectedSystem === 'cardiovascular'}
              data-selected={selectedSystem === 'cardiovascular'}
              onClick={() => setSelectedSystem('cardiovascular')}
              onKeyDown={(e) => handleZoneKeyDown(e, 'cardiovascular')}
              className="dt-body-zone"
              style={{
                filter:
                  selectedSystem === 'cardiovascular'
                    ? STATUS_STYLE[systemStatuses.cardiovascular].ring
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

            {/* Zone 3: Immune */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Inspeccionar sistema inmunitario y sangre"
              aria-pressed={selectedSystem === 'immune'}
              data-selected={selectedSystem === 'immune'}
              onClick={() => setSelectedSystem('immune')}
              onKeyDown={(e) => handleZoneKeyDown(e, 'immune')}
              className="dt-body-zone"
              style={{
                filter:
                  selectedSystem === 'immune'
                    ? STATUS_STYLE[systemStatuses.immune].ring
                    : undefined,
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

            {/* Zone 4: Metabolic / Glucose */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Inspeccionar metabolismo y glucosa"
              aria-pressed={selectedSystem === 'metabolic'}
              data-selected={selectedSystem === 'metabolic'}
              onClick={() => setSelectedSystem('metabolic')}
              onKeyDown={(e) => handleZoneKeyDown(e, 'metabolic')}
              className="dt-body-zone"
              style={{
                filter:
                  selectedSystem === 'metabolic'
                    ? STATUS_STYLE[systemStatuses.metabolic].ring
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

            {/* Zone 5: Musculoskeletal */}
            <g
              role="button"
              tabIndex={0}
              aria-label="Inspeccionar densidad ósea y músculos"
              aria-pressed={selectedSystem === 'musculoskeletal'}
              data-selected={selectedSystem === 'musculoskeletal'}
              onClick={() => setSelectedSystem('musculoskeletal')}
              onKeyDown={(e) => handleZoneKeyDown(e, 'musculoskeletal')}
              className="dt-body-zone"
              style={{
                filter:
                  selectedSystem === 'musculoskeletal'
                    ? STATUS_STYLE[systemStatuses.musculoskeletal].ring
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

          {/* Quick System Selector Pills */}
          <div className="relative z-10 mt-3 flex flex-wrap justify-center gap-1.5">
            {(Object.keys(BODY_SYSTEM_GUIDES) as BodySystemId[]).map((sysId) => {
              const guide = BODY_SYSTEM_GUIDES[sysId];
              const status = systemStatuses[sysId];
              const isSelected = selectedSystem === sysId;
              const dotColor =
                status === 'nominal'
                  ? 'bg-primary'
                  : status === 'warning'
                    ? 'bg-warning'
                    : 'bg-danger';

              return (
                <button
                  key={sysId}
                  type="button"
                  onClick={() => setSelectedSystem(sysId)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold dt-transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    isSelected
                      ? 'border-primary bg-primary-container text-on-primary-container'
                      : 'border-outline bg-surface-container text-on-surface-variant hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                  {guide.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Diagnostic & Preventive Card */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-outline bg-surface-container-low p-5 space-y-4">
          <div key={selectedSystem} className="space-y-4 dt-animate-panel">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline bg-surface-container text-primary">
                  {SYSTEM_ICONS[selectedSystem]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface font-display">
                    {activeGuide.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Evaluación en tiempo real · {astronaut.name}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${activeStyle.badge}`}
              >
                {activeStatus === 'nominal' ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                ) : activeStatus === 'warning' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-danger" />
                )}
                {activeStyle.label}
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {getMetricSummary(selectedSystem).map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-outline bg-surface-container px-3.5 py-2.5"
                >
                  <span className="block text-[11px] text-on-surface-variant">{m.label}</span>
                  <span className="mt-0.5 block text-sm font-bold text-on-surface font-mono">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Plain-Language Medical Education */}
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-outline bg-surface-container p-3.5">
                <p className="font-semibold text-primary font-display">
                  ¿Por qué importa este sistema en {mission.shortName}?
                </p>
                <p className="mt-1 leading-relaxed text-on-surface-variant">
                  {activeGuide.whySpaceAffectsIt}
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 dt-transition ${
                  activeStatus === 'nominal'
                    ? 'border-primary/30 bg-primary-container text-on-primary-container'
                    : activeStatus === 'warning'
                      ? 'border-warning/35 bg-warning-container text-on-warning-container'
                      : 'border-danger/40 bg-danger-container text-on-danger-container'
                }`}
              >
                <p className="font-bold font-display">
                  {activeStatus === 'nominal'
                    ? 'Estado y Prevención Continua:'
                    : 'Qué hacer ahora (Medida Preventiva Autónoma):'}
                </p>
                <p className="mt-1 leading-relaxed">
                  {activeStatus === 'nominal'
                    ? activeGuide.nominalSummary
                    : activeStatus === 'warning'
                      ? activeGuide.warningAction
                      : activeGuide.criticalAction}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
            <span className="text-[11px] text-on-surface-variant">
              Basado en NASA HRP & Dosimetría CSA
            </span>
            <button
              type="button"
              onClick={() => setActiveTab(activeGuide.linkedTab)}
              className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Abrir módulo especializado
              <ArrowRight className="h-3.5 w-3.5 dt-transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
