'use client';

import React, { useMemo, useState } from 'react';
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
    softFill: string;
    stroke: string;
    ring: string;
    badge: string;
    shortBadge: string;
    dot: string;
    label: string;
    shortLabel: string;
  }
> = {
  nominal: {
    fill: 'rgba(47, 93, 70, 0.20)',
    softFill: 'rgba(47, 93, 70, 0.10)',
    stroke: '#2F5D46',
    ring: 'drop-shadow(0 0 6px rgba(47, 93, 70, 0.35))',
    badge: 'border-primary/35 bg-primary-container text-on-primary-container',
    shortBadge: 'bg-primary-container text-on-primary-container border-primary/25',
    dot: 'bg-primary',
    label: 'Verde · Óptimo',
    shortLabel: 'Óptimo',
  },
  warning: {
    fill: 'rgba(181, 71, 8, 0.20)',
    softFill: 'rgba(181, 71, 8, 0.11)',
    stroke: '#B54708',
    ring: 'drop-shadow(0 0 7px rgba(181, 71, 8, 0.38))',
    badge: 'border-warning/35 bg-warning-container text-on-warning-container',
    shortBadge: 'bg-warning-container text-on-warning-container border-warning/30',
    dot: 'bg-warning',
    label: 'Amarillo · Precaución',
    shortLabel: 'Precaución',
  },
  critical: {
    fill: 'rgba(180, 35, 24, 0.22)',
    softFill: 'rgba(180, 35, 24, 0.12)',
    stroke: '#B42318',
    ring: 'drop-shadow(0 0 8px rgba(180, 35, 24, 0.45))',
    badge: 'border-danger/45 bg-danger-container text-on-danger-container',
    shortBadge: 'bg-danger-container text-on-danger-container border-danger/35',
    dot: 'bg-danger',
    label: 'Rojo · Atención Inmediata',
    shortLabel: 'Crítico',
  },
};

const SYSTEM_ICONS: Record<BodySystemId, React.ReactNode> = {
  brain: <Brain className="h-4 w-4" />,
  cardiovascular: <HeartPulse className="h-4 w-4" />,
  immune: <Droplets className="h-4 w-4" />,
  metabolic: <Activity className="h-4 w-4" />,
  musculoskeletal: <Bone className="h-4 w-4" />,
};

const SVG_VB = { minX: 54, minY: 10, width: 192, height: 412 } as const;

function toSvgPct(x: number, y: number) {
  return {
    xPct: ((x - SVG_VB.minX) / SVG_VB.width) * 100,
    yPct: ((y - SVG_VB.minY) / SVG_VB.height) * 100,
  };
}

type HoverTargetId = BodySystemId | 'surgery';

interface SurgicalMarker {
  x: number;
  y: number;
  label: string;
  detail: string;
}

/**
 * Maps EHR prior surgery descriptions onto anterior anatomical coordinates
 * (viewer left = patient anatomical right; viewer right = patient anatomical left).
 */
function getSurgicalMarker(priorSurgeries: string[]): SurgicalMarker | null {
  const joined = priorSurgeries.join(' ').toLowerCase();
  if (!joined || joined.includes('sin cirugías')) return null;

  const original = priorSurgeries[0] ?? 'Antecedente quirúrgico';

  if (joined.includes('rodilla')) {
    const isLeft = joined.includes('izquierda');
    return {
      x: isLeft ? 174.5 : 125.5,
      y: 316,
      label: isLeft ? 'Antecedente Qx: rodilla izq.' : 'Antecedente Qx: rodilla der.',
      detail: original,
    };
  }

  if (joined.includes('hombro')) {
    const isRight = joined.includes('derecho');
    return {
      x: isRight ? 105 : 195,
      y: 105,
      label: isRight ? 'Antecedente Qx: hombro der.' : 'Antecedente Qx: hombro izq.',
      detail: original,
    };
  }

  if (joined.includes('columna') || joined.includes('espalda') || joined.includes('lumbar')) {
    return {
      x: 150,
      y: 196,
      label: 'Antecedente Qx: zona lumbar',
      detail: original,
    };
  }

  return null;
}

