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
import { isLowImmuneStatus } from '@/data/astronautsData';
import { getBodySystemGuides, getMedicalTooltips, TriageLevel } from '@/data/medicalKnowledge';
import { formatNumberLocale, Language } from '@/i18n/types';

function getTriageLabel(status: TriageLevel, lang: Language): string {
  const isEs = lang === 'es';
  if (status === 'critical') return isEs ? 'Crítico' : 'Critical';
  if (status === 'warning') return isEs ? 'Precaución' : 'Caution';
  return isEs ? 'Óptimo' : 'Optimal';
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

function getDeviceBadge(device: DeviceConnection | undefined, lang: Language) {
  const isEs = lang === 'es';
  if (!device || !device.availableInMission) {
    return {
      label: isEs ? 'No embarcado' : 'Not onboard',
      classes: 'border-outline bg-surface-container-high text-on-surface-variant',
      available: false,
      connected: false,
    };
  }
  if (device.connected) {
    return {
      label: `${isEs ? 'En vivo' : 'Live'} · ${device.lastUpdated}`,
      classes: 'border-primary/30 bg-primary-container text-on-primary-container',
      available: true,
      connected: true,
    };
  }
  return {
    label: isEs ? 'Modo manual (sensor offline)' : 'Manual mode (sensor offline)',
    classes: 'border-warning/35 bg-warning-container/70 text-on-warning-container',
    available: true,
    connected: false,
  };
}

export function MissionMonitorTab() {
  const {
    language,
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

  const isEs = language === 'es';
  const bodySystemGuides = useMemo(() => getBodySystemGuides(language), [language]);
  const medicalTooltips = useMemo(() => getMedicalTooltips(language), [language]);

  const [inspectedRadDayIdx, setInspectedRadDayIdx] = useState<number | null>(null);
  const [inspectedGlucDayIdx, setInspectedGlucDayIdx] = useState<number | null>(null);
  const [inspectedWbcDayIdx, setInspectedWbcDayIdx] = useState<number | null>(null);

  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
  const dosimeterDevice = devices.find((d) => d.id === 'dosimeter');
  const glucometerDevice = devices.find((d) => d.id === 'glucometer');
  const hematologyDevice = devices.find((d) => d.id === 'hematology');

  const dosimeterBadge = getDeviceBadge(dosimeterDevice, language);
  const glucometerBadge = getDeviceBadge(glucometerDevice, language);
  const hematologyBadge = getDeviceBadge(hematologyDevice, language);

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
      ? isEs
        ? 'Hipoglucemia Crítica: Riesgo de síncope y fallo cognitivo en EVA/Rover.'
        : 'Critical Hypoglycemia: Risk of syncope and cognitive impairment in EVA/Rover.'
      : biomarkers.glucoseMgDl < 75
        ? isEs
          ? 'Glucosa Baja (Precaución): Ingiere 15g de carbohidratos rápidos.'
          : 'Low Glucose (Caution): Ingest 15g of fast-acting carbohydrates.'
        : biomarkers.glucoseMgDl >= 175
          ? isEs
            ? 'Hiperglucemia Crítica: Hidratar y notificar a médico de vuelo.'
            : 'Critical Hyperglycemia: Hydrate and notify flight surgeon.'
          : biomarkers.glucoseMgDl >= 135
            ? isEs
              ? 'Glucosa Elevada: Posible resistencia insulínica por estrés o microgravedad.'
              : 'Elevated Glucose: Possible stress- or microgravity-induced insulin resistance.'
            : hasLowBaselineEvaRisk
              ? isEs
                ? 'Glucemia Óptima · Vigilar basal baja (<85 mg/dL) antes de caminatas EVA.'
                : 'Optimal Glycemia · Monitor low baseline (<85 mg/dL) before EVAs.'
              : isEs
                ? 'Glucemia Óptima: Metabolismo energético estable respecto a tu línea base.'
                : 'Optimal Glycemia: Energy metabolism stable relative to your baseline.';

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
        return isEs
          ? 'Alerta Crítica Combinada: Leucocitos deprimidos junto a límite de radiación superado. Inicia aislamiento preventivo, refugio blindado y monitoreo cada 12h.'
          : 'Combined Critical Alert: Depressed leukocytes alongside exceeded radiation limit. Initiate preventive isolation, storm shelter, and 12h monitoring.';
      }
      if (wbcStatus === 'critical') {
        return isEs
          ? `Alerta Crítica Hematológica: Conteo de leucocitos bajo umbral crítico (≤${formatNumberLocale(wbcCriticalLimit, language)} cél/µL). Inicia aislamiento preventivo y repite control en 12h.`
          : `Critical Hematologic Alert: Leukocyte count below critical threshold (≤${formatNumberLocale(wbcCriticalLimit, language)} cells/µL). Initiate preventive isolation and recheck in 12h.`;
      }
      return isEs
        ? 'Alerta Crítica por Estrés Radiativo: Dosis o tasa solar sobre límite operacional con riesgo de depresión medular e inmune. Mantén refugio blindado y controla leucocitos cada 12h.'
        : 'Critical Radiation Stress Alert: Dose or solar rate above operational limit with risk of marrow and immune suppression. Remain in shielded shelter and monitor WBC every 12h.';
    }
    if (systemStatuses.immune === 'warning') {
      if (wbcStatus !== 'nominal' && radStatus !== 'nominal') {
        return isEs
          ? 'Precaución Inmuno-Radiativa: Descenso de glóbulos blancos combinado con dosis elevada de radiación. Refuerza descanso, hidratación y permanencia en módulo blindado.'
          : 'Immuno-Radiation Caution: White cell decline paired with elevated radiation dose. Reinforce rest, hydration, and stay inside shielded core.';
      }
      if (wbcStatus !== 'nominal') {
        return isEs
          ? `Precaución Inmune: Leucocitos en zona de vigilancia (${formatNumberLocale(biomarkers.wbcCount, language)} cél/µL${isLowImmune ? ', umbral EHR temprano' : ''}). Refuerza descanso nocturno y control en cabina.`
          : `Immune Caution: Leukocytes in watch range (${formatNumberLocale(biomarkers.wbcCount, language)} cells/µL${isLowImmune ? ', early EHR threshold' : ''}). Prioritize sleep and cabin follow-up.`;
      }
      return isEs
        ? 'Vigilancia Inmune por Radiación: La exposición ionizante acumulada o tasa diaria elevada puede deprimir linfocitos T; limita exposición fuera de zona blindada.'
        : 'Radiation Immune Watch: Cumulative ionizing exposure or high daily rate can suppress T-lymphocytes; limit time outside shielded core.';
    }
    return isEs
      ? 'Conteo inmunológico y carga radiativa estables dentro del margen seguro para tu historial clínico.'
      : 'Immune count and radiation load stable within safe margins for your clinical profile.';
  }, [
    systemStatuses.immune,
    wbcStatus,
    radStatus,
    wbcCriticalLimit,
    biomarkers.wbcCount,
    isLowImmune,
    isEs,
    language,
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
                {isEs
                  ? 'Dosimetría Operacional CSA & Límites NASA HRP'
                  : 'CSA Operational Dosimetry & NASA HRP Limits'}
              </p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-display ${getTriageContainerClasses(
                  radStatus
                )}`}
              >
                {isEs ? 'Estado:' : 'Status:'} {getTriageLabel(radStatus, language)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-mono ${dosimeterBadge.classes}`}
              >
                {isEs ? 'Dosímetro:' : 'Dosimeter:'} {dosimeterBadge.label}
              </span>
            </div>
            <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
              <Radiation className="h-5 w-5 text-warning" />
              {isEs
                ? 'Supervivencia de Misión y Radiación Acumulada (mSv)'
                : 'Mission Survival & Cumulative Radiation (mSv)'}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {isEs ? (
                <>
                  Seguimiento continuo en{' '}
                  <span className="font-semibold text-on-surface">{mission.name}</span> (Riesgo{' '}
                  {mission.radiationRiskLevel.toLowerCase()} · Día {missionDay}/
                  {mission.durationDays}) frente al límite seguro ({mission.missionLimitMsv} mSv).
                </>
              ) : (
                <>
                  Continuous tracking on{' '}
                  <span className="font-semibold text-on-surface">{mission.name}</span> (
                  {mission.radiationRiskLevel.toLowerCase()} risk · Day {missionDay}/
                  {mission.durationDays}) against the safe dose limit ({mission.missionLimitMsv}{' '}
                  mSv).
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`rounded-xl border px-4 py-2 text-center ${getTriageContainerClasses(
                cumulativeRadStatus
              )}`}
            >
              <span className="block text-[10px] font-medium">
                {isEs ? 'Dosis Acumulada' : 'Cumulative Dose'}
              </span>
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
              <span className="block text-[10px] font-medium">
                {isEs ? 'Tasa Actual' : 'Current Rate'}
              </span>
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
              <span className="block text-[10px] font-medium">
                {isEs ? 'Margen de Supervivencia' : 'Survival Margin'}
              </span>
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
                    ? isEs
                      ? 'Alerta Crítica de Radiación · Protocolo de Refugio Blindado Activo'
                      : 'Critical Radiation Alert · Shielded Storm Shelter Protocol Active'
                    : isEs
                      ? 'Precaución Operacional de Radiación · Vigilancia Solar'
                      : 'Operational Radiation Caution · Solar Weather Watch'}
                </p>
                <p className="mt-0.5 leading-relaxed">
                  {radStatus === 'critical'
                    ? isEs
                      ? 'Suspende salidas EVA de inmediato, trasládate al núcleo blindado con tanques de agua/polietileno y repite lectura de dosímetro + hemograma cada 2–12 h.'
                      : 'Abort EVAs immediately, relocate to shielded core behind water/polyethylene tanks, and repeat dosimeter + CBC readings every 2–12 h.'
                    : isEs
                      ? 'Tasa diaria o dosis acumulada sobre el umbral de alerta. Limita operaciones fuera de blindaje y verifica el dosímetro CSA al iniciar turno.'
                      : 'Daily rate or cumulative dose exceeds alert threshold. Limit unshielded operations and verify the CSA dosimeter at shift start.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('sensors')}
              className="shrink-0 cursor-pointer rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-[11px] font-bold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              {isEs ? 'Verificar Dosímetro →' : 'Verify Dosimeter →'}
            </button>
          </div>
        )}

        {/* Radiation Progress Bar & Survival Projection */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-on-surface font-semibold font-display">
              {isEs
                ? `Consumo del Presupuesto Seguro de Radiación (${rawRadPct}%)`
                : `Safe Radiation Budget Consumed (${rawRadPct}%)`}
            </span>
            <span className="text-on-surface-variant font-mono">
              {isEs ? 'Alerta:' : 'Alert:'} {mission.warningLimitMsv} mSv ·{' '}
              {isEs ? 'Crítico:' : 'Critical:'} {mission.missionLimitMsv} mSv
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
              title={`${isEs ? 'Umbral de alerta:' : 'Alert threshold:'} ${mission.warningLimitMsv} mSv`}
              className="absolute top-0 bottom-0 w-0.5 bg-on-surface/45"
              style={{ left: `${warningMarkPct}%` }}
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                {excessMsv > 0
                  ? isEs
                    ? 'Exceso sobre Límite'
                    : 'Dose Over Limit'
                  : isEs
                    ? 'Presupuesto Restante'
                    : 'Remaining Budget'}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  excessMsv > 0 ? 'text-danger' : 'text-on-surface'
                }`}
              >
                {excessMsv > 0
                  ? `+${excessMsv.toFixed(1)} mSv ${isEs ? 'excedidos' : 'exceeded'}`
                  : `${remainingMsv.toFixed(1)} mSv ${isEs ? 'disponibles' : 'available'}`}
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                {isEs ? 'Autonomía Segura al Ritmo Actual' : 'Safe Autonomy at Current Rate'}
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
                  ? isEs
                    ? '0 días (refugio requerido)'
                    : '0 days (shelter required)'
                  : isEs
                    ? `${safeDaysAtCurrentRate} días vs ${daysRemainingInMission}d restantes`
                    : `${safeDaysAtCurrentRate} days vs ${daysRemainingInMission}d left`}
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low px-3.5 py-2">
              <span className="text-[10px] font-medium text-on-surface-variant block">
                {isEs
                  ? `Proyección Fin de Misión (Día ${mission.durationDays})`
                  : `End-of-Mission Projection (Day ${mission.durationDays})`}
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
                ~{projectedEndDoseMsv} mSv {isEs ? 'estimados' : 'estimated'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Radiation Survival SVG Chart */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-on-surface-variant">
              {isEs
                ? 'Haz clic o pasa el cursor sobre cualquier día para inspeccionar la dosis acumulada.'
                : 'Click or hover over any day to inspect cumulative dose.'}
            </span>
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="inline-flex items-center gap-1.5 text-warning">
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />{' '}
                {isEs ? 'Dosis (mSv)' : 'Dose (mSv)'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                <span className="h-0.5 w-3 border-t-2 border-dashed border-warning" />{' '}
                {isEs ? 'Alerta' : 'Alert'} ({mission.warningLimitMsv})
              </span>
              <span className="inline-flex items-center gap-1.5 text-danger">
                <span className="h-0.5 w-3 border-t-2 border-dashed border-danger" />{' '}
                {isEs ? 'Límite' : 'Limit'} ({mission.missionLimitMsv})
              </span>
            </div>
          </div>

          {activeRadPoint && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2 text-xs">
              <span className="font-mono font-bold text-on-surface">
                {isEs ? 'Inspección Día' : 'Inspecting Day'} {activeRadPoint.day}
              </span>
              <div className="flex flex-wrap items-center gap-3 font-mono">
                <span className="font-semibold text-warning">
                  {isEs ? 'Acumulado:' : 'Cumulative:'} {activeRadPoint.radiationMsv.toFixed(1)} mSv
                </span>
                <span className="text-on-surface-variant">
                  {isEs ? 'Uso límite:' : 'Limit usage:'} {activeRadPct}%
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
                    ? isEs
                      ? 'Sobre Límite'
                      : 'Over Limit'
                    : activeRadPoint.radiationMsv >= mission.warningLimitMsv
                      ? isEs
                        ? 'Sobre Alerta'
                        : 'Above Alert'
                      : isEs
                        ? 'Dentro de Margen'
                        : 'Within Margin'}
                </span>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[460px] h-56"
              role="img"
              aria-label={
                isEs
                  ? 'Gráfica interactiva de radiación acumulada en milisieverts'
                  : 'Interactive cumulative radiation chart in millisieverts'
              }
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
                {isEs ? 'Límite Crítico' : 'Critical Limit'} ({mission.missionLimitMsv} mSv)
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
                {isEs ? 'Alerta' : 'Alert'} ({mission.warningLimitMsv} mSv)
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
                    aria-label={
                      isEs
                        ? `Inspeccionar Día ${pt.day}: ${pt.radiationMsv.toFixed(1)} mSv acumulados`
                        : `Inspect Day ${pt.day}: ${pt.radiationMsv.toFixed(1)} mSv cumulative`
                    }
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
              {isEs ? '¿Por qué importa la radiación (mSv)?' : 'Why does radiation (mSv) matter?'}
            </p>
            <p className="leading-relaxed text-on-surface-variant">
              {medicalTooltips.radiation.why}
            </p>
            <p className="text-[11px] text-on-surface font-medium">
              {isEs ? 'Entorno actual:' : 'Current environment:'} {mission.cabinEnvironment}.
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
              {isEs ? 'Protocolo de Blindaje y Tormenta Solar' : 'Shielding & Solar Storm Protocol'}
            </p>
            <p className="leading-relaxed">
              {radStatus === 'critical'
                ? isEs
                  ? '¡ALERTA CRÍTICA! Suspende caminatas EVA, trasládate al núcleo blindado con tanques de agua/polietileno y repite dosimetría cada 2 horas.'
                  : 'CRITICAL ALERT! Abort EVAs, relocate to the shielded core with water/polyethylene tanks, and repeat dosimetry every 2 hours.'
                : radStatus === 'warning'
                  ? isEs
                    ? '¡PRECAUCIÓN ACTIVA! Evita exposición innecesaria fuera del módulo blindado, mantén ruta directa al refugio solar y registra el dosímetro CSA.'
                    : 'ACTIVE CAUTION! Avoid unnecessary unshielded exposure, maintain a direct path to the storm shelter, and log CSA dosimetry.'
                  : medicalTooltips.radiation.how}
            </p>
            {!dosimeterBadge.connected && (
              <p className="text-[11px] font-semibold">
                {isEs
                  ? 'Dosímetro en modo manual: registra el tiempo fuera de blindaje y verifica avisos de clima espacial.'
                  : 'Dosimeter in manual mode: log unshielded exposure time and monitor space weather alerts.'}
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
                  {isEs
                    ? 'Panel Detallado de Glucosa en Sangre (mg/dL)'
                    : 'Detailed Blood Glucose Panel (mg/dL)'}
                </h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-mono ${glucometerBadge.classes}`}
                >
                  {glucometerBadge.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {isEs
                  ? `Comparado contra tu línea base pre-misión (${baselineGlucose} mg/dL).`
                  : `Compared against pre-mission baseline (${baselineGlucose} mg/dL).`}
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
              <span className="text-[10px] text-on-surface-variant block">
                {isEs ? 'Línea Base EHR' : 'EHR Baseline'}
              </span>
              <span className="mt-0.5 block font-mono text-sm font-bold text-on-surface">
                {baselineGlucose} mg/dL
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
              <span className="text-[10px] text-on-surface-variant block">
                {isEs ? 'Desviación vs Base' : 'Delta vs Baseline'}
              </span>
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
              <span className="text-[10px] text-on-surface-variant block">
                {isEs ? 'Corredor Óptimo' : 'Optimal Corridor'}
              </span>
              <span className="mt-0.5 block font-mono text-sm font-bold text-primary">
                75 – 125
              </span>
            </div>
          </div>

          {/* Glucose Chart Legend & Day Inspection */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-on-surface-variant">
                {isEs
                  ? 'Haz clic o pasa el cursor para inspeccionar cada medición:'
                  : 'Click or hover to inspect each measurement:'}
              </span>
              <div className="flex flex-wrap items-center gap-3 font-semibold">
                <span className="inline-flex items-center gap-1.5 text-telemetry">
                  <span className="h-2.5 w-2.5 rounded-full bg-telemetry" />{' '}
                  {isEs ? 'Glucosa' : 'Glucose'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <span className="h-0.5 w-3 border-t-2 border-dashed border-primary" />{' '}
                  {isEs ? 'Base' : 'Baseline'} ({baselineGlucose})
                </span>
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary/20 border border-primary/40" />{' '}
                  {isEs ? 'Zona 75–125' : 'Zone 75–125'}
                </span>
              </div>
            </div>

            {activeGlucPoint && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5 text-xs">
                <span className="font-mono font-bold text-on-surface">
                  {isEs ? 'Inspección Día' : 'Inspecting Day'} {activeGlucPoint.day}
                </span>
                <div className="flex flex-wrap items-center gap-3 font-mono">
                  <span className="font-semibold text-telemetry">
                    {activeGlucPoint.glucoseMgDl} mg/dL
                  </span>
                  <span className="text-on-surface-variant">
                    {activeGlucDelta >= 0 ? `+${activeGlucDelta}` : activeGlucDelta}{' '}
                    {isEs ? 'vs base' : 'vs baseline'}
                  </span>
                </div>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full min-w-[440px] h-52"
                role="img"
                aria-label={
                  isEs
                    ? 'Gráfica histórica interactiva de glucosa capilar'
                    : 'Interactive capillary blood glucose trajectory chart'
                }
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
                      {isEs ? 'Crítico' : 'Critical'} ≥175 mg/dL
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
                  {isEs ? 'Crítico' : 'Critical'} &lt;65 mg/dL
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
                      aria-label={
                        isEs
                          ? `Inspeccionar Día ${pt.day}: Glucosa ${pt.glucoseMgDl} mg/dL`
                          : `Inspect Day ${pt.day}: Glucose ${pt.glucoseMgDl} mg/dL`
                      }
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
                ? bodySystemGuides.metabolic.criticalAction
                : glucoseStatus === 'warning'
                  ? bodySystemGuides.metabolic.warningAction
                  : `${medicalTooltips.glucose.how} ${medicalTooltips.glucose.why}`}
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
                  <span>{isEs ? 'Abrir Protocolo SOS' : 'Open SOS Protocol'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sensors')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-danger/35 bg-surface-container px-3 py-1.5 text-[11px] font-semibold text-on-danger-container font-display dt-transition hover:-translate-y-px hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{isEs ? 'Validar en Glucómetro' : 'Verify on Glucometer'}</span>
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
                  {isEs ? 'Inmunidad y Sangre' : 'Immunity & Hematology'}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {isEs
                    ? `Cruce de leucocitos con expediente médico (${astronaut.bloodType}).`
                    : `Leukocyte cross-check against medical record (${astronaut.bloodType}).`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-semibold ${hematologyBadge.classes}`}
                >
                  {hematologyBadge.available
                    ? hematologyBadge.connected
                      ? isEs
                        ? 'Analizador: En vivo'
                        : 'Analyzer: Live'
                      : isEs
                        ? 'Modo manual'
                        : 'Manual mode'
                    : isEs
                      ? 'No embarcado'
                      : 'Not onboard'}
                </span>
                <span className="rounded-lg border border-danger/30 bg-danger-container px-2.5 py-1 font-bold text-xs text-on-danger-container font-mono">
                  {isEs ? 'Sangre' : 'Blood'} {astronaut.bloodType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-outline bg-surface-container-low p-3">
                <span className="text-on-surface-variant block">
                  {isEs ? 'Leucocitos Actuales' : 'Current Leukocytes'}
                </span>
                <span
                  className={`mt-1 block font-mono text-lg font-bold ${
                    wbcStatus === 'critical'
                      ? 'text-danger'
                      : wbcStatus === 'warning'
                        ? 'text-warning'
                        : 'text-on-surface'
                  }`}
                >
                  {formatNumberLocale(biomarkers.wbcCount, language)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {isEs ? 'células/µL' : 'cells/µL'} · {getTriageLabel(wbcStatus, language)}
                </span>
              </div>
              <div className="rounded-xl border border-outline bg-surface-container-low p-3">
                <span className="text-on-surface-variant block">
                  {isEs ? 'Condición Pre-Misión' : 'Pre-Mission Status'}
                </span>
                <span
                  className={`mt-1 block text-xs font-bold font-display ${
                    isLowImmune ? 'text-warning' : 'text-primary'
                  }`}
                >
                  {isLowImmune
                    ? isEs
                      ? 'Defensas Bajas'
                      : 'Low Defenses'
                    : isEs
                      ? 'Inmunidad Normal'
                      : 'Normal Immunity'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono block mt-0.5">
                  {isEs ? 'Alerta' : 'Alert'} ≤{formatNumberLocale(wbcWarningLimit, language)} ·{' '}
                  {isEs ? 'Crítico' : 'Crit'} ≤{formatNumberLocale(wbcCriticalLimit, language)}
                </span>
              </div>
            </div>

            {/* Historical WBC Trend Micro-Chart (uses history[].wbcCount) */}
            <div className="rounded-xl border border-outline bg-surface-container-low p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <span className="font-semibold text-on-surface font-display">
                  {isEs ? 'Tendencia de Leucocitos (cél/µL)' : 'Leukocyte Trend (cells/µL)'}
                </span>
                {activeWbcPoint && (
                  <span className="font-mono font-bold text-telemetry">
                    {isEs ? 'Día' : 'Day'} {activeWbcPoint.day}:{' '}
                    {formatNumberLocale(activeWbcPoint.wbcCount, language)}/µL
                  </span>
                )}
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${wbcChartW} ${wbcChartH}`}
                  className="w-full min-w-[300px] h-36"
                  role="img"
                  aria-label={
                    isEs
                      ? 'Gráfica de tendencia de leucocitos por día'
                      : 'Daily leukocyte trend chart'
                  }
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
                          {formatNumberLocale(v, language)}
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
                        aria-label={
                          isEs
                            ? `Inspeccionar Día ${pt.day}: ${formatNumberLocale(pt.wbcCount, language)} leucocitos por µL`
                            : `Inspect Day ${pt.day}: ${formatNumberLocale(pt.wbcCount, language)} leukocytes per µL`
                        }
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
                {isEs ? 'Diagnóstico Inmunitario Autónomo' : 'Autonomous Immune Assessment'}
              </p>
              <p className="leading-relaxed">{immuneDiagnosisText}</p>
              {!hematologyBadge.available && (
                <p className="text-[11px] font-medium pt-0.5">
                  {isEs
                    ? `Nota de cabina (${mission.shortName}): ${hematologyDevice?.unavailableReason}. Aplica control manual de síntomas y ganglios.`
                    : `Cabin note (${mission.shortName}): ${hematologyDevice?.unavailableReason}. Apply manual symptom and lymph node checks.`}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 text-xs">
              <p className="font-semibold text-primary flex items-center gap-1.5 font-display">
                <Sparkles className="h-3.5 w-3.5" />
                {isEs ? '¿Por qué importa en el espacio?' : 'Why does this matter in space?'}
              </p>
              <p className="mt-1 text-on-surface-variant leading-relaxed">
                {medicalTooltips.immune.why}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('sensors')}
            className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            {hematologyBadge.available
              ? isEs
                ? 'Simular Nueva Muestra de Sangre / Dosimetría →'
                : 'Simulate New Blood Sample / Dosimetry →'
              : isEs
                ? 'Ir al Hub de Sensores (Dosimetría y Glucosa) →'
                : 'Open Sensor Hub (Dosimetry & Glucose) →'}
          </button>
        </div>
      </section>
    </div>
  );
}
