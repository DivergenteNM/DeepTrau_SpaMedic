'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  Info,
  Radiation,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DeviceConnection, useMission } from '@/context/MissionContext';
import { BODY_SYSTEM_GUIDES, MEDICAL_TOOLTIPS, TriageLevel } from '@/data/medicalKnowledge';

function getTriageLabel(status: TriageLevel): string {
  if (status === 'critical') return 'Crítico';
  if (status === 'warning') return 'Precaución';
  return 'Óptimo';
}

function getTriageContainerClasses(status: TriageLevel): string {
  if (status === 'critical') {
    return 'border-danger/40 bg-danger-container text-on-danger-container';
  }
  if (status === 'warning') {
    return 'border-warning/35 bg-warning-container text-on-warning-container';
  }
  return 'border-primary/30 bg-primary-container text-on-primary-container';
}

function getDeviceBadge(device: DeviceConnection | undefined) {
  if (!device || !device.availableInMission) {
    return {
      label: 'No embarcado',
      classes: 'border-outline bg-surface-container-high text-on-surface-variant',
      available: false,
      connected: false,
    };
  }
  if (device.connected) {
    return {
      label: `En vivo · ${device.lastUpdated}`,
      classes: 'border-primary/30 bg-primary-container text-on-primary-container',
      available: true,
      connected: true,
    };
  }
  return {
    label: 'Modo manual (sensor offline)',
    classes: 'border-warning/35 bg-warning-container/70 text-on-warning-container',
    available: true,
    connected: false,
  };
}

