'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { EmergencyZoneGuide, MiniBodyZoneId } from '@/data/emergencyProtocolsData';

interface EmergencyMiniBodyMapProps {
  protocolZones: EmergencyZoneGuide[];
  selectedZoneId: MiniBodyZoneId;
  onSelectZone: (zoneId: MiniBodyZoneId) => void;
  urgency: 'critical' | 'warning';
}

const ZONE_META: Record<
  MiniBodyZoneId,
  {
    titleEn: string;
    titleEs: string;
    tagEn: string;
    tagEs: string;
    anchorX: number;
    anchorY: number;
    elbowX: number;
    pinX: number;
    pinY: number;
    side: 'left' | 'right';
  }
> = {
  head: {
    titleEn: 'Cranium / Consciousness',
    titleEs: 'Cráneo / Conciencia',
    tagEn: 'CRANIUM',
    tagEs: 'CRÁNEO',
    anchorX: 169,
    anchorY: 42,
    elbowX: 204,
    pinX: 240,
    pinY: 42,
    side: 'right',
  },
  airway_neck: {
    titleEn: 'Airway / Neck',
    titleEs: 'Vía Aérea / Cuello',
    tagEn: 'AIRWAY',
    tagEs: 'VÍA AÉREA',
    anchorX: 143,
    anchorY: 82,
    elbowX: 98,
    pinX: 60,
    pinY: 82,
    side: 'left',
  },
  chest_heart: {
    titleEn: 'Thorax / Heart & O₂',
    titleEs: 'Tórax / Corazón y O₂',
    tagEn: 'THORAX',
    tagEs: 'TÓRAX',
    anchorX: 179,
    anchorY: 128,
    elbowX: 210,
    pinX: 240,
    pinY: 128,
    side: 'right',
  },
  abdomen_fast: {
    titleEn: 'Abdomen / Pelvis FAST',
    titleEs: 'Abdomen / Pelvis FAST',
    tagEn: 'FAST',
    tagEs: 'FAST',
    anchorX: 122,
    anchorY: 180,
    elbowX: 94,
    pinX: 60,
    pinY: 180,
    side: 'left',
  },
  limbs_joints: {
    titleEn: 'Limbs / Venous Return',
    titleEs: 'Extremidades / Retorno',
    tagEn: 'LIMBS',
    tagEs: 'PIERNAS',
    anchorX: 181,
    anchorY: 288,
    elbowX: 210,
    pinX: 240,
    pinY: 288,
    side: 'right',
  },
};

