'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ban,
  Bot,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Droplets,
  Flag,
  HeartPulse,
  ImagePlus,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  Timer,
  Trash2,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import {
  buildDynamicContraindications,
  EMERGENCY_PROTOCOLS,
  EmergencyProtocol,
  EmergencyProtocolId,
  EmergencyVitalKey,
  evaluateSymptomTriage,
  MiniBodyZoneId,
  QUICK_SYMPTOM_TAGS,
  SIMULATED_CAPTURES,
} from '@/data/emergencyProtocolsData';
import { EmergencyMiniBodyMap } from './EmergencyMiniBodyMap';

interface TimerLapRecord {
  id: string;
  lapNumber: number;
  elapsedFormatted: string;
  protocolTitle: string;
  recordedAtUtc: string;
}

interface AttachedMediaPreview {
  label: string;
  modality: string;
  caption: string;
  dataUrl: string;
  isSimulated: boolean;
}

interface TransmittedPacketSummary {
  packetId: string;
  sentAtUtc: string;
  etaText: string;
  protocolTitle: string;
  episodeDuration: string;
  lapCount: number;
  hasAttachedImage: boolean;
  vitalsSnapshot: string;
}

const PROTOCOL_ICONS: Record<EmergencyProtocolId, React.ReactNode> = {
  seizure: <Zap className="h-4 w-4" />,
  syncope: <Activity className="h-4 w-4" />,
  cardiovascular_cpr: <HeartPulse className="h-4 w-4" />,
  hypoxia: <Wind className="h-4 w-4" />,
  metabolic_thermal_shock: <Thermometer className="h-4 w-4" />,
  internal_trauma_fast: <ScanLine className="h-4 w-4" />,
};