export function MissionMonitorTab() {
  const {
    mission,
    astronaut,
    missionDay,
    biomarkers,
    history,
    devices,
    systemStatuses,
    setActiveTab,
    openSosOverlay,
  } = useMission();

  const [inspectedRadDayIdx, setInspectedRadDayIdx] = useState<number | null>(null);
  const [inspectedGlucDayIdx, setInspectedGlucDayIdx] = useState<number | null>(null);
  const [inspectedWbcDayIdx, setInspectedWbcDayIdx] = useState<number | null>(null);

  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';
  const dosimeterDevice = devices.find((d) => d.id === 'dosimeter');
  const glucometerDevice = devices.find((d) => d.id === 'glucometer');
  const hematologyDevice = devices.find((d) => d.id === 'hematology');

  const dosimeterBadge = getDeviceBadge(dosimeterDevice);
  const glucometerBadge = getDeviceBadge(glucometerDevice);
  const hematologyBadge = getDeviceBadge(hematologyDevice);

  // --- Radiation & Mission Survival Calculations ---
  const rawRadPct = Math.round(
    (biomarkers.cumulativeRadiationMsv / Math.max(1, mission.missionLimitMsv)) * 100
  );
  const radBarWidthPct = Math.min(100, Math.max(0, rawRadPct));
  const warningMarkPct = Math.min(
    96,
    Math.max(6, Math.round((mission.warningLimitMsv / Math.max(1, mission.missionLimitMsv)) * 100))
  );
  const survivalMarginPct = Math.max(0, 100 - Math.min(100, rawRadPct));

  const cumulativeRadStatus: TriageLevel =
    biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv
      ? 'critical'
      : biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv
        ? 'warning'
        : 'nominal';

  const dailyRadStatus: TriageLevel =
    biomarkers.dailyRadiationMsv >= 5.0
      ? 'critical'
      : biomarkers.dailyRadiationMsv >= 2.8
        ? 'warning'
        : 'nominal';

  const radStatus: TriageLevel =
    cumulativeRadStatus === 'critical' || dailyRadStatus === 'critical'
      ? 'critical'
      : cumulativeRadStatus === 'warning' || dailyRadStatus === 'warning'
        ? 'warning'
        : 'nominal';

  const remainingMsv = Math.max(0, mission.missionLimitMsv - biomarkers.cumulativeRadiationMsv);
  const excessMsv = Math.max(0, biomarkers.cumulativeRadiationMsv - mission.missionLimitMsv);
  const daysRemainingInMission = Math.max(0, mission.durationDays - missionDay);
  const safeDaysAtCurrentRate =
    biomarkers.dailyRadiationMsv > 0
      ? Math.floor(remainingMsv / biomarkers.dailyRadiationMsv)
      : daysRemainingInMission;
  const projectedEndDoseMsv = Number(
    (biomarkers.cumulativeRadiationMsv + biomarkers.dailyRadiationMsv * daysRemainingInMission).toFixed(
      1
    )
  );

  // --- Glucose Calculations (decoupled from temperature for accurate badge, while surfacing fever/hypothermia if active) ---
  const glucoseStatus: TriageLevel =
    biomarkers.glucoseMgDl < 65 || biomarkers.glucoseMgDl >= 175
      ? 'critical'
      : biomarkers.glucoseMgDl < 75 || biomarkers.glucoseMgDl >= 135
        ? 'warning'
        : 'nominal';

  const tempStatus: TriageLevel =
    biomarkers.bodyTempC <= 35.2 || biomarkers.bodyTempC >= 38.5
      ? 'critical'
      : biomarkers.bodyTempC <= 35.8 || biomarkers.bodyTempC >= 37.8
        ? 'warning'
        : 'nominal';

  const baselineGlucose = astronaut.clinicalHistory.baselineGlucose;
  const glucoseDelta = biomarkers.glucoseMgDl - baselineGlucose;
  const hasLowBaselineEvaRisk =
    baselineGlucose < 85 && (mission.id === 'planetary-habitat' || mission.id === 'surface-rover');

  const glucoseStatusText =
    biomarkers.glucoseMgDl < 65
      ? 'Hipoglucemia Crítica: Riesgo de síncope y fallo cognitivo en EVA/Rover.'
      : biomarkers.glucoseMgDl < 75
        ? 'Glucosa Baja (Precaución): Ingiere 15g de carbohidratos rápidos.'
        : biomarkers.glucoseMgDl >= 175
          ? 'Hiperglucemia Crítica: Hidratar y notificar a médico de vuelo.'
          : biomarkers.glucoseMgDl >= 135
            ? 'Glucosa Elevada: Posible resistencia insulínica por estrés o microgravedad.'
            : hasLowBaselineEvaRisk
              ? 'Glucemia Óptima · Vigilar basal baja (<85 mg/dL) antes de caminatas EVA.'
              : 'Glucemia Óptima: Metabolismo energético estable respecto a tu línea base.';

  // --- Immune / WBC Calculations ---
  const wbcCriticalLimit = isLowImmune ? 3600 : 3200;
  const wbcWarningLimit = isLowImmune ? 4500 : 4100;
  const wbcStatus: TriageLevel =
    biomarkers.wbcCount <= wbcCriticalLimit
      ? 'critical'
      : biomarkers.wbcCount <= wbcWarningLimit
        ? 'warning'
        : 'nominal';

  const immuneDiagnosisText = useMemo(() => {
    if (systemStatuses.immune === 'critical') {
      if (wbcStatus === 'critical' && radStatus === 'critical') {
        return 'Alerta Crítica Combinada: Leucocitos deprimidos junto a límite de radiación superado. Inicia aislamiento preventivo, refugio blindado y monitoreo cada 12h.';
      }
      if (wbcStatus === 'critical') {
        return `Alerta Crítica Hematológica: Conteo de leucocitos bajo umbral crítico (≤${wbcCriticalLimit.toLocaleString('es-ES')} cél/µL). Inicia aislamiento preventivo y repite control en 12h.`;
      }
      return 'Alerta Crítica por Estrés Radiativo: Dosis o tasa solar sobre límite operacional con riesgo de depresión medular e inmune. Mantén refugio blindado y controla leucocitos cada 12h.';
    }
    if (systemStatuses.immune === 'warning') {
      if (wbcStatus !== 'nominal' && radStatus !== 'nominal') {
        return 'Precaución Inmuno-Radiativa: Descenso de glóbulos blancos combinado con dosis elevada de radiación. Refuerza descanso, hidratación y permanencia en módulo blindado.';
      }
      if (wbcStatus !== 'nominal') {
        return `Precaución Inmune: Leucocitos en zona de vigilancia (${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL${isLowImmune ? ', umbral EHR temprano' : ''}). Refuerza descanso nocturno y control en cabina.`;
      }
      return 'Vigilancia Inmune por Radiación: La exposición ionizante acumulada o tasa diaria elevada puede deprimir linfocitos T; limita exposición fuera de zona blindada.';
    }
    return 'Conteo inmunológico y carga radiativa estables dentro del margen seguro para tu historial clínico.';
  }, [
    systemStatuses.immune,
    wbcStatus,
    radStatus,
    wbcCriticalLimit,
    biomarkers.wbcCount,
    isLowImmune,
  ]);

  // --- SVG Chart Geometry (Radiation & Glucose) ---
  const chartW = 620;
  const chartH = 220;
  const padL = 46;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (idx: number) =>
    padL + (history.length <= 1 ? plotW / 2 : (idx / Math.max(1, history.length - 1)) * plotW);

  const maxHistRad = history.reduce((max, pt) => Math.max(max, pt.radiationMsv), 0);
  const maxRadY = Math.max(
    mission.missionLimitMsv + 28,
    biomarkers.cumulativeRadiationMsv + 20,
    maxHistRad + 15
  );
  const toYRad = (val: number) =>
    padT + plotH - (Math.min(maxRadY, Math.max(0, val)) / maxRadY) * plotH;

  const radPath =
    history.length > 0
      ? history
          .map(
            (pt, i) =>
              `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toYRad(pt.radiationMsv).toFixed(1)}`
          )
          .join(' ')
      : '';
  const radArea =
    history.length > 0
      ? `${radPath} L ${toX(history.length - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${toX(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const activeRadIdx =
    inspectedRadDayIdx !== null && history[inspectedRadDayIdx]
      ? inspectedRadDayIdx
      : history.length > 0
        ? history.length - 1
        : null;
  const activeRadPoint = activeRadIdx !== null ? history[activeRadIdx] : null;
  const activeRadPct = activeRadPoint
    ? Math.round((activeRadPoint.radiationMsv / Math.max(1, mission.missionLimitMsv)) * 100)
    : 0;

  // Glucose SVG dynamic bounds so readings up to 210 mg/dL or below 50 mg/dL never clip
  const minHistGluc = history.reduce(
    (min, pt) => Math.min(min, pt.glucoseMgDl),
    biomarkers.glucoseMgDl
  );
  const maxHistGluc = history.reduce(
    (max, pt) => Math.max(max, pt.glucoseMgDl),
    biomarkers.glucoseMgDl
  );
  const minGluc = Math.min(50, Math.floor((minHistGluc - 10) / 10) * 10);
  const maxGluc = Math.max(185, Math.ceil((maxHistGluc + 15) / 10) * 10);
  const toYGluc = (val: number) =>
    padT +
    plotH -
    ((Math.min(maxGluc, Math.max(minGluc, val)) - minGluc) / Math.max(1, maxGluc - minGluc)) *
      plotH;

  const glucoseTicks = useMemo(() => {
    const base = [60, 90, 125, 160];
    if (maxGluc >= 195) base.push(195);
    if (minGluc <= 45) base.unshift(45);
    return base.filter((v) => v >= minGluc && v <= maxGluc);
  }, [minGluc, maxGluc]);

  const glucosePath =
    history.length > 0
      ? history
          .map(
            (pt, i) =>
              `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toYGluc(pt.glucoseMgDl).toFixed(1)}`
          )
          .join(' ')
      : '';

  const activeGlucIdx =
    inspectedGlucDayIdx !== null && history[inspectedGlucDayIdx]
      ? inspectedGlucDayIdx
      : history.length > 0
        ? history.length - 1
        : null;
  const activeGlucPoint = activeGlucIdx !== null ? history[activeGlucIdx] : null;
  const activeGlucDelta = activeGlucPoint ? activeGlucPoint.glucoseMgDl - baselineGlucose : 0;

  // --- WBC Micro-Chart Geometry ---
  const wbcChartW = 420;
  const wbcChartH = 148;
  const wbcPadL = 44;
  const wbcPadR = 14;
  const wbcPadT = 16;
  const wbcPadB = 24;
  const wbcPlotW = wbcChartW - wbcPadL - wbcPadR;
  const wbcPlotH = wbcChartH - wbcPadT - wbcPadB;

  const minHistWbc = history.reduce((min, pt) => Math.min(min, pt.wbcCount), biomarkers.wbcCount);
  const maxHistWbc = history.reduce((max, pt) => Math.max(max, pt.wbcCount), biomarkers.wbcCount);
  const minWbc = Math.min(2600, Math.floor((minHistWbc - 400) / 500) * 500);
  const maxWbc = Math.max(7200, Math.ceil((maxHistWbc + 500) / 500) * 500);

  const toXWbc = (idx: number) =>
    wbcPadL +
    (history.length <= 1 ? wbcPlotW / 2 : (idx / Math.max(1, history.length - 1)) * wbcPlotW);
  const toYWbc = (val: number) =>
    wbcPadT +
    wbcPlotH -
    ((Math.min(maxWbc, Math.max(minWbc, val)) - minWbc) / Math.max(1, maxWbc - minWbc)) *
      wbcPlotH;

  const wbcPath =
    history.length > 0
      ? history
          .map(
            (pt, i) =>
              `${i === 0 ? 'M' : 'L'} ${toXWbc(i).toFixed(1)} ${toYWbc(pt.wbcCount).toFixed(1)}`
          )
          .join(' ')
      : '';

  const activeWbcIdx =
    inspectedWbcDayIdx !== null && history[inspectedWbcDayIdx]
      ? inspectedWbcDayIdx
      : history.length > 0
        ? history.length - 1
        : null;
  const activeWbcPoint = activeWbcIdx !== null ? history[activeWbcIdx] : null;

  const warningRadY = toYRad(mission.warningLimitMsv);
  const criticalRadY = toYRad(mission.missionLimitMsv);
  const radLabelsTooClose = Math.abs(warningRadY - criticalRadY) < 16;

  return (
    <div className="space-y-6">
      {/* Section 1: Cumulative Radiation & Mission Survival */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-outline-variant pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-warning font-display">
                Dosimetría Operacional CSA &amp; Límites NASA HRP
              </p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-display ${getTriageContainerClasses(
                  radStatus
                )}`}
              >
                Estado: {getTriageLabel(radStatus)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-mono ${dosimeterBadge.classes}`}
              >
                Dosímetro: {dosimeterBadge.label}
              </span>
            </div>
            <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
              <Radiation className="h-5 w-5 text-warning" />
              Supervivencia de Misión y Radiación Acumulada (mSv)
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Seguimiento continuo en <span className="font-semibold text-on-surface">{mission.name}</span>{' '}
              (Riesgo {mission.radiationRiskLevel.toLowerCase()} · Día {missionDay}/{mission.durationDays})
              frente al límite seguro ({mission.missionLimitMsv} mSv).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`rounded-xl border px-4 py-2 text-center ${getTriageContainerClasses(
                cumulativeRadStatus
              )}`}
            >
              <span className="block text-[10px] font-medium">Dosis Acumulada</span>
              <span className="font-mono text-lg font-bold">
                {biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv
              </span>
            </div>
            <div
              className={`rounded-xl border px-4 py-2 text-center ${
                dailyRadStatus === 'nominal'
                  ? 'border-telemetry/25 bg-telemetry-container text-on-telemetry-container'
                  : getTriageContainerClasses(dailyRadStatus)
              }`}
            >
              <span className="block text-[10px] font-medium">Tasa Actual</span>
              <span className="font-mono text-lg font-bold">
                {biomarkers.dailyRadiationMsv.toFixed(2)} mSv/d
              </span>
            </div>
            <div
              className={`rounded-xl border px-4 py-2 text-center ${
                radStatus === 'critical' || survivalMarginPct <= 15
                  ? 'border-danger/35 bg-danger-container text-on-danger-container'
                  : radStatus === 'warning' || survivalMarginPct <= 35
                    ? 'border-warning/35 bg-warning-container text-on-warning-container'
                    : 'border-primary/30 bg-primary-container text-on-primary-container'
              }`}
            >
              <span className="block text-[10px] font-medium">Margen de Supervivencia</span>
              <span className="font-mono text-lg font-bold">{survivalMarginPct}%</span>
            </div>
          </div>
        </div>

        {/* Active Radiation Alert Strip when Warning / Critical */}
        {radStatus !== 'nominal' && (
          <div
            className={`dt-animate-panel flex flex-col gap-3 rounded-xl border p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between ${getTriageContainerClasses(
              radStatus
            )}`}
          >
            <div className="flex items-start gap-2.5">
              {radStatus === 'critical' ? (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              )}
              <div>
                <p className="font-bold font-display">
                  {radStatus === 'critical'
                    ? 'Alerta Crítica de Radiación · Protocolo de Refugio Blindado Activo'
                    : 'Precaución Operacional de Radiación · Vigilancia Solar'}
                </p>
                <p className="mt-0.5 leading-relaxed">
                  {radStatus === 'critical'
                    ? 'Suspende salidas EVA de inmediato, trasládate al núcleo blindado con tanques de agua/polietileno y repite lectura de dosímetro + hemograma cada 2–12 h.'
                    : 'Tasa diaria o dosis acumulada sobre el umbral de alerta. Limita operaciones fuera de blindaje y verifica el dosímetro CSA al iniciar turno.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('sensors')}
              className="shrink-0 cursor-pointer rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-[11px] font-bold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Verificar Dosímetro →
            </button>
          </div>
        )}

        {/* Radiation Progress Bar & Survival Projection */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-on-surface font-semibold font-display">
              Consumo del Presupuesto Seguro de Radiación ({rawRadPct}%)
            </span>
            <span className="text-on-surface-variant font-mono">
              Alerta: {mission.warningLimitMsv} mSv · Crítico: {mission.missionLimitMsv} mSv
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className={`h-full rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                radStatus === 'critical'
                  ? 'bg-danger'
                  : radStatus === 'warning'
                    ? 'bg-warning'
                    : 'bg-primary'
              }`}
              style={{ width: `${radBarWidthPct}%` }}
            />
            <span
              aria-hidden="true"
              title={`Umbral de alerta: ${mission.warningLimitMsv} mSv`}
              className="absolute top-0 bottom-0 w-0.5 bg-on-surface/45"
              style={{ left: `${warningMarkPct}%` }}
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                {excessMsv > 0 ? 'Exceso sobre Límite' : 'Presupuesto Restante'}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  excessMsv > 0 ? 'text-danger' : 'text-on-surface'
                }`}
              >
                {excessMsv > 0
                  ? `+${excessMsv.toFixed(1)} mSv excedidos`
                  : `${remainingMsv.toFixed(1)} mSv disponibles`}
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                Autonomía Segura al Ritmo Actual
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  excessMsv > 0
                    ? 'text-danger'
                    : safeDaysAtCurrentRate < daysRemainingInMission
                      ? 'text-warning'
                      : 'text-primary'
                }`}
              >
                {excessMsv > 0
                  ? '0 días (refugio requerido)'
                  : `${safeDaysAtCurrentRate} días vs ${daysRemainingInMission}d restantes`}
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                Proyección Fin de Misión (Día {mission.durationDays})
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  projectedEndDoseMsv >= mission.missionLimitMsv
                    ? 'text-danger'
                    : projectedEndDoseMsv >= mission.warningLimitMsv
                      ? 'text-warning'
                      : 'text-primary'
                }`}
              >
                ~{projectedEndDoseMsv} mSv estimados
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Radiation Survival SVG Chart */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-on-surface-variant">
              Haz clic o pasa el cursor sobre cualquier día para inspeccionar la dosis acumulada.
            </span>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="inline-flex items-center gap-1.5 text-warning">
                <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Dosis (mSv)
              </span>
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                <span className="h-0.5 w-3 border-t-2 border-dashed border-warning" /> Alerta (
                {mission.warningLimitMsv})
              </span>
              <span className="inline-flex items-center gap-1.5 text-danger">
                <span className="h-0.5 w-3 border-t-2 border-dashed border-danger" /> Límite (
                {mission.missionLimitMsv})
              </span>
            </div>
          </div>

          {activeRadPoint && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2 text-xs">
              <span className="font-mono font-bold text-on-surface">
                Inspección Día {activeRadPoint.day}
              </span>
              <div className="flex flex-wrap items-center gap-3 font-mono">
                <span className="font-semibold text-warning">
                  Acumulado: {activeRadPoint.radiationMsv.toFixed(1)} mSv
                </span>
                <span className="text-on-surface-variant">
                  Uso límite: {activeRadPct}%
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${getTriageContainerClasses(
                    activeRadPoint.radiationMsv >= mission.missionLimitMsv
                      ? 'critical'
                      : activeRadPoint.radiationMsv >= mission.warningLimitMsv
                        ? 'warning'
                        : 'nominal'
                  )}`}
                >
                  {activeRadPoint.radiationMsv >= mission.missionLimitMsv
                    ? 'Sobre Límite'
                    : activeRadPoint.radiationMsv >= mission.warningLimitMsv
                      ? 'Sobre Alerta'
                      : 'Dentro de Margen'}
                </span>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[460px] h-56"
              role="img"
              aria-label="Gráfica interactiva de radiación acumulada en milisieverts"
            >
              <defs>
                <linearGradient id="radAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B54708" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#B54708" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0, Math.round(maxRadY * 0.33), Math.round(maxRadY * 0.66), Math.round(maxRadY)].map(
                (v, idx) => {
                  const y = toYRad(v);
                  return (
                    <g key={`${v}-${idx}`}>
                      <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#E6E2D8" />
                      <text
                        x={4}
                        y={y + 4}
                        fill="#55635B"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {v}
                      </text>
                    </g>
                  );
                }
              )}

              <line
                x1={padL}
                y1={criticalRadY}
                x2={chartW - padR}
                y2={criticalRadY}
                stroke="#B42318"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={chartW - padR - 4}
                y={criticalRadY - 5}
                textAnchor="end"
                fill="#B42318"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                Límite Crítico ({mission.missionLimitMsv} mSv)
              </text>

              <line
                x1={padL}
                y1={warningRadY}
                x2={chartW - padR}
                y2={warningRadY}
                stroke="#B54708"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={chartW - padR - 4}
                y={radLabelsTooClose ? warningRadY + 12 : warningRadY - 5}
                textAnchor="end"
                fill="#B54708"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                Alerta ({mission.warningLimitMsv} mSv)
              </text>

              {radArea && <path d={radArea} fill="url(#radAreaGrad)" />}
              {radPath && <path d={radPath} fill="none" stroke="#B54708" strokeWidth="2.5" />}

              {history.map((pt, i) => {
                const x = toX(i);
                const cy = toYRad(pt.radiationMsv);
                const isSelected = activeRadIdx === i;
                const ptColor =
                  pt.radiationMsv >= mission.missionLimitMsv ? '#B42318' : '#B54708';
                return (
                  <g
                    key={`${pt.day}-${i}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspeccionar Día ${pt.day}: ${pt.radiationMsv.toFixed(1)} mSv acumulados`}
                    onMouseEnter={() => setInspectedRadDayIdx(i)}
                    onClick={() => setInspectedRadDayIdx(i)}
                    onFocus={() => setInspectedRadDayIdx(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setInspectedRadDayIdx(i);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <rect x={x - 16} y={padT} width={32} height={plotH} fill="transparent" />
                    {isSelected && (
                      <line
                        x1={x}
                        y1={padT}
                        x2={x}
                        y2={padT + plotH}
                        stroke="#B54708"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.55"
                      />
                    )}
                    <circle cx={x} cy={cy} r={isSelected ? '5.2' : '3.5'} fill={ptColor} />
                    <text
                      x={x}
                      y={chartH - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#1A241E' : '#55635B'}
                      fontWeight={isSelected ? '700' : '400'}
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                    >
                      D{pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Shielding Protocol Info */}
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
            <p className="font-bold text-primary flex items-center gap-1.5 font-display">
              <Info className="h-4 w-4" />
              ¿Por qué importa la radiación (mSv)?
            </p>
            <p className="leading-relaxed text-on-surface-variant">
              {MEDICAL_TOOLTIPS.radiation.why}
            </p>
            <p className="text-[11px] text-on-surface font-medium">
              Entorno actual: {mission.cabinEnvironment}.
            </p>
          </div>
          <div
            className={`rounded-xl border p-3.5 space-y-1.5 ${
              radStatus === 'critical'
                ? 'border-danger/40 bg-danger-container text-on-danger-container'
                : radStatus === 'warning'
                  ? 'border-warning/35 bg-warning-container text-on-warning-container'
                  : 'border-outline bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <p
              className={`font-bold flex items-center gap-1.5 font-display ${
                radStatus === 'critical'
                  ? 'text-on-danger-container'
                  : radStatus === 'warning'
                    ? 'text-on-warning-container'
                    : 'text-on-surface'
              }`}
            >
              {radStatus === 'critical' ? (
                <ShieldAlert className="h-4 w-4 text-danger" />
              ) : radStatus === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-primary" />
              )}
              Protocolo de Blindaje y Tormenta Solar
            </p>
            <p className="leading-relaxed">
              {radStatus === 'critical'
                ? '¡ALERTA CRÍTICA! Suspende caminatas EVA, trasládate al núcleo blindado con tanques de agua/polietileno y repite dosimetría cada 2 horas.'
                : radStatus === 'warning'
                  ? '¡PRECAUCIÓN ACTIVA! Evita exposición innecesaria fuera del módulo blindado, mantén ruta directa al refugio solar y registra el dosímetro CSA.'
                  : MEDICAL_TOOLTIPS.radiation.how}
            </p>
            {!dosimeterBadge.connected && (
              <p className="text-[11px] font-semibold">
                Dosímetro en modo manual: registra el tiempo fuera de blindaje y verifica avisos de
                clima espacial.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Blood Glucose (mg/dL) & Immune Defense Cross-Analysis */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                  <Droplets className="h-5 w-5 text-telemetry" />
                  Panel Detallado de Glucosa en Sangre (mg/dL)
                </h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-mono ${glucometerBadge.classes}`}
                >
                  {glucometerBadge.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Comparado contra tu línea base pre-misión ({baselineGlucose} mg/dL).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {tempStatus !== 'nominal' && (
                <span
                  className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold ${getTriageContainerClasses(
                    tempStatus
                  )}`}
                >
                  Temp: {biomarkers.bodyTempC.toFixed(1)} °C
                </span>
              )}
              <span
                className={`rounded-full border px-3 py-1 font-mono text-sm font-bold ${getTriageContainerClasses(
                  glucoseStatus
                )}`}
              >
                {biomarkers.glucoseMgDl} mg/dL
              </span>
            </div>
          </div>

          {/* Personal Baseline vs Live Telemetry Comparison */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
              <span className="text-[10px] text-on-surface-variant block">Línea Base EHR</span>
              <span className="mt-0.5 block font-mono text-sm font-bold text-on-surface">
                {baselineGlucose} mg/dL
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
              <span className="text-[10px] text-on-surface-variant block">Desviación vs Base</span>
              <span
                className={`mt-0.5 block font-mono text-sm font-bold ${
                  glucoseStatus === 'critical'
                    ? 'text-danger'
                    : glucoseStatus === 'warning'
                      ? 'text-warning'
                      : 'text-primary'
                }`}
              >
                {glucoseDelta >= 0 ? `+${glucoseDelta}` : glucoseDelta} mg/dL
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
              <span className="text-[10px] text-on-surface-variant block">Corredor Óptimo</span>
              <span className="mt-0.5 block font-mono text-sm font-bold text-primary">
                75 – 125
              </span>
            </div>
          </div>

          {/* Glucose Chart Legend & Day Inspection */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-on-surface-variant">
                Haz clic o pasa el cursor para inspeccionar cada medición:
              </span>
              <div className="flex flex-wrap items-center gap-3 font-semibold">
                <span className="inline-flex items-center gap-1.5 text-telemetry">
                  <span className="h-2.5 w-2.5 rounded-full bg-telemetry" /> Glucosa
                </span>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-primary" /> Base (
                  {baselineGlucose})
                </span>
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary/20 border border-primary/40" />{' '}
                  Zona 75–125
                </span>
              </div>
            </div>

            {activeGlucPoint && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5 text-xs">
                <span className="font-mono font-bold text-on-surface">
                  Inspección Día {activeGlucPoint.day}
                </span>
                <div className="flex flex-wrap items-center gap-3 font-mono">
                  <span className="font-semibold text-telemetry">
                    {activeGlucPoint.glucoseMgDl} mg/dL
                  </span>
                  <span className="text-on-surface-variant">
                    {activeGlucDelta >= 0 ? `+${activeGlucDelta}` : activeGlucDelta} vs base
                  </span>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full min-w-[440px] h-52"
                role="img"
                aria-label="Gráfica histórica interactiva de glucosa capilar"
              >
                {/* Safe Corridor 75 - 125 mg/dL */}
                <rect
                  x={padL}
                  y={toYGluc(125)}
                  width={plotW}
                  height={Math.max(0, toYGluc(75) - toYGluc(125))}
                  fill="rgba(47, 93, 70, 0.12)"
                />

                {glucoseTicks.map((v) => {
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
                      <text
                        x={4}
                        y={y + 4}
                        fill="#55635B"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Hyperglycemia Critical Reference (175 mg/dL) */}
                {maxGluc >= 175 && (
                  <>
                    <line
                      x1={padL}
                      y1={toYGluc(175)}
                      x2={chartW - padR}
                      y2={toYGluc(175)}
                      stroke="#B42318"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.55"
                    />
                    <text
                      x={chartW - padR - 4}
                      y={toYGluc(175) - 4}
                      textAnchor="end"
                      fill="#B42318"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                    >
                      Crítico ≥175 mg/dL
                    </text>
                  </>
                )}

                {/* Hypoglycemia Critical Reference (65 mg/dL) */}
                <line
                  x1={padL}
                  y1={toYGluc(65)}
                  x2={chartW - padR}
                  y2={toYGluc(65)}
                  stroke="#B42318"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.55"
                />
                <text
                  x={chartW - padR - 4}
                  y={toYGluc(65) + 11}
                  textAnchor="end"
                  fill="#B42318"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  Crítico &lt;65 mg/dL
                </text>

                {/* Personal Baseline Reference */}
                <line
                  x1={padL}
                  y1={toYGluc(baselineGlucose)}
                  x2={chartW - padR}
                  y2={toYGluc(baselineGlucose)}
                  stroke="#2F5D46"
                  strokeWidth="1.25"
                  strokeDasharray="3 3"
                />

                {glucosePath && (
                  <path d={glucosePath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />
                )}

                {history.map((pt, i) => {
                  const x = toX(i);
                  const cy = toYGluc(pt.glucoseMgDl);
                  const isSelected = activeGlucIdx === i;
                  const ptCritical = pt.glucoseMgDl < 65 || pt.glucoseMgDl >= 175;
                  const ptWarning = !ptCritical && (pt.glucoseMgDl < 75 || pt.glucoseMgDl >= 135);
                  const ptColor = ptCritical ? '#B42318' : ptWarning ? '#B54708' : '#2B5B6C';

                  return (
                    <g
                      key={`${pt.day}-${i}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspeccionar Día ${pt.day}: Glucosa ${pt.glucoseMgDl} mg/dL`}
                      onMouseEnter={() => setInspectedGlucDayIdx(i)}
                      onClick={() => setInspectedGlucDayIdx(i)}
                      onFocus={() => setInspectedGlucDayIdx(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setInspectedGlucDayIdx(i);
                        }
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      <rect x={x - 16} y={padT} width={32} height={plotH} fill="transparent" />
                      {isSelected && (
                        <line
                          x1={x}
                          y1={padT}
                          x2={x}
                          y2={padT + plotH}
                          stroke="#2B5B6C"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          opacity="0.55"
                        />
                      )}
                      <circle cx={x} cy={cy} r={isSelected ? '5.2' : '3.5'} fill={ptColor} />
                      <text
                        x={x}
                        y={chartH - 8}
                        textAnchor="middle"
                        fill={isSelected ? '#1A241E' : '#55635B'}
                        fontWeight={isSelected ? '700' : '400'}
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                      >
                        D{pt.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3.5 text-xs space-y-2 ${
              glucoseStatus === 'critical'
                ? 'border-danger/40 bg-danger-container text-on-danger-container'
                : glucoseStatus === 'warning'
                  ? 'border-warning/35 bg-warning-container text-on-warning-container'
                  : 'border-outline bg-surface-container-low text-on-surface'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold font-display flex items-center gap-1.5">
                {glucoseStatus === 'critical' ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-danger" />
                ) : glucoseStatus === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span>{glucoseStatusText}</span>
              </p>
            </div>
            <p
              className={
                glucoseStatus === 'nominal' ? 'text-on-surface-variant' : 'opacity-90'
              }
            >
              {glucoseStatus === 'critical'
                ? BODY_SYSTEM_GUIDES.metabolic.criticalAction
                : glucoseStatus === 'warning'
                  ? BODY_SYSTEM_GUIDES.metabolic.warningAction
                  : `${MEDICAL_TOOLTIPS.glucose.how} ${MEDICAL_TOOLTIPS.glucose.why}`}
            </p>

            {glucoseStatus === 'critical' && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    openSosOverlay(
                      biomarkers.glucoseMgDl < 65 ? 'syncope' : 'metabolic_thermal_shock'
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-[11px] font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-danger-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <AlertOctagon className="h-3.5 w-3.5" />
                  <span>Abrir Protocolo SOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sensors')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-danger/35 bg-surface-container px-3 py-1.5 text-[11px] font-semibold text-on-danger-container font-display dt-transition hover:-translate-y-px hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Validar en Glucómetro</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Immune Defense & Clinical Cross-Reference */}
        <div className="lg:col-span-5 rounded-2xl border border-outline bg-surface-container p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant pb-3">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                  <Activity className="h-5 w-5 text-danger" />
                  Inmunidad y Sangre
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Cruce de leucocitos con expediente médico ({astronaut.bloodType}).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-semibold ${hematologyBadge.classes}`}
                >
                  {hematologyBadge.available
                    ? hematologyBadge.connected
                      ? 'Analizador: En vivo'
                      : 'Modo manual'
                    : 'No embarcado'}
                </span>
                <span className="rounded-lg border border-danger/30 bg-danger-container px-2.5 py-1 font-bold text-xs text-on-danger-container font-mono">
                  Sangre {astronaut.bloodType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-outline bg-surface-container-low p-3">
                <span className="text-on-surface-variant block">Leucocitos Actuales</span>
                <span
                  className={`mt-1 block font-mono text-lg font-bold ${
                    wbcStatus === 'critical'
                      ? 'text-danger'
                      : wbcStatus === 'warning'
                        ? 'text-warning'
                        : 'text-on-surface'
                  }`}
                >
                  {biomarkers.wbcCount.toLocaleString('es-ES')}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  células/µL · {getTriageLabel(wbcStatus)}
                </span>
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
                <span className="text-[10px] text-on-surface-variant font-mono block mt-0.5">
                  Alerta ≤{wbcWarningLimit.toLocaleString('es-ES')} · Crítico ≤
                  {wbcCriticalLimit.toLocaleString('es-ES')}
                </span>
              </div>
            </div>

            {/* Historical WBC Trend Micro-Chart (uses history[].wbcCount) */}
            <div className="rounded-xl border border-outline bg-surface-container-low p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <span className="font-semibold text-on-surface font-display">
                  Tendencia de Leucocitos (cél/µL)
                </span>
                {activeWbcPoint && (
                  <span className="font-mono font-bold text-telemetry">
                    Día {activeWbcPoint.day}: {activeWbcPoint.wbcCount.toLocaleString('es-ES')}/µL
                  </span>
                )}
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${wbcChartW} ${wbcChartH}`}
                  className="w-full min-w-[300px] h-36"
                  role="img"
                  aria-label="Gráfica de tendencia de leucocitos por día"
                >
                  {/* Warning & Critical threshold reference lines */}
                  <line
                    x1={wbcPadL}
                    y1={toYWbc(wbcWarningLimit)}
                    x2={wbcChartW - wbcPadR}
                    y2={toYWbc(wbcWarningLimit)}
                    stroke="#B54708"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={wbcPadL}
                    y1={toYWbc(wbcCriticalLimit)}
                    x2={wbcChartW - wbcPadR}
                    y2={toYWbc(wbcCriticalLimit)}
                    stroke="#B42318"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {[minWbc, Math.round((minWbc + maxWbc) / 2), maxWbc].map((v, idx) => {
                    const y = toYWbc(v);
                    return (
                      <g key={`${v}-${idx}`}>
                        <line
                          x1={wbcPadL}
                          y1={y}
                          x2={wbcChartW - wbcPadR}
                          y2={y}
                          stroke="#E6E2D8"
                        />
                        <text
                          x={2}
                          y={y + 3}
                          fill="#55635B"
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                        >
                          {v.toLocaleString('es-ES')}
                        </text>
                      </g>
                    );
                  })}

                  {wbcPath && (
                    <path d={wbcPath} fill="none" stroke="#2B5B6C" strokeWidth="2.2" />
                  )}

                  {history.map((pt, i) => {
                    const x = toXWbc(i);
                    const cy = toYWbc(pt.wbcCount);
                    const isSelected = activeWbcIdx === i;
                    const ptColor =
                      pt.wbcCount <= wbcCriticalLimit
                        ? '#B42318'
                        : pt.wbcCount <= wbcWarningLimit
                          ? '#B54708'
                          : '#2F5D46';
                    return (
                      <g
                        key={`${pt.day}-${i}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspeccionar Día ${pt.day}: ${pt.wbcCount.toLocaleString('es-ES')} leucocitos por µL`}
                        onMouseEnter={() => setInspectedWbcDayIdx(i)}
                        onClick={() => setInspectedWbcDayIdx(i)}
                        onFocus={() => setInspectedWbcDayIdx(i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setInspectedWbcDayIdx(i);
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        <rect
                          x={x - 14}
                          y={wbcPadT}
                          width={28}
                          height={wbcPlotH}
                          fill="transparent"
                        />
                        {isSelected && (
                          <line
                            x1={x}
                            y1={wbcPadT}
                            x2={x}
                            y2={wbcPadT + wbcPlotH}
                            stroke="#2B5B6C"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.5"
                          />
                        )}
                        <circle cx={x} cy={cy} r={isSelected ? '4.5' : '3'} fill={ptColor} />
                        <text
                          x={x}
                          y={wbcChartH - 6}
                          textAnchor="middle"
                          fill={isSelected ? '#1A241E' : '#55635B'}
                          fontWeight={isSelected ? '700' : '400'}
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                        >
                          D{pt.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div
              className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${getTriageContainerClasses(
                systemStatuses.immune
              )}`}
            >
              <p className="font-bold flex items-center gap-1.5 font-display">
                {systemStatuses.immune === 'critical' ? (
                  <ShieldAlert className="h-4 w-4 text-danger" />
                ) : systemStatuses.immune === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                )}
                Diagnóstico Inmunitario Autónomo
              </p>
              <p className="leading-relaxed">{immuneDiagnosisText}</p>
              {!hematologyBadge.available && (
                <p className="text-[11px] font-medium pt-0.5">
                  Nota de cabina ({mission.shortName}): {hematologyDevice?.unavailableReason}.
                  Aplica control manual de síntomas y ganglios.
                </p>
              )}
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
            className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            {hematologyBadge.available
              ? 'Simular Nueva Muestra de Sangre / Dosimetría →'
              : 'Ir al Hub de Sensores (Dosimetría y Glucosa) →'}
          </button>
        </div>
      </section>
    </div>
  );
}
