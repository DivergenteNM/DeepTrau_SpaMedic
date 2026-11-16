'use client';

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  HeartPulse,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { hasKnownAllergies } from '@/data/astronautsData';
import {
  EmergencyProtocol,
  EmergencyVitalKey,
  MiniBodyZoneId,
  buildDynamicContraindications,
  evaluateSymptomTriage,
  getEmergencyProtocols,
  getQuickSymptomTags,
  getSimulatedCaptures,
} from '@/data/emergencyProtocolsData';
import { EmergencyMiniBodyMap } from '@/components/emergency/EmergencyMiniBodyMap';
import { Language } from '@/i18n/types';

interface SosCommandWorkspaceProps {
  mode: 'overlay' | 'page';
  onBack: () => void;
  titleId?: string;
}

interface EarthPacketSnapshot {
  timestampUtc: string;
  protocolTitle: string;
  severityLabel: string;
  astronautName: string;
  bloodType: string;
  gravityLabel: string;
  commDelay: string;
  vitalsSummary: string;
  elapsedFormatted: string;
  checklistSummary: string;
  lapsCount: number;
  allergyWarning: string;
}

export interface StopwatchHandle {
  startIfIdle: () => void;
  getElapsedMs: () => number;
  getLapsCount: () => number;
}

function formatElapsedTime(totalMs: number): string {
  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

type VitalSeverity = 'nominal' | 'warning' | 'critical';

function evaluateVitalSeverity(
  key: EmergencyVitalKey,
  systolic: number,
  diastolic: number,
  hr: number,
  spo2: number,
  glucose: number,
  tempC: number
): VitalSeverity {
  switch (key) {
    case 'bp':
      if (systolic <= 90 || systolic >= 165 || diastolic <= 55) return 'critical';
      if (systolic <= 100 || systolic >= 145) return 'warning';
      return 'nominal';
    case 'hr':
      if (hr <= 45 || hr >= 125) return 'critical';
      if (hr <= 52 || hr >= 105) return 'warning';
      return 'nominal';
    case 'spo2':
      if (spo2 < 90) return 'critical';
      if (spo2 < 94) return 'warning';
      return 'nominal';
    case 'glucose':
      if (glucose < 65 || glucose >= 240) return 'critical';
      if (glucose < 74 || glucose >= 180) return 'warning';
      return 'nominal';
    case 'temp':
      if (tempC >= 38.5 || tempC <= 35.2) return 'critical';
      if (tempC >= 37.7 || tempC <= 35.8) return 'warning';
      return 'nominal';
  }
}

function getSeverityStyle(severity: VitalSeverity, lang: Language) {
  const isEs = lang === 'es';
  if (severity === 'critical') {
    return {
      label: isEs ? 'Crítico' : 'Critical',
      badgeClasses: 'bg-danger-container text-on-danger-container',
      dotClass: 'bg-danger',
    };
  }
  if (severity === 'warning') {
    return {
      label: isEs ? 'Precaución' : 'Caution',
      badgeClasses: 'bg-warning-container text-on-warning-container',
      dotClass: 'bg-warning',
    };
  }
  return {
    label: 'Nominal',
    badgeClasses: 'bg-primary-container text-on-primary-container',
    dotClass: 'bg-primary',
  };
}

const EpisodeStopwatch = React.forwardRef<
  StopwatchHandle,
  {
    autoStartTrigger: boolean;
    onConsumeAutoStart: () => void;
    onRunningChange?: (running: boolean) => void;
    language: Language;
  }
>(function EpisodeStopwatch(
  { autoStartTrigger, onConsumeAutoStart, onRunningChange, language },
  ref
) {
  const isEs = language === 'es';
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<string[]>([]);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoStartTrigger) {
      setElapsedMs(0);
      setLaps([]);
      setIsRunning(true);
      lastTickRef.current = Date.now();
      onConsumeAutoStart();
    }
  }, [autoStartTrigger, onConsumeAutoStart]);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (!isRunning) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const prev = lastTickRef.current ?? now;
      lastTickRef.current = now;
      setElapsedMs((curr) => curr + (now - prev));
    }, 100);
    return () => clearInterval(timer);
  }, [isRunning]);

  useImperativeHandle(
    ref,
    () => ({
      startIfIdle: () => {
        if (!isRunning) {
          lastTickRef.current = Date.now();
          setIsRunning(true);
        }
      },
      getElapsedMs: () => elapsedMs,
      getLapsCount: () => laps.length,
    }),
    [elapsedMs, isRunning, laps.length]
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex items-center gap-2 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5">
        <Clock
          className={`h-3.5 w-3.5 ${isRunning ? 'text-danger' : 'text-primary'}`}
          aria-hidden="true"
        />
        <span className="hidden text-[11px] font-medium text-on-surface-variant xl:inline">
          {isEs ? 'Episodio' : 'Episode'}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums text-on-surface">
          {formatElapsedTime(elapsedMs)}
        </span>
        {laps.length > 0 && (
          <span className="hidden border-l border-outline pl-2 font-mono text-[11px] text-on-surface-variant 2xl:inline">
            {isEs ? 'M' : 'L'}
            {laps.length}: {laps[laps.length - 1]}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsRunning((prev) => !prev)}
        className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
          isRunning
            ? 'border border-warning/40 bg-warning-container text-on-warning-container hover:bg-warning-container/80'
            : 'bg-primary text-on-primary hover:bg-primary-hover'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEs ? 'Pausar' : 'Pause'}</span>
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {elapsedMs > 0
                ? isEs
                  ? 'Reanudar'
                  : 'Resume'
                : isEs
                  ? 'Iniciar reloj'
                  : 'Start Timer'}
            </span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setLaps((prev) => [...prev, formatElapsedTime(elapsedMs)].slice(-4))}
        disabled={elapsedMs === 0 && !isRunning}
        className="inline-flex min-h-[34px] cursor-pointer items-center rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5 text-xs font-semibold text-on-surface font-display dt-transition hover:border-primary/45 hover:bg-surface-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        {isEs ? 'Marca' : 'Lap'}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsRunning(false);
          setElapsedMs(0);
          setLaps([]);
        }}
        title={isEs ? 'Reiniciar cronómetro' : 'Reset stopwatch'}
        aria-label={isEs ? 'Reiniciar cronómetro' : 'Reset stopwatch'}
        className="inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container-low px-2 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:border-primary/45 hover:bg-surface-container hover:text-on-surface active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
});

