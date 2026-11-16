'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bone,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Info,
  Pause,
  Pill,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import {
  isMildMuscleAtrophy,
  useMission,
} from '@/context/MissionContext';
import { hasPriorSurgeries } from '@/data/astronautsData';
import { getBodySystemGuides, getMedicalTooltips } from '@/data/medicalKnowledge';
import { isDailyFrequency, isHighImpactLoad } from '@/data/missionsData';

type ExerciseFilter = 'all' | 'daily' | 'weekly';

function formatTimerClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function BoneMuscleTab() {
  const {
    language,
    mission,
    astronaut,
    biomarkers,
    history,
    exercises,
    devices,
    systemStatuses,
    supplementsChecked,
    toggleExerciseTask,
    toggleSupplement,
    setActiveTab,
  } = useMission();

  const [frequencyFilter, setFrequencyFilter] = useState<ExerciseFilter>('all');
  const [activeTimerExId, setActiveTimerExId] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionCompletedBanner, setSessionCompletedBanner] = useState<string | null>(null);
  const [inspectedDayIdx, setInspectedDayIdx] = useState<number | null>(null);

  const hasSurgeries = hasPriorSurgeries(astronaut.clinicalHistory.priorSurgeries);
  const realPriorSurgeries = useMemo(
    () => (hasSurgeries ? astronaut.clinicalHistory.priorSurgeries : []),
    [hasSurgeries, astronaut.clinicalHistory.priorSurgeries]
  );

  const adaptedCount = exercises.filter((e) => e.isAdaptedForSurgery).length;
  const completedCount = exercises.filter((e) => e.completed).length;
  const totalMinutes = exercises.reduce((acc, ex) => acc + ex.durationMin, 0);
  const completedMinutes = exercises
    .filter((ex) => ex.completed)
    .reduce((acc, ex) => acc + ex.durationMin, 0);
  const exerciseProgressPct =
    totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  const dailyExercises = exercises.filter((e) => isDailyFrequency(e.frequency));
  const weeklyExercises = exercises.filter((e) => !isDailyFrequency(e.frequency));
  const allDailyDone =
    dailyExercises.length > 0 && dailyExercises.every((e) => e.completed);

  const filteredExercises = useMemo(() => {
    if (frequencyFilter === 'all') return exercises;
    if (frequencyFilter === 'daily') return exercises.filter((ex) => isDailyFrequency(ex.frequency));
    return exercises.filter((ex) => !isDailyFrequency(ex.frequency));
  }, [exercises, frequencyFilter]);

  const activeTimerExercise = useMemo(
    () => exercises.find((ex) => ex.id === activeTimerExId) ?? null,
    [exercises, activeTimerExId]
  );

  useEffect(() => {
    if (activeTimerExId && !exercises.some((ex) => ex.id === activeTimerExId)) {
      setActiveTimerExId(null);
      setTimerRunning(false);
      setRemainingSeconds(0);
    }
  }, [exercises, activeTimerExId]);

  useEffect(() => {
    if (!timerRunning || !activeTimerExId) return;
    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, activeTimerExId]);

  const handleStartExerciseSession = (exId: string, durationMin: number) => {
    if (activeTimerExId === exId) {
      setTimerRunning((prev) => !prev);
      return;
    }
    setActiveTimerExId(exId);
    setRemainingSeconds(durationMin * 60);
    setTimerRunning(true);
    setSessionCompletedBanner(null);
  };

  const handleFinishSessionAndMark = () => {
    if (!activeTimerExercise) return;
    const displayName = activeTimerExercise.isAdaptedForSurgery
      ? activeTimerExercise.alternativeName ?? activeTimerExercise.name
      : activeTimerExercise.name;

    if (!activeTimerExercise.completed) {
      toggleExerciseTask(activeTimerExercise.id);
    }
    setTimerRunning(false);
    setActiveTimerExId(null);
    setRemainingSeconds(0);
    setSessionCompletedBanner(
      language === 'es'
        ? `Bloque completado: ${displayName} (+0.2% retención · +30 pts)`
        : `Block completed: ${displayName} (+0.2% retention · +30 pts)`
    );
    window.setTimeout(() => setSessionCompletedBanner(null), 4500);
  };

  const supCheckedCount = [
    supplementsChecked.vitaminD,
    supplementsChecked.calcium,
    supplementsChecked.hydration,
  ].filter(Boolean).length;
  const supProgressPct = Math.round((supCheckedCount / 3) * 100);

  const ultrasoundDevice = devices.find((d) => d.id === 'ultrasound');
  const musculoStatus = systemStatuses.musculoskeletal;
  const musculoGuide = getBodySystemGuides(language).musculoskeletal;
  const tooltips = getMedicalTooltips(language);

  const statusBadge =
    musculoStatus === 'critical'
      ? {
          label: language === 'es' ? 'Crítico' : 'Critical',
          classes: 'border-danger/40 bg-danger-container text-on-danger-container',
        }
      : musculoStatus === 'warning'
        ? {
            label: language === 'es' ? 'Precaución' : 'Caution',
            classes: 'border-warning/35 bg-warning-container text-on-warning-container',
          }
        : {
            label: language === 'es' ? 'Óptimo' : 'Optimal',
            classes: 'border-primary/30 bg-primary-container text-on-primary-container',
          };

  // Native SVG Bone & Muscle Retention Chart
  const chartW = 620;
  const chartH = 228;
  const padL = 44;
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

  const computeUnmitigated = (day: number) => Math.max(minVal, 100 - (day / 30) * 1.5);

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
      const projected = computeUnmitigated(pt.day);
      return `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(projected).toFixed(1)}`;
    })
    .join(' ');

  const activeDayIdx =
    inspectedDayIdx !== null && history[inspectedDayIdx]
      ? inspectedDayIdx
      : history.length > 0
        ? history.length - 1
        : null;
  const activeDayPoint = activeDayIdx !== null ? history[activeDayIdx] : null;
  const activeUnmitigated = activeDayPoint
    ? Number(computeUnmitigated(activeDayPoint.day).toFixed(1))
    : null;
  const activeNetSaved =
    activeDayPoint && activeUnmitigated !== null
      ? Number((activeDayPoint.boneRetention - activeUnmitigated).toFixed(1))
      : null;

  const safeTopY = toY(100);
  const safeBottomY = toY(98);
  const criticalThresholdY = toY(95.5);

  const timerTotalSec = activeTimerExercise ? activeTimerExercise.durationMin * 60 : 1;
  const timerElapsedSec = activeTimerExercise ? Math.max(0, timerTotalSec - remainingSeconds) : 0;
  const timerPct = activeTimerExercise
    ? Math.min(100, Math.round((timerElapsedSec / Math.max(1, timerTotalSec)) * 100))
    : 0;
  const timerPhaseLabel =
    remainingSeconds === 0
      ? language === 'es'
        ? 'Bloque finalizado · Listo para registrar'
        : 'Block complete · Ready to log'
      : timerPct < 15
        ? language === 'es'
          ? 'Fase 1: Calentamiento y movilidad articular'
          : 'Phase 1: Warm-up & joint mobility'
        : timerPct < 85
          ? language === 'es'
            ? 'Fase 2: Carga mecánica ósea y resistencia'
            : 'Phase 2: Mechanical bone loading & resistance'
          : language === 'es'
            ? 'Fase 3: Enfriamiento y descarga lumbar'
            : 'Phase 3: Cool-down & lumbar decompression';

  return (
    <div className="space-y-6">
      {/* Header + Triage KPIs + Surgical Adaptation Banner */}
      <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
                {language === 'es' ? 'Contramedida Gravitatoria' : 'Gravitational Countermeasure'} ·{' '}
                {mission.gravityLabel}
              </p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-display ${statusBadge.classes}`}
              >
                {language === 'es' ? 'Estado' : 'Status'}: {statusBadge.label}
              </span>
            </div>
            <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
              <Dumbbell className="h-5 w-5 text-primary" />
              {language === 'es'
                ? 'Densidad Ósea, Masa Muscular y Plan de Ejercicio'
                : 'Bone Density, Muscle Mass & Exercise Plan'}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {language === 'es' ? (
                <>
                  Rutinas diarias y semanales adaptadas a la gravedad de{' '}
                  <span className="text-on-surface font-semibold">{mission.name}</span> y al
                  historial quirúrgico de{' '}
                  <span className="font-semibold text-primary">{astronaut.name}</span>.
                </>
              ) : (
                <>
                  Daily and weekly regimens tailored to{' '}
                  <span className="text-on-surface font-semibold">{mission.name}</span> gravity and{' '}
                  <span className="font-semibold text-primary">{astronaut.name}</span>&apos;s
                  surgical history.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-xl border border-primary/25 bg-primary-container px-4 py-2 text-center">
              <span className="block text-[10px] font-medium text-on-primary-container">
                {language === 'es' ? 'Retención Ósea (BMD)' : 'Bone Retention (BMD)'}
              </span>
              <span className="font-mono text-lg font-bold text-on-primary-container">
                {biomarkers.boneDensityRetentionPercent}%
              </span>
            </div>
            <div className="rounded-xl border border-telemetry/25 bg-telemetry-container px-4 py-2 text-center">
              <span className="block text-[10px] font-medium text-on-telemetry-container">
                {language === 'es' ? 'Masa Muscular' : 'Muscle Mass'}
              </span>
              <span className="font-mono text-lg font-bold text-on-telemetry-container">
                {biomarkers.muscleMassRetentionPercent}%
              </span>
            </div>
            <div className="rounded-xl border border-outline bg-surface-container-low px-4 py-2 text-center">
              <span className="block text-[10px] font-medium text-on-surface-variant">
                {language === 'es' ? 'Carga Completada' : 'Completed Load'}
              </span>
              <span className="font-mono text-lg font-bold text-on-surface">
                {completedMinutes}/{totalMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Musculoskeletal Clinical Alert when Warning/Critical */}
        {musculoStatus !== 'nominal' && (
          <div
            className={`dt-animate-panel flex flex-col gap-3 rounded-xl border p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between ${
              musculoStatus === 'critical'
                ? 'border-danger/40 bg-danger-container text-on-danger-container'
                : 'border-warning/35 bg-warning-container text-on-warning-container'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  musculoStatus === 'critical' ? 'text-danger' : 'text-warning'
                }`}
              />
              <div>
                <p className="font-bold font-display">
                  {musculoStatus === 'critical'
                    ? language === 'es'
                      ? 'Alerta Crítica de Desmineralización o Pérdida Muscular'
                      : 'Critical Demineralization or Muscle Loss Alert'
                    : language === 'es'
                      ? 'Precaución Musculoesquelética Activa'
                      : 'Active Musculoskeletal Caution'}
                  {isMildMuscleAtrophy(biomarkers.ultrasoundStatus)
                    ? language === 'es'
                      ? ' · Hallazgo: Atrofia Muscular Leve (Eco)'
                      : ' · Finding: Mild Muscle Atrophy (US)'
                    : ''}
                </p>
                <p className="mt-0.5 leading-relaxed">
                  {musculoStatus === 'critical'
                    ? musculoGuide.criticalAction
                    : musculoGuide.warningAction}
                </p>
              </div>
            </div>
            {ultrasoundDevice?.availableInMission && (
              <button
                type="button"
                onClick={() => setActiveTab('sensors')}
                className="shrink-0 cursor-pointer rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-[11px] font-bold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                {language === 'es' ? 'Verificar Ultrasonido →' : 'Verify Ultrasound →'}
              </button>
            )}
          </div>
        )}

        {/* Surgical Adaptation Banner */}
        {adaptedCount > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-warning/35 bg-warning-container p-3.5 text-xs text-on-warning-container">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-bold font-display">
                {language === 'es'
                  ? `Adaptación Automática por Cirugías Previas Activa (${adaptedCount} ejercicio${
                      adaptedCount > 1 ? 's' : ''
                    } ajustado${adaptedCount > 1 ? 's' : ''})`
                  : `Automatic Prior Surgery Adaptation Active (${adaptedCount} exercise${
                      adaptedCount > 1 ? 's' : ''
                    } adjusted)`}
              </p>
              <p className="mt-0.5">
                {language === 'es'
                  ? `Debido al antecedente registrado (${realPriorSurgeries.join(', ')}), DeepTrau reemplazó las cargas de alto impacto articular por alternativas seguras sin perder estímulo óseo.`
                  : `Due to recorded clinical history (${realPriorSurgeries.join(', ')}), DeepTrau replaced high-impact joint loads with safe alternatives preserving bone stimulus.`}
              </p>
            </div>
          </div>
        ) : realPriorSurgeries.length > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-container/65 p-3.5 text-xs text-on-warning-container">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-bold font-display">
                {language === 'es'
                  ? `Antecedente Quirúrgico en Expediente (${realPriorSurgeries.join(', ')})`
                  : `Surgical History on Record (${realPriorSurgeries.join(', ')})`}
              </p>
              <p className="mt-0.5">
                {language === 'es'
                  ? `Los equipos asignados en ${mission.shortName} no generan choque directo sobre la zona operada; mantén control de rango articular y evita sobrecarga por encima de la cabeza.`
                  : `Equipment onboard ${mission.shortName} avoids direct shock on the operated joint; control range of motion and avoid overhead overload.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-container p-3 text-xs font-medium text-on-primary-container">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            {language === 'es'
              ? `Sin cirugías previas ni restricciones articulares para la gravedad actual (${mission.gravityLabel}). Protocolo completo habilitado.`
              : `No prior surgeries or joint restrictions for current gravity (${mission.gravityLabel}). Full protocol cleared.`}
          </div>
        )}
      </div>

      {/* Main Content: Exercise Checklist + Nutrition Supplements */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily & Weekly Exercise Planner */}
        <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-on-surface font-display">
                {language === 'es'
                  ? 'Rutina de Ejercicio Diaria y Semanal'
                  : 'Daily & Weekly Exercise Routine'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {language === 'es'
                  ? 'Completa tus bloques para sumar +0.2% de conservación proyectada y +30 pts.'
                  : 'Complete blocks to add +0.2% projected bone/muscle retention and +30 pts.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {allDailyDone && (
                <span className="dt-animate-panel rounded-full border border-primary/30 bg-primary-container px-2.5 py-1 text-[10px] font-bold text-on-primary-container font-display">
                  {language === 'es' ? 'Rutina diaria sincronizada ✓' : 'Daily routine synced ✓'}
                </span>
              )}
              <span className="rounded-full border border-primary/25 bg-primary-container px-2.5 py-1 text-xs font-semibold text-on-primary-container font-mono">
                {completedCount}/{exercises.length}{' '}
                {language === 'es' ? 'completados' : 'completed'}
              </span>
            </div>
          </div>

          {/* Progress bar + Frequency Filter Tabs */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-on-surface-variant">
                  {language === 'es'
                    ? `Progreso de carga física (${completedMinutes} de ${totalMinutes} min)`
                    : `Physical workload progress (${completedMinutes} of ${totalMinutes} min)`}
                </span>
                <span className="font-mono font-bold text-primary">{exerciseProgressPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-[width,background-color] duration-300"
                  style={{ width: `${exerciseProgressPct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  {
                    id: 'all',
                    label:
                      language === 'es'
                        ? `Todas (${exercises.length})`
                        : `All (${exercises.length})`,
                  },
                  {
                    id: 'daily',
                    label:
                      language === 'es'
                        ? `Diarias (${dailyExercises.length})`
                        : `Daily (${dailyExercises.length})`,
                  },
                  {
                    id: 'weekly',
                    label:
                      language === 'es'
                        ? `Semanales (${weeklyExercises.length})`
                        : `Weekly (${weeklyExercises.length})`,
                  },
                ] as const
              ).map((tab) => {
                const isActive = frequencyFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFrequencyFilter(tab.id)}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      isActive
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline bg-surface-container-low text-on-surface-variant hover:border-primary/45 hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {sessionCompletedBanner && (
            <div className="dt-animate-panel rounded-xl border border-primary/35 bg-primary-container px-3.5 py-2.5 text-xs font-semibold text-on-primary-container flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>{sessionCompletedBanner}</span>
            </div>
          )}

          {/* Active Guided Session Timer */}
          {activeTimerExercise && (
            <div
              key={activeTimerExercise.id}
              className="dt-animate-panel rounded-xl border border-primary/40 bg-primary-container/50 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-primary font-display flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5" />
                    {language === 'es' ? 'Sesión Activa' : 'Active Session'} ·{' '}
                    {activeTimerExercise.machine}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-on-surface font-display truncate">
                    {activeTimerExercise.isAdaptedForSurgery
                      ? activeTimerExercise.alternativeName
                      : activeTimerExercise.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">{timerPhaseLabel}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-lg border border-primary/30 bg-surface-container px-2.5 py-1 font-mono text-base font-bold text-primary">
                    {formatTimerClock(remainingSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setActiveTimerExId(null);
                    }}
                    aria-label={
                      language === 'es'
                        ? 'Cerrar temporizador de sesión'
                        : 'Close session timer'
                    }
                    className="cursor-pointer rounded-lg border border-outline bg-surface-container p-1.5 text-on-surface-variant dt-transition hover:border-primary/45 hover:text-on-surface active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${timerPct}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((prev) => !prev)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5 text-warning" />
                        {language === 'es' ? 'Pausar' : 'Pause'}
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 text-primary" />
                        {remainingSeconds === 0
                          ? language === 'es'
                            ? 'Reiniciar'
                            : 'Restart'
                          : language === 'es'
                            ? 'Reanudar'
                            : 'Resume'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setRemainingSeconds(activeTimerExercise.durationMin * 60);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:text-on-surface active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {language === 'es' ? 'Reiniciar' : 'Reset'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleFinishSessionAndMark}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {language === 'es'
                    ? 'Finalizar y completar (+30 pts)'
                    : 'Finish & complete (+30 pts)'}
                </button>
              </div>
            </div>
          )}

          {/* Exercise List */}
          <div className="space-y-3">
            {filteredExercises.map((ex) => {
              const isTimerActive = activeTimerExId === ex.id;
              const loadBadgeLabel = ex.isAdaptedForSurgery
                ? language === 'es'
                  ? 'Impacto adaptado · Seguro'
                  : 'Adapted impact · Safe'
                : ex.jointLoad;
              const loadBadgeClass = ex.isAdaptedForSurgery
                ? 'border-warning/35 bg-warning-container text-on-warning-container'
                : isHighImpactLoad(ex.jointLoad)
                  ? 'border-telemetry/30 bg-telemetry-container text-on-telemetry-container'
                  : 'border-outline bg-surface-container text-on-surface-variant';

              return (
                <div
                  key={ex.id}
                  className={`rounded-xl border p-4 dt-transition ${
                    ex.completed
                      ? 'border-primary/30 bg-primary-container/55'
                      : ex.isAdaptedForSurgery
                        ? 'border-warning/40 bg-surface-container-low'
                        : 'border-outline bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExerciseTask(ex.id)}
                      aria-label={
                        ex.completed
                          ? `${language === 'es' ? 'Desmarcar' : 'Uncheck'} ${
                              ex.isAdaptedForSurgery ? ex.alternativeName : ex.name
                            }`
                          : `${language === 'es' ? 'Marcar como completado' : 'Mark completed'} ${
                              ex.isAdaptedForSurgery ? ex.alternativeName : ex.name
                            }`
                      }
                      className="group mt-0.5 shrink-0 cursor-pointer rounded-full p-0.5 dt-transition hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-on-surface-variant group-hover:text-primary" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExerciseTask(ex.id)}
                          className={`cursor-pointer text-left text-sm font-bold font-display dt-transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 rounded ${
                            ex.completed
                              ? 'line-through text-on-surface-variant'
                              : 'text-on-surface'
                          }`}
                        >
                          {ex.isAdaptedForSurgery ? ex.alternativeName : ex.name}
                        </button>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold font-mono">
                          <span className="rounded-md border border-outline bg-surface-container px-2 py-0.5 text-on-surface-variant">
                            {ex.frequency}
                          </span>
                          <span className="rounded-md border border-primary/25 bg-primary-container px-2 py-0.5 text-on-primary-container">
                            {ex.durationMin} min
                          </span>
                          <span className={`rounded-md border px-2 py-0.5 ${loadBadgeClass}`}>
                            {loadBadgeLabel}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant">
                        {language === 'es' ? 'Equipo:' : 'Equipment:'}{' '}
                        <span className="font-semibold text-on-surface">{ex.machine}</span> ·{' '}
                        {language === 'es' ? 'Objetivo:' : 'Target:'} {ex.targetSystem}
                      </p>

                      {ex.isAdaptedForSurgery && (
                        <div className="rounded-lg border border-warning/30 bg-warning-container p-2.5 text-[11px] text-on-warning-container">
                          <span className="font-bold">
                            {language === 'es'
                              ? `Adaptado por ${ex.matchedSurgery}:`
                              : `Adapted for ${ex.matchedSurgery}:`}
                          </span>{' '}
                          {ex.alternativeDescription} (
                          {language === 'es' ? 'Reemplaza a:' : 'Replaces:'} <em>{ex.name}</em>)
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          {ex.completed
                            ? language === 'es'
                              ? 'Registrado hoy (+0.2% BMD/Músculo)'
                              : 'Logged today (+0.2% BMD/Muscle)'
                            : language === 'es'
                              ? 'Pendiente (+30 pts)'
                              : 'Pending (+30 pts)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartExerciseSession(ex.id, ex.durationMin)}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold font-display dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                            isTimerActive
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-outline bg-surface-container text-on-surface hover:border-primary/45 hover:bg-surface-container-high'
                          }`}
                        >
                          {isTimerActive && timerRunning ? (
                            <>
                              <Pause className="h-3 w-3" />
                              {language === 'es' ? 'Pausar' : 'Pause'} ({formatTimerClock(remainingSeconds)})
                            </>
                          ) : isTimerActive ? (
                            <>
                              <Play className="h-3 w-3" />
                              {language === 'es' ? 'Reanudar' : 'Resume'} ({formatTimerClock(remainingSeconds)})
                            </>
                          ) : (
                            <>
                              <Timer className="h-3 w-3 text-primary" />
                              {ex.completed
                                ? language === 'es'
                                  ? 'Repetir sesión'
                                  : 'Repeat session'
                                : language === 'es'
                                  ? `Iniciar bloque (${ex.durationMin}m)`
                                  : `Start block (${ex.durationMin}m)`}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bone Nutrition, Supplements & Medical Explanation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <Pill className="h-5 w-5 text-primary" />
                {language === 'es'
                  ? 'Suplementación Ósea e Hidratación'
                  : 'Bone Supplementation & Hydration'}
              </h3>
              <span className="rounded-full border border-primary/25 bg-primary-container px-2.5 py-0.5 text-xs font-semibold text-on-primary-container font-mono">
                {supCheckedCount}/3
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-[width,background-color] duration-300"
                  style={{ width: `${supProgressPct}%` }}
                />
              </div>
              {supCheckedCount === 3 && (
                <p className="dt-animate-panel text-[11px] font-semibold text-primary">
                  {language === 'es'
                    ? 'Soporte mineral completo · Sincronizado con rutina diaria ✓'
                    : 'Full mineral support · Synced with daily routine ✓'}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'vitaminD' as const,
                  title:
                    language === 'es'
                      ? 'Vitamina D3 (800 – 1,000 UI/día)'
                      : 'Vitamin D3 (800 – 1,000 IU/day)',
                  desc:
                    language === 'es'
                      ? 'Esencial sin luz solar directa para absorber calcio en cabina.'
                      : 'Essential without direct sunlight to support calcium absorption in cabin.',
                  icon: <Bone className="h-4 w-4 text-warning" />,
                },
                {
                  key: 'calcium' as const,
                  title:
                    language === 'es'
                      ? 'Calcio Biodisponible (1,000 mg)'
                      : 'Bioavailable Calcium (1,000 mg)',
                  desc:
                    language === 'es'
                      ? 'Compensa la reabsorción ósea inducida por microgravedad.'
                      : 'Counterbalances bone resorption induced by microgravity.',
                  icon: <Pill className="h-4 w-4 text-primary" />,
                },
                {
                  key: 'hydration' as const,
                  title:
                    language === 'es'
                      ? 'Hidratación Post-Ejercicio (600 ml + Electrolitos)'
                      : 'Post-Exercise Hydration (600 ml + Electrolytes)',
                  desc:
                    language === 'es'
                      ? 'Previene cálculos renales por liberación de calcio óseo a la sangre.'
                      : 'Prevents renal stones caused by bone calcium mobilization into blood.',
                  icon: <Droplets className="h-4 w-4 text-telemetry" />,
                },
              ].map((sup) => {
                const checked = supplementsChecked[sup.key];
                return (
                  <button
                    key={sup.key}
                    type="button"
                    onClick={() => toggleSupplement(sup.key)}
                    className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      checked
                        ? 'border-primary/30 bg-primary-container/55 hover:bg-primary-container/75'
                        : 'border-outline bg-surface-container-low hover:border-primary hover:bg-surface-container'
                    }`}
                  >
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 dt-transition group-hover:scale-110 ${
                        checked ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
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
                        {!checked && (
                          <span className="shrink-0 font-mono text-[10px] font-semibold text-primary">
                            +10 pts
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant">{sup.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-outline bg-surface-container p-5 space-y-3 text-xs">
            <p className="font-bold text-primary flex items-center gap-1.5 font-display">
              <Sparkles className="h-4 w-4" />
              {language === 'es'
                ? `¿Por qué importa en ${mission.shortName} (${mission.gravityLabel})?`
                : `Why does this matter in ${mission.shortName} (${mission.gravityLabel})?`}
            </p>
            <p className="leading-relaxed text-on-surface-variant">
              {mission.gravityG === 0
                ? language === 'es'
                  ? 'En microgravedad continua (0g), el esqueleto y los músculos posturales dejan de recibir carga axial terrestre. '
                  : 'In continuous microgravity (0g), the skeleton and postural muscles lose terrestrial axial loading. '
                : language === 'es'
                  ? `En gravedad parcial (${mission.gravityLabel}), la carga mecánica es insuficiente frente a 1g terrestre y las caminatas EVA exigen resistencia articular. `
                  : `In partial gravity (${mission.gravityLabel}), mechanical load remains below 1g Earth gravity and EVAs demand joint resilience. `}
              {tooltips.boneMuscle.why}
            </p>
            <div className="rounded-xl border border-outline bg-surface-container-low p-3 space-y-1">
              <p className="font-semibold text-on-surface font-display">
                {language === 'es'
                  ? 'Ultrasonido / Seguimiento Muscular:'
                  : 'Ultrasound / Muscle Follow-up:'}{' '}
                {biomarkers.ultrasoundStatus}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {biomarkers.ultrasoundNotes}
              </p>
            </div>
            <div>
              <p className="font-semibold text-on-surface font-display">
                {language === 'es' ? 'Qué hacer ahora:' : 'Recommended action:'}
              </p>
              <p className="mt-0.5 leading-relaxed text-on-surface-variant">
                {musculoStatus === 'critical'
                  ? musculoGuide.criticalAction
                  : musculoStatus === 'warning'
                    ? musculoGuide.warningAction
                    : tooltips.boneMuscle.how}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bone & Muscle Retention Interactive SVG Chart */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-on-surface font-display">
              {language === 'es'
                ? 'Curva de Conservación Ósea y Muscular vs. Deterioro sin Ejercicio'
                : 'Bone & Muscle Retention Curve vs. Unmitigated Loss'}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {language === 'es'
                ? 'Haz clic o pasa el cursor sobre cualquier día para comparar tu retención real frente a la pérdida sin contramedidas (-1.5%/mes).'
                : 'Click or hover any mission day to compare real retention against unmitigated microgravity decay (-1.5%/mo).'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />{' '}
              {language === 'es' ? 'Densidad Ósea (BMD %)' : 'Bone Density (BMD %)'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-telemetry">
              <span className="h-2.5 w-2.5 rounded-full bg-telemetry" />{' '}
              {language === 'es' ? 'Masa Muscular (%)' : 'Muscle Mass (%)'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-danger">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />{' '}
              {language === 'es' ? 'Sin Ejercicio (Riesgo)' : 'No Exercise (Risk)'}
            </span>
          </div>
        </div>

        {activeDayPoint && activeUnmitigated !== null && activeNetSaved !== null && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2 text-xs">
            <span className="font-mono font-bold text-on-surface">
              {language === 'es'
                ? `Inspección Día ${activeDayPoint.day}`
                : `Day ${activeDayPoint.day} Inspection`}
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono">
              <span className="text-primary font-semibold">
                {language === 'es' ? 'Ósea (BMD):' : 'Bone (BMD):'} {activeDayPoint.boneRetention}%
              </span>
              <span className="text-telemetry font-semibold">
                {language === 'es' ? 'Músculo:' : 'Muscle:'} {activeDayPoint.muscleRetention}%
              </span>
              <span className="text-danger font-semibold">
                {language === 'es' ? 'Sin ejercicio:' : 'No exercise:'} {activeUnmitigated}%
              </span>
              <span className="rounded-md border border-primary/25 bg-primary-container px-2 py-0.5 text-[11px] font-bold text-on-primary-container">
                {language === 'es' ? 'Protección neta:' : 'Net saved:'}{' '}
                {activeNetSaved >= 0 ? `+${activeNetSaved}` : activeNetSaved}%
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
              language === 'es'
                ? 'Gráfica interactiva de conservación de densidad ósea y masa muscular'
                : 'Interactive bone density and muscle mass retention chart'
            }
          >
            <rect
              x={padL}
              y={safeTopY}
              width={plotW}
              height={safeBottomY - safeTopY}
              fill="rgba(47, 93, 70, 0.09)"
            />

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

            <line
              x1={padL}
              y1={safeBottomY}
              x2={chartW - padR}
              y2={safeBottomY}
              stroke="#2F5D46"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.55"
            />
            <line
              x1={padL}
              y1={criticalThresholdY}
              x2={chartW - padR}
              y2={criticalThresholdY}
              stroke="#B54708"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.55"
            />

            <path
              d={unmitigatedPath}
              fill="none"
              stroke="#B42318"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <path d={bonePath} fill="none" stroke="#2F5D46" strokeWidth="2.5" />
            <path d={musclePath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />

            {history.map((pt, i) => {
              const x = toX(i);
              const isSelected = activeDayIdx === i;
              const projectedY = toY(computeUnmitigated(pt.day));
              return (
                <g
                  key={pt.day}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    language === 'es'
                      ? `Inspeccionar Día ${pt.day}: Ósea ${pt.boneRetention}%, Músculo ${pt.muscleRetention}%`
                      : `Inspect Day ${pt.day}: Bone ${pt.boneRetention}%, Muscle ${pt.muscleRetention}%`
                  }
                  onMouseEnter={() => setInspectedDayIdx(i)}
                  onClick={() => setInspectedDayIdx(i)}
                  onFocus={() => setInspectedDayIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setInspectedDayIdx(i);
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
                      stroke="#2F5D46"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.55"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={projectedY}
                    r={isSelected ? '4' : '2.5'}
                    fill="#B42318"
                    opacity={isSelected ? '1' : '0.7'}
                  />
                  <circle
                    cx={x}
                    cy={toY(pt.boneRetention)}
                    r={isSelected ? '5' : '3.5'}
                    fill="#2F5D46"
                  />
                  <circle
                    cx={x}
                    cy={toY(pt.muscleRetention)}
                    r={isSelected ? '5' : '3.5'}
                    fill="#2B5B6C"
                  />
                  <text
                    x={x}
                    y={chartH - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#1A241E' : '#55635B'}
                    fontWeight={isSelected ? '700' : '400'}
                    fontSize="10"
                  >
                    D{pt.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>
    </div>
  );
}