export function InteractiveBodyMap() {
  const { systemStatuses, biomarkers, astronaut, mission, setActiveTab } = useMission();
  const [selectedSystem, setSelectedSystem] = useState<BodySystemId>('brain');
  const [hoveredSystem, setHoveredSystem] = useState<BodySystemId | null>(null);
  const [hoveredSvgTarget, setHoveredSvgTarget] = useState<HoverTargetId | null>(null);

  const activeGuide = BODY_SYSTEM_GUIDES[selectedSystem];
  const activeStatus = systemStatuses[selectedSystem];
  const activeStyle = STATUS_STYLE[activeStatus];

  const displaySystem = hoveredSystem ?? selectedSystem;
  const displayGuide = BODY_SYSTEM_GUIDES[displaySystem];
  const displayStatus = systemStatuses[displaySystem];

  const surgicalMarker = useMemo(
    () => getSurgicalMarker(astronaut.clinicalHistory.priorSurgeries),
    [astronaut.clinicalHistory.priorSurgeries]
  );

  const alertCount = useMemo(
    () =>
      (Object.values(systemStatuses) as TriageLevel[]).filter((status) => status !== 'nominal')
        .length,
    [systemStatuses]
  );

  const getPrimaryReadout = (sys: BodySystemId) => {
    switch (sys) {
      case 'brain':
        return `Ánimo ${biomarkers.moodScore}/10 · ${biomarkers.sleepHours}h sueño`;
      case 'cardiovascular':
        return `SpO₂ ${biomarkers.spo2Percent}% · ${biomarkers.heartRateBpm} bpm`;
      case 'immune':
        return `${biomarkers.wbcCount.toLocaleString('es-ES')}/µL · ${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`;
      case 'metabolic':
        return `Glucosa ${biomarkers.glucoseMgDl} mg/dL`;
      case 'musculoskeletal':
        return `BMD ${biomarkers.boneDensityRetentionPercent}% · Músculo ${biomarkers.muscleMassRetentionPercent}%`;
    }
  };

  const getTooltipContent = (target: HoverTargetId) => {
    if (target === 'surgery' && surgicalMarker) {
      const placeBelow = surgicalMarker.y < 145;
      const anchor = toSvgPct(
        surgicalMarker.x,
        placeBelow ? surgicalMarker.y + 15 : surgicalMarker.y - 14
      );
      return {
        title: surgicalMarker.label,
        status: 'warning' as TriageLevel,
        statusLabel: 'Adaptado',
        metrics: surgicalMarker.detail,
        hint: 'Protocolo articular seguro activo · Clic para ver',
        placement: placeBelow ? ('bottom' as const) : ('top' as const),
        ...anchor,
      };
    }

    const sys: BodySystemId = target === 'surgery' ? 'musculoskeletal' : target;
    const guide = BODY_SYSTEM_GUIDES[sys];
    const status = systemStatuses[sys];

    const coords: Record<
      BodySystemId,
      { x: number; y: number; placement: 'top' | 'bottom'; metrics: string }
    > = {
      brain: {
        x: 150,
        y: 66,
        placement: 'bottom',
        metrics: `Ánimo ${biomarkers.moodScore}/10 · Sueño ${biomarkers.sleepHours}h · Estrés ${biomarkers.stressLevel}/10`,
      },
      cardiovascular: {
        x: 150,
        y: 96,
        placement: 'top',
        metrics: `SpO₂ ${biomarkers.spo2Percent}% · ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · ${biomarkers.heartRateBpm} bpm`,
      },
      metabolic: {
        x: 131,
        y: 154,
        placement: 'top',
        metrics: `Glucosa ${biomarkers.glucoseMgDl} mg/dL · Basal ${astronaut.clinicalHistory.baselineGlucose} mg/dL`,
      },
      immune: {
        x: 169,
        y: 154,
        placement: 'top',
        metrics: `Leucocitos ${biomarkers.wbcCount.toLocaleString('es-ES')}/µL · ${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
      },
      musculoskeletal: {
        x: 150,
        y: 224,
        placement: 'top',
        metrics: `Retención ósea ${biomarkers.boneDensityRetentionPercent}% · Músculo ${biomarkers.muscleMassRetentionPercent}%`,
      },
    };

    const cfg = coords[sys];
    const anchor = toSvgPct(cfg.x, cfg.y);

    return {
      title: guide.shortLabel,
      status,
      statusLabel: STATUS_STYLE[status].shortLabel,
      metrics: cfg.metrics,
      hint:
        selectedSystem === sys
          ? 'Sistema activo · Revisa el panel derecho'
          : 'Clic para inspeccionar medidas preventivas',
      placement: cfg.placement,
      ...anchor,
    };
  };

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

  const zoneInteractionProps = (sys: BodySystemId, label: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': selectedSystem === sys,
    'data-selected': selectedSystem === sys,
    'data-status': systemStatuses[sys],
    onClick: () => setSelectedSystem(sys),
    onMouseEnter: () => {
      setHoveredSystem(sys);
      setHoveredSvgTarget(sys);
    },
    onMouseLeave: () => {
      setHoveredSystem((prev) => (prev === sys ? null : prev));
      setHoveredSvgTarget((prev) => (prev === sys ? null : prev));
    },
    onFocus: () => setHoveredSvgTarget(sys),
    onBlur: () => setHoveredSvgTarget((prev) => (prev === sys ? null : prev)),
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => handleZoneKeyDown(e, sys),
    className: 'dt-body-zone',
    style: {
      filter: selectedSystem === sys ? STATUS_STYLE[systemStatuses[sys]].ring : undefined,
    },
  });

  const brainStyle = STATUS_STYLE[systemStatuses.brain];
  const cardioStyle = STATUS_STYLE[systemStatuses.cardiovascular];
  const metabolicStyle = STATUS_STYLE[systemStatuses.metabolic];
  const immuneStyle = STATUS_STYLE[systemStatuses.immune];
  const musculoStyle = STATUS_STYLE[systemStatuses.musculoskeletal];

  const activeTooltip = hoveredSvgTarget ? getTooltipContent(hoveredSvgTarget) : null;

  return (
    <div className="rounded-2xl border border-outline bg-surface-container p-5">
      {/* Header + Triage Legend */}
      <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[18px] leading-[24px] font-bold text-on-surface font-display">
            <Sparkles className="h-5 w-5 text-primary" />
            Mapa Corporal Interactivo de Salud Espacial
          </h2>
          <p className="text-xs text-on-surface-variant">
            Pasa el cursor o haz clic en cualquier zona anatómica para inspeccionar su estado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold shrink-0">
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

      {/* Full-Width System Selector Strip */}
      <div
        className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-low/70 p-1.5"
        role="group"
        aria-label="Selector rápido de sistemas corporales"
      >
        {(Object.keys(BODY_SYSTEM_GUIDES) as BodySystemId[]).map((sysId) => {
          const guide = BODY_SYSTEM_GUIDES[sysId];
          const status = systemStatuses[sysId];
          const isSelected = selectedSystem === sysId;
          const dotColor =
            status === 'nominal'
              ? 'bg-primary'
              : status === 'warning'
                ? 'bg-warning'
                : 'bg-danger animate-pulse';

          return (
            <button
              key={sysId}
              type="button"
              onClick={() => setSelectedSystem(sysId)}
              onMouseEnter={() => setHoveredSystem(sysId)}
              onMouseLeave={() => setHoveredSystem((prev) => (prev === sysId ? null : prev))}
              aria-pressed={isSelected}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold dt-transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${isSelected
                ? 'border-primary bg-surface-container text-on-primary-container dt-selected-ring'
                : status === 'critical'
                  ? 'border-danger/35 bg-danger-container/50 text-on-danger-container hover:-translate-y-px hover:border-danger'
                  : status === 'warning'
                    ? 'border-warning/35 bg-warning-container/45 text-on-warning-container hover:-translate-y-px hover:border-warning'
                    : 'border-outline bg-surface-container text-on-surface-variant hover:-translate-y-px hover:border-primary/45 hover:text-on-surface'
                }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
              <span>{guide.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.18fr]">
        {/* Left: Biometric Anatomical Scanner Viewport */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline bg-surface-container-low p-3">
          {/* Technical Mineral Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-65"
            style={{
              backgroundImage:
                'linear-gradient(to right, #E6E2D8 1px, transparent 1px), linear-gradient(to bottom, #E6E2D8 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* Scanner Micro-HUD Top Bar */}
          <div className="relative z-10 flex items-center justify-between gap-2 pb-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.07em] text-on-surface-variant">
              Vista Anterior
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold ${alertCount > 0
                ? 'border-warning/30 bg-warning-container text-on-warning-container'
                : 'border-outline bg-surface-container text-on-surface-variant'
                }`}
            >
              {alertCount > 0
                ? `${alertCount} ${alertCount === 1 ? 'alerta' : 'alertas'}`
                : mission.gravityLabel}
            </span>
          </div>

          {/* Native Anatomical Telemetry SVG + Hover Tooltip Anchor */}
          <div className="relative z-10 flex flex-1 items-center justify-center py-0.5">
            <div
              style={{ aspectRatio: `${SVG_VB.width} / ${SVG_VB.height}` }}
              className="relative w-full max-w-[246px] sm:max-w-[254px]"
            >
              <svg
                viewBox={`${SVG_VB.minX} ${SVG_VB.minY} ${SVG_VB.width} ${SVG_VB.height}`}
                className="h-full w-full select-none"
                role="img"
                aria-label="Escáner anatómico interactivo de salud espacial"
              >
                {/* Calibration Frame & Anatomical Planes */}
                <g aria-hidden="true">
                  {/* Corner Reticle Brackets */}
                  <path
                    d="M58 24 L58 14 L68 14 M232 14 L242 14 L242 24 M58 408 L58 418 L68 418 M232 418 L242 418 L242 408"
                    fill="none"
                    stroke="#D8D3C8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Concentric Calibration Rings */}
                  <circle
                    cx="150"
                    cy="148"
                    r="88"
                    fill="none"
                    stroke="#E6E2D8"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                  />
                  <circle
                    cx="150"
                    cy="148"
                    r="60"
                    fill="none"
                    stroke="#E6E2D8"
                    strokeWidth="0.9"
                    opacity="0.85"
                  />

                  {/* Vertical Anatomical Midline */}
                  <line
                    x1="150"
                    y1="14"
                    x2="150"
                    y2="418"
                    stroke="#D8D3C8"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />

                  {/* Horizontal Elevation Reference Ticks */}
                  <path
                    d="M59 44 L64 44 M236 44 L241 44 M59 132 L64 132 M236 132 L241 132 M59 178 L64 178 M236 178 L241 178 M59 236 L64 236 M236 236 L241 236 M59 316 L64 316 M236 316 L241 316"
                    stroke="#D8D3C8"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />

                  {/* Anatomical Orientation Labels (Patient Right = Viewer Left) */}
                  <text
                    x="61"
                    y="96"
                    fill="#55635B"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    opacity="0.65"
                  >
                    D
                  </text>
                  <text
                    x="234"
                    y="96"
                    fill="#55635B"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    opacity="0.65"
                  >
                    I
                  </text>
                </g>

                {/* Sculpted Continuous Anatomical Silhouette */}
                <g aria-hidden="true">
                  {/* Neck, Shoulders, Arms, Hands, Torso, Legs & Feet */}
                  <path
                    d="M 139 64 L 161 64
                       C 161 75, 164 81, 171 85
                       C 182 90, 196 93, 203 103
                       C 209 112, 211 128, 214 146
                       C 217 161, 221 178, 224 196
                       C 226 208, 228 218, 229 225
                       C 233 233, 234 242, 230 246
                       C 228 249, 224 247, 222 243
                       C 220 238, 218 238, 216 241
                       C 214 243, 212 240, 214 234
                       C 216 227, 216 220, 214 214
                       C 210 194, 203 175, 199 158
                       C 196 147, 193 135, 191 128
                       C 189 144, 187 164, 184 182
                       C 183 194, 189 209, 191 224
                       C 192 246, 189 278, 185 306
                       C 183 317, 184 326, 186 338
                       C 188 352, 185 372, 181 392
                       C 180 398, 185 405, 184 410
                       C 182 414, 169 414, 166 409
                       C 164 405, 166 398, 166 392
                       C 163 372, 161 352, 163 336
                       C 165 325, 165 316, 163 305
                       C 160 282, 156 258, 153 240
                       C 152 236, 148 236, 147 240
                       C 144 258, 140 282, 137 305
                       C 135 316, 135 325, 137 336
                       C 139 352, 137 372, 134 392
                       C 134 398, 136 405, 134 409
                       C 131 414, 118 414, 116 410
                       C 115 405, 120 398, 119 392
                       C 115 372, 112 352, 114 338
                       C 116 326, 117 317, 115 306
                       C 111 278, 108 246, 109 224
                       C 111 209, 117 194, 116 182
                       C 113 164, 111 144, 109 128
                       C 107 135, 104 147, 101 158
                       C 97 175, 90 194, 86 214
                       C 84 220, 84 227, 86 234
                       C 88 240, 86 243, 84 241
                       C 82 238, 80 238, 78 243
                       C 76 247, 72 249, 70 246
                       C 66 242, 67 233, 71 225
                       C 72 218, 74 208, 76 196
                       C 79 178, 83 161, 86 146
                       C 89 128, 91 112, 97 103
                       C 104 93, 118 90, 129 85
                       C 136 81, 139 75, 139 64 Z"
                    fill="#FFFFFF"
                    stroke="#D8D3C8"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                  />

                  {/* Cranium & Ears */}
                  <path
                    d="M127 42 C123 42, 123 53, 127 54 M173 42 C177 42, 177 53, 173 54"
                    fill="#FFFFFF"
                    stroke="#D8D3C8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 150 22 C 165 22, 173 32, 173 45 C 173 55, 168 63, 160 68 C 155 71, 145 71, 140 68 C 132 63, 127 55, 127 45 C 127 32, 135 22, 150 22 Z"
                    fill="#FFFFFF"
                    stroke="#D8D3C8"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                  />

                  {/* Internal Structural Guide Contours (Clavicles, Rib Arch, Pelvis, Arm Creases) */}
                  <g fill="none" stroke="#E6E2D8" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M146 91 Q127 88 109 98" />
                    <path d="M154 91 Q173 88 191 98" />
                    <path d="M109 128 Q105 112 108 101" />
                    <path d="M191 128 Q195 112 192 101" />
                    <path d="M116 151 Q150 159 184 151" />
                    <path d="M114 211 Q150 225 186 211" />
                    <line x1="150" y1="76" x2="150" y2="208" strokeDasharray="2 4" />
                  </g>
                </g>

                {/* ZONE 1: Brain & Mental Health */}
                <g {...zoneInteractionProps('brain', 'Inspeccionar cerebro y salud mental')}>
                  <circle cx="150" cy="44" r="24" fill="transparent" />
                  {selectedSystem === 'brain' && (
                    <circle
                      cx="150"
                      cy="42"
                      r="26"
                      fill="none"
                      stroke={brainStyle.stroke}
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      className="dt-body-reticle"
                    />
                  )}
                  {/* Bilateral Cerebral Hemispheres */}
                  <path
                    d="M 149 27 C 139 27, 132 34, 132 43 C 132 50, 137 55, 144 55 C 147 55, 149 53, 149 50 Z"
                    fill={brainStyle.fill}
                    stroke={brainStyle.stroke}
                    strokeWidth={selectedSystem === 'brain' ? 2.1 : 1.6}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 151 27 C 161 27, 168 34, 168 43 C 168 50, 163 55, 156 55 C 153 55, 151 53, 151 50 Z"
                    fill={brainStyle.fill}
                    stroke={brainStyle.stroke}
                    strokeWidth={selectedSystem === 'brain' ? 2.1 : 1.6}
                    strokeLinejoin="round"
                  />
                  {/* Cortical Gyri & Neural Stem */}
                  <path
                    d="M137 37 Q142 34 146 38 M136 45 Q141 42 146 46 M163 37 Q158 34 154 38 M164 45 Q159 42 154 46 M148 54 L148 61 M152 54 L152 61"
                    fill="none"
                    stroke={brainStyle.stroke}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>

                {/* ZONE 2: Cardiovascular & Oxygenation */}
                <g
                  {...zoneInteractionProps(
                    'cardiovascular',
                    'Inspeccionar sistema cardiovascular y oxigenación'
                  )}
                >
                  <rect x="114" y="99" width="72" height="56" rx="18" fill="transparent" />
                  {selectedSystem === 'cardiovascular' && (
                    <rect
                      x="113"
                      y="100"
                      width="74"
                      height="54"
                      rx="20"
                      fill="none"
                      stroke={cardioStyle.stroke}
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      className="dt-body-reticle"
                    />
                  )}
                  {/* Trachea & Bronchi */}
                  <path
                    d="M150 94 L150 109 M150 109 L137 119 M150 109 L163 119"
                    fill="none"
                    stroke={cardioStyle.stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  {/* Bilateral Pulmonary Contours */}
                  <path
                    d="M 146 107 C 136 104, 123 110, 119 123 C 116 134, 118 147, 126 150 C 134 152, 143 148, 146 142 Z"
                    fill={cardioStyle.softFill}
                    stroke={cardioStyle.stroke}
                    strokeWidth={selectedSystem === 'cardiovascular' ? 1.8 : 1.3}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 154 107 C 164 104, 177 110, 181 123 C 184 134, 182 147, 174 150 C 168 152, 160 149, 157 145 Z"
                    fill={cardioStyle.softFill}
                    stroke={cardioStyle.stroke}
                    strokeWidth={selectedSystem === 'cardiovascular' ? 1.8 : 1.3}
                    strokeLinejoin="round"
                  />
                  {/* Anatomical Heart Silhouette (Apex to Patient Left / Viewer Right) */}
                  <path
                    d="M 154 121 C 150 116, 143 119, 144 128 C 145 136, 153 143, 160 145 C 166 142, 169 133, 167 124 C 165 118, 158 118, 154 121 Z"
                    fill={cardioStyle.fill}
                    stroke={cardioStyle.stroke}
                    strokeWidth={selectedSystem === 'cardiovascular' ? 2.2 : 1.7}
                    strokeLinejoin="round"
                  />
                  {/* ECG Tracing with contrast halo */}
                  <path
                    d="M122 132 L135 132 L140 123 L146 141 L152 126 L157 132 L178 132"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.75"
                  />
                  <path
                    d="M122 132 L135 132 L140 123 L146 141 L152 126 L157 132 L178 132"
                    fill="none"
                    stroke={cardioStyle.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* ZONE 3: Metabolic & Glucose (Patient Right Upper Quadrant / Viewer Left) */}
                <g {...zoneInteractionProps('metabolic', 'Inspeccionar metabolismo y glucosa')}>
                  <rect x="114" y="157" width="35" height="40" rx="12" fill="transparent" />
                  {selectedSystem === 'metabolic' && (
                    <rect
                      x="114"
                      y="158"
                      width="34"
                      height="38"
                      rx="12"
                      fill="none"
                      stroke={metabolicStyle.stroke}
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      className="dt-body-reticle"
                    />
                  )}
                  {/* Hepatic + Pancreatic Metabolic Contour */}
                  <path
                    d="M 118 164 C 128 160, 143 161, 146 167 C 147 172, 138 179, 129 185 C 122 190, 117 184, 118 164 Z"
                    fill={metabolicStyle.fill}
                    stroke={metabolicStyle.stroke}
                    strokeWidth={selectedSystem === 'metabolic' ? 2.1 : 1.6}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M132 183 Q142 186 146 179"
                    fill="none"
                    stroke={metabolicStyle.stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Metabolic Glucose Hex Node */}
                  <polygon
                    points="129,169 133,171.5 133,176.5 129,179 125,176.5 125,171.5"
                    fill="#FFFFFF"
                    stroke={metabolicStyle.stroke}
                    strokeWidth="1.5"
                  />
                </g>

                {/* ZONE 4: Immune System & Blood (Patient Left Upper Quadrant / Viewer Right) */}
                <g {...zoneInteractionProps('immune', 'Inspeccionar sistema inmunitario y sangre')}>
                  <rect x="151" y="157" width="35" height="40" rx="12" fill="transparent" />
                  {selectedSystem === 'immune' && (
                    <rect
                      x="152"
                      y="158"
                      width="34"
                      height="38"
                      rx="12"
                      fill="none"
                      stroke={immuneStyle.stroke}
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      className="dt-body-reticle"
                    />
                  )}
                  {/* Splenic Organ Contour */}
                  <path
                    d="M 164 162 C 174 160, 182 167, 181 178 C 180 188, 171 192, 163 187 C 158 183, 158 167, 164 162 Z"
                    fill={immuneStyle.fill}
                    stroke={immuneStyle.stroke}
                    strokeWidth={selectedSystem === 'immune' ? 2.1 : 1.6}
                    strokeLinejoin="round"
                  />
                  {/* Lymphatic Pathway & Leukocyte Nodes */}
                  <path
                    d="M156 164 Q161 175 159 191"
                    fill="none"
                    stroke={immuneStyle.stroke}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.88"
                  />
                  <circle cx="156" cy="165" r="2.5" fill={immuneStyle.stroke} />
                  <circle cx="159" cy="189" r="2.5" fill={immuneStyle.stroke} />
                  <circle
                    cx="170"
                    cy="175"
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={immuneStyle.stroke}
                    strokeWidth="1.5"
                  />
                  <circle cx="170" cy="175" r="1.8" fill={immuneStyle.stroke} />
                </g>

                {/* ZONE 5: Musculoskeletal (Bilateral Muscular Sheaths + Hip/Femur/Patella/Tibia) */}
                <g
                  {...zoneInteractionProps(
                    'musculoskeletal',
                    'Inspeccionar densidad ósea y músculos'
                  )}
                >
                  <rect x="108" y="226" width="84" height="172" rx="16" fill="transparent" />
                  {selectedSystem === 'musculoskeletal' && (
                    <rect
                      x="108"
                      y="228"
                      width="84"
                      height="168"
                      rx="16"
                      fill="none"
                      stroke={musculoStyle.stroke}
                      strokeWidth="1.4"
                      strokeDasharray="3 3"
                      className="dt-body-reticle"
                    />
                  )}

                  {/* Left-Viewer Limb Muscle Contour & Skeletal Axis */}
                  <path
                    d="M 116 240 C 122 236, 134 238, 138 248 L 133 314 C 133 324, 133 358, 130 382 C 128 386, 123 386, 121 382 L 118 338 C 117 318, 114 274, 116 240 Z"
                    fill={musculoStyle.fill}
                    stroke={musculoStyle.stroke}
                    strokeWidth={selectedSystem === 'musculoskeletal' ? 2 : 1.5}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M133 237 L126 252 L125.5 310 M125.5 322 L125.5 384"
                    fill="none"
                    stroke={musculoStyle.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="133"
                    cy="237"
                    r="2.8"
                    fill="#FFFFFF"
                    stroke={musculoStyle.stroke}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="125.5"
                    cy="316"
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={musculoStyle.stroke}
                    strokeWidth="1.7"
                  />

                  {/* Right-Viewer Limb Muscle Contour & Skeletal Axis */}
                  <path
                    d="M 184 240 C 178 236, 166 238, 162 248 L 167 314 C 167 324, 167 358, 170 382 C 172 386, 177 386, 179 382 L 182 338 C 183 318, 186 274, 184 240 Z"
                    fill={musculoStyle.fill}
                    stroke={musculoStyle.stroke}
                    strokeWidth={selectedSystem === 'musculoskeletal' ? 2 : 1.5}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M167 237 L174 252 L174.5 310 M174.5 322 L174.5 384"
                    fill="none"
                    stroke={musculoStyle.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="167"
                    cy="237"
                    r="2.8"
                    fill="#FFFFFF"
                    stroke={musculoStyle.stroke}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="174.5"
                    cy="316"
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={musculoStyle.stroke}
                    strokeWidth="1.7"
                  />
                </g>

                {/* Dynamic Clinical Surgical Marker (EHR Prior Surgery Context) */}
                {surgicalMarker && (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${surgicalMarker.label}. Clic para ver detalle musculoesquelético`}
                    data-selected={selectedSystem === 'musculoskeletal'}
                    data-status="warning"
                    onClick={() => setSelectedSystem('musculoskeletal')}
                    onMouseEnter={() => {
                      setHoveredSystem('musculoskeletal');
                      setHoveredSvgTarget('surgery');
                    }}
                    onMouseLeave={() => {
                      setHoveredSystem((prev) => (prev === 'musculoskeletal' ? null : prev));
                      setHoveredSvgTarget((prev) => (prev === 'surgery' ? null : prev));
                    }}
                    onFocus={() => setHoveredSvgTarget('surgery')}
                    onBlur={() => setHoveredSvgTarget((prev) => (prev === 'surgery' ? null : prev))}
                    onKeyDown={(e) => handleZoneKeyDown(e, 'musculoskeletal')}
                    className="dt-body-zone"
                  >
                    <circle
                      cx={surgicalMarker.x}
                      cy={surgicalMarker.y}
                      r="11"
                      fill="rgba(181, 71, 8, 0.16)"
                      stroke="#B54708"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <circle
                      cx={surgicalMarker.x}
                      cy={surgicalMarker.y}
                      r="4"
                      fill="#FEF0C7"
                      stroke="#B54708"
                      strokeWidth="1.6"
                    />
                  </g>
                )}
              </svg>

              {/* Floating Clinical Hover Tooltip */}
              {activeTooltip && (
                <div
                  role="tooltip"
                  style={{
                    top: `${activeTooltip.yPct}%`,
                  }}
                  className={`pointer-events-none absolute left-1/2 z-30 w-[min(224px,calc(100%-6px))] -translate-x-1/2 dt-animate-panel ${
                    activeTooltip.placement === 'top' ? '-translate-y-full -mt-2' : 'mt-2'
                  }`}
                >
                  <div
                    className={`relative rounded-xl border bg-surface-container px-3 py-2 shadow-[0_12px_26px_-10px_rgba(26,36,30,0.24)] ${
                      activeTooltip.status === 'critical'
                        ? 'border-danger/45'
                        : activeTooltip.status === 'warning'
                          ? 'border-warning/45'
                          : 'border-primary/40'
                    }`}
                  >
                    {/* Directional Caret aligned with hovered organ X */}
                    <span
                      style={{
                        left: `clamp(16px, ${activeTooltip.xPct}%, calc(100% - 16px))`,
                      }}
                      className={`absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-surface-container ${
                        activeTooltip.placement === 'top'
                          ? '-bottom-[5.5px] border-r border-b'
                          : '-top-[5.5px] border-l border-t'
                      } ${
                        activeTooltip.status === 'critical'
                          ? 'border-danger/45'
                          : activeTooltip.status === 'warning'
                            ? 'border-warning/45'
                            : 'border-primary/40'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLE[activeTooltip.status].dot}`}
                        />
                        <span className="truncate text-[11px] font-bold text-on-surface font-display">
                          {activeTooltip.title}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_STYLE[activeTooltip.status].shortBadge}`}
                      >
                        {activeTooltip.statusLabel}
                      </span>
                    </div>

                    <p className="mt-1 font-mono text-[10px] font-semibold leading-snug text-on-surface">
                      {activeTooltip.metrics}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-on-surface-variant">
                      {activeTooltip.hint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Scanner Micro-HUD Readout */}
          <div className="relative z-10 mt-1 rounded-xl border border-outline bg-surface-container px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${displayStatus === 'nominal'
                    ? 'bg-primary'
                    : displayStatus === 'warning'
                      ? 'bg-warning'
                      : 'bg-danger'
                    }`}
                />
                <span className="truncate text-[11px] font-bold text-on-surface font-display">
                  {displayGuide.shortLabel}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold text-primary">
                {getPrimaryReadout(displaySystem)}
              </span>
            </div>
            {surgicalMarker && (
              <p className="mt-1 flex items-center gap-1 truncate text-[10px] font-medium text-on-warning-container">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {surgicalMarker.label}
              </p>
            )}
          </div>
        </div>

        {/* Right: Detailed Diagnostic & Preventive Card */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-outline bg-surface-container-low p-5">
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
                className={`rounded-xl border p-3.5 dt-transition ${activeStatus === 'nominal'
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

          <div className="flex items-center justify-between border-t border-outline-variant pt-3">
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