export function EmergencyMiniBodyMap({
  protocolZones,
  selectedZoneId,
  onSelectZone,
  urgency,
}: EmergencyMiniBodyMapProps) {
  const { language } = useMission();
  const isEs = language === 'es';
  const [hoveredZoneId, setHoveredZoneId] = useState<MiniBodyZoneId | null>(null);

  const zoneMap = new Map(protocolZones.map((z, i) => [z.zoneId, { guide: z, index: i + 1 }]));
  const activeEntry = zoneMap.get(selectedZoneId);
  const activeGuide = activeEntry?.guide ?? protocolZones[0];

  const getZoneColors = (zoneId: MiniBodyZoneId) => {
    const isRelevant = zoneMap.has(zoneId);
    const isSelected = selectedZoneId === zoneId;
    const isHovered = hoveredZoneId === zoneId;

    if (isRelevant) {
      if (urgency === 'critical') {
        return {
          fill: isSelected
            ? 'rgba(180, 35, 24, 0.34)'
            : isHovered
              ? 'rgba(180, 35, 24, 0.27)'
              : 'rgba(180, 35, 24, 0.19)',
          softFill: isSelected ? 'rgba(180, 35, 24, 0.18)' : 'rgba(180, 35, 24, 0.10)',
          stroke: '#B42318',
          pinBg: isSelected ? '#B42318' : '#FFFFFF',
          pinText: isSelected ? '#FFFFFF' : '#7A271A',
          status: 'critical' as const,
        };
      }
      return {
        fill: isSelected
          ? 'rgba(181, 71, 8, 0.32)'
          : isHovered
            ? 'rgba(181, 71, 8, 0.25)'
            : 'rgba(181, 71, 8, 0.17)',
        softFill: isSelected ? 'rgba(181, 71, 8, 0.17)' : 'rgba(181, 71, 8, 0.09)',
        stroke: '#B54708',
        pinBg: isSelected ? '#B54708' : '#FFFFFF',
        pinText: isSelected ? '#FFFFFF' : '#7A2E0E',
        status: 'warning' as const,
      };
    }

    return {
      fill: isSelected
        ? 'rgba(47, 93, 70, 0.22)'
        : isHovered
          ? 'rgba(47, 93, 70, 0.14)'
          : 'rgba(47, 93, 70, 0.06)',
      softFill: isSelected ? 'rgba(47, 93, 70, 0.12)' : 'rgba(47, 93, 70, 0.04)',
      stroke: isSelected ? '#2F5D46' : isHovered ? '#4A7C64' : '#9AA59E',
      pinBg: '#FFFFFF',
      pinText: '#55635B',
      status: 'nominal' as const,
    };
  };

  const zoneProps = (zoneId: MiniBodyZoneId) => {
    const colors = getZoneColors(zoneId);
    const meta = ZONE_META[zoneId];
    return {
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `${isEs ? 'Verificar' : 'Inspect'} ${isEs ? meta.titleEs : meta.titleEn}`,
      'aria-pressed': selectedZoneId === zoneId,
      'data-selected': selectedZoneId === zoneId,
      'data-status': colors.status,
      onClick: () => onSelectZone(zoneId),
      onMouseEnter: () => setHoveredZoneId(zoneId),
      onMouseLeave: () => setHoveredZoneId((prev) => (prev === zoneId ? null : prev)),
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
      <div className="relative overflow-hidden rounded-xl border border-outline bg-surface-container-low p-3">
        {/* Subtle Clinical Calibration Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(to right, #E6E2D8 1px, transparent 1px), linear-gradient(to bottom, #E6E2D8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10 flex items-center justify-between pb-1.5 text-[10px] font-mono font-semibold text-on-surface-variant">
          <span>{isEs ? 'EXPLORACIÓN DIRIGIDA' : 'TARGETED SCAN'}</span>
          <span>
            {protocolZones.length} {isEs ? 'ZONAS CLAVE' : 'KEY ZONES'}
          </span>
        </div>

        {/* Sculpted Anatomical Scanner SVG */}
        <div className="relative z-10 mx-auto w-full max-w-[256px]">
          <svg
            viewBox="-8 4 316 420"
            className="h-auto w-full select-none"
            role="img"
            aria-label={
              isEs
                ? 'Mapa anatómico de verificación clínica rápida'
                : 'Anatomical rapid clinical inspection map'
            }
          >
            {/* Calibration Brackets, Concentric Ring & Anatomical Midline */}
            <g aria-hidden="true">
              <path
                d="M66 20 L66 12 L75 12 M225 12 L234 12 L234 20 M66 406 L66 414 L75 414 M225 414 L234 414 L234 406"
                fill="none"
                stroke="#D8D3C8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle
                cx="150"
                cy="148"
                r="82"
                fill="none"
                stroke="#E6E2D8"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <line
                x1="150"
                y1="12"
                x2="150"
                y2="414"
                stroke="#D8D3C8"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <text
                x="69"
                y="148"
                fill="#55635B"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                opacity="0.55"
              >
                {isEs ? 'D' : 'R'}
              </text>
              <text
                x="227"
                y="148"
                fill="#55635B"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                opacity="0.55"
              >
                {isEs ? 'I' : 'L'}
              </text>
            </g>

            {/* Sculpted Continuous Human Silhouette */}
            <g aria-hidden="true">
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
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Cranium & Ears */}
              <path
                d="M127 42 C123 42, 123 53, 127 54 M173 42 C177 42, 177 53, 173 54"
                fill="#FFFFFF"
                stroke="#D8D3C8"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M 150 22 C 165 22, 173 32, 173 45 C 173 55, 168 63, 160 68 C 155 71, 145 71, 140 68 C 132 63, 127 55, 127 45 C 127 32, 135 22, 150 22 Z"
                fill="#FFFFFF"
                stroke="#D8D3C8"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Subtle Anatomical Surface Landmarks (Clavicles, Rib Arch, Pelvis) */}
              <g fill="none" stroke="#E6E2D8" strokeWidth="1.2" strokeLinecap="round">
                <path d="M146 91 Q127 88 109 98" />
                <path d="M154 91 Q173 88 191 98" />
                <path d="M116 152 Q150 160 184 152" />
                <path d="M114 211 Q150 225 186 211" />
              </g>
            </g>

            {/* ZONE 1: Cranium & Neurological Consciousness */}
            <g {...zoneProps('head')}>
              <circle cx="150" cy="43" r="24" fill="transparent" />
              {selectedZoneId === 'head' && (
                <circle
                  cx="150"
                  cy="42"
                  r="27"
                  fill="none"
                  stroke={headColors.stroke}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="dt-body-reticle"
                />
              )}
              <path
                d="M 149 27 C 139 27, 132 34, 132 43 C 132 50, 137 55, 144 55 C 147 55, 149 53, 149 50 Z"
                fill={headColors.fill}
                stroke={headColors.stroke}
                strokeWidth={selectedZoneId === 'head' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              <path
                d="M 151 27 C 161 27, 168 34, 168 43 C 168 50, 163 55, 156 55 C 153 55, 151 53, 151 50 Z"
                fill={headColors.fill}
                stroke={headColors.stroke}
                strokeWidth={selectedZoneId === 'head' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              <path
                d="M137 37 Q142 34 146 38 M136 45 Q141 42 146 46 M163 37 Q158 34 154 38 M164 45 Q159 42 154 46"
                fill="none"
                stroke={headColors.stroke}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>

            {/* ZONE 2: Airway, Cervical Trachea & Carotid/Pulse */}
            <g {...zoneProps('airway_neck')}>
              <rect x="135" y="65" width="30" height="36" rx="10" fill="transparent" />
              {selectedZoneId === 'airway_neck' && (
                <rect
                  x="136"
                  y="66"
                  width="28"
                  height="34"
                  rx="11"
                  fill="none"
                  stroke={airwayColors.stroke}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="dt-body-reticle"
                />
              )}
              {/* Larynx + Tracheal Column */}
              <path
                d="M144 70 C144 67, 156 67, 156 70 L155 96 L145 96 Z"
                fill={airwayColors.fill}
                stroke={airwayColors.stroke}
                strokeWidth={selectedZoneId === 'airway_neck' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              {/* Tracheal Cartilage Rings + Mainstem Bronchi */}
              <path
                d="M146 75 H154 M146 80 H154 M146 85 H154 M146 90 H154 M150 96 L141 104 M150 96 L159 104"
                fill="none"
                stroke={airwayColors.stroke}
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>

            {/* ZONE 3: Thorax, Lungs, Heart & ECG */}
            <g {...zoneProps('chest_heart')}>
              <rect x="114" y="101" width="72" height="53" rx="16" fill="transparent" />
              {selectedZoneId === 'chest_heart' && (
                <rect
                  x="113"
                  y="101"
                  width="74"
                  height="52"
                  rx="18"
                  fill="none"
                  stroke={chestColors.stroke}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="dt-body-reticle"
                />
              )}
              {/* Right & Left Pulmonary Fields */}
              <path
                d="M 146 107 C 136 104, 123 110, 119 123 C 116 134, 118 147, 126 150 C 134 152, 143 148, 146 142 Z"
                fill={chestColors.softFill}
                stroke={chestColors.stroke}
                strokeWidth={selectedZoneId === 'chest_heart' ? 1.8 : 1.3}
                strokeLinejoin="round"
              />
              <path
                d="M 154 107 C 164 104, 177 110, 181 123 C 184 134, 182 147, 174 150 C 168 152, 160 149, 157 145 Z"
                fill={chestColors.softFill}
                stroke={chestColors.stroke}
                strokeWidth={selectedZoneId === 'chest_heart' ? 1.8 : 1.3}
                strokeLinejoin="round"
              />
              {/* Anatomical Heart Silhouette */}
              <path
                d="M 154 121 C 150 116, 143 119, 144 128 C 145 136, 153 143, 160 145 C 166 142, 169 133, 167 124 C 165 118, 158 118, 154 121 Z"
                fill={chestColors.fill}
                stroke={chestColors.stroke}
                strokeWidth={selectedZoneId === 'chest_heart' ? 2.1 : 1.6}
                strokeLinejoin="round"
              />
              {/* ECG Trace with Halo */}
              <path
                d="M123 132 L135 132 L140 124 L146 140 L152 126 L157 132 L177 132"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
              <path
                d="M123 132 L135 132 L140 124 L146 140 L152 126 L157 132 L177 132"
                fill="none"
                stroke={chestColors.stroke}
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* ZONE 4: Abdomen & Pelvic FAST Ultrasound Windows */}
            <g {...zoneProps('abdomen_fast')}>
              <rect x="115" y="157" width="70" height="54" rx="16" fill="transparent" />
              {selectedZoneId === 'abdomen_fast' && (
                <rect
                  x="114"
                  y="157"
                  width="72"
                  height="52"
                  rx="18"
                  fill="none"
                  stroke={abdomenColors.stroke}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="dt-body-reticle"
                />
              )}
              {/* Anatomical Peritoneal Window Contour */}
              <path
                d="M 122 162 Q 150 167 178 162 C 181 175, 181 190, 177 200 Q 150 212 123 200 C 119 190, 119 175, 122 162 Z"
                fill={abdomenColors.fill}
                stroke={abdomenColors.stroke}
                strokeWidth={selectedZoneId === 'abdomen_fast' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              {/* FAST Quadrant Crosshairs + Acoustic Scan Nodes */}
              <line
                x1="150"
                y1="167"
                x2="150"
                y2="202"
                stroke={abdomenColors.stroke}
                strokeWidth="1.1"
                strokeDasharray="2 3"
              />
              <line
                x1="126"
                y1="183"
                x2="174"
                y2="183"
                stroke={abdomenColors.stroke}
                strokeWidth="1.1"
                strokeDasharray="2 3"
              />
              <circle cx="136" cy="174" r="3" fill="#FFFFFF" stroke={abdomenColors.stroke} strokeWidth="1.4" />
              <circle cx="164" cy="174" r="3" fill="#FFFFFF" stroke={abdomenColors.stroke} strokeWidth="1.4" />
              <circle cx="150" cy="197" r="3.2" fill="#FFFFFF" stroke={abdomenColors.stroke} strokeWidth="1.4" />
            </g>

            {/* ZONE 5: Lower Extremities & Venous Return / Vascular Axis */}
            <g {...zoneProps('limbs_joints')}>
              <rect x="110" y="232" width="80" height="162" rx="16" fill="transparent" />
              {selectedZoneId === 'limbs_joints' && (
                <rect
                  x="110"
                  y="232"
                  width="80"
                  height="160"
                  rx="18"
                  fill="none"
                  stroke={limbsColors.stroke}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  className="dt-body-reticle"
                />
              )}

              {/* Sculpted Right-Patient / Left-Viewer Leg Contour */}
              <path
                d="M 116 240 C 122 236, 134 238, 138 248 L 133 314 C 133 324, 133 358, 130 382 C 128 386, 123 386, 121 382 L 118 338 C 117 318, 114 274, 116 240 Z"
                fill={limbsColors.fill}
                stroke={limbsColors.stroke}
                strokeWidth={selectedZoneId === 'limbs_joints' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              <path
                d="M132 238 L126 254 L125.5 312 M125.5 322 L125.5 382"
                fill="none"
                stroke={limbsColors.stroke}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="125.5" cy="316" r="4" fill="#FFFFFF" stroke={limbsColors.stroke} strokeWidth="1.5" />

              {/* Sculpted Left-Patient / Right-Viewer Leg Contour */}
              <path
                d="M 184 240 C 178 236, 166 238, 162 248 L 167 314 C 167 324, 167 358, 170 382 C 172 386, 177 386, 179 382 L 182 338 C 183 318, 186 274, 184 240 Z"
                fill={limbsColors.fill}
                stroke={limbsColors.stroke}
                strokeWidth={selectedZoneId === 'limbs_joints' ? 2 : 1.4}
                strokeLinejoin="round"
              />
              <path
                d="M168 238 L174 254 L174.5 312 M174.5 322 L174.5 382"
                fill="none"
                stroke={limbsColors.stroke}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="174.5" cy="316" r="4" fill="#FFFFFF" stroke={limbsColors.stroke} strokeWidth="1.5" />
            </g>

            {/* Technical Leader Lines + Clickable Numbered Pins for Active Protocol Targets */}
            {protocolZones.map((zone, idx) => {
              const meta = ZONE_META[zone.zoneId];
              const colors = getZoneColors(zone.zoneId);
              const isSelected = selectedZoneId === zone.zoneId;
              const num = idx + 1;
              const labelX = meta.side === 'right' ? meta.pinX + 12 : meta.pinX - 12;

              return (
                <g
                  key={zone.zoneId}
                  role="button"
                  tabIndex={-1}
                  aria-label={`${num}. ${zone.label}`}
                  onClick={() => onSelectZone(zone.zoneId)}
                  onMouseEnter={() => setHoveredZoneId(zone.zoneId)}
                  onMouseLeave={() =>
                    setHoveredZoneId((prev) => (prev === zone.zoneId ? null : prev))
                  }
                  className="cursor-pointer"
                >
                  <polyline
                    points={`${meta.anchorX},${meta.anchorY} ${meta.elbowX},${meta.pinY} ${meta.pinX},${meta.pinY}`}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 1.8 : 1.15}
                    strokeDasharray={isSelected ? undefined : '2.5 2.5'}
                    opacity={isSelected ? 1 : 0.78}
                  />
                  <circle
                    cx={meta.anchorX}
                    cy={meta.anchorY}
                    r={isSelected ? 3.2 : 2.3}
                    fill={colors.stroke}
                  />
                  <circle
                    cx={meta.pinX}
                    cy={meta.pinY}
                    r={isSelected ? 10.5 : 9}
                    fill={colors.pinBg}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 1.8 : 1.3}
                  />
                  <text
                    x={meta.pinX}
                    y={meta.pinY + 3.5}
                    textAnchor="middle"
                    fill={colors.pinText}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    {num}
                  </text>
                  <text
                    x={labelX}
                    y={meta.pinY + 3}
                    textAnchor={meta.side === 'right' ? 'start' : 'end'}
                    fill={isSelected ? colors.stroke : '#55635B'}
                    fontSize="7.5"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    className="hidden sm:inline"
                  >
                    {isEs ? meta.tagEs : meta.tagEn}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Synchronized Numbered Zone Selector Chips */}
        <div className="relative z-10 mt-2.5 flex flex-wrap gap-1.5">
          {protocolZones.map((zone, idx) => {
            const isSel = selectedZoneId === zone.zoneId;
            return (
              <button
                key={zone.zoneId}
                type="button"
                onClick={() => onSelectZone(zone.zoneId)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                  isSel
                    ? urgency === 'critical'
                      ? 'border-danger bg-danger-container text-on-danger-container'
                      : 'border-warning bg-warning-container text-on-warning-container'
                    : 'border-outline bg-surface-container text-on-surface-variant hover:-translate-y-px hover:border-primary/45 hover:text-on-surface'
                }`}
              >
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    isSel
                      ? urgency === 'critical'
                        ? 'bg-danger text-white'
                        : 'bg-warning text-white'
                      : 'bg-surface-container-low text-on-surface'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{zone.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Clinical Instruction Card */}
      {activeGuide ? (
        <div
          key={activeGuide.zoneId}
          className="dt-animate-panel space-y-1.5 rounded-xl border border-outline bg-surface-container p-3 text-xs"
        >
          <p className="flex items-center gap-1.5 font-bold text-on-surface font-display">
            <AlertTriangle
              className={`h-3.5 w-3.5 shrink-0 ${
                urgency === 'critical' ? 'text-danger' : 'text-warning'
              }`}
              aria-hidden="true"
            />
            <span>
              {activeEntry ? `${activeEntry.index}. ` : ''}
              {activeGuide.label}
            </span>
          </p>
          <p className="leading-relaxed text-on-surface-variant">{activeGuide.checkInstruction}</p>
          <p className="rounded-lg border border-danger/30 bg-danger-container/60 px-2.5 py-1.5 text-[11px] font-medium text-on-danger-container">
            {isEs ? 'Signo crítico:' : 'Critical sign:'} {activeGuide.criticalSign}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-outline bg-surface-container p-3 text-xs text-on-surface-variant">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            {isEs
              ? 'Zona sin afectación primaria; verifica solo si hay dolor o lesión visible.'
              : 'Zone without primary involvement; inspect only if pain or visible trauma is present.'}
          </span>
        </div>
      )}
    </div>
  );
}