function formatElapsedTime(totalMs: number): string {
  const totalTenths = Math.floor(totalMs / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function SosEmergencyOverlay() {
  const {
    isSosOpen,
    closeSosOverlay,
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
    globalTriage,
    missionDay,
  } = useMission();

  // Protocol & checklist interactive state
  const [checkedStepsMap, setCheckedStepsMap] = useState<Record<string, boolean>>({});
  const [selectedZoneByProtocol, setSelectedZoneByProtocol] = useState<
    Partial<Record<EmergencyProtocolId, MiniBodyZoneId>>
  >({});

  // Episode stopwatch state
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerLaps, setTimerLaps] = useState<TimerLapRecord[]>([]);
  const timerAnchorRef = useRef<number | null>(null);

  // Symptom search & AI triage copilot state
  const [symptomQuery, setSymptomQuery] = useState('');
  const [activeTriageInput, setActiveTriageInput] = useState('se desmayó y tiene sudor frío');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMediaPreview | null>(null);

  // Earth transmission & crisis menu state
  const [transmittedPacket, setTransmittedPacket] = useState<TransmittedPacketSummary | null>(null);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const scenarioMenuRef = useRef<HTMLDivElement>(null);

  const activeProtocol: EmergencyProtocol = useMemo(
    () =>
      EMERGENCY_PROTOCOLS.find((p) => p.id === activeEmergencyProtocolId) ??
      EMERGENCY_PROTOCOLS[0],
    [activeEmergencyProtocolId]
  );

  // Auto-start stopwatch when Scenario 2 triggers
  useEffect(() => {
    if (isSosOpen && shouldAutoStartTimer) {
      setElapsedMs(0);
      setTimerLaps([]);
      timerAnchorRef.current = Date.now();
      setIsTimerRunning(true);
      clearAutoStartTimerFlag();
    }
  }, [isSosOpen, shouldAutoStartTimer, clearAutoStartTimerFlag]);

  // Synchronize copilot query hint when a crisis scenario triggers
  useEffect(() => {
    if (activeCrisisScenario === 'syncope_hypoglycemic') {
      setActiveTriageInput('se desmayó con sudor frío, glucosa baja e hipotensión');
      setSymptomQuery('se desmayó con sudor frío, glucosa baja e hipotensión');
    } else if (activeCrisisScenario === 'microgravity_seizure') {
      setActiveTriageInput('convulsión y movimientos involuntarios en microgravedad 0g');
      setSymptomQuery('convulsión y movimientos involuntarios en microgravedad 0g');
    }
  }, [activeCrisisScenario]);

  // Stopwatch ticker (100ms precision)
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerAnchorRef.current === null) {
      timerAnchorRef.current = Date.now();
    }
    const interval = window.setInterval(() => {
      if (timerAnchorRef.current !== null) {
        setElapsedMs(Date.now() - timerAnchorRef.current);
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  // Close scenario menu or overlay on Escape
  useEffect(() => {
    if (!isSosOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isScenarioMenuOpen) {
          setIsScenarioMenuOpen(false);
        } else {
          closeSosOverlay();
        }
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (scenarioMenuRef.current && !scenarioMenuRef.current.contains(e.target as Node)) {
        setIsScenarioMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [isSosOpen, isScenarioMenuOpen, closeSosOverlay]);

  const triageResult = useMemo(
    () =>
      evaluateSymptomTriage(
        activeTriageInput,
        {
          glucoseMgDl: biomarkers.glucoseMgDl,
          spo2Percent: biomarkers.spo2Percent,
          systolicBP: biomarkers.systolicBP,
          diastolicBP: biomarkers.diastolicBP,
          heartRateBpm: biomarkers.heartRateBpm,
          bodyTempC: biomarkers.bodyTempC,
          wbcCount: biomarkers.wbcCount,
        },
        astronaut,
        mission
      ),
    [activeTriageInput, biomarkers, astronaut, mission]
  );

  const recommendedProtocol = useMemo(
    () =>
      EMERGENCY_PROTOCOLS.find((p) => p.id === triageResult.recommendedProtocolId) ??
      EMERGENCY_PROTOCOLS[0],
    [triageResult.recommendedProtocolId]
  );

  const dynamicContra = useMemo(
    () => buildDynamicContraindications(activeProtocol, astronaut),
    [activeProtocol, astronaut]
  );

  const selectedZoneId: MiniBodyZoneId =
    selectedZoneByProtocol[activeProtocol.id] ?? activeProtocol.verifyNow.zones[0].zoneId;

  const gravityAdaptedSteps =
    mission.gravityG === 0
      ? activeProtocol.actionSteps.zeroGSteps
      : activeProtocol.actionSteps.partialGravitySteps;

  const allActionSteps = useMemo(
    () => [
      ...gravityAdaptedSteps.map((text, idx) => ({
        id: `${activeProtocol.id}-grav-${idx}`,
        group: mission.gravityG === 0 ? `Adaptación Microgravedad (0g)` : `Adaptación ${mission.gravityLabel}`,
        text,
      })),
      ...activeProtocol.actionSteps.commonSteps.map((text, idx) => ({
        id: `${activeProtocol.id}-comm-${idx}`,
        group: 'Estabilización Clínica Inmediata',
        text,
      })),
    ],
    [activeProtocol, gravityAdaptedSteps, mission.gravityG, mission.gravityLabel]
  );

  const completedStepCount = allActionSteps.filter((step) => checkedStepsMap[step.id]).length;
  const stepProgressPct =
    allActionSteps.length > 0 ? Math.round((completedStepCount / allActionSteps.length) * 100) : 0;

  if (!isSosOpen) return null;

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      timerAnchorRef.current = Date.now() - elapsedMs;
      setIsTimerRunning(true);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    timerAnchorRef.current = null;
    setElapsedMs(0);
    setTimerLaps([]);
  };

  const handleRecordLap = () => {
    const nowUtc = new Date().toISOString().slice(11, 19) + ' UTC';
    setTimerLaps((prev) => [
      {
        id: `lap-${Date.now()}`,
        lapNumber: prev.length + 1,
        elapsedFormatted: formatElapsedTime(elapsedMs),
        protocolTitle: activeProtocol.shortTitle,
        recordedAtUtc: nowUtc,
      },
      ...prev,
    ]);
  };

  const handleToggleStep = (stepId: string) => {
    setCheckedStepsMap((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleTriageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomQuery.trim()) return;
    setActiveTriageInput(symptomQuery.trim());
  };

  const handleSelectQuickSymptom = (queryText: string) => {
    setSymptomQuery(queryText);
    setActiveTriageInput(queryText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedMedia({
          label: file.name,
          modality: 'Archivo Médico Adjunto',
          caption: 'Imagen cargada localmente desde dispositivo de cabina',
          dataUrl: reader.result,
          isSimulated: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransmitCriticalPacket = () => {
    const nowUtc = new Date().toISOString().slice(11, 19) + ' UTC';
    const packetId = `TX-SOS-${missionDay}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTransmittedPacket({
      packetId,
      sentAtUtc: nowUtc,
      etaText: mission.commDelay,
      protocolTitle: activeProtocol.title,
      episodeDuration: formatElapsedTime(elapsedMs),
      lapCount: timerLaps.length,
      hasAttachedImage: Boolean(attachedMedia),
      vitalsSnapshot: `PA ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · FC ${biomarkers.heartRateBpm} bpm · SpO₂ ${biomarkers.spo2Percent}% · Glucosa ${biomarkers.glucoseMgDl} mg/dL · Temp ${biomarkers.bodyTempC.toFixed(1)} °C`,
    });
  };

  const getVitalBadge = (key: EmergencyVitalKey) => {
    switch (key) {
      case 'bp': {
        const isCrit =
          biomarkers.systolicBP <= 90 ||
          biomarkers.systolicBP >= 150 ||
          biomarkers.diastolicBP <= 55;
        const isWarn = !isCrit && (biomarkers.systolicBP <= 100 || biomarkers.diastolicBP <= 60);
        return {
          label: 'Presión Arterial',
          value: `${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg`,
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'nominal',
        };
      }
      case 'hr': {
        const isCrit = biomarkers.heartRateBpm >= 115 || biomarkers.heartRateBpm <= 45;
        const isWarn = !isCrit && biomarkers.heartRateBpm >= 95;
        return {
          label: 'Frecuencia Cardíaca',
          value: `${biomarkers.heartRateBpm} bpm`,
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'nominal',
        };
      }
      case 'spo2': {
        const isCrit = biomarkers.spo2Percent < 92;
        const isWarn = !isCrit && biomarkers.spo2Percent < 95;
        return {
          label: 'Oxígeno SpO₂',
          value: `${biomarkers.spo2Percent}%`,
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'nominal',
        };
      }
      case 'glucose': {
        const isCrit = biomarkers.glucoseMgDl < 65 || biomarkers.glucoseMgDl >= 175;
        const isWarn = !isCrit && (biomarkers.glucoseMgDl < 75 || biomarkers.glucoseMgDl >= 135);
        return {
          label: 'Glucosa Capilar',
          value: `${biomarkers.glucoseMgDl} mg/dL`,
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'nominal',
        };
      }
      case 'temp': {
        const isCrit = biomarkers.bodyTempC <= 35.2 || biomarkers.bodyTempC >= 38.5;
        const isWarn = !isCrit && (biomarkers.bodyTempC <= 35.8 || biomarkers.bodyTempC >= 37.8);
        return {
          label: 'Temp. Corporal',
          value: `${biomarkers.bodyTempC.toFixed(1)} °C`,
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'nominal',
        };
      }
    }
  };

  const vitalStatusClasses = (status: string) =>
    status === 'critical'
      ? 'border-danger/50 bg-danger-container text-on-danger-container'
      : status === 'warning'
        ? 'border-warning/45 bg-warning-container text-on-warning-container'
        : 'border-primary/25 bg-surface-container text-on-surface';

  const allergiesClean = astronaut.clinicalHistory.allergies;
  const hasRealAllergy = allergiesClean.some((a) => !a.toLowerCase().includes('ninguna'));
  const hasAnomalyActive = Boolean(activeCrisisScenario) || globalTriage !== 'nominal';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Centro de Emergencias Médicas SOS y Triaje Asistido por IA"
      className="fixed inset-0 z-50 overflow-y-auto bg-surface text-on-surface"
    >
      <div className="dt-animate-enter min-h-screen flex flex-col">
        {/* Top SOS Command Header */}
        <header className="sticky top-0 z-30 border-b-2 border-danger/35 bg-surface-container/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-danger bg-danger px-3 py-1.5 text-xs font-bold tracking-wide text-on-primary font-display">
                <span className="h-2.5 w-2.5 rounded-full bg-on-primary animate-pulse" />
                <span>MODO ALERTA MÉDICA · SOS EMERGENCIA</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-on-surface font-display sm:text-[18px] leading-tight">
                  Respuesta Autónoma a Crisis Médicas en Vuelo
                </h1>
                <p className="text-xs text-on-surface-variant">
                  {mission.name} · Día {missionDay} · Tripulante:{' '}
                  <span className="font-semibold text-on-surface">{astronaut.name}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Live Crisis Simulator Dropdown */}
              <div ref={scenarioMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsScenarioMenuOpen((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-warning/45 bg-warning-container px-3 py-2 text-xs font-bold text-on-warning-container font-display dt-transition hover:-translate-y-px hover:border-warning active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
                >
                  <Zap className="h-3.5 w-3.5 text-warning" />
                  <span>Simular Crisis en Vivo</span>
                </button>

                {isScenarioMenuOpen && (
                  <div className="dt-animate-panel absolute right-0 top-[calc(100%+8px)] z-40 w-80 rounded-2xl border border-outline bg-surface-container p-3 shadow-[0_16px_32px_-12px_rgba(26,36,30,0.22)] space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                      Escenarios de Demostración en Vivo
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScenarioMenuOpen(false);
                        simulateLiveCrisis('syncope_hypoglycemic');
                      }}
                      className="w-full cursor-pointer rounded-xl border border-danger/35 bg-danger-container/60 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-danger hover:bg-danger-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                    >
                      <p className="text-xs font-bold text-on-danger-container font-display">
                        Escenario 1: Síncope / Shock Hipoglucémico
                      </p>
                      <p className="mt-0.5 text-[11px] text-on-danger-container/90">
                        Glucosa 52 mg/dL · PA 82/50 mmHg · Alerta cardiovascular y metabólica en Rojo.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsScenarioMenuOpen(false);
                        simulateLiveCrisis('microgravity_seizure');
                      }}
                      className="w-full cursor-pointer rounded-xl border border-warning/40 bg-warning-container/70 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-warning hover:bg-warning-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
                    >
                      <p className="text-xs font-bold text-on-warning-container font-display">
                        Escenario 2: Crisis Convulsiva en Microgravedad
                      </p>
                      <p className="mt-0.5 text-[11px] text-on-warning-container/90">
                        Sistema neurológico en Rojo · Guía de contención en 0g y cronómetro activo.
                      </p>
                    </button>
                  </div>
                )}
              </div>

              {hasAnomalyActive && (
                <button
                  type="button"
                  onClick={restoreNominalVitals}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/40 bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restablecer Signos Nominales</span>
                </button>
              )}

              <button
                type="button"
                onClick={closeSosOverlay}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-high active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                <X className="h-4 w-4" />
                <span>Volver al Panel</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          {/* Active Crisis Simulation Alert Banner */}
          {crisisAlertBanner && (
            <div className="dt-animate-panel flex flex-col gap-3 rounded-2xl border-2 border-danger bg-danger-container p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger text-on-primary animate-pulse">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-danger-container font-display">
                    {crisisAlertBanner.title}
                  </p>
                  <p className="text-xs text-on-danger-container/95">
                    {crisisAlertBanner.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={restoreNominalVitals}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-danger px-3.5 py-2 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-danger-hover active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restablecer Signos Nominales</span>
              </button>
            </div>
          )}

          {/* Inherited Context Bar: Astronaut EHR + Live Vitals + Mission & Live Emergency Tools */}
          <section className="grid gap-4 xl:grid-cols-12">
            {/* 1. Astronaut in Crisis EHR */}
            <div className="xl:col-span-4 rounded-2xl border border-outline bg-surface-container p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/35 bg-danger-container text-sm font-bold text-on-danger-container font-display">
                    {astronaut.avatarBadge}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-danger font-display">
                      Astronauta en Emergencia
                    </p>
                    <h2 className="text-sm font-bold text-on-surface font-display">
                      {astronaut.name} · {astronaut.age} años
                    </h2>
                    <p className="text-[11px] text-on-surface-variant">{astronaut.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg border border-danger/40 bg-danger-container px-2.5 py-1 font-mono text-xs font-bold text-on-danger-container">
                  <Droplets className="h-3.5 w-3.5 text-danger" />
                  {astronaut.bloodType}
                </span>
              </div>

              <div className="grid gap-2 text-xs">
                <div
                  className={`rounded-xl border p-2.5 ${
                    hasRealAllergy
                      ? 'border-danger/40 bg-danger-container/55 text-on-danger-container'
                      : 'border-outline bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Alergias Registradas
                  </span>
                  <span className="font-semibold">{allergiesClean.join(', ')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Cirugías Previas
                    </span>
                    <span className="text-[11px] font-semibold text-on-surface">
                      {astronaut.clinicalHistory.priorSurgeries[0] ?? 'Sin cirugías'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-outline bg-surface-container-low p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Estado Inmune
                    </span>
                    <span className="text-[11px] font-semibold text-on-surface">
                      {astronaut.clinicalHistory.immuneStatus === 'Normal'
                        ? 'Normal'
                        : 'Defensas Bajas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Live Vital Signs */}
            <div className="xl:col-span-4 rounded-2xl border border-outline bg-surface-container p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-primary font-display">
                    Telemetría Heredada en Vivo
                  </p>
                  <h2 className="text-sm font-bold text-on-surface font-display">
                    5 Signos Vitales Críticos
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-primary-container">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  EN VIVO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
                {(['bp', 'hr', 'spo2', 'glucose', 'temp'] as EmergencyVitalKey[]).map((vKey) => {
                  const item = getVitalBadge(vKey);
                  return (
                    <div
                      key={vKey}
                      className={`rounded-xl border px-3 py-2 dt-transition ${vitalStatusClasses(
                        item.status
                      )} ${vKey === 'temp' ? 'col-span-2 sm:col-span-1 xl:col-span-2' : ''}`}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-85 block">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block font-mono text-sm font-bold">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Mission Parameters + Episode Stopwatch + Critical Packet to Earth */}
            <div className="xl:col-span-4 rounded-2xl border border-outline bg-surface-container p-4 flex flex-col justify-between space-y-3">
              {/* Mission Context */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline bg-surface-container-low px-3 py-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Gravedad Activa
                  </span>
                  <span className="font-bold text-primary font-display">
                    {mission.gravityLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Retardo Enlace Tierra
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-telemetry">
                    <Radio className="h-3.5 w-3.5" />
                    {mission.commDelay}
                  </span>
                </div>
              </div>

              {/* Episode Stopwatch */}
              <div className="rounded-xl border border-outline bg-surface-container-low p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-danger" />
                    <span className="text-xs font-bold text-on-surface font-display">
                      Cronómetro de Episodio Médico
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xl font-bold tracking-tight ${
                      isTimerRunning ? 'text-danger' : 'text-on-surface'
                    }`}
                  >
                    {formatElapsedTime(elapsedMs)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleTimer}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold font-display dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${
                      isTimerRunning
                        ? 'bg-warning text-on-primary hover:bg-warning-hover focus-visible:ring-warning/40'
                        : 'bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-primary/35'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Iniciar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRecordLap}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-xs font-semibold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary-container/50 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Flag className="h-3.5 w-3.5 text-primary" />
                    <span>Registrar Tiempo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetTimer}
                    title="Reiniciar cronómetro"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:-translate-y-px hover:bg-surface-container-high hover:text-on-surface active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {timerLaps.length > 0 && (
                  <div className="max-h-20 overflow-y-auto space-y-1 border-t border-outline-variant pt-2">
                    {timerLaps.map((lap) => (
                      <div
                        key={lap.id}
                        className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant"
                      >
                        <span>
                          Marca #{lap.lapNumber} · {lap.protocolTitle}
                        </span>
                        <span className="font-bold text-on-surface">
                          {lap.elapsedFormatted} ({lap.recordedAtUtc})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transmit Critical Packet to Earth */}
              <button
                type="button"
                onClick={handleTransmitCriticalPacket}
                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-0.5 hover:bg-danger-hover hover:shadow-[0_10px_20px_-8px_rgba(180,35,24,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/45"
              >
                <Send className="h-4 w-4 dt-transition group-hover:translate-x-0.5" />
                <span>Transmitir Paquete Crítico a Tierra</span>
              </button>
            </div>
          </section>

          {/* Earth Transmission Confirmation Banner */}
          {transmittedPacket && (
            <section className="dt-animate-panel rounded-2xl border border-primary/45 bg-primary-container p-4 text-on-primary-container">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold font-display">
                      Paquete Crítico Empaquetado y Transmitido ({transmittedPacket.packetId}) ·{' '}
                      {transmittedPacket.sentAtUtc}
                    </p>
                    <p>
                      <span className="font-semibold">Llegada estimada a Cirujanos de Vuelo en Tierra:</span>{' '}
                      <span className="font-mono font-bold">{transmittedPacket.etaText}</span> (según
                      distancia de {mission.shortName}).
                    </p>
                    <p className="text-[11px] opacity-90">
                      Contenido enviado: Protocolo {transmittedPacket.protocolTitle} · Cronómetro{' '}
                      {transmittedPacket.episodeDuration} ({transmittedPacket.lapCount} marcas) ·{' '}
                      {transmittedPacket.vitalsSnapshot} · EHR ({astronaut.bloodType}, Alergias:{' '}
                      {allergiesClean.join(', ')})
                      {transmittedPacket.hasAttachedImage ? ' · + Imagen Diagnóstica Adjunta' : ''}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransmittedPacket(null)}
                  aria-label="Cerrar notificación de envío"
                  className="self-start cursor-pointer rounded-lg border border-primary/30 bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-primary-container dt-transition hover:bg-surface-container-low active:scale-[0.97]"
                >
                  Ocultar
                </button>
              </div>
            </section>
          )}

          {/* 1-Click Matrix of 6 Emergency Protocols */}
          <section className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.06em] text-on-surface-variant font-display flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-danger" />
                Matriz de 6 Protocolos de Emergencia en 1 Clic (Tripulantes No Médicos)
              </h2>
              <span className="text-xs text-on-surface-variant">
                Protocolo activo: <strong className="text-on-surface">{activeProtocol.title}</strong>
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {EMERGENCY_PROTOCOLS.map((protocol) => {
                const isSelected = protocol.id === activeProtocol.id;
                const isCrit = protocol.urgency === 'critical';
                return (
                  <button
                    key={protocol.id}
                    type="button"
                    onClick={() => setActiveEmergencyProtocolId(protocol.id)}
                    aria-pressed={isSelected}
                    className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-3 text-left dt-transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 ${
                      isSelected
                        ? isCrit
                          ? 'border-danger bg-danger-container text-on-danger-container shadow-[0_0_0_3px_rgba(180,35,24,0.16)] focus-visible:ring-danger/40'
                          : 'border-warning bg-warning-container text-on-warning-container shadow-[0_0_0_3px_rgba(181,71,8,0.16)] focus-visible:ring-warning/40'
                        : 'border-outline bg-surface-container text-on-surface hover:border-primary/50 hover:bg-surface-container-low focus-visible:ring-primary/35'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[10px] font-bold opacity-85">
                          {protocol.code}
                        </span>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            isSelected
                              ? isCrit
                                ? 'bg-danger text-on-primary'
                                : 'bg-warning text-on-primary'
                              : isCrit
                                ? 'bg-danger-container text-danger'
                                : 'bg-warning-container text-warning'
                          }`}
                        >
                          {PROTOCOL_ICONS[protocol.id]}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-bold font-display leading-snug">
                        {protocol.shortTitle}
                      </p>
                      <p className="mt-1 text-[11px] leading-snug opacity-85 line-clamp-2">
                        {protocol.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Main Operational Workspace: 3-Column Protocol Guide + AI Triage Copilot Sidebar */}
          <section className="grid gap-5 xl:grid-cols-12">
            {/* Left/Center: 3-Column Protocol Guide */}
            <div key={activeProtocol.id} className="xl:col-span-8 dt-animate-panel space-y-4">
              <div className="rounded-2xl border border-outline bg-surface-container p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold ${
                        activeProtocol.urgency === 'critical'
                          ? 'border-danger/40 bg-danger-container text-on-danger-container'
                          : 'border-warning/40 bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {activeProtocol.urgency === 'critical' ? 'PRIORIDAD ROJA' : 'PRIORIDAD ÁMBAR'}
                    </span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {activeProtocol.code}
                    </span>
                  </div>
                  <h2 className="mt-1 text-[20px] leading-[26px] font-bold text-on-surface font-display">
                    {activeProtocol.title}
                  </h2>
                </div>
                <p className="text-[11px] text-on-surface-variant max-w-xs sm:text-right">
                  Base científica: {activeProtocol.nasaReference}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* Column 1: Qué verificar ya */}
                <div className="rounded-2xl border border-outline bg-surface-container p-4 space-y-3">
                  <div className="border-b border-outline-variant pb-2.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-danger">
                      Columna 1
                    </span>
                    <h3 className="text-sm font-bold text-on-surface font-display">
                      Qué verificar ya
                    </h3>
                    <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
                      {activeProtocol.verifyNow.quickCheckSummary}
                    </p>
                  </div>

                  {/* Key Vitals for this Protocol */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeProtocol.verifyNow.vitalKeys.map((vKey) => {
                      const info = getVitalBadge(vKey);
                      return (
                        <div
                          key={vKey}
                          className={`rounded-xl border px-2.5 py-1.5 ${vitalStatusClasses(
                            info.status
                          )}`}
                        >
                          <span className="text-[10px] font-medium block opacity-85">
                            {info.label}
                          </span>
                          <span className="font-mono text-xs font-bold">{info.value}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mini Interactive Body Map */}
                  <EmergencyMiniBodyMap
                    protocolZones={activeProtocol.verifyNow.zones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={(zId) =>
                      setSelectedZoneByProtocol((prev) => ({
                        ...prev,
                        [activeProtocol.id]: zId,
                      }))
                    }
                    urgency={activeProtocol.urgency}
                  />
                </div>

                {/* Column 2: Pasos de acción en esta gravedad */}
                <div className="rounded-2xl border border-outline bg-surface-container p-4 space-y-3">
                  <div className="border-b border-outline-variant pb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                        Columna 2
                      </span>
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {completedStepCount}/{allActionSteps.length} listos
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface font-display">
                      Pasos de acción en {mission.gravityLabel}
                    </h3>
                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary transition-[width,background-color] duration-300"
                        style={{ width: `${stepProgressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allActionSteps.map((step, index) => {
                      const isDone = Boolean(checkedStepsMap[step.id]);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          aria-pressed={isDone}
                          className={`group flex w-full cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                            isDone
                              ? 'border-primary/35 bg-primary-container/60 text-on-primary-container'
                              : 'border-outline bg-surface-container-low text-on-surface hover:border-primary/45 hover:bg-surface-container'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 dt-transition group-hover:scale-110">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Circle className="h-4 w-4 text-on-surface-variant" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                              Paso {index + 1} · {step.group}
                            </span>
                            <p
                              className={`mt-0.5 text-xs leading-relaxed ${
                                isDone ? 'line-through opacity-75' : 'text-on-surface'
                              }`}
                            >
                              {step.text}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Qué NO hacer y Escalado a Tierra */}
                <div className="rounded-2xl border border-outline bg-surface-container p-4 space-y-3">
                  <div className="border-b border-outline-variant pb-2.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-warning">
                      Columna 3
                    </span>
                    <h3 className="text-sm font-bold text-on-surface font-display">
                      Qué NO hacer y Escalado a Tierra
                    </h3>
                  </div>

                  {/* EHR-Specific Contraindications */}
                  <div className="rounded-xl border border-danger/35 bg-danger-container/50 p-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-on-danger-container font-display">
                      <ShieldAlert className="h-4 w-4 text-danger shrink-0" />
                      <span>Alertas por Expediente Clínico ({astronaut.avatarBadge})</span>
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-on-danger-container leading-relaxed">
                      {dynamicContra.ehrRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Base Contraindications */}
                  <div className="rounded-xl border border-warning/35 bg-warning-container/45 p-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-on-warning-container font-display">
                      <Ban className="h-4 w-4 text-warning shrink-0" />
                      <span>Qué NO hacer ahora</span>
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-on-warning-container leading-relaxed">
                      {dynamicContra.baseRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Earth Flight Surgeon Escalation */}
                  <div className="rounded-xl border border-telemetry/35 bg-telemetry-container/55 p-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-on-telemetry-container font-display">
                      <Clock className="h-4 w-4 text-telemetry shrink-0" />
                      <span>Cuándo escalar a Tierra ({mission.commDelay})</span>
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-on-telemetry-container leading-relaxed">
                      {activeProtocol.earthEscalation.map((criterion, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-telemetry" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Symptom Search & AI Triage Copilot */}
            <aside className="xl:col-span-4 rounded-2xl border border-outline bg-surface-container p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-primary font-display flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-primary" />
                    Copiloto IA de Triaje Rápido
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-on-surface font-display">
                    Buscador de Síntomas en Cabina
                  </h2>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Cruza lo que observas en tu compañero con los signos vitales activos y el
                    expediente médico.
                  </p>
                </div>

                {/* Symptom Keyboard Search */}
                <form onSubmit={handleTriageSearchSubmit} className="space-y-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      value={symptomQuery}
                      onChange={(e) => setSymptomQuery(e.target.value)}
                      placeholder="Ej. se desmayó y tiene sudor frío..."
                      className="w-full rounded-xl border border-outline bg-surface pl-9 pr-3 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/75 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Evaluar Síntomas + Telemetría</span>
                  </button>
                </form>

                {/* Quick Symptom Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-on-surface-variant block">
                    Etiquetas rápidas de síntomas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SYMPTOM_TAGS.map((tag) => {
                      const isActive = activeTriageInput === tag.queryText;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleSelectQuickSymptom(tag.queryText)}
                          className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                            isActive
                              ? 'border-primary bg-primary-container text-on-primary-container font-semibold'
                              : 'border-outline bg-surface-container-low text-on-surface-variant hover:border-primary/45 hover:text-on-surface'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Structured Command Response */}
                <div
                  key={`${activeTriageInput}-${triageResult.recommendedProtocolId}-${triageResult.urgency}`}
                  className={`dt-animate-panel rounded-2xl border p-3.5 space-y-3 ${
                    triageResult.urgency === 'critical'
                      ? 'border-danger/45 bg-danger-container/45'
                      : 'border-warning/45 bg-warning-container/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      ORDEN DE TRIAJE IA
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold font-display ${
                        triageResult.urgency === 'critical'
                          ? 'border-danger bg-danger text-on-primary'
                          : 'border-warning bg-warning text-on-primary'
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {triageResult.urgency === 'critical'
                        ? 'URGENCIA: ROJO'
                        : 'URGENCIA: AMARILLO'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                        Posible Causa
                      </span>
                      <p className="font-medium text-on-surface leading-relaxed">
                        {triageResult.possibleCause}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                        Acción Inmediata
                      </span>
                      <p className="text-on-surface leading-relaxed">
                        {triageResult.immediateAction}
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline bg-surface-container p-2.5 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                        Protocolo Recomendado
                      </span>
                      <p className="font-bold text-on-surface font-display">
                        {recommendedProtocol.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveEmergencyProtocolId(recommendedProtocol.id)}
                        disabled={activeProtocol.id === recommendedProtocol.id}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-on-primary font-display dt-transition hover:bg-primary-hover active:scale-[0.985] disabled:cursor-default disabled:bg-primary-container disabled:text-on-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                      >
                        {activeProtocol.id === recommendedProtocol.id
                          ? 'Protocolo Activo en Pantalla'
                          : 'Abrir Protocolo Recomendado'}
                      </button>
                    </div>

                    <p className="text-[11px] font-medium text-on-surface-variant">
                      {triageResult.ehrAlert}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attach Camera or Ultrasound Simulated / Real Image */}
              <div className="rounded-2xl border border-outline bg-surface-container-low p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-on-surface font-display flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-telemetry" />
                    <span>Adjuntar Cámara o Ultrasonido</span>
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant">ADUM / Óptica</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {SIMULATED_CAPTURES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setAttachedMedia({
                          label: preset.label,
                          modality: preset.modality,
                          caption: preset.caption,
                          dataUrl: preset.dataUrl,
                          isSimulated: true,
                        })
                      }
                      className="cursor-pointer rounded-xl border border-outline bg-surface-container px-2.5 py-2 text-left text-[11px] font-semibold text-on-surface dt-transition hover:-translate-y-px hover:border-telemetry hover:bg-telemetry-container/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      <span className="block text-[10px] font-mono text-telemetry">
                        {preset.modality}
                      </span>
                      <span className="line-clamp-1">{preset.label}</span>
                    </button>
                  ))}
                </div>

                <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/45 bg-surface-container px-3 py-2 text-xs font-semibold text-primary dt-transition hover:border-primary hover:bg-primary-container/40 active:scale-[0.985]">
                  <ImagePlus className="h-4 w-4" />
                  <span>Subir captura real (archivo local)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>

                {attachedMedia && (
                  <div className="dt-animate-panel rounded-xl border border-viewport-border bg-viewport-surface p-2 text-on-viewport space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate font-mono font-semibold">{attachedMedia.label}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedMedia(null)}
                        aria-label="Quitar imagen adjunta"
                        className="cursor-pointer rounded-md p-1 text-on-viewport/80 dt-transition hover:bg-danger hover:text-on-primary active:scale-[0.95]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <img
                      src={attachedMedia.dataUrl}
                      alt={attachedMedia.caption}
                      className="h-32 w-full rounded-lg object-cover border border-viewport-border/60"
                    />
                    <p className="text-[10px] text-on-viewport/80 leading-snug">
                      {attachedMedia.caption}
                      {attachedMedia.isSimulated
                        ? ' · Marca de agua visible [SI / TELEMETRÍA SIMULADA]'
                        : ''}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
