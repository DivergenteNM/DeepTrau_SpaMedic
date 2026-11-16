'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Heart,
  Moon,
  Pause,
  Play,
  Smile,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { computeMissionPhaseInsight } from '@/utils/psychologyAnalysis';
import { PvtCognitiveTestCard } from './PvtCognitiveTestCard';
import { VideoDiaryStudio } from './VideoDiaryStudio';
import { EarthAnchorVault } from './EarthAnchorVault';

type SleepQualityKey = 'restorative' | 'fragmented' | 'insomnia';
type StressorKey = 'none' | 'isolation' | 'circadian' | 'workload' | 'noise';
type CabinLightMode = 'day_480' | 'neutral_3500' | 'amber_1800';

export function MentalHealthTab() {
  const {
    language,
    mission,
    missionDay,
    biomarkers,
    history,
    pvtHistory,
    psychRoutinesChecked,
    addMentalCheckIn,
    togglePsychRoutine,
    completeBreathingSession,
  } = useMission();

  const isEs = language === 'es';

  // Check-in state synced cleanly with biomarkers
  const [moodScore, setMoodScore] = useState<number>(biomarkers.moodScore);
  const [sleepHours, setSleepHours] = useState<number>(biomarkers.sleepHours);
  const [stressLevel, setStressLevel] = useState<number>(biomarkers.stressLevel);
  const [crewCohesion, setCrewCohesion] = useState<number>(biomarkers.crewCohesion);
  const [sleepQualityKey, setSleepQualityKey] = useState<SleepQualityKey>(
    biomarkers.sleepHours >= 7 ? 'restorative' : biomarkers.sleepHours >= 5.5 ? 'fragmented' : 'insomnia'
  );
  const [primaryStressorKey, setPrimaryStressorKey] = useState<StressorKey>('none');
  const [checkInSaved, setCheckInSaved] = useState(false);

  useEffect(() => {
    setMoodScore(biomarkers.moodScore);
    setSleepHours(biomarkers.sleepHours);
    setStressLevel(biomarkers.stressLevel);
    setCrewCohesion(biomarkers.crewCohesion);
    setSleepQualityKey(
      biomarkers.sleepHours >= 7 ? 'restorative' : biomarkers.sleepHours >= 5.5 ? 'fragmented' : 'insomnia'
    );
  }, [biomarkers.moodScore, biomarkers.sleepHours, biomarkers.stressLevel, biomarkers.crewCohesion]);

  // Breathing Pacer state (4-4-4-4 Box Breathing with target cycles + audio cue)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathTargetCycles, setBreathTargetCycles] = useState<2 | 4>(4);
  const [breathTotalSec, setBreathTotalSec] = useState(0);
  const [breathAudioCue, setBreathAudioCue] = useState(true);
  const [breathCompletedBanner, setBreathCompletedBanner] = useState(false);
  const breathAudioCtxRef = useRef<AudioContext | null>(null);

  // Interactive Circadian Cabin Lighting state
  const [cabinLight, setCabinLight] = useState<CabinLightMode>(
    psychRoutinesChecked.circadianLight ? 'amber_1800' : 'day_480'
  );

  // Interactive SVG Chart inspection
  const [inspectedDayIdx, setInspectedDayIdx] = useState<number | null>(null);

  const playSoftBreathChime = (freq: number) => {
    if (!breathAudioCue) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = breathAudioCtxRef.current ?? new AudioCtx();
      breathAudioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // ignore audio restrictions
    }
  };

  const targetSeconds = breathTargetCycles * 16;

  useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathTotalSec((prev) => {
        const next = prev + 1;
        if (next >= targetSeconds) {
          setBreathingActive(false);
          completeBreathingSession();
          setBreathCompletedBanner(true);
          playSoftBreathChime(528);
          setTimeout(() => setBreathCompletedBanner(false), 4000);
          return 0;
        }
        const phasePos = next % 16;
        if (phasePos === 0) playSoftBreathChime(432);
        else if (phasePos === 4) playSoftBreathChime(480);
        else if (phasePos === 8) playSoftBreathChime(360);
        else if (phasePos === 12) playSoftBreathChime(320);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breathingActive, targetSeconds, breathAudioCue]);

  useEffect(() => {
    return () => {
      if (breathAudioCtxRef.current) {
        void breathAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const breathTick = breathTotalSec % 16;
  const currentBreathCycle = Math.min(breathTargetCycles, Math.floor(breathTotalSec / 16) + 1);
  const phaseRemainingSec = 4 - (breathTick % 4);
  const breathProgressPct = Math.round((breathTotalSec / targetSeconds) * 100);

  const breathPhase =
    breathTick < 4
      ? isEs
        ? `Inhala profundo (${phaseRemainingSec}s)`
        : `Inhale deeply (${phaseRemainingSec}s)`
      : breathTick < 8
        ? isEs
          ? `Mantén el aire (${phaseRemainingSec}s)`
          : `Hold breath (${phaseRemainingSec}s)`
        : breathTick < 12
          ? isEs
            ? `Exhala lento (${phaseRemainingSec}s)`
            : `Exhale slowly (${phaseRemainingSec}s)`
          : isEs
            ? `Pausa en calma (${phaseRemainingSec}s)`
            : `Calm pause (${phaseRemainingSec}s)`;

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const sleepQualityValue =
      sleepQualityKey === 'restorative'
        ? isEs
          ? 'Reparador'
          : 'Restorative'
        : sleepQualityKey === 'fragmented'
          ? isEs
            ? 'Fragmentado'
            : 'Fragmented'
          : isEs
            ? 'Insomnio'
            : 'Insomnia';
    const stressorMap: Record<StressorKey, string> = {
      none: isEs ? 'Ninguno' : 'None',
      isolation: isEs ? 'Aislamiento' : 'Isolation',
      circadian: isEs ? 'Desfase Circadiano' : 'Circadian Shift',
      workload: isEs ? 'Carga Operativa' : 'Operational Workload',
      noise: isEs ? 'Ruido Cabina' : 'Cabin Noise',
    };
    addMentalCheckIn({
      moodScore,
      sleepHours,
      stressLevel,
      crewCohesion,
      sleepQuality: sleepQualityValue,
      primaryStressor: stressorMap[primaryStressorKey],
    });
    setCheckInSaved(true);
    setTimeout(() => setCheckInSaved(false), 3500);
  };

  const handleSelectCabinLight = (mode: CabinLightMode) => {
    setCabinLight(mode);
    if (mode === 'amber_1800' && !psychRoutinesChecked.circadianLight) {
      togglePsychRoutine('circadianLight');
    } else if (mode !== 'amber_1800' && psychRoutinesChecked.circadianLight) {
      togglePsychRoutine('circadianLight');
    }
  };

  const phaseInsight = useMemo(
    () =>
      computeMissionPhaseInsight({
        missionDay,
        mission,
        moodScore: biomarkers.moodScore,
        sleepHours: biomarkers.sleepHours,
        stressLevel: biomarkers.stressLevel,
        crewCohesion: biomarkers.crewCohesion,
        latestPvtScore: pvtHistory[0]?.alertnessScore,
        lang: language,
      }),
    [missionDay, mission, biomarkers, pvtHistory, language]
  );

  // SVG Mental History Chart calculations
  const chartW = 620;
  const chartH = 220;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (idx: number) =>
    padL + (history.length <= 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
  const toY10 = (val: number) => padT + plotH - (Math.min(10, Math.max(0, val)) / 10) * plotH;

  const moodPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.moodScore).toFixed(1)}`)
    .join(' ');
  const sleepPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.sleepHours).toFixed(1)}`)
    .join(' ');
  const stressPath = history
    .map(
      (pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.stressLevel).toFixed(1)}`
    )
    .join(' ');

  const activeDayIdx =
    inspectedDayIdx !== null && history[inspectedDayIdx]
      ? inspectedDayIdx
      : history.length > 0
        ? history.length - 1
        : null;
  const activeDayPoint = activeDayIdx !== null ? history[activeDayIdx] : null;

  const sleepTargetTopY = toY10(8.5);
  const sleepTargetBottomY = toY10(7);

  return (
    <div className="space-y-6">
      {/* Phase & Resilience Overview Strip */}
      <section className="rounded-2xl border border-outline bg-surface-container p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary-container text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface font-display">
                {phaseInsight.phaseTitle} · {isEs ? 'Día' : 'Day'} {missionDay}{' '}
                {isEs ? 'de' : 'of'} {mission.durationDays} ({phaseInsight.progressPercent}%)
              </p>
              <p className="text-[11px] text-on-surface-variant">{phaseInsight.summary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phaseInsight.isThirdQuarterWindow && (
              <span className="rounded-full border border-warning/35 bg-warning-container px-2.5 py-1 text-[10px] font-bold text-on-warning-container font-display">
                {isEs ? 'Ventana Tercer Cuarto Activa' : 'Third-Quarter Window Active'}
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                phaseInsight.resilienceScore >= 75
                  ? 'border-primary/35 bg-primary-container text-on-primary-container'
                  : phaseInsight.resilienceScore >= 58
                    ? 'border-warning/35 bg-warning-container text-on-warning-container'
                    : 'border-danger/35 bg-danger-container text-on-danger-container'
              }`}
            >
              {isEs ? 'Resiliencia' : 'Resilience'}: {phaseInsight.resilienceScore}%
            </span>
          </div>
        </div>

        {/* Mission timeline bar highlighting Third-Quarter window (50%-78%) */}
        <div className="relative h-2.5 w-full rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-warning/25"
            style={{ left: '50%', width: '28%' }}
            title={
              isEs
                ? 'Ventana crítica de Tercer Cuarto (50%–78%)'
                : 'Critical Third-Quarter Window (50%–78%)'
            }
          />
          <div
            className="relative h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${phaseInsight.progressPercent}%` }}
          />
        </div>
      </section>

      {/* Low Mood Countermeasure Alert */}
      {(biomarkers.moodScore <= 6 || biomarkers.sleepHours < 6.5) && (
        <div className="dt-animate-panel rounded-2xl border border-warning/35 bg-warning-container p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-xs text-on-warning-container">
              <p className="font-bold font-display">
                {isEs
                  ? 'Contramedida Emocional Sugerida (Aislamiento y Sueño)'
                  : 'Suggested Emotional Countermeasure (Isolation & Sleep)'}
              </p>
              <p className="mt-0.5">
                {isEs ? (
                  <>
                    Detectamos descenso de ánimo ({biomarkers.moodScore}/10) o descanso reducido (
                    {biomarkers.sleepHours}h). Te recomendamos completar el Test PVT, iniciar una
                    sesión de respiración 4-4-4-4 o abrir &quot;Mi Ancla en la Tierra&quot;.
                  </>
                ) : (
                  <>
                    Detected mood decline ({biomarkers.moodScore}/10) or reduced sleep (
                    {biomarkers.sleepHours}h). We recommend completing the PVT Test, starting a
                    4-4-4-4 breathing session, or opening &quot;My Earth Anchor&quot;.
                  </>
                )}
              </p>
            </div>
          </div>
          <a
            href="#muro-inspiracion"
            className="shrink-0 cursor-pointer rounded-xl bg-warning px-3.5 py-2 text-center text-xs font-bold text-surface dt-transition hover:-translate-y-0.5 hover:bg-warning-hover hover:shadow-sm active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
          >
            {isEs ? 'Ir a Mi Ancla en la Tierra' : 'Go to My Earth Anchor'}
          </a>
        </div>
      )}

      {/* Row 1: Daily Mood/Sleep Check-in + Psychological Routines & Real Breathing/Circadian */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveCheckIn}
          className="lg:col-span-6 rounded-2xl border border-outline bg-surface-container p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <Smile className="h-5 w-5 text-primary" />
                {isEs ? 'Check-in Emocional y Calidad de Sueño' : 'Emotional & Sleep Quality Check-in'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {isEs
                  ? `Monitorea confinamiento, arquitectura del descanso y cohesión en ${mission.shortName}.`
                  : `Monitor confinement, sleep architecture, and crew cohesion on ${mission.shortName}.`}
              </p>
            </div>
            {checkInSaved && (
              <span className="dt-animate-panel rounded-full border border-primary/30 bg-primary-container px-2.5 py-1 text-[11px] font-semibold text-on-primary-container">
                {isEs ? '¡Guardado!' : 'Saved!'}
              </span>
            )}
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">
                  {isEs ? 'Estado de Ánimo' : 'Mood State'}
                </span>
                <span className="font-mono font-bold text-primary">{moodScore}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">
                  {isEs ? 'Horas de Sueño' : 'Sleep Hours'}
                </span>
                <span className="font-mono font-bold text-telemetry">{sleepHours} h</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full cursor-pointer accent-telemetry"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">
                  {isEs ? 'Estrés por Confinamiento' : 'Confinement Stress'}
                </span>
                <span className="font-mono font-bold text-warning">{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full cursor-pointer accent-warning"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">
                  {isEs ? 'Cohesión de Tripulación' : 'Crew Cohesion'}
                </span>
                <span className="font-mono font-bold text-secondary">{crewCohesion}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={crewCohesion}
                onChange={(e) => setCrewCohesion(Number(e.target.value))}
                className="w-full cursor-pointer accent-secondary"
              />
            </div>
          </div>

          {/* Sleep Quality & Stressor context */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold text-on-surface-variant">
                {isEs ? 'Calidad del descanso' : 'Sleep quality'}
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-outline bg-surface-container-low p-1">
                {([
                  { key: 'restorative' as const, label: isEs ? 'Reparador' : 'Restorative' },
                  { key: 'fragmented' as const, label: isEs ? 'Fragmentado' : 'Fragmented' },
                  { key: 'insomnia' as const, label: isEs ? 'Insomnio' : 'Insomnia' },
                ]).map((q) => (
                  <button
                    key={q.key}
                    type="button"
                    onClick={() => setSleepQualityKey(q.key)}
                    className={`cursor-pointer rounded-lg px-2 py-1.5 text-[11px] font-semibold dt-transition ${
                      sleepQualityKey === q.key
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="primary-stressor"
                className="block text-[11px] font-semibold text-on-surface-variant"
              >
                {isEs ? 'Estresor principal del turno' : 'Primary shift stressor'}
              </label>
              <select
                id="primary-stressor"
                value={primaryStressorKey}
                onChange={(e) => setPrimaryStressorKey(e.target.value as StressorKey)}
                className="w-full cursor-pointer rounded-xl border border-outline bg-surface-container-low px-3 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary"
              >
                <option value="none">
                  {isEs ? 'Sin estresor relevante' : 'No relevant stressor'}
                </option>
                <option value="isolation">
                  {isEs ? 'Aislamiento / Distancia Tierra' : 'Isolation / Earth distance'}
                </option>
                <option value="circadian">
                  {isEs ? 'Desfase circadiano / Luz' : 'Circadian shift / Light'}
                </option>
                <option value="workload">
                  {isEs ? 'Carga operativa / EVA' : 'Operational workload / EVA'}
                </option>
                <option value="noise">
                  {isEs ? 'Ruido / Confinamiento cabina' : 'Cabin noise / Confinement'}
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            {isEs ? 'Registrar Check-in del Día (+30 pts)' : 'Log Daily Check-in (+30 pts)'}
          </button>
        </form>

        {/* Daily & Weekly Psychological Routines + Interactive Breathing + Circadian Lighting */}
        <div className="lg:col-span-6 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="border-b border-outline-variant pb-3">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Wind className="h-5 w-5 text-primary" />
              {isEs
                ? 'Regulación Autonómica e Higiene Circadiana'
                : 'Autonomic Regulation & Circadian Hygiene'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {isEs
                ? 'Respiración guiada con auto-completado, espectro lumínico de cabina y contramedidas.'
                : 'Guided breathing with auto-completion, cabin lighting spectrum, and countermeasures.'}
            </p>
          </div>

          {/* Interactive Box Breathing Pacer with SVG progress ring */}
          <div className="rounded-xl border border-primary/30 bg-primary-container p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      opacity="0.7"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="#2F5D46"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={169.6}
                      strokeDashoffset={169.6 - (169.6 * breathProgressPct) / 100}
                      className="transition-[stroke-dashoffset] duration-700"
                    />
                  </svg>
                  <div
                    className={`absolute flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-surface-container transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      breathingActive
                        ? breathTick < 8
                          ? 'scale-110'
                          : 'scale-90'
                        : 'scale-100'
                    }`}
                  >
                    <Wind className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-on-primary-container font-display">
                    {isEs
                      ? 'Respiración Guiada Anti-Cortisol (4-4-4-4)'
                      : 'Guided Anti-Cortisol Breathing (4-4-4-4)'}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-primary">
                    {breathingActive
                      ? `${breathPhase} · ${isEs ? 'Ciclo' : 'Cycle'} ${currentBreathCycle}/${breathTargetCycles}`
                      : isEs
                        ? 'Completa la sesión para registrar la rutina'
                        : 'Complete the session to log the routine'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBreathAudioCue((v) => !v)}
                  title={
                    breathAudioCue
                      ? isEs
                        ? 'Silenciar tono guía'
                        : 'Mute guide tone'
                      : isEs
                        ? 'Activar tono guía'
                        : 'Enable guide tone'
                  }
                  className="cursor-pointer rounded-xl border border-primary/25 bg-surface-container p-2 text-primary dt-transition hover:bg-surface-container-low active:scale-[0.97]"
                >
                  {breathAudioCue ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBreathingActive((b) => !b);
                    if (breathingActive) setBreathTotalSec(0);
                    else playSoftBreathChime(432);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  {breathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {breathingActive ? (isEs ? 'Detener' : 'Stop') : isEs ? 'Iniciar' : 'Start'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-primary-container">
              <div className="flex items-center gap-1.5">
                <span>{isEs ? 'Duración:' : 'Duration:'}</span>
                {([2, 4] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={breathingActive}
                    onClick={() => {
                      setBreathTargetCycles(c);
                      setBreathTotalSec(0);
                    }}
                    className={`cursor-pointer rounded-lg px-2 py-0.5 font-mono font-semibold dt-transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      breathTargetCycles === c
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {c === 2
                      ? isEs
                        ? '32s (2 ciclos)'
                        : '32s (2 cycles)'
                      : isEs
                        ? '64s (4 ciclos)'
                        : '64s (4 cycles)'}
                  </button>
                ))}
              </div>
              {breathCompletedBanner && (
                <span className="dt-animate-panel font-bold text-primary">
                  {isEs
                    ? '¡Sesión completada! Rutina marcada ✓ (+20 pts)'
                    : 'Session completed! Routine logged ✓ (+20 pts)'}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Cabin Circadian Light Controller */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-display">
                <Sun className="h-4 w-4 text-warning" />
                {isEs
                  ? 'Control Lumínico Circadiano de Cabina'
                  : 'Cabin Circadian Light Control'}
              </span>
              <span className="font-mono text-[10px] font-semibold text-on-surface-variant">
                {cabinLight === 'amber_1800'
                  ? isEs
                    ? 'Modo Pre-Sueño Activo'
                    : 'Pre-Sleep Mode Active'
                  : cabinLight === 'neutral_3500'
                    ? isEs
                      ? 'Transición Tarde'
                      : 'Afternoon Transition'
                    : isEs
                      ? 'Turno Diurno'
                      : 'Day Shift'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  id: 'day_480' as const,
                  label: isEs ? '480nm Alerta' : '480nm Alert',
                  desc: isEs ? 'Suprime melatonina' : 'Suppresses melatonin',
                },
                {
                  id: 'neutral_3500' as const,
                  label: isEs ? '3500K Neutro' : '3500K Neutral',
                  desc: isEs ? 'Trabajo en cabina' : 'Cabin operations',
                },
                {
                  id: 'amber_1800' as const,
                  label: isEs ? '1800K Ámbar' : '1800K Amber',
                  desc: isEs ? 'Pre-sueño (-60m)' : 'Pre-sleep (-60m)',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectCabinLight(opt.id)}
                  className={`cursor-pointer rounded-lg border p-2 text-left dt-transition active:scale-[0.98] ${
                    cabinLight === opt.id
                      ? opt.id === 'amber_1800'
                        ? 'border-warning bg-warning-container text-on-warning-container'
                        : 'border-primary bg-primary-container text-on-primary-container'
                      : 'border-outline bg-surface-container text-on-surface hover:border-primary/40'
                  }`}
                >
                  <p className="text-[11px] font-bold font-display">{opt.label}</p>
                  <p className="text-[10px] opacity-80">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Psychological Checklist */}
          <div className="space-y-2">
            {[
              {
                key: 'breathing' as const,
                title: isEs
                  ? 'Diaria: Sesión de respiración guiada anti-cortisol'
                  : 'Daily: Guided anti-cortisol breathing session',
                desc: isEs
                  ? 'Se marca automáticamente al finalizar los ciclos guiados o manualmente.'
                  : 'Automatically checked upon completing guided cycles or manually.',
              },
              {
                key: 'circadianLight' as const,
                title: isEs
                  ? 'Diaria: Ajuste de luz circadiana ámbar 1800K pre-sueño'
                  : 'Daily: Pre-sleep 1800K amber circadian light adjustment',
                desc: isEs
                  ? 'Sincronizado con el controlador superior (vital en 16 amaneceres/día).'
                  : 'Synced with top controller (critical across 16 orbital sunrises/day).',
              },
              {
                key: 'weeklyResilience' as const,
                title: isEs
                  ? 'Semanal: Revisión de resiliencia "Tercer Cuarto de Misión"'
                  : 'Weekly: "Mission Third-Quarter" resilience review',
                desc: isEs
                  ? 'Refuerza motivación y cohesión interpersonal al superar el 50% de tránsito.'
                  : 'Reinforces motivation and interpersonal cohesion past 50% transit.',
              },
            ].map((item) => {
              const checked = psychRoutinesChecked[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => togglePsychRoutine(item.key)}
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
                  <div>
                    <p
                      className={`text-xs font-semibold font-display ${
                        checked
                          ? 'line-through text-on-surface-variant'
                          : 'text-on-surface'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Real Millisecond Psychomotor Vigilance Test (PVT) */}
      <PvtCognitiveTestCard />

      {/* Row 3: Video Diary Studio & Real MediaRecorder / Local NLP / Earth Sync */}
      <VideoDiaryStudio currentMoodScore={moodScore} />

      {/* Row 4: Interactive Historical Mental Health Chart (Native SVG) */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Moon className="h-5 w-5 text-telemetry" />
              {isEs
                ? 'Evolución de Salud Mental y Sueño en la Misión'
                : 'Mission Mental Health & Sleep Trajectory'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {isEs
                ? 'Haz clic o pasa el cursor sobre cualquier día para inspeccionar ánimo, sueño (banda óptima 7–8.5h) y estrés.'
                : 'Click or hover over any day to inspect mood, sleep (optimal 7–8.5h band), and stress.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />{' '}
              {isEs ? 'Ánimo' : 'Mood'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-telemetry">
              <span className="h-2.5 w-2.5 rounded-full bg-telemetry" />{' '}
              {isEs ? 'Horas Sueño' : 'Sleep Hours'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-warning">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />{' '}
              {isEs ? 'Estrés' : 'Stress'}
            </span>
          </div>
        </div>

        {activeDayPoint && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2 text-xs">
            <span className="font-mono font-bold text-on-surface">
              {isEs ? 'Inspección Día' : 'Inspecting Day'} {activeDayPoint.day}
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono">
              <span className="text-primary font-semibold">
                {isEs ? 'Ánimo' : 'Mood'}: {activeDayPoint.moodScore}/10
              </span>
              <span className="text-telemetry font-semibold">
                {isEs ? 'Sueño' : 'Sleep'}: {activeDayPoint.sleepHours} h
              </span>
              <span className="text-warning font-semibold">
                {isEs ? 'Estrés' : 'Stress'}: {activeDayPoint.stressLevel}/10
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
                ? 'Gráfica histórica interactiva de evolución mental en la misión'
                : 'Interactive mission mental health trajectory chart'
            }
          >
            {/* Optimal sleep corridor (7h - 8.5h) */}
            <rect
              x={padL}
              y={sleepTargetTopY}
              width={plotW}
              height={sleepTargetBottomY - sleepTargetTopY}
              fill="rgba(43, 91, 108, 0.12)"
            />

            {[2, 4, 6, 8, 10].map((v) => {
              const y = toY10(v);
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
                  <text x={8} y={y + 4} fill="#55635B" fontSize="10">
                    {v}
                  </text>
                </g>
              );
            })}

            <path d={moodPath} fill="none" stroke="#2F5D46" strokeWidth="2.5" />
            <path d={sleepPath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />
            <path d={stressPath} fill="none" stroke="#B54708" strokeWidth="2" strokeDasharray="5 3" />

            {history.map((pt, i) => {
              const isSelected = activeDayIdx === i;
              const x = toX(i);
              return (
                <g
                  key={pt.day}
                  onMouseEnter={() => setInspectedDayIdx(i)}
                  onClick={() => setInspectedDayIdx(i)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x - 14}
                    y={padT}
                    width={28}
                    height={plotH}
                    fill="transparent"
                  />
                  {isSelected && (
                    <line
                      x1={x}
                      y1={padT}
                      x2={x}
                      y2={padT + plotH}
                      stroke="#2F5D46"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={toY10(pt.moodScore)}
                    r={isSelected ? '5' : '3.5'}
                    fill="#2F5D46"
                  />
                  <circle
                    cx={x}
                    cy={toY10(pt.sleepHours)}
                    r={isSelected ? '5' : '3.5'}
                    fill="#2B5B6C"
                  />
                  <circle
                    cx={x}
                    cy={toY10(pt.stressLevel)}
                    r={isSelected ? '4.5' : '3'}
                    fill="#B54708"
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

      {/* Row 5: Family Inspiration Vault ("Mi Ancla en la Tierra") */}
      <EarthAnchorVault />
    </div>
  );
}
