'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EmergencyZoneGuide, MiniBodyZoneId } from '@/data/emergencyProtocolsData';

interface EmergencyMiniBodyMapProps {
  protocolZones: EmergencyZoneGuide[];
  selectedZoneId: MiniBodyZoneId;
  onSelectZone: (zoneId: MiniBodyZoneId) => void;
  urgency: 'critical' | 'warning';
}

const ZONE_LABELS: Record<MiniBodyZoneId, string> = {
  head: 'Cráneo / Conciencia',
  airway_neck: 'Vía Aérea / Cuello',
  chest_heart: 'Tórax / Corazón',
  abdomen_fast: 'Abdomen / Pelvis FAST',
  limbs_joints: 'Extremidades / Retorno',
};

export function EmergencyMiniBodyMap({
  protocolZones,
  selectedZoneId,
  onSelectZone,
  urgency,
}: EmergencyMiniBodyMapProps) {
  const zoneMap = new Map(protocolZones.map((z) => [z.zoneId, z]));
  const activeGuide = zoneMap.get(selectedZoneId) ?? protocolZones[0];

  const getZoneColors = (zoneId: MiniBodyZoneId) => {
    const isRelevant = zoneMap.has(zoneId);
    const isSelected = selectedZoneId === zoneId;

    if (isRelevant) {
      if (urgency === 'critical') {
        return {
          fill: isSelected ? 'rgba(180, 35, 24, 0.34)' : 'rgba(180, 35, 24, 0.20)',
          stroke: '#B42318',
          status: 'critical' as const,
        };
      }
      return {
        fill: isSelected ? 'rgba(181, 71, 8, 0.32)' : 'rgba(181, 71, 8, 0.18)',
        stroke: '#B54708',
        status: 'warning' as const,
      };
    }

    return {
      fill: isSelected ? 'rgba(47, 93, 70, 0.22)' : 'rgba(47, 93, 70, 0.08)',
      stroke: isSelected ? '#2F5D46' : '#8A968E',
      status: 'nominal' as const,
    };
  };

  const zoneProps = (zoneId: MiniBodyZoneId) => {
    const colors = getZoneColors(zoneId);
    return {
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `Verificar ${ZONE_LABELS[zoneId]}`,
      'aria-pressed': selectedZoneId === zoneId,
      'data-selected': selectedZoneId === zoneId,
      'data-status': colors.status,
      onClick: () => onSelectZone(zoneId),
      onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectZone(zoneId);
        }
      },
      className: 'dt-body-zone cursor-pointer',
    };
  };

  const headColors = getZoneColors('head');
  const airwayColors = getZoneColors('airway_neck');
  const chestColors = getZoneColors('chest_heart');
  const abdomenColors = getZoneColors('abdomen_fast');
  const limbsColors = getZoneColors('limbs_joints');

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-container-low p-2.5">
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'linear-gradient(to right, #E6E2D8 1px, transparent 1px), linear-gradient(to bottom, #E6E2D8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative z-10 flex items-center justify-between pb-1 text-[10px] font-mono font-semibold text-on-surface-variant">
          <span>MINI MAPA DE REVISIÓN</span>
          <span>CLIC EN ZONA</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[175px]">
          <svg
            viewBox="40 8 140 226"
            className="h-auto w-full select-none"
            role="img"
            aria-label="Mini mapa corporal de verificación rápida"
          >
            {/* Base silhouette */}
            <g aria-hidden="true">
              <path
                d="M102 52 L118 52 C119 59 124 63 134 67 C144 71 149 82 152 104 L156 135 C157 142 149 144 146 136 L140 100 L137 138 L140 176 L134 222 C133 227 123 227 122 221 L117 170 L110 156 L103 170 L98 221 C97 227 87 227 86 222 L80 176 L83 138 L80 100 L74 136 C71 144 63 142 64 135 L68 104 C71 82 76 71 86 67 C96 63 101 59 102 52 Z"
                fill="#FFFFFF"
                stroke="#D8D3C8"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle
                cx="110"
                cy="33"
                r="17"
                fill="#FFFFFF"
                stroke="#D8D3C8"
                strokeWidth="1.8"
              />
            </g>

            {/* Head */}
            <g {...zoneProps('head')}>
              <circle
                cx="110"
                cy="33"
                r="15"
                fill={headColors.fill}
                stroke={headColors.stroke}
                strokeWidth={selectedZoneId === 'head' ? 2.2 : 1.5}
              />
            </g>

            {/* Airway / Neck */}
            <g {...zoneProps('airway_neck')}>
              <rect
                x="100"
                y="50"
                width="20"
                height="16"
                rx="6"
                fill={airwayColors.fill}
                stroke={airwayColors.stroke}
                strokeWidth={selectedZoneId === 'airway_neck' ? 2.2 : 1.5}
              />
            </g>

            {/* Chest / Heart */}
            <g {...zoneProps('chest_heart')}>
              <rect
                x="87"
                y="70"
                width="46"
                height="35"
                rx="10"
                fill={chestColors.fill}
                stroke={chestColors.stroke}
                strokeWidth={selectedZoneId === 'chest_heart' ? 2.2 : 1.5}
              />
              <path
                d="M94 88 L103 88 L106 81 L110 95 L114 85 L117 88 L126 88"
                fill="none"
                stroke={chestColors.stroke}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Abdomen / FAST */}
            <g {...zoneProps('abdomen_fast')}>
              <rect
                x="89"
                y="109"
                width="42"
                height="34"
                rx="9"
                fill={abdomenColors.fill}
                stroke={abdomenColors.stroke}
                strokeWidth={selectedZoneId === 'abdomen_fast' ? 2.2 : 1.5}
              />
              <line
                x1="110"
                y1="114"
                x2="110"
                y2="138"
                stroke={abdomenColors.stroke}
                strokeWidth="1.1"
                strokeDasharray="2 2"
              />
              <line
                x1="95"
                y1="126"
                x2="125"
                y2="126"
                stroke={abdomenColors.stroke}
                strokeWidth="1.1"
                strokeDasharray="2 2"
              />
            </g>

            {/* Limbs / Joints */}
            <g {...zoneProps('limbs_joints')}>
              <rect
                x="82"
                y="150"
                width="21"
                height="62"
                rx="8"
                fill={limbsColors.fill}
                stroke={limbsColors.stroke}
                strokeWidth={selectedZoneId === 'limbs_joints' ? 2.2 : 1.5}
              />
              <rect
                x="117"
                y="150"
                width="21"
                height="62"
                rx="8"
                fill={limbsColors.fill}
                stroke={limbsColors.stroke}
                strokeWidth={selectedZoneId === 'limbs_joints' ? 2.2 : 1.5}
              />
            </g>
          </svg>
        </div>

        {/* Zone Quick Chips */}
        <div className="relative z-10 mt-2 flex flex-wrap gap-1">
          {protocolZones.map((zone) => {
            const isSel = selectedZoneId === zone.zoneId;
            return (
              <button
                key={zone.zoneId}
                type="button"
                onClick={() => onSelectZone(zone.zoneId)}
                className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-semibold dt-transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5D46] ${
                  isSel
                    ? 'border-danger bg-danger-container text-on-danger-container'
                    : 'border-outline bg-surface-container text-on-surface-variant hover:-translate-y-px hover:border-primary/45 hover:text-on-surface'
                }`}
              >
                {zone.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Detail */}
      {activeGuide ? (
        <div
          key={activeGuide.zoneId}
          className="dt-animate-panel rounded-xl border border-outline bg-surface-container p-3 text-xs space-y-1.5"
        >
          <p className="font-bold text-on-surface font-display flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-danger" />
            <span>{activeGuide.label}</span>
          </p>
          <p className="text-on-surface-variant leading-relaxed">{activeGuide.checkInstruction}</p>
          <p className="rounded-lg border border-danger/30 bg-danger-container/60 px-2.5 py-1.5 text-[11px] font-medium text-on-danger-container">
            Signo crítico: {activeGuide.criticalSign}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-outline bg-surface-container p-3 text-xs text-on-surface-variant flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span>Zona sin afectación primaria; verifica solo si hay dolor o lesión visible.</span>
        </div>
      )}
    </div>
  );
}