export default function SosCommandWorkspace({
  mode,
  onBack,
  titleId = 'sos-emergency-heading',
}: SosCommandWorkspaceProps) {
  const {
    language,
    activeEmergencyProtocolId,
    setActiveEmergencyProtocolId,
    activeCrisisScenario,
    crisisAlertBanner,
    shouldAutoStartTimer,
    clearAutoStartTimerFlag,
    simulateLiveCrisis,
    restoreNominalVitals,
    mission,
    astronaut,
    biomarkers,
    missionDay,
  } = useMission();

  const isEs = language === 'es';
  const protocols = useMemo(() => getEmergencyProtocols(language), [language]);
  const quickSymptomTags = useMemo(() => getQuickSymptomTags(language), [language]);
  const simulatedCaptures = useMemo(() => getSimulatedCaptures(language), [language]);

  const stopwatchRef = useRef<StopwatchHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const crisisMenuRef = useRef<HTMLDivElement | null>(null);
  const safetyRef = useRef<HTMLDivElement | null>(null);

  const [isCrisisMenuOpen, setIsCrisisMenuOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<MiniBodyZoneId>('head');
  const [checkedSteps, setCheckedSteps] = useState<string[]>([]);

  const [symptomQuery, setSymptomQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedCaptureUrl, setSelectedCaptureUrl] = useState<string | null>(null);
  const [selectedCaptureLabel, setSelectedCaptureLabel] = useState<string | null>(null);
  const [selectedCaptureFinding, setSelectedCaptureFinding] = useState<string | null>(null);
  const [isSimulatedCapture, setIsSimulatedCapture] = useState(false);

  const [sentPacket, setSentPacket] = useState<EarthPacketSnapshot | null>(null);

  const activeProtocol: EmergencyProtocol = useMemo(
    () => protocols.find((p) => p.id === activeEmergencyProtocolId) ?? protocols[0],
    [protocols, activeEmergencyProtocolId]
  );

  useEffect(() => {
    const firstZone = activeProtocol.verifyNow.zones[0]?.zoneId ?? 'head';
    setSelectedZoneId(firstZone);
    setCheckedSteps([]);
  }, [activeProtocol]);

  useEffect(() => {
    if (!isCrisisMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCrisisMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (crisisMenuRef.current && !crisisMenuRef.current.contains(e.target as Node)) {
        setIsCrisisMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCrisisMenuOpen]);

  const vitalsSnapshot = useMemo(
    () => ({
      glucoseMgDl: biomarkers.glucoseMgDl,
      spo2Percent: biomarkers.spo2Percent,
      systolicBP: biomarkers.systolicBP,
      diastolicBP: biomarkers.diastolicBP,
      heartRateBpm: biomarkers.heartRateBpm,
      bodyTempC: biomarkers.bodyTempC,
      wbcCount: biomarkers.wbcCount,
    }),
    [biomarkers]
  );

  const vitalCards = useMemo(() => {
    const items: Array<{
      key: EmergencyVitalKey;
      label: string;
      value: string;
      unit: string;
      severity: VitalSeverity;
    }> = [
      {
        key: 'bp',
        label: isEs ? 'Presión arterial' : 'Blood Pressure',
        value: `${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
        unit: 'mmHg',
        severity: evaluateVitalSeverity(
          'bp',
          biomarkers.systolicBP,
          biomarkers.diastolicBP,
          biomarkers.heartRateBpm,
          biomarkers.spo2Percent,
          biomarkers.glucoseMgDl,
          biomarkers.bodyTempC
        ),
      },
      {
        key: 'hr',
        label: isEs ? 'Frecuencia cardíaca' : 'Heart Rate',
        value: `${biomarkers.heartRateBpm}`,
        unit: isEs ? 'lpm' : 'bpm',
        severity: evaluateVitalSeverity(
          'hr',
          biomarkers.systolicBP,
          biomarkers.diastolicBP,
          biomarkers.heartRateBpm,
          biomarkers.spo2Percent,
          biomarkers.glucoseMgDl,
          biomarkers.bodyTempC
        ),
      },
      {
        key: 'spo2',
        label: isEs ? 'Saturación O₂' : 'O₂ Saturation',
        value: `${biomarkers.spo2Percent}%`,
        unit: 'SpO₂',
        severity: evaluateVitalSeverity(
          'spo2',
          biomarkers.systolicBP,
          biomarkers.diastolicBP,
          biomarkers.heartRateBpm,
          biomarkers.spo2Percent,
          biomarkers.glucoseMgDl,
          biomarkers.bodyTempC
        ),
      },
      {
        key: 'glucose',
        label: isEs ? 'Glucosa capilar' : 'Capillary Glucose',
        value: `${biomarkers.glucoseMgDl}`,
        unit: 'mg/dL',
        severity: evaluateVitalSeverity(
          'glucose',
          biomarkers.systolicBP,
          biomarkers.diastolicBP,
          biomarkers.heartRateBpm,
          biomarkers.spo2Percent,
          biomarkers.glucoseMgDl,
          biomarkers.bodyTempC
        ),
      },
      {
        key: 'temp',
        label: isEs ? 'Temperatura central' : 'Core Temperature',
        value: `${biomarkers.bodyTempC.toFixed(1)}`,
        unit: '°C',
        severity: evaluateVitalSeverity(
          'temp',
          biomarkers.systolicBP,
          biomarkers.diastolicBP,
          biomarkers.heartRateBpm,
          biomarkers.spo2Percent,
          biomarkers.glucoseMgDl,
          biomarkers.bodyTempC
        ),
      },
    ];
    return items;
  }, [biomarkers, isEs]);

  const triageRecommendation = useMemo(
    () => evaluateSymptomTriage(submittedQuery, vitalsSnapshot, astronaut, mission, language),
    [submittedQuery, vitalsSnapshot, astronaut, mission, language]
  );

  const recommendedProtocol = useMemo(
    () =>
      protocols.find((p) => p.id === triageRecommendation.recommendedProtocolId) ?? protocols[0],
    [protocols, triageRecommendation.recommendedProtocolId]
  );

  const gravitySteps = useMemo(() => {
    const specific =
      mission.gravityG === 0
        ? activeProtocol.actionSteps.zeroGSteps
        : activeProtocol.actionSteps.partialGravitySteps;
    return [...specific, ...activeProtocol.actionSteps.commonSteps];
  }, [activeProtocol, mission.gravityG]);

  const dynamicSafety = useMemo(
    () => buildDynamicContraindications(activeProtocol, astronaut, language),
    [activeProtocol, astronaut, language]
  );

  const allergies = useMemo(() => {
    if (!hasKnownAllergies(astronaut.clinicalHistory.allergies)) return [];
    return astronaut.clinicalHistory.allergies.filter(
      (a) => !['ninguna', 'none'].includes(a.trim().toLowerCase())
    );
  }, [astronaut.clinicalHistory.allergies]);

  const handleToggleStep = (stepKey: string) => {
    setCheckedSteps((prev) =>
      prev.includes(stepKey) ? prev.filter((item) => item !== stepKey) : [...prev, stepKey]
    );
  };

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(
      symptomQuery.trim() ||
        (isEs ? 'evaluación rápida signos vitales' : 'rapid vital signs assessment')
    );
  };

  const handleSelectTag = (tagQuery: string) => {
    setSymptomQuery(tagQuery);
    setSubmittedQuery(tagQuery);
  };

  const handleSelectSimulatedCapture = (captureId: string) => {
    const found = simulatedCaptures.find((c) => c.id === captureId);
    if (!found) return;
    setSelectedCaptureUrl(found.dataUrl);
    setSelectedCaptureLabel(`${found.modality}: ${found.caption}`);
    setSelectedCaptureFinding(found.findingSummary);
    setIsSimulatedCapture(true);
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedCaptureUrl(reader.result);
        setSelectedCaptureLabel(`${isEs ? 'Captura local' : 'Local capture'}: ${file.name}`);
        setSelectedCaptureFinding(
          isEs
            ? 'Imagen cargada por el tripulante para inspección visual y adjunto al paquete de Control en Tierra.'
            : 'Crew-uploaded image ready for visual inspection and Earth Mission Control downlink attachment.'
        );
        setIsSimulatedCapture(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransmitEarthPacket = () => {
    const nowUtc = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const currentElapsed = stopwatchRef.current?.getElapsedMs() ?? 0;
    const lapsCount = stopwatchRef.current?.getLapsCount() ?? 0;

    setSentPacket({
      timestampUtc: nowUtc,
      protocolTitle: activeProtocol.title,
      severityLabel:
        activeProtocol.urgency === 'critical'
          ? isEs
            ? 'CRÍTICA'
            : 'CRITICAL'
          : isEs
            ? 'ALTA'
            : 'HIGH',
      astronautName: astronaut.name,
      bloodType: astronaut.bloodType,
      gravityLabel: mission.gravityLabel,
      commDelay: mission.commDelay,
      vitalsSummary: isEs
        ? `PA ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · FC ${biomarkers.heartRateBpm} lpm · SpO2 ${biomarkers.spo2Percent}% · Glucosa ${biomarkers.glucoseMgDl} mg/dL · Temp ${biomarkers.bodyTempC.toFixed(1)} °C`
        : `BP ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · HR ${biomarkers.heartRateBpm} bpm · SpO2 ${biomarkers.spo2Percent}% · Glucose ${biomarkers.glucoseMgDl} mg/dL · Temp ${biomarkers.bodyTempC.toFixed(1)} °C`,
      elapsedFormatted: formatElapsedTime(currentElapsed),
      checklistSummary: isEs
        ? `${checkedSteps.length} / ${gravitySteps.length} pasos completados`
        : `${checkedSteps.length} / ${gravitySteps.length} steps completed`,
      lapsCount,
      allergyWarning:
        allergies.length > 0
          ? isEs
            ? `Alergia activa: ${allergies.join(', ')}`
            : `Active allergy: ${allergies.join(', ')}`
          : isEs
            ? 'Sin alergias farmacológicas activas'
            : 'No active drug allergies',
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Sticky Emergency Command Header */}
      <header className="sticky top-0 z-30 border-b border-danger/35 bg-surface-container/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
          {/* Left: SOS Identity + Live Mission & Patient Context */}
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-danger text-white shadow-xs"
                aria-hidden="true"
              >
                <HeartPulse className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-danger px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {isEs ? 'SOS ACTIVO' : 'SOS ACTIVE'}
                  </span>
                  <h1
                    id={titleId}
                    className="truncate text-sm font-bold tracking-tight text-on-surface font-display sm:text-base"
                  >
                    {isEs ? 'Consola Médica de Emergencia' : 'Emergency Medical Console'}
                  </h1>
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{astronaut.name}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-on-danger-container">
                    {astronaut.bloodType}
                  </span>
                  <span>·</span>
                  <span>
                    {mission.shortName} ({isEs ? 'Día' : 'Day'} {missionDay})
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline font-medium text-on-surface">
                    {mission.gravityLabel}
                  </span>
                  <span className="hidden md:inline">·</span>
                  <span className="hidden md:inline">
                    {isEs ? 'Retardo Tierra:' : 'Earth Delay:'} {mission.commDelay}
                  </span>
                </p>
              </div>
            </div>

            {allergies.length > 0 && (
              <button
                type="button"
                onClick={() => safetyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-danger/35 bg-danger-container px-2.5 py-1 text-xs font-semibold text-on-danger-container dt-transition hover:bg-danger-container/80 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {isEs ? 'Alergia' : 'Allergy'}: {allergies.join(', ')}
                </span>
              </button>
            )}
          </div>

          {/* Right: Language + Stopwatch + Simulate Crisis Demo + Exit */}
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher />
            <EpisodeStopwatch
              ref={stopwatchRef}
              autoStartTrigger={shouldAutoStartTimer}
              onConsumeAutoStart={clearAutoStartTimerFlag}
              language={language}
            />

            <div ref={crisisMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCrisisMenuOpen((prev) => !prev)}
                aria-expanded={isCrisisMenuOpen}
                className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40 ${
                  activeCrisisScenario
                    ? 'border-warning bg-warning-container text-on-warning-container'
                    : 'border-outline bg-surface-container-low text-on-surface-variant hover:-translate-y-px hover:border-warning/50 hover:bg-warning-container/45 hover:text-on-surface'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {isEs ? 'Simular crisis' : 'Simulate crisis'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-75" aria-hidden="true" />
              </button>

              {isCrisisMenuOpen && (
                <div className="dt-animate-panel absolute right-0 top-[calc(100%+8px)] z-40 w-80 rounded-2xl border border-outline bg-surface-container p-3 shadow-[0_14px_32px_-12px_rgba(26,36,30,0.20)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                      {isEs ? 'Escenarios de Demostración' : 'Demo Crisis Scenarios'}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-warning">SIM</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCrisisMenuOpen(false);
                      simulateLiveCrisis('syncope_hypoglycemic');
                    }}
                    className="w-full cursor-pointer rounded-xl border border-danger/35 bg-danger-container/60 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-danger hover:bg-danger-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                  >
                    <p className="text-xs font-bold text-on-danger-container font-display">
                      {isEs
                        ? '1. Síncope / Shock Hipoglucémico'
                        : '1. Hypoglycemic Syncope / Shock'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-on-danger-container/90">
                      {isEs
                        ? 'Glucosa 52 mg/dL, PA 82/50 mmHg, alerta crítica y reloj activo.'
                        : 'Glucose 52 mg/dL, BP 82/50 mmHg, critical alert & timer running.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCrisisMenuOpen(false);
                      simulateLiveCrisis('microgravity_seizure');
                    }}
                    className="w-full cursor-pointer rounded-xl border border-warning/40 bg-warning-container/65 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-warning hover:bg-warning-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
                  >
                    <p className="text-xs font-bold text-on-warning-container font-display">
                      {isEs
                        ? '2. Crisis Convulsiva en Microgravedad'
                        : '2. Microgravity Seizure Episode'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-on-warning-container/90">
                      {isEs
                        ? 'Protocolo de contención 0g preseleccionado y cronómetro corriendo.'
                        : '0g restraint protocol preselected with episode timer running.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCrisisMenuOpen(false);
                      restoreNominalVitals();
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/35 bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container font-display dt-transition hover:bg-primary hover:text-on-primary active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {isEs ? 'Restablecer Signos Nominales' : 'Restore Nominal Vitals'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBack}
              className="group inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl border border-outline bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface font-display dt-transition hover:border-primary/45 hover:bg-surface-container-low active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 text-on-surface-variant dt-transition group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              <span>
                {mode === 'overlay'
                  ? isEs
                    ? 'Salir de SOS'
                    : 'Exit SOS'
                  : isEs
                    ? 'Volver al Panel'
                    : 'Back to Dashboard'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Operational Workspace */}
      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 lg:px-6">
        {/* Active Crisis Alert Banner (Only visible during live simulated crisis) */}
        {activeCrisisScenario && crisisAlertBanner && (
          <div
            className="dt-animate-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/45 bg-danger-container px-4 py-3 text-on-danger-container"
            role="alert"
          >
            <div className="flex items-start gap-2.5 sm:items-center">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger sm:mt-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-display">{crisisAlertBanner.title}:</strong>{' '}
                <span>{crisisAlertBanner.description}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={restoreNominalVitals}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-danger/40 bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-danger-container dt-transition hover:bg-surface active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEs ? 'Restablecer signos' : 'Restore vitals'}</span>
            </button>
          </div>
        )}

        {/* 1. Unified 5-Sensor Live Vital Telemetry Strip */}
        <section aria-label={isEs ? 'Signos vitales en vivo' : 'Live vital signs'}>
          <div className="overflow-hidden rounded-2xl border border-outline bg-surface-container">
            <div className="grid grid-cols-2 divide-y divide-outline-variant sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
              {vitalCards.map((vital) => {
                const style = getSeverityStyle(vital.severity, language);
                const isProtocolTarget = activeProtocol.verifyNow.vitalKeys.includes(vital.key);
                return (
                  <div
                    key={vital.key}
                    className={`flex flex-col justify-between gap-1.5 px-4 py-3 ${
                      isProtocolTarget
                        ? vital.severity === 'critical'
                          ? 'border-t-2 border-t-danger bg-danger-container/20'
                          : 'border-t-2 border-t-primary bg-surface-container-low/40'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-on-surface-variant">
                        {vital.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold font-display ${style.badgeClasses}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dotClass}`} />
                        {style.label}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xl font-semibold tracking-tight tabular-nums text-on-surface sm:text-2xl">
                          {vital.value}
                        </span>
                        <span className="text-xs text-on-surface-variant">{vital.unit}</span>
                      </div>
                      {isProtocolTarget && (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {isEs ? 'Clave' : 'Key'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Quick 6-Protocol Selector Strip */}
        <section
          aria-label={
            isEs ? 'Selector rápido de protocolos de emergencia' : 'Quick emergency protocol selector'
          }
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-on-surface-variant font-display">
              {isEs ? 'Protocolos de Respuesta Rápida (6)' : 'Rapid Response Protocols (6)'}
            </h2>
            <span className="text-xs text-on-surface-variant">
              {isEs
                ? 'Pasos adaptados automáticamente a '
                : 'Steps automatically adapted to '}
              <strong>{mission.gravityLabel}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {protocols.map((protocol) => {
              const isSelected = protocol.id === activeProtocol.id;
              const isCritical = protocol.urgency === 'critical';
              return (
                <button
                  key={protocol.id}
                  type="button"
                  onClick={() => setActiveEmergencyProtocolId(protocol.id)}
                  aria-pressed={isSelected}
                  className={`flex cursor-pointer flex-col justify-between gap-1 rounded-xl border p-3 text-left dt-transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    isSelected
                      ? 'border-primary bg-surface-container dt-selected-ring'
                      : 'border-outline bg-surface-container-low/70 hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-on-surface-variant">
                      {protocol.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        isCritical
                          ? 'bg-danger-container text-on-danger-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCritical ? 'bg-danger' : 'bg-warning'
                        }`}
                      />
                      {isCritical
                        ? isEs
                          ? 'CRÍTICA'
                          : 'CRITICAL'
                        : isEs
                          ? 'ALTA'
                          : 'HIGH'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-snug text-on-surface font-display sm:text-[13px]">
                    {protocol.shortTitle}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Main Operational Grid: Left Protocol Execution (8 cols) + Right AI Triage & Earth Link (4 cols) */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {/* Left Primary Protocol Execution Panel (8 cols) */}
          <section
            aria-label={isEs ? 'Guía clínica del protocolo activo' : 'Active protocol clinical guide'}
            className="overflow-hidden rounded-2xl border border-outline bg-surface-container lg:col-span-8"
          >
            <div key={activeProtocol.id} className="dt-animate-enter">
              {/* Protocol Title Bar */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant bg-surface-container-low/45 px-4 py-3.5 sm:px-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                        activeProtocol.urgency === 'critical'
                          ? 'bg-danger-container text-on-danger-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {activeProtocol.code} · {isEs ? 'PRIORIDAD' : 'PRIORITY'}{' '}
                      {activeProtocol.urgency === 'critical'
                        ? isEs
                          ? 'CRÍTICA'
                          : 'CRITICAL'
                        : isEs
                          ? 'ALTA'
                          : 'HIGH'}
                    </span>
                    <span className="text-xs font-medium text-on-surface-variant">
                      {isEs ? 'Entorno:' : 'Environment:'} {mission.gravityLabel}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-on-surface font-display sm:text-xl">
                    {activeProtocol.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    <strong>Ref.:</strong> {activeProtocol.nasaReference}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-outline bg-surface-container px-2.5 py-1 font-mono text-xs font-semibold text-on-surface">
                    {checkedSteps.length} / {gravitySteps.length} {isEs ? 'pasos' : 'steps'}
                  </span>
                  {checkedSteps.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCheckedSteps([])}
                      className="cursor-pointer rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface-variant dt-transition hover:border-primary/45 hover:bg-surface-container hover:text-on-surface active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {isEs ? 'Limpiar' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Column 1 (Body Verification) & Column 2 (Gravity Checklist) */}
              <div className="grid grid-cols-1 divide-y divide-outline-variant md:grid-cols-12 md:divide-x md:divide-y-0">
                {/* Col 1: What to Verify + Interactive Mini Body Map */}
                <div className="space-y-3 p-4 md:col-span-5">
                  <div className="space-y-1">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      {isEs ? '1. Qué verificar ya' : '1. Verify immediately'}
                    </p>
                    <p className="text-sm leading-snug text-on-surface">
                      {activeProtocol.verifyNow.quickCheckSummary}
                    </p>
                  </div>

                  <EmergencyMiniBodyMap
                    protocolZones={activeProtocol.verifyNow.zones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={setSelectedZoneId}
                    urgency={activeProtocol.urgency}
                  />
                </div>

                {/* Col 2: Gravity-Adapted Interactive Checklist */}
                <div className="space-y-2.5 p-4 md:col-span-7">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      {isEs
                        ? `2. Pasos de acción en ${mission.gravityLabel}`
                        : `2. Action steps in ${mission.gravityLabel}`}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isEs
                        ? 'Marca cada maniobra al completarla en cabina.'
                        : 'Check off each maneuver as completed in cabin.'}
                    </p>
                  </div>

                  <div className="divide-y divide-outline-variant">
                    {gravitySteps.map((stepText, idx) => {
                      const stepKey = `${activeProtocol.id}-${idx}`;
                      const isDone = checkedSteps.includes(stepKey);
                      return (
                        <button
                          key={stepKey}
                          type="button"
                          onClick={() => handleToggleStep(stepKey)}
                          aria-pressed={isDone}
                          className="flex min-h-[42px] w-full cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-left dt-transition hover:bg-surface-container-low/75 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                        >
                          <span
                            className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold dt-transition ${
                              isDone
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-outline bg-surface text-on-surface-variant'
                            }`}
                            aria-hidden="true"
                          >
                            {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                          </span>
                          <span
                            className={`text-sm leading-snug ${
                              isDone ? 'text-on-surface-variant line-through' : 'text-on-surface'
                            }`}
                          >
                            {stepText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Col 3 Band: Clinical Contraindications (EHR), Do-Nots & Earth Escalation */}
              <div
                ref={safetyRef}
                className="space-y-3 border-t border-outline-variant bg-surface-container-low/35 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-2.5 text-xs text-on-surface">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {isEs
                      ? '3. Qué NO hacer y escalado a Tierra'
                      : '3. Contraindications & Earth escalation'}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>
                      <strong>{isEs ? 'Cirugías:' : 'Surgeries:'}</strong>{' '}
                      {astronaut.clinicalHistory.priorSurgeries.join('; ')}
                    </span>
                    <span>
                      <strong>{isEs ? 'Inmunidad:' : 'Immunity:'}</strong>{' '}
                      {astronaut.clinicalHistory.immuneStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {/* Dynamic EHR Rules */}
                  <div className="space-y-2 border-l-2 border-danger pl-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-on-danger-container font-display">
                      {isEs ? 'Alertas por expediente EHR' : 'EHR Profile Alerts'}
                    </h3>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-on-surface">
                      {dynamicSafety.ehrRules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Base Contraindications */}
                  <div className="space-y-2 border-l-2 border-warning pl-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-on-warning-container font-display">
                      {isEs ? 'Qué NO hacer en cabina' : 'Cabin Contraindications'}
                    </h3>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-on-surface">
                      {dynamicSafety.baseRules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Earth Escalation Criteria */}
                  <div className="space-y-2 border-l-2 border-telemetry pl-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-on-telemetry-container font-display">
                      {isEs ? 'Cuándo escalar a Tierra' : 'When to Escalate to Earth'}
                    </h3>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-on-surface">
                      {activeProtocol.earthEscalation.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Tactical Column (4 cols): AI Triage Copilot + Optics + Earth Packet */}
          <aside className="space-y-4 lg:col-span-4">
            {/* Copiloto IA de Triaje Rápido y Captura ADUM */}
            <section
              aria-label={
                isEs ? 'Copiloto de triaje y óptica ADUM' : 'AI triage copilot & ADUM optics'
              }
              className="space-y-3.5 rounded-2xl border border-outline bg-surface-container p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-on-surface font-display">
                    {isEs ? 'Copiloto IA de Triaje' : 'AI Triage Copilot'}
                  </h2>
                </div>
                <span className="font-mono text-[11px] font-medium text-on-surface-variant">
                  {isEs ? 'EHR + Vitales' : 'EHR + Vitals'}
                </span>
              </div>

              <form onSubmit={handleTriageSubmit} className="flex gap-2">
                <label htmlFor="sos-symptom-input" className="sr-only">
                  {isEs ? 'Describe síntoma observado' : 'Describe observed symptom'}
                </label>
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
                    aria-hidden="true"
                  />
                  <input
                    id="sos-symptom-input"
                    type="text"
                    value={symptomQuery}
                    onChange={(e) => setSymptomQuery(e.target.value)}
                    placeholder={
                      isEs
                        ? 'Ej: mareo tras EVA, dolor pecho...'
                        : 'e.g., post-EVA dizziness, chest pain...'
                    }
                    className="min-h-[42px] w-full rounded-xl border border-outline bg-surface py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary font-display dt-transition hover:bg-primary-hover active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  {isEs ? 'Analizar' : 'Analyze'}
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5">
                {quickSymptomTags.slice(0, 4).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelectTag(tag.queryText)}
                    className="cursor-pointer rounded-lg border border-outline bg-surface px-2.5 py-1 text-left text-xs font-medium text-on-surface dt-transition hover:border-primary/45 hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Structured Triage Result */}
              <div
                key={`${triageRecommendation.recommendedProtocolId}-${triageRecommendation.urgency}-${submittedQuery}`}
                className={`dt-animate-panel space-y-2 rounded-xl border p-3.5 text-xs ${
                  triageRecommendation.urgency === 'critical'
                    ? 'border-danger/35 bg-danger-container/50 text-on-surface'
                    : 'border-warning/35 bg-warning-container/55 text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold font-display">
                    {isEs ? 'Sugerencia:' : 'Suggested:'} {recommendedProtocol.shortTitle}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      triageRecommendation.urgency === 'critical'
                        ? 'bg-danger text-white'
                        : 'bg-warning text-white'
                    }`}
                  >
                    {triageRecommendation.urgency === 'critical'
                      ? isEs
                        ? 'ROJO'
                        : 'RED'
                      : isEs
                        ? 'AMARILLO'
                        : 'AMBER'}
                  </span>
                </div>

                <p className="leading-snug">{triageRecommendation.possibleCause}</p>

                <p className="font-medium text-on-danger-container">
                  {triageRecommendation.ehrAlert}
                </p>

                {recommendedProtocol.id !== activeProtocol.id && (
                  <button
                    type="button"
                    onClick={() => setActiveEmergencyProtocolId(recommendedProtocol.id)}
                    className="inline-flex cursor-pointer items-center rounded-lg border border-primary/35 bg-surface-container px-2.5 py-1.5 text-xs font-semibold text-on-primary-container dt-transition hover:bg-primary hover:text-on-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    {isEs ? 'Aplicar protocolo' : 'Apply protocol'} {recommendedProtocol.code}
                  </button>
                )}
              </div>

              {/* ADUM Ultrasound & Optical Capture */}
              <div className="space-y-2.5 border-t border-outline-variant pt-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface font-display">
                    <Eye className="h-4 w-4 text-telemetry" aria-hidden="true" />
                    <span>{isEs ? 'Captura ADUM / Óptica' : 'ADUM / Optical Capture'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface dt-transition hover:border-primary/45 hover:bg-surface-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEs ? 'Subir foto' : 'Upload image'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleRealFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {simulatedCaptures.map((cap) => (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => handleSelectSimulatedCapture(cap.id)}
                      title={cap.label}
                      className="cursor-pointer rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface dt-transition hover:border-telemetry/50 hover:bg-telemetry-container/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {cap.id.includes('optical')
                        ? isEs
                          ? 'Sim: Pupilar / O₂'
                          : 'Sim: Pupil / O₂'
                        : isEs
                          ? 'Sim: Eco FAST / Trauma'
                          : 'Sim: FAST Ultrasound'}
                    </button>
                  ))}
                </div>

                {selectedCaptureUrl && (
                  <div className="dt-animate-panel overflow-hidden rounded-xl border border-outline bg-[var(--color-viewport-surface)] text-[var(--color-on-viewport)]">
                    <div className="flex items-center justify-between gap-2 border-b border-outline/20 px-3 py-1.5 text-xs">
                      <span className="truncate font-medium">{selectedCaptureLabel}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        {isSimulatedCapture && (
                          <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-on-primary">
                            {isEs ? 'SIMULADA' : 'SIMULATED'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaptureUrl(null);
                            setSelectedCaptureLabel(null);
                            setSelectedCaptureFinding(null);
                          }}
                          className="cursor-pointer text-[var(--color-on-viewport)] dt-transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={isEs ? 'Cerrar captura' : 'Close capture'}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <img
                      src={selectedCaptureUrl}
                      alt={
                        selectedCaptureLabel ??
                        (isEs ? 'Captura médica de cabina' : 'Cabin medical capture')
                      }
                      width={360}
                      height={220}
                      className="h-[112px] w-full bg-[var(--color-viewport-surface)] object-contain"
                    />
                    {selectedCaptureFinding && (
                      <p className="px-3 py-2 text-xs text-primary-container">
                        {selectedCaptureFinding}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Enlace Crítico a Control de Misión en Tierra */}
            <section
              aria-label={
                isEs
                  ? 'Transmisión de paquete crítico a Tierra'
                  : 'Critical packet transmission to Earth'
              }
              className="space-y-3 rounded-2xl border border-outline bg-surface-container p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-telemetry" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-on-surface font-display">
                    {isEs ? 'Enlace Control en Tierra' : 'Earth Mission Control Link'}
                  </h2>
                </div>
                <span className="rounded-md bg-telemetry-container px-2 py-0.5 font-mono text-[11px] font-semibold text-on-telemetry-container">
                  {mission.commDelay}
                </span>
              </div>

              <div className="divide-y divide-outline-variant text-xs">
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-on-surface-variant">
                    {isEs ? 'Protocolo' : 'Protocol'}
                  </span>
                  <span className="font-semibold text-on-surface">{activeProtocol.shortTitle}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-on-surface-variant">
                    {isEs ? 'Progreso' : 'Progress'}
                  </span>
                  <span className="font-mono font-semibold text-on-surface">
                    {checkedSteps.length} / {gravitySteps.length} {isEs ? 'en' : 'in'}{' '}
                    {mission.gravityLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-on-surface-variant">
                    {isEs ? 'Adjunto óptico' : 'Optical attachment'}
                  </span>
                  <span className="truncate max-w-[190px] font-medium text-on-surface">
                    {selectedCaptureLabel ?? (isEs ? 'Solo telemetría + EHR' : 'Telemetry + EHR only')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTransmitEarthPacket}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white font-display dt-transition hover:-translate-y-px hover:bg-danger-hover active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/45"
              >
                <Radio className="h-4 w-4" aria-hidden="true" />
                <span>
                  {sentPacket
                    ? isEs
                      ? 'Reenviar paquete actualizado'
                      : 'Resend updated packet'
                    : isEs
                      ? 'Transmitir paquete crítico a Tierra'
                      : 'Transmit critical packet to Earth'}
                </span>
              </button>

              {sentPacket && (
                <div className="dt-animate-panel space-y-1.5 rounded-xl border border-primary/35 bg-primary-container/60 p-3.5 text-xs text-on-surface">
                  <div className="flex items-center justify-between gap-2 font-semibold text-on-primary-container">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      {isEs
                        ? 'Paquete enviado a Control Médico'
                        : 'Packet sent to Medical Control'}
                    </span>
                    <span className="font-mono text-[11px]">ETA {sentPacket.commDelay}</span>
                  </div>
                  <p className="font-mono text-[11px] text-on-surface-variant">
                    UTC: {sentPacket.timestampUtc} · {isEs ? 'Episodio' : 'Episode'}{' '}
                    {sentPacket.elapsedFormatted} ({sentPacket.lapsCount}{' '}
                    {isEs ? 'marcas' : 'laps'})
                  </p>
                  <p className="font-mono text-[11px] text-on-surface">{sentPacket.vitalsSummary}</p>
                  <p className="font-medium text-on-danger-container">{sentPacket.allergyWarning}</p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
