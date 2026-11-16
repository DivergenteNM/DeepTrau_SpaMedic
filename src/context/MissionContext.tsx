'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MISSIONS_DATA, MissionExercisePreset, MissionId, MissionType } from '@/data/missionsData';
import { AstronautProfile, PRELOADED_ASTRONAUTS } from '@/data/astronautsData';
import { sanitizeAstronautProfile } from '@/utils/astronautValidation';
import {
  BodySystemId,
  DEFAULT_INSPIRATION_ITEMS,
  TriageLevel,
} from '@/data/medicalKnowledge';
import { EmergencyProtocolId } from '@/data/emergencyProtocolsData';
import {
  analyzeMissionAndAstronautRisks,
  MissionRiskItem,
} from '@/utils/missionRiskAnalysis';
import {
  analyzeDiaryEntryLocally,
  PvtSessionResult,
} from '@/utils/psychologyAnalysis';

export type AppTabId = 'dashboard' | 'sensors' | 'psychology' | 'musculoskeletal' | 'survival';

export type DeviceId =
  | 'vitals_cuff'
  | 'dosimeter'
  | 'glucometer'
  | 'hematology'
  | 'ultrasound'
  | 'eva_spirometer';

export interface DeviceConnection {
  id: DeviceId;
  name: string;
  shortName: string;
  categoryLabel: string;
  description: string;
  unit: string;
  availableInMission: boolean;
  unavailableReason?: string;
  connected: boolean;
  lastReading: string;
  lastUpdated: string;
  status: TriageLevel;
}

export interface TelemetryBiomarkers {
  glucoseMgDl: number;
  wbcCount: number; // células/µL (normal 4500 - 10500)
  spo2Percent: number;
  systolicBP: number;
  diastolicBP: number;
  heartRateBpm: number;
  bodyTempC: number;
  dailyRadiationMsv: number;
  cumulativeRadiationMsv: number;
  boneDensityRetentionPercent: number;
  muscleMassRetentionPercent: number;
  moodScore: number; // 1 - 10
  sleepHours: number;
  stressLevel: number; // 1 - 10
  crewCohesion: number; // 1 - 10
  ultrasoundStatus: 'Normal' | 'Edema Neuro-Ocular Leve' | 'Atrofia Muscular Leve';
  ultrasoundNotes: string;
}

export interface HistoryPoint {
  day: number;
  radiationMsv: number;
  glucoseMgDl: number;
  wbcCount: number;
  moodScore: number;
  sleepHours: number;
  stressLevel: number;
  boneRetention: number;
  muscleRetention: number;
}

export type RoutinePriority = 'overdue' | 'urgent' | 'normal';

export interface OverdueRoutineEntry {
  fromDay: number;
  daysLate: number;
  reasonLabel: string;
}

export interface StartupModalProgress {
  dateKey: string;
  sessionEpoch: number;
  riskBriefingDone: boolean;
  routineModalDone: boolean;
}

export interface DailyRoutineItem {
  id: string;
  title: string;
  category: 'Escaneo' | 'Psicología' | 'Ejercicio' | 'Nutrición' | 'Manual';
  linkedDeviceId?: DeviceId;
  usesManualFallback: boolean;
  reason: string;
  completed: boolean;
  points: number;
  priority: RoutinePriority;
  isOverdue: boolean;
  overdueFromDay?: number;
  overdueDays?: number;
  priorityLabel: string;
  urgencyContext?: string;
}

export interface VideoDiaryEntry {
  id: string;
  day: number;
  timestamp: string;
  mode: 'video' | 'texto';
  title: string;
  notes: string;
  moodRating: number;
  durationSeconds?: number;
  aiIndicators: {
    emotionalTone: string;
    vocalFatigue: string;
    confinementStress: 'Bajo' | 'Moderado' | 'Elevado';
    earthSyncStatus: string;
    detectedThemes?: string[];
    clinicalRecommendation?: string;
    syncState?: 'queued' | 'transmitting' | 'acknowledged';
    earthFeedback?: string;
  };
}

export interface InspirationItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Familia' | 'Tierra' | 'Mensaje de Voz';
  durationOrDate: string;
  quote: string;
  imageUrl?: string;
  palette: 'cyan' | 'emerald' | 'amber' | 'rose';
  soundId: 'rain' | 'ocean' | 'forest' | 'heartbeat';
  soundLabel: string;
  audioUrl?: string;
}

export type DemoScenario =
  | 'nominal'
  | 'solar_storm'
  | 'hypoglycemia_immune'
  | 'isolation_fatigue';

export type EmergencyCrisisScenario = 'syncope_hypoglycemic' | 'microgravity_seizure';

export interface CrisisAlertBanner {
  scenario: EmergencyCrisisScenario;
  title: string;
  description: string;
}

interface StoredState {
  hasCompletedWelcome: boolean;
  isOnboarded: boolean;
  missionId: MissionId;
  astronaut: AstronautProfile;
  missionDay: number;
  activeTab: AppTabId;
  devices: DeviceConnection[];
  biomarkers: TelemetryBiomarkers;
  history: HistoryPoint[];
  completedRoutineIds: string[];
  overdueRoutineMeta: Record<string, OverdueRoutineEntry>;
  startupSessionEpoch: number;
  startupProgress: StartupModalProgress;
  completedExerciseIds: string[];
  supplementsChecked: { vitaminD: boolean; calcium: boolean; hydration: boolean };
  psychRoutinesChecked: { breathing: boolean; circadianLight: boolean; weeklyResilience: boolean };
  streakDays: number;
  healthPoints: number;
  videoLogs: VideoDiaryEntry[];
  inspirationItems: InspirationItem[];
  pvtHistory: PvtSessionResult[];
}

interface MissionContextValue {
  isHydrated: boolean;
  hasCompletedWelcome: boolean;
  isOnboarded: boolean;
  mission: MissionType;
  astronaut: AstronautProfile;
  missionDay: number;
  activeTab: AppTabId;
  setActiveTab: (tab: AppTabId) => void;
  devices: DeviceConnection[];
  biomarkers: TelemetryBiomarkers;
  history: HistoryPoint[];
  routines: DailyRoutineItem[];
  detectedRisks: MissionRiskItem[];
  shouldShowRiskBriefing: boolean;
  shouldShowRoutineModal: boolean;
  hasPendingRoutineModal: boolean;
  acknowledgeRiskBriefing: () => void;
  acknowledgeRoutineModal: () => void;
  reopenRiskBriefing: () => void;
  reopenRoutineModal: () => void;
  exercises: (MissionExercisePreset & {
    isAdaptedForSurgery: boolean;
    matchedSurgery?: string;
    completed: boolean;
  })[];
  supplementsChecked: { vitaminD: boolean; calcium: boolean; hydration: boolean };
  psychRoutinesChecked: { breathing: boolean; circadianLight: boolean; weeklyResilience: boolean };
  streakDays: number;
  healthPoints: number;
  readinessScore: number;
  systemStatuses: Record<BodySystemId, TriageLevel>;
  globalTriage: TriageLevel;
  videoLogs: VideoDiaryEntry[];
  videoMediaUrls: Record<string, string>;
  inspirationItems: InspirationItem[];
  pvtHistory: PvtSessionResult[];
  completeWelcome: () => void;
  reopenWelcome: () => void;
  completeOnboarding: (missionId: MissionId, astronautProfile: AstronautProfile) => void;
  reopenOnboarding: () => void;
  toggleDevice: (deviceId: DeviceId) => void;
  setAllAvailableDevicesConnection: (connected: boolean) => void;
  recordTelemetryScan: (partial: Partial<TelemetryBiomarkers>, customNote?: string) => void;
  triggerDemoAnomaly: (scenario: DemoScenario) => void;
  toggleRoutineTask: (taskId: string) => void;
  toggleExerciseTask: (exerciseId: string) => void;
  toggleSupplement: (key: 'vitaminD' | 'calcium' | 'hydration') => void;
  togglePsychRoutine: (key: 'breathing' | 'circadianLight' | 'weeklyResilience') => void;
  completeBreathingSession: () => void;
  savePvtSession: (result: PvtSessionResult) => void;
  addMentalCheckIn: (payload: {
    moodScore: number;
    sleepHours: number;
    stressLevel: number;
    crewCohesion: number;
    sleepQuality?: 'Reparador' | 'Fragmentado' | 'Insomnio';
    primaryStressor?: string;
  }) => void;
  addVideoDiaryEntry: (payload: {
    mode: 'video' | 'texto';
    title: string;
    notes: string;
    moodRating: number;
    durationSeconds?: number;
    voiceActiveRatio?: number;
    usedRealMic?: boolean;
    mediaUrl?: string;
  }) => void;
  syncVideoDiaryToEarth: (entryId: string) => void;
  addInspirationItem: (item: Omit<InspirationItem, 'id'>) => void;
  removeInspirationItem: (id: string) => void;
  resetDemoData: () => void;
  isSosOpen: boolean;
  activeEmergencyProtocolId: EmergencyProtocolId;
  activeCrisisScenario: EmergencyCrisisScenario | null;
  crisisAlertBanner: CrisisAlertBanner | null;
  shouldAutoStartTimer: boolean;
  openSosOverlay: (protocolId?: EmergencyProtocolId) => void;
  closeSosOverlay: () => void;
  setActiveEmergencyProtocolId: (id: EmergencyProtocolId) => void;
  simulateLiveCrisis: (scenario: EmergencyCrisisScenario) => void;
  restoreNominalVitals: () => void;
  clearAutoStartTimerFlag: () => void;
}

const STORAGE_KEY = 'deeptrau_mvp_state_v2';

const MissionContext = createContext<MissionContextValue | null>(null);

interface MissionDeviceConfig {
  availableInMission: boolean;
  defaultConnected: boolean;
  defaultLastUpdated: string;
  unavailableReason?: string;
}

const MISSION_DEVICE_CONFIG: Record<MissionId, Record<DeviceId, MissionDeviceConfig>> = {
  'deep-space-transit': {
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 08:15 UTC',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 08:20 UTC',
    },
    ultrasound: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdated: 'En espera · Último control hace 2 días',
    },
    eva_spirometer: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdated: 'No embarcado',
      unavailableReason:
        'Exclusivo para misiones de superficie con esclusas EVA y exposición a regolito',
    },
  },
  'planetary-habitat': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 07:50 UTC',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 08:05 UTC',
    },
    eva_spirometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdated: 'En espera · Activar tras caminata EVA',
    },
    ultrasound: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdated: 'No embarcado',
      unavailableReason:
        'Módulo de imagenología SANS asignado a misiones orbitales 0g',
    },
  },
  'space-station': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    ultrasound: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo · Enlace Tierra',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 08:20 UTC',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdated: 'En espera · Control capilar en ayunas',
    },
    eva_spirometer: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdated: 'No embarcado',
      unavailableReason:
        'Exclusivo para operaciones EVA en superficie planetaria',
    },
  },
  'surface-rover': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdated: 'Hoy · 07:40 UTC',
    },
    eva_spirometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdated: 'En espera · Control de aire y filtros de cabina',
    },
    hematology: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdated: 'No embarcado',
      unavailableReason:
        'Analizador óptico excluido por vibración y volumen en cabina del Rover',
    },
    ultrasound: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdated: 'No embarcado',
      unavailableReason:
        'Escáner multi-órgano permanece en la base principal',
    },
  },
};

function createInitialDevices(
  biomarkers: TelemetryBiomarkers,
  mission: MissionType
): DeviceConnection[] {
  const cfg = MISSION_DEVICE_CONFIG[mission.id];

  const templates: Omit<
    DeviceConnection,
    'availableInMission' | 'unavailableReason' | 'connected' | 'lastUpdated'
  >[] = [
    {
      id: 'vitals_cuff',
      name: 'Oxímetro de Pulso y Tensiómetro Orbital',
      shortName: 'Oxígeno y Presión',
      categoryLabel: 'Cardio y O₂',
      description: 'Registra SpO₂%, presión arterial (mmHg) y frecuencia cardíaca (bpm).',
      unit: 'SpO₂% · mmHg',
      lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
      status: 'nominal',
    },
    {
      id: 'dosimeter',
      name: 'Dosímetro Personal de Radiación (Tecnología CSA)',
      shortName: 'Dosímetro CSA',
      categoryLabel: 'Radiación',
      description: 'Mide tasa diaria y dosis acumulada de radiación ionizante en mSv.',
      unit: 'mSv',
      lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
      status: 'nominal',
    },
    {
      id: 'glucometer',
      name: 'Glucómetro y Analizador Metabólico Capilar',
      shortName: 'Glucómetro',
      categoryLabel: 'Metabolismo',
      description: 'Mide glucosa en sangre (mg/dL) para prevenir hipoglucemia o resistencia insulínica.',
      unit: 'mg/dL',
      lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
      status: 'nominal',
    },
    {
      id: 'hematology',
      name: 'Analizador Hematológico e Inmune Portátil',
      shortName: 'Sangre / Defensas',
      categoryLabel: 'Inmunidad',
      description: 'Evalúa leucocitos (células/µL) y biomarcadores de respuesta inmunológica.',
      unit: 'células/µL',
      lastReading: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
      status: 'nominal',
    },
    {
      id: 'ultrasound',
      name: 'Escáner de Ultrasonido Portátil Multi-Órgano',
      shortName: 'Ultrasonido',
      categoryLabel: 'Imagen SANS',
      description: 'Inspección óptica neuro-ocular (SANS), flujo vascular y masa muscular profunda.',
      unit: 'Imagen / Doppler',
      lastReading: biomarkers.ultrasoundStatus,
      status: 'nominal',
    },
    {
      id: 'eva_spirometer',
      name: 'Monitor Respiratorio y Térmico de Esclusa EVA',
      shortName: 'Monitor EVA / Aire',
      categoryLabel: 'Respiratorio EVA',
      description: 'Controla temperatura central (°C) y oxigenación tras exposición a regolito.',
      unit: '°C · SpO₂%',
      lastReading: `${biomarkers.bodyTempC.toFixed(1)} °C · ${biomarkers.spo2Percent}% O₂`,
      status: 'nominal',
    },
  ];

  return templates.map((tpl) => {
    const devCfg = cfg[tpl.id];
    return {
      ...tpl,
      availableInMission: devCfg.availableInMission,
      unavailableReason: devCfg.unavailableReason,
      connected: devCfg.availableInMission ? devCfg.defaultConnected : false,
      lastUpdated: devCfg.defaultLastUpdated,
    };
  });
}

function reconcileDevicesForMission(
  storedDevices: DeviceConnection[] | undefined,
  mission: MissionType,
  biomarkers: TelemetryBiomarkers
): DeviceConnection[] {
  const base = createInitialDevices(biomarkers, mission);
  if (!Array.isArray(storedDevices)) return base;

  const storedMap = new Map(storedDevices.map((d) => [d.id, d]));
  return base.map((template) => {
    const existing = storedMap.get(template.id);
    if (!template.availableInMission) {
      return {
        ...template,
        connected: false,
      };
    }
    if (!existing) return template;
    return {
      ...template,
      connected: Boolean(existing.connected),
      lastUpdated: existing.lastUpdated || template.lastUpdated,
    };
  });
}

function generateInitialHistory(mission: MissionType, astronaut: AstronautProfile): HistoryPoint[] {
  const days = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const baseGlucose = astronaut.clinicalHistory.baselineGlucose;
  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

  return days.map((day, idx) => {
    const rad = Number((day * mission.dailyRadiationRateMsv * (0.9 + (idx % 3) * 0.06)).toFixed(1));
    const glucoseWave = ((idx % 4) - 1.5) * 4;
    const moodWave = idx >= 6 && idx <= 8 ? 7 : 8 + (idx % 2);
    const sleepWave = mission.id === 'space-station' ? 6.6 + (idx % 3) * 0.3 : 7.1 + (idx % 2) * 0.4;
    const wbcBase = isLowImmune ? 4700 : 6200;
    const wbcDelta = -idx * 45 + (idx % 2 === 0 ? 150 : -100);
    const boneDecay = mission.gravityG === 0 ? 0.032 : 0.018;
    const muscleDecay = mission.gravityG === 0 ? 0.045 : 0.025;

    return {
      day,
      radiationMsv: rad,
      glucoseMgDl: Math.round(baseGlucose + glucoseWave),
      wbcCount: Math.max(3600, wbcBase + wbcDelta),
      moodScore: moodWave,
      sleepHours: Number(sleepWave.toFixed(1)),
      stressLevel: idx >= 6 ? 4 : 3,
      boneRetention: Number((100 - day * boneDecay).toFixed(1)),
      muscleRetention: Number((100 - day * muscleDecay).toFixed(1)),
    };
  });
}

function createInitialBiomarkers(mission: MissionType, astronaut: AstronautProfile): TelemetryBiomarkers {
  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';
  const cumulativeRad = Number((45 * mission.dailyRadiationRateMsv).toFixed(1));

  return {
    glucoseMgDl: astronaut.clinicalHistory.baselineGlucose + 3,
    wbcCount: isLowImmune ? 4450 : 6100,
    spo2Percent: mission.id === 'planetary-habitat' ? 97 : 98,
    systolicBP: astronaut.clinicalHistory.baselineSystolic,
    diastolicBP: astronaut.clinicalHistory.baselineDiastolic,
    heartRateBpm: astronaut.clinicalHistory.baselineHR + 4,
    bodyTempC: 36.7,
    dailyRadiationMsv: mission.dailyRadiationRateMsv,
    cumulativeRadiationMsv: cumulativeRad,
    boneDensityRetentionPercent: mission.gravityG === 0 ? 98.6 : 99.2,
    muscleMassRetentionPercent: mission.gravityG === 0 ? 98.0 : 98.9,
    moodScore: 8,
    sleepHours: mission.id === 'space-station' ? 6.8 : 7.4,
    stressLevel: 3,
    crewCohesion: 9,
    ultrasoundStatus: 'Normal',
    ultrasoundNotes: 'Sin edema del nervio óptico ni estasis venosa yugular detectada.',
  };
}

function playCabinAlertTone(scenario: EmergencyCrisisScenario) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const pattern =
      scenario === 'microgravity_seizure'
        ? [
            { freq: 880, start: 0, dur: 0.14 },
            { freq: 660, start: 0.18, dur: 0.14 },
            { freq: 880, start: 0.36, dur: 0.18 },
          ]
        : [
            { freq: 740, start: 0, dur: 0.16 },
            { freq: 554, start: 0.2, dur: 0.22 },
          ];

    pattern.forEach((beep) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(beep.freq, now + beep.start);
      gain.gain.setValueAtTime(0.001, now + beep.start);
      gain.gain.exponentialRampToValueAtTime(0.09, now + beep.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beep.start + beep.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + beep.start);
      osc.stop(now + beep.start + beep.dur + 0.02);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 850);
  } catch {
    // Ignore autoplay or AudioContext restrictions cleanly
  }
}

function createInitialVideoLogs(mission: MissionType): VideoDiaryEntry[] {
  return [
    {
      id: 'vlog-1',
      day: 42,
      timestamp: 'Día 42 · 20:10 UTC',
      mode: 'video',
      title: 'Reflexión de mitad de tránsito y cohesión de cabina',
      notes:
        'Jornada exigente revisando sellos de laboratorio. Un poco de nostalgia al ver fotos familiares, pero la rutina de ciclismo CEVIS despejó la mente.',
      moodRating: 8,
      durationSeconds: 38,
      aiIndicators: {
        emotionalTone: 'Estable y resiliente',
        vocalFatigue: 'Leve · prosodia estable (fin de turno)',
        confinementStress: 'Bajo',
        earthSyncStatus: `Empaquetado para envío asíncrono (${mission.commDelay})`,
        detectedThemes: ['Vínculo Terrestre / Nostalgia', 'Regulación Positiva'],
        clinicalRecommendation:
          'Mantener anclaje visual con familia y sostener bloque de ejercicio cardiovascular.',
        syncState: 'queued',
      },
    },
    {
      id: 'vlog-2',
      day: 44,
      timestamp: 'Día 44 · 19:45 UTC',
      mode: 'texto',
      title: 'Bitácora de sueño y ejercicio adaptado',
      notes:
        'Ajusté la luz ámbar 60 minutos antes de dormir. Dormí de corrido y sin molestias articulares tras la sesión de resistencia.',
      moodRating: 8,
      aiIndicators: {
        emotionalTone: 'Positivo / Enfocado',
        vocalFatigue: 'N/A (Bitácora escrita)',
        confinementStress: 'Bajo',
        earthSyncStatus: 'Confirmado por Psicología de Tierra (Houston/CSA)',
        detectedThemes: ['Higiene Circadiana / Sueño', 'Regulación Positiva'],
        clinicalRecommendation: 'Continuar protocolo de luz ámbar 1800K pre-sueño.',
        syncState: 'acknowledged',
        earthFeedback:
          'Psicología de Vuelo: Excelente respuesta circadiana. Sin signos de fatiga de tercer cuarto.',
      },
    },
  ];
}

function getLocalCalendarDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeInitialOverdueMeta(
  mission: MissionType,
  astronaut: AstronautProfile,
  missionDay: number
): Record<string, OverdueRoutineEntry> {
  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';
  const hasSurgeries = astronaut.clinicalHistory.priorSurgeries.some(
    (s) => !s.toLowerCase().includes('sin cirug')
  );
  const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');
  const hasLowGlucoseBase = astronaut.clinicalHistory.baselineGlucose < 85;
  const isHealthyNominalProfile =
    !isLowImmune && !hasSurgeries && !hasCircadianNote && !hasLowGlucoseBase;

  if (isHealthyNominalProfile && mission.id === 'space-station') {
    return {};
  }

  const meta: Record<string, OverdueRoutineEntry> = {};
  const ultrasoundScan = mission.recommendedScans.find((s) => s.deviceId === 'ultrasound');
  if (ultrasoundScan) {
    meta[ultrasoundScan.id] = {
      fromDay: Math.max(1, missionDay - 2),
      daysLate: 2,
      reasonLabel: 'Último ultrasonido hace 2 días (control SANS pendiente)',
    };
  } else if (mission.id === 'planetary-habitat') {
    meta['scan-blood-hab'] = {
      fromDay: Math.max(1, missionDay - 1),
      daysLate: 1,
      reasonLabel: 'Panel inmune pendiente tras excursión EVA del turno anterior',
    };
  }

  meta['nutrition-calcium-daily'] = {
    fromDay: Math.max(1, missionDay - 1),
    daysLate: 1,
    reasonLabel: 'Suplementación de Calcio y Vitamina D pendiente de ayer',
  };

  return meta;
}

function buildDefaultState(
  missionId: MissionId = 'deep-space-transit',
  astronaut: AstronautProfile = PRELOADED_ASTRONAUTS[0],
  isOnboarded = false,
  hasCompletedWelcome = false,
  startupSessionEpoch = 1
): StoredState {
  const mission = MISSIONS_DATA.find((m) => m.id === missionId) ?? MISSIONS_DATA[0];
  const biomarkers = createInitialBiomarkers(mission, astronaut);
  const missionDay = 45;
  return {
    hasCompletedWelcome,
    isOnboarded,
    missionId: mission.id,
    astronaut,
    missionDay,
    activeTab: 'dashboard',
    devices: createInitialDevices(biomarkers, mission),
    biomarkers,
    history: generateInitialHistory(mission, astronaut),
    completedRoutineIds: ['psych-checkin-daily'],
    overdueRoutineMeta: computeInitialOverdueMeta(mission, astronaut, missionDay),
    startupSessionEpoch,
    startupProgress: {
      dateKey: '',
      sessionEpoch: startupSessionEpoch,
      riskBriefingDone: false,
      routineModalDone: false,
    },
    completedExerciseIds: [],
    supplementsChecked: { vitaminD: true, calcium: false, hydration: true },
    psychRoutinesChecked: { breathing: false, circadianLight: true, weeklyResilience: false },
    streakDays: 12,
    healthPoints: 1480,
    videoLogs: createInitialVideoLogs(mission),
    inspirationItems: DEFAULT_INSPIRATION_ITEMS,
    pvtHistory: [
      {
        id: 'pvt-seed-1',
        day: 43,
        timestamp: 'Día 43 · 08:30 UTC',
        trialsMs: [264, 279, 255, 288, 271],
        meanRtMs: 271,
        fastestRtMs: 255,
        lapses: 0,
        falseStarts: 0,
        alertnessScore: 98,
        statusLabel: 'Óptima',
      },
    ],
  };
}

function evaluateSystemStatuses(
  biomarkers: TelemetryBiomarkers,
  mission: MissionType,
  astronaut: AstronautProfile,
  activeCrisisScenario: EmergencyCrisisScenario | null = null
): Record<BodySystemId, TriageLevel> {
  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

  // 1. Brain & Mental Health
  let brain: TriageLevel = 'nominal';
  if (
    activeCrisisScenario === 'microgravity_seizure' ||
    biomarkers.moodScore <= 4 ||
    biomarkers.sleepHours < 5.5 ||
    biomarkers.stressLevel >= 8 ||
    biomarkers.ultrasoundStatus === 'Edema Neuro-Ocular Leve'
  ) {
    brain = 'critical';
  } else if (biomarkers.moodScore <= 6 || biomarkers.sleepHours < 6.5 || biomarkers.stressLevel >= 6) {
    brain = 'warning';
  }

  // 2. Cardiovascular & Oxygen
  let cardiovascular: TriageLevel = 'nominal';
  const bpDelta = Math.abs(biomarkers.systolicBP - astronaut.clinicalHistory.baselineSystolic);
  if (
    biomarkers.spo2Percent < 92 ||
    biomarkers.systolicBP >= 150 ||
    biomarkers.systolicBP <= 90 ||
    biomarkers.diastolicBP <= 55 ||
    biomarkers.heartRateBpm >= 115 ||
    biomarkers.heartRateBpm <= 45
  ) {
    cardiovascular = 'critical';
  } else if (
    biomarkers.spo2Percent < 95 ||
    bpDelta >= 18 ||
    biomarkers.systolicBP <= 100 ||
    biomarkers.diastolicBP <= 60 ||
    biomarkers.heartRateBpm >= 95
  ) {
    cardiovascular = 'warning';
  }

  // 3. Immune & Radiation (crossed with pre-existing low defenses!)
  let immune: TriageLevel = 'nominal';
  const wbcCritical = isLowImmune ? 3600 : 3200;
  const wbcWarning = isLowImmune ? 4500 : 4100;

  if (
    biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv ||
    biomarkers.dailyRadiationMsv >= 5.0 ||
    biomarkers.wbcCount <= wbcCritical
  ) {
    immune = 'critical';
  } else if (
    biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv ||
    biomarkers.dailyRadiationMsv >= 2.8 ||
    biomarkers.wbcCount <= wbcWarning
  ) {
    immune = 'warning';
  }

  // 4. Metabolic & Glucose / Thermoregulation (crossed with personal baseline)
  let metabolic: TriageLevel = 'nominal';
  if (
    biomarkers.glucoseMgDl < 65 ||
    biomarkers.glucoseMgDl >= 175 ||
    biomarkers.bodyTempC <= 35.2 ||
    biomarkers.bodyTempC >= 38.5
  ) {
    metabolic = 'critical';
  } else if (
    biomarkers.glucoseMgDl < 75 ||
    biomarkers.glucoseMgDl >= 135 ||
    biomarkers.bodyTempC <= 35.8 ||
    biomarkers.bodyTempC >= 37.8
  ) {
    metabolic = 'warning';
  }

  // 5. Musculoskeletal
  let musculoskeletal: TriageLevel = 'nominal';
  if (
    biomarkers.boneDensityRetentionPercent < 95.5 ||
    biomarkers.muscleMassRetentionPercent < 94.5
  ) {
    musculoskeletal = 'critical';
  } else if (
    biomarkers.boneDensityRetentionPercent < 98.0 ||
    biomarkers.muscleMassRetentionPercent < 97.5 ||
    biomarkers.ultrasoundStatus === 'Atrofia Muscular Leve'
  ) {
    musculoskeletal = 'warning';
  }

  return { brain, cardiovascular, immune, metabolic, musculoskeletal };
}

function syncDeviceStatuses(
  devices: DeviceConnection[],
  biomarkers: TelemetryBiomarkers,
  statuses: Record<BodySystemId, TriageLevel>
): DeviceConnection[] {
  return devices.map((dev) => {
    const safeConnected = dev.availableInMission ? dev.connected : false;
    if (!dev.availableInMission) {
      return {
        ...dev,
        connected: false,
        status: 'nominal',
      };
    }

    if (dev.id === 'glucometer') {
      return {
        ...dev,
        connected: safeConnected,
        lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
        status: statuses.metabolic,
      };
    }
    if (dev.id === 'hematology') {
      return {
        ...dev,
        connected: safeConnected,
        lastReading: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
        status: statuses.immune,
      };
    }
    if (dev.id === 'vitals_cuff') {
      return {
        ...dev,
        connected: safeConnected,
        lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
        status: statuses.cardiovascular,
      };
    }
    if (dev.id === 'dosimeter') {
      return {
        ...dev,
        connected: safeConnected,
        lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
        status: statuses.immune,
      };
    }
    if (dev.id === 'eva_spirometer') {
      const evaStatus: TriageLevel =
        statuses.cardiovascular === 'critical' || statuses.metabolic === 'critical'
          ? 'critical'
          : statuses.cardiovascular === 'warning' || statuses.metabolic === 'warning'
            ? 'warning'
            : 'nominal';
      return {
        ...dev,
        connected: safeConnected,
        lastReading: `${biomarkers.bodyTempC.toFixed(1)} °C · ${biomarkers.spo2Percent}% O₂`,
        status: evaStatus,
      };
    }
    return {
      ...dev,
      connected: safeConnected,
      lastReading: biomarkers.ultrasoundStatus,
      status:
        biomarkers.ultrasoundStatus === 'Normal'
          ? 'nominal'
          : biomarkers.ultrasoundStatus === 'Edema Neuro-Ocular Leve'
            ? 'warning'
            : 'warning',
    };
  });
}

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(() => buildDefaultState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [activeEmergencyProtocolId, setActiveEmergencyProtocolId] =
    useState<EmergencyProtocolId>('syncope');
  const [activeCrisisScenario, setActiveCrisisScenario] =
    useState<EmergencyCrisisScenario | null>(null);
  const [crisisAlertBanner, setCrisisAlertBanner] = useState<CrisisAlertBanner | null>(null);
  const [shouldAutoStartTimer, setShouldAutoStartTimer] = useState(false);
  const [videoMediaUrls, setVideoMediaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed && parsed.missionId && parsed.astronaut) {
          const safeAstro = sanitizeAstronautProfile(parsed.astronaut);
          const parsedMission =
            MISSIONS_DATA.find((m) => m.id === parsed.missionId) ?? MISSIONS_DATA[0];
          const safeEpoch =
            typeof parsed.startupSessionEpoch === 'number' && parsed.startupSessionEpoch >= 1
              ? parsed.startupSessionEpoch
              : 1;
          const safeOverdueMeta =
            parsed.overdueRoutineMeta && typeof parsed.overdueRoutineMeta === 'object'
              ? parsed.overdueRoutineMeta
              : computeInitialOverdueMeta(parsedMission, safeAstro, parsed.missionDay ?? 45);
          const safeStartupProgress: StartupModalProgress =
            parsed.startupProgress && typeof parsed.startupProgress.dateKey === 'string'
              ? {
                  dateKey: parsed.startupProgress.dateKey,
                  sessionEpoch:
                    typeof parsed.startupProgress.sessionEpoch === 'number'
                      ? parsed.startupProgress.sessionEpoch
                      : safeEpoch,
                  riskBriefingDone: Boolean(parsed.startupProgress.riskBriefingDone),
                  routineModalDone: Boolean(parsed.startupProgress.routineModalDone),
                }
              : {
                  dateKey: '',
                  sessionEpoch: safeEpoch,
                  riskBriefingDone: false,
                  routineModalDone: false,
                };

          const safeBiomarkers: TelemetryBiomarkers = {
            ...parsed.biomarkers,
            bodyTempC: parsed.biomarkers?.bodyTempC ?? 36.7,
          };

          const defaultMap = new Map(DEFAULT_INSPIRATION_ITEMS.map((d) => [d.id, d]));
          const reconciledInspiration = Array.isArray(parsed.inspirationItems)
            ? parsed.inspirationItems.map((item) => {
                const preset = defaultMap.get(item.id);
                return preset ? { ...item, ...preset, imageUrl: item.imageUrl } : item;
              })
            : DEFAULT_INSPIRATION_ITEMS;

          setState({
            ...parsed,
            astronaut: safeAstro,
            biomarkers: safeBiomarkers,
            devices: reconcileDevicesForMission(parsed.devices, parsedMission, safeBiomarkers),
            hasCompletedWelcome: Boolean(parsed.hasCompletedWelcome),
            overdueRoutineMeta: safeOverdueMeta,
            startupSessionEpoch: safeEpoch,
            startupProgress: safeStartupProgress,
            pvtHistory: Array.isArray(parsed.pvtHistory) ? parsed.pvtHistory : [],
            inspirationItems: reconciledInspiration,
          });
        }
      }
    } catch {
      // Fallback safely to default state
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, isHydrated]);

  const mission = useMemo(
    () => MISSIONS_DATA.find((m) => m.id === state.missionId) ?? MISSIONS_DATA[0],
    [state.missionId]
  );

  const systemStatuses = useMemo(
    () => evaluateSystemStatuses(state.biomarkers, mission, state.astronaut, activeCrisisScenario),
    [state.biomarkers, mission, state.astronaut, activeCrisisScenario]
  );

  const globalTriage: TriageLevel = useMemo(() => {
    const vals = Object.values(systemStatuses);
    if (vals.includes('critical')) return 'critical';
    if (vals.includes('warning')) return 'warning';
    return 'nominal';
  }, [systemStatuses]);

  const devicesWithStatus = useMemo(
    () => syncDeviceStatuses(state.devices, state.biomarkers, systemStatuses),
    [state.devices, state.biomarkers, systemStatuses]
  );

  const routines: DailyRoutineItem[] = useMemo(() => {
    const connectedMap = new Map(state.devices.map((d) => [d.id, d.connected]));
    const isLowImmune = state.astronaut.clinicalHistory.immuneStatus !== 'Normal';
    const hasPriorSurgery = state.astronaut.clinicalHistory.priorSurgeries.some(
      (s) => !s.toLowerCase().includes('sin cirug')
    );
    const hasCircadianNote = state.astronaut.clinicalHistory.notes
      .toLowerCase()
      .includes('circadian');

    const resolvePriority = (
      id: string,
      linkedDeviceId: DeviceId | undefined,
      usesManualFallback: boolean
    ): Pick<
      DailyRoutineItem,
      'priority' | 'isOverdue' | 'overdueFromDay' | 'overdueDays' | 'priorityLabel' | 'urgencyContext'
    > => {
      const overdue = state.overdueRoutineMeta?.[id];
      if (overdue) {
        return {
          priority: 'overdue',
          isOverdue: true,
          overdueFromDay: overdue.fromDay,
          overdueDays: overdue.daysLate,
          priorityLabel: `Atrasada · Día ${overdue.fromDay}`,
          urgencyContext: overdue.reasonLabel,
        };
      }

      if (usesManualFallback) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: 'Sensor offline · Requiere protocolo clínico manual',
        };
      }

      if (
        linkedDeviceId === 'dosimeter' &&
        (systemStatuses.immune !== 'nominal' ||
          mission.radiationRiskLevel === 'Extremo' ||
          mission.radiationRiskLevel === 'Alto')
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext:
            systemStatuses.immune !== 'nominal'
              ? 'Alerta de radiación o inmunidad activa'
              : `Misión con radiación ${mission.radiationRiskLevel.toLowerCase()}`,
        };
      }

      if (
        linkedDeviceId === 'hematology' &&
        (systemStatuses.immune !== 'nominal' || isLowImmune)
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: isLowImmune
            ? 'EHR: Defensas bajas previas en seguimiento'
            : 'Conteo de leucocitos fuera de rango nominal',
        };
      }

      if (
        linkedDeviceId === 'glucometer' &&
        (systemStatuses.metabolic !== 'nominal' ||
          (state.astronaut.clinicalHistory.baselineGlucose < 85 &&
            (mission.id === 'planetary-habitat' || mission.id === 'surface-rover')))
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext:
            systemStatuses.metabolic !== 'nominal'
              ? 'Glucemia capilar requiere verificación hoy'
              : 'Línea base glucémica baja para operación EVA/Rover',
        };
      }

      if (
        linkedDeviceId === 'vitals_cuff' &&
        (systemStatuses.cardiovascular !== 'nominal' ||
          mission.id === 'surface-rover' ||
          mission.id === 'planetary-habitat')
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext:
            systemStatuses.cardiovascular !== 'nominal'
              ? 'Alerta cardiovascular o SpO₂% activa'
              : 'Control vital prioritario en cabina/EVA',
        };
      }

      if (
        linkedDeviceId === 'ultrasound' &&
        (systemStatuses.brain !== 'nominal' || systemStatuses.musculoskeletal !== 'nominal')
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: 'Seguimiento prioritario neuro-ocular / muscular',
        };
      }

      if (
        id === 'psych-checkin-daily' &&
        (systemStatuses.brain !== 'nominal' ||
          (hasCircadianNote && state.biomarkers.sleepHours < 7.0))
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: 'Disrupción circadiana o fatiga detectada hoy',
        };
      }

      if (
        id === 'exercise-daily-protocol' &&
        (systemStatuses.musculoskeletal !== 'nominal' || hasPriorSurgery || mission.gravityG === 0)
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: hasPriorSurgery
            ? 'Sesión adaptada a antecedente quirúrgico'
            : `Contramedida clave en ${mission.gravityLabel}`,
        };
      }

      if (id === 'nutrition-calcium-daily' && systemStatuses.musculoskeletal !== 'nominal') {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: 'Urgente hoy',
          urgencyContext: 'Soporte mineral prioritario por retención ósea',
        };
      }

      return {
        priority: 'normal',
        isOverdue: false,
        priorityLabel: 'Programada',
      };
    };

    const items: DailyRoutineItem[] = mission.recommendedScans.map((scan) => {
      const isConnected = connectedMap.get(scan.deviceId) ?? false;
      const usesManualFallback = !isConnected;
      return {
        id: scan.id,
        title: isConnected ? scan.title : scan.manualFallbackTitle,
        category: isConnected ? 'Escaneo' : 'Manual',
        linkedDeviceId: scan.deviceId,
        usesManualFallback,
        reason: isConnected
          ? scan.reason
          : `Herramienta desconectada: protocolo adaptado a autoevaluación clínica (${scan.reason})`,
        completed: state.completedRoutineIds.includes(scan.id),
        points: scan.points,
        ...resolvePriority(scan.id, scan.deviceId, usesManualFallback),
      };
    });

    items.push(
      {
        id: 'psych-checkin-daily',
        title: 'Check-in emocional y calidad de sueño + Video-Diario',
        category: 'Psicología',
        usesManualFallback: false,
        reason: 'Previene fatiga por aislamiento y desincronización circadiana.',
        completed: state.completedRoutineIds.includes('psych-checkin-daily'),
        points: 25,
        ...resolvePriority('psych-checkin-daily', undefined, false),
      },
      {
        id: 'exercise-daily-protocol',
        title: hasPriorSurgery
          ? 'Entrenamiento óseo y muscular adaptado a historial quirúrgico'
          : `Rutina física diaria (${mission.gravityLabel})`,
        category: 'Ejercicio',
        usesManualFallback: false,
        reason: 'Contrarresta pérdida ósea (1-1.5%/mes) y protege articulaciones.',
        completed: state.completedRoutineIds.includes('exercise-daily-protocol'),
        points: 40,
        ...resolvePriority('exercise-daily-protocol', undefined, false),
      },
      {
        id: 'nutrition-calcium-daily',
        title: 'Hidratación controlada + Vitamina D y Calcio',
        category: 'Nutrición',
        usesManualFallback: false,
        reason: 'Soporta remineralización ósea y estabilidad metabólica.',
        completed: state.completedRoutineIds.includes('nutrition-calcium-daily'),
        points: 20,
        ...resolvePriority('nutrition-calcium-daily', undefined, false),
      }
    );

    const priorityRank: Record<RoutinePriority, number> = {
      overdue: 0,
      urgent: 1,
      normal: 2,
    };

    return items.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [
    mission,
    state.devices,
    state.completedRoutineIds,
    state.overdueRoutineMeta,
    state.astronaut,
    state.biomarkers.sleepHours,
    systemStatuses,
  ]);

  const detectedRisks: MissionRiskItem[] = useMemo(
    () =>
      analyzeMissionAndAstronautRisks({
        mission,
        astronaut: state.astronaut,
        biomarkers: state.biomarkers,
        systemStatuses,
        routines,
        devices: devicesWithStatus,
        activeCrisisScenario,
      }),
    [
      mission,
      state.astronaut,
      state.biomarkers,
      systemStatuses,
      routines,
      devicesWithStatus,
      activeCrisisScenario,
    ]
  );

  const todayKey = isHydrated ? getLocalCalendarDateKey() : '';
  const sameDayAndEpoch =
    isHydrated &&
    state.startupProgress.dateKey === todayKey &&
    state.startupProgress.sessionEpoch === state.startupSessionEpoch;
  const riskBriefingDone = sameDayAndEpoch && state.startupProgress.riskBriefingDone;
  const routineModalDone = sameDayAndEpoch && state.startupProgress.routineModalDone;

  const canPresentStartupModals =
    isHydrated && state.isOnboarded && state.activeTab === 'dashboard' && !isSosOpen;

  const shouldShowRiskBriefing =
    canPresentStartupModals && !riskBriefingDone && detectedRisks.length > 0;

  const shouldShowRoutineModal =
    canPresentStartupModals && !shouldShowRiskBriefing && !routineModalDone;
  const hasPendingRoutineModal = !routineModalDone;

  const exercises = useMemo(() => {
    const surgeryText = state.astronaut.clinicalHistory.priorSurgeries.join(' ').toLowerCase();
    return mission.defaultExercises.map((ex) => {
      const matchedJoint = ex.affectedJoints.find((joint) => surgeryText.includes(joint));
      const matchedSurgery = matchedJoint
        ? state.astronaut.clinicalHistory.priorSurgeries.find((s) =>
            s.toLowerCase().includes(matchedJoint)
          )
        : undefined;
      return {
        ...ex,
        isAdaptedForSurgery: Boolean(matchedJoint && ex.alternativeName),
        matchedSurgery,
        completed: state.completedExerciseIds.includes(ex.id),
      };
    });
  }, [mission, state.astronaut, state.completedExerciseIds]);

  const readinessScore = useMemo(() => {
    const completedCount = routines.filter((r) => r.completed).length;
    const routinePct = routines.length > 0 ? (completedCount / routines.length) * 35 : 35;
    let bioScore = 65;
    Object.values(systemStatuses).forEach((status) => {
      if (status === 'warning') bioScore -= 8;
      if (status === 'critical') bioScore -= 18;
    });
    return Math.max(18, Math.min(100, Math.round(routinePct + bioScore)));
  }, [routines, systemStatuses]);

  const completeWelcome = () => {
    setState((prev) => ({
      ...prev,
      hasCompletedWelcome: true,
      isOnboarded: false,
    }));
  };

  const reopenWelcome = () => {
    setState((prev) => ({
      ...prev,
      hasCompletedWelcome: false,
      isOnboarded: false,
    }));
  };

  const completeOnboarding = (missionId: MissionId, astronautProfile: AstronautProfile) => {
    const selectedMission = MISSIONS_DATA.find((m) => m.id === missionId) ?? MISSIONS_DATA[0];
    const safeProfile = sanitizeAstronautProfile(astronautProfile);
    const newBiomarkers = createInitialBiomarkers(selectedMission, safeProfile);
    setState((prev) => {
      const nextEpoch = prev.startupSessionEpoch + 1;
      return {
        ...buildDefaultState(selectedMission.id, safeProfile, true, true, nextEpoch),
        biomarkers: newBiomarkers,
        devices: createInitialDevices(newBiomarkers, selectedMission),
        history: generateInitialHistory(selectedMission, safeProfile),
        videoLogs: createInitialVideoLogs(selectedMission),
      };
    });
  };

  const acknowledgeRiskBriefing = () => {
    const key = getLocalCalendarDateKey();
    setState((prev) => {
      const sameContext =
        prev.startupProgress.dateKey === key &&
        prev.startupProgress.sessionEpoch === prev.startupSessionEpoch;
      return {
        ...prev,
        startupProgress: {
          dateKey: key,
          sessionEpoch: prev.startupSessionEpoch,
          riskBriefingDone: true,
          routineModalDone: sameContext ? prev.startupProgress.routineModalDone : false,
        },
      };
    });
  };

  const acknowledgeRoutineModal = () => {
    const key = getLocalCalendarDateKey();
    setState((prev) => ({
      ...prev,
      startupProgress: {
        dateKey: key,
        sessionEpoch: prev.startupSessionEpoch,
        riskBriefingDone: true,
        routineModalDone: true,
      },
    }));
  };

  const reopenRiskBriefing = () => {
    const key = getLocalCalendarDateKey();
    setState((prev) => {
      const sameContext =
        prev.startupProgress.dateKey === key &&
        prev.startupProgress.sessionEpoch === prev.startupSessionEpoch;
      return {
        ...prev,
        startupProgress: {
          dateKey: key,
          sessionEpoch: prev.startupSessionEpoch,
          riskBriefingDone: false,
          routineModalDone: sameContext ? prev.startupProgress.routineModalDone : true,
        },
      };
    });
  };

  const reopenRoutineModal = () => {
    const key = getLocalCalendarDateKey();
    setState((prev) => ({
      ...prev,
      startupProgress: {
        dateKey: key,
        sessionEpoch: prev.startupSessionEpoch,
        riskBriefingDone: true,
        routineModalDone: false,
      },
    }));
  };

  const reopenOnboarding = () => {
    setState((prev) => ({ ...prev, hasCompletedWelcome: true, isOnboarded: false }));
  };

  const setActiveTab = (tab: AppTabId) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const toggleDevice = (deviceId: DeviceId) => {
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === deviceId && d.availableInMission
          ? {
              ...d,
              connected: !d.connected,
              lastUpdated: !d.connected ? 'Conectado ahora' : 'En espera (manual)',
            }
          : d
      ),
    }));
  };

  const setAllAvailableDevicesConnection = (connected: boolean) => {
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.availableInMission
          ? {
              ...d,
              connected,
              lastUpdated: connected ? 'Conectado ahora' : 'En espera (manual)',
            }
          : d
      ),
    }));
  };

  const recordTelemetryScan = (partial: Partial<TelemetryBiomarkers>, customNote?: string) => {
    setState((prev) => {
      const nextDay = prev.missionDay + 1;
      const nextBio: TelemetryBiomarkers = {
        ...prev.biomarkers,
        ...partial,
        ultrasoundNotes: customNote ?? prev.biomarkers.ultrasoundNotes,
      };
      const nextPoint: HistoryPoint = {
        day: nextDay,
        radiationMsv: nextBio.cumulativeRadiationMsv,
        glucoseMgDl: nextBio.glucoseMgDl,
        wbcCount: nextBio.wbcCount,
        moodScore: nextBio.moodScore,
        sleepHours: nextBio.sleepHours,
        stressLevel: nextBio.stressLevel,
        boneRetention: nextBio.boneDensityRetentionPercent,
        muscleRetention: nextBio.muscleMassRetentionPercent,
      };
      const touchedDevices = new Set<DeviceId>();
      if (partial.glucoseMgDl !== undefined) touchedDevices.add('glucometer');
      if (partial.wbcCount !== undefined) touchedDevices.add('hematology');
      if (
        partial.spo2Percent !== undefined ||
        partial.systolicBP !== undefined ||
        partial.diastolicBP !== undefined ||
        partial.heartRateBpm !== undefined
      ) {
        touchedDevices.add('vitals_cuff');
      }
      if (
        partial.dailyRadiationMsv !== undefined ||
        partial.cumulativeRadiationMsv !== undefined
      ) {
        touchedDevices.add('dosimeter');
      }
      if (partial.ultrasoundStatus !== undefined) touchedDevices.add('ultrasound');
      if (partial.bodyTempC !== undefined || partial.spo2Percent !== undefined) {
        touchedDevices.add('eva_spirometer');
      }

      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nextBio,
        devices: prev.devices.map((d) =>
          d.availableInMission && touchedDevices.has(d.id)
            ? { ...d, lastUpdated: `Día ${nextDay} · Recién medido` }
            : d
        ),
        history: [...prev.history.slice(-14), nextPoint],
        healthPoints: prev.healthPoints + 25,
      };
    });
  };

  const triggerDemoAnomaly = (scenario: DemoScenario) => {
    if (scenario === 'nominal') {
      setActiveCrisisScenario(null);
      setCrisisAlertBanner(null);
      setShouldAutoStartTimer(false);
    }
    setState((prev) => {
      const activeMission = MISSIONS_DATA.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA[0];
      const nextDay = prev.missionDay + 1;
      let nextBio = { ...prev.biomarkers };

      if (scenario === 'nominal') {
        nextBio = createInitialBiomarkers(activeMission, prev.astronaut);
      } else if (scenario === 'solar_storm') {
        nextBio.dailyRadiationMsv = 6.8;
        nextBio.cumulativeRadiationMsv = Number(
          Math.max(activeMission.missionLimitMsv + 8, prev.biomarkers.cumulativeRadiationMsv + 38).toFixed(1)
        );
        nextBio.wbcCount =
          prev.astronaut.clinicalHistory.immuneStatus !== 'Normal' ? 3350 : 3950;
        nextBio.stressLevel = 7;
      } else if (scenario === 'hypoglycemia_immune') {
        nextBio.glucoseMgDl = 61;
        nextBio.wbcCount = 3450;
        nextBio.heartRateBpm = prev.astronaut.clinicalHistory.baselineHR + 36;
        nextBio.spo2Percent = 94;
      } else if (scenario === 'isolation_fatigue') {
        nextBio.moodScore = 4;
        nextBio.sleepHours = 4.8;
        nextBio.stressLevel = 8;
        nextBio.ultrasoundStatus = 'Edema Neuro-Ocular Leve';
        nextBio.ultrasoundNotes =
          'Aplanamiento posterior ocular leve compatible con desplazamiento de fluidos en microgravedad.';
      }

      const nextPoint: HistoryPoint = {
        day: nextDay,
        radiationMsv: nextBio.cumulativeRadiationMsv,
        glucoseMgDl: nextBio.glucoseMgDl,
        wbcCount: nextBio.wbcCount,
        moodScore: nextBio.moodScore,
        sleepHours: nextBio.sleepHours,
        stressLevel: nextBio.stressLevel,
        boneRetention: nextBio.boneDensityRetentionPercent,
        muscleRetention: nextBio.muscleMassRetentionPercent,
      };

      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nextBio,
        history: [...prev.history.slice(-14), nextPoint],
      };
    });
  };

  const toggleRoutineTask = (taskId: string) => {
    setState((prev) => {
      const exists = prev.completedRoutineIds.includes(taskId);
      const nextIds = exists
        ? prev.completedRoutineIds.filter((id) => id !== taskId)
        : [...prev.completedRoutineIds, taskId];
      return {
        ...prev,
        completedRoutineIds: nextIds,
        healthPoints: exists ? Math.max(0, prev.healthPoints - 25) : prev.healthPoints + 25,
      };
    });
  };

  const toggleExerciseTask = (exerciseId: string) => {
    setState((prev) => {
      const exists = prev.completedExerciseIds.includes(exerciseId);
      const nextIds = exists
        ? prev.completedExerciseIds.filter((id) => id !== exerciseId)
        : [...prev.completedExerciseIds, exerciseId];
      const delta = exists ? -0.2 : 0.2;
      const nextBone = Number(
        Math.min(100, Math.max(92, prev.biomarkers.boneDensityRetentionPercent + delta)).toFixed(1)
      );
      const nextMuscle = Number(
        Math.min(100, Math.max(92, prev.biomarkers.muscleMassRetentionPercent + delta)).toFixed(1)
      );
      const nextBio: TelemetryBiomarkers = {
        ...prev.biomarkers,
        boneDensityRetentionPercent: nextBone,
        muscleMassRetentionPercent: nextMuscle,
      };

      const lastPoint = prev.history[prev.history.length - 1];
      const nextHistory =
        lastPoint && lastPoint.day === prev.missionDay
          ? prev.history.map((pt, idx) =>
              idx === prev.history.length - 1
                ? { ...pt, boneRetention: nextBone, muscleRetention: nextMuscle }
                : pt
            )
          : [
              ...prev.history.slice(-14),
              {
                day: prev.missionDay,
                radiationMsv: nextBio.cumulativeRadiationMsv,
                glucoseMgDl: nextBio.glucoseMgDl,
                wbcCount: nextBio.wbcCount,
                moodScore: nextBio.moodScore,
                sleepHours: nextBio.sleepHours,
                stressLevel: nextBio.stressLevel,
                boneRetention: nextBone,
                muscleRetention: nextMuscle,
              },
            ];

      const activeMission = MISSIONS_DATA.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA[0];
      const dailyExerciseIds = activeMission.defaultExercises
        .filter((ex) => ex.frequency === 'Diaria')
        .map((ex) => ex.id);
      const allDailyCompleted =
        dailyExerciseIds.length > 0 && dailyExerciseIds.every((id) => nextIds.includes(id));

      const hasExerciseRoutine = prev.completedRoutineIds.includes('exercise-daily-protocol');
      let nextRoutineIds = prev.completedRoutineIds;
      if (allDailyCompleted && !hasExerciseRoutine) {
        nextRoutineIds = [...prev.completedRoutineIds, 'exercise-daily-protocol'];
      } else if (!allDailyCompleted && hasExerciseRoutine) {
        nextRoutineIds = prev.completedRoutineIds.filter((id) => id !== 'exercise-daily-protocol');
      }

      return {
        ...prev,
        completedExerciseIds: nextIds,
        completedRoutineIds: nextRoutineIds,
        healthPoints: exists ? Math.max(0, prev.healthPoints - 30) : prev.healthPoints + 30,
        biomarkers: nextBio,
        history: nextHistory,
      };
    });
  };

  const toggleSupplement = (key: 'vitaminD' | 'calcium' | 'hydration') => {
    setState((prev) => {
      const nextChecked = !prev.supplementsChecked[key];
      const nextSupplements = {
        ...prev.supplementsChecked,
        [key]: nextChecked,
      };
      const allSupplementsDone =
        nextSupplements.vitaminD && nextSupplements.calcium && nextSupplements.hydration;
      const hasNutritionRoutine = prev.completedRoutineIds.includes('nutrition-calcium-daily');
      let nextRoutineIds = prev.completedRoutineIds;
      if (allSupplementsDone && !hasNutritionRoutine) {
        nextRoutineIds = [...prev.completedRoutineIds, 'nutrition-calcium-daily'];
      } else if (!allSupplementsDone && hasNutritionRoutine) {
        nextRoutineIds = prev.completedRoutineIds.filter((id) => id !== 'nutrition-calcium-daily');
      }

      return {
        ...prev,
        supplementsChecked: nextSupplements,
        completedRoutineIds: nextRoutineIds,
        healthPoints: nextChecked ? prev.healthPoints + 10 : Math.max(0, prev.healthPoints - 10),
      };
    });
  };

  const togglePsychRoutine = (key: 'breathing' | 'circadianLight' | 'weeklyResilience') => {
    setState((prev) => ({
      ...prev,
      psychRoutinesChecked: {
        ...prev.psychRoutinesChecked,
        [key]: !prev.psychRoutinesChecked[key],
      },
      biomarkers: {
        ...prev.biomarkers,
        stressLevel: !prev.psychRoutinesChecked[key]
          ? Math.max(1, prev.biomarkers.stressLevel - 1)
          : prev.biomarkers.stressLevel,
      },
      healthPoints: prev.healthPoints + 15,
    }));
  };

  const completeBreathingSession = () => {
    setState((prev) => {
      const alreadyDone = prev.psychRoutinesChecked.breathing;
      return {
        ...prev,
        psychRoutinesChecked: {
          ...prev.psychRoutinesChecked,
          breathing: true,
        },
        biomarkers: {
          ...prev.biomarkers,
          stressLevel: Math.max(1, prev.biomarkers.stressLevel - 1),
        },
        healthPoints: prev.healthPoints + (alreadyDone ? 10 : 20),
      };
    });
  };

  const savePvtSession = (result: PvtSessionResult) => {
    setState((prev) => {
      const adjustedStress =
        result.statusLabel === 'Alerta Circadiana'
          ? Math.min(10, Math.max(prev.biomarkers.stressLevel, 6))
          : prev.biomarkers.stressLevel;
      return {
        ...prev,
        pvtHistory: [result, ...(prev.pvtHistory ?? [])].slice(0, 10),
        biomarkers: {
          ...prev.biomarkers,
          stressLevel: adjustedStress,
        },
        healthPoints: prev.healthPoints + 20,
      };
    });
  };

  const addMentalCheckIn = (payload: {
    moodScore: number;
    sleepHours: number;
    stressLevel: number;
    crewCohesion: number;
    sleepQuality?: 'Reparador' | 'Fragmentado' | 'Insomnio';
    primaryStressor?: string;
  }) => {
    setState((prev) => {
      const nextDay = prev.missionDay + 1;
      const nextBio: TelemetryBiomarkers = {
        ...prev.biomarkers,
        moodScore: payload.moodScore,
        sleepHours: payload.sleepHours,
        stressLevel: payload.stressLevel,
        crewCohesion: payload.crewCohesion,
      };
      const nextPoint: HistoryPoint = {
        day: nextDay,
        radiationMsv: nextBio.cumulativeRadiationMsv,
        glucoseMgDl: nextBio.glucoseMgDl,
        wbcCount: nextBio.wbcCount,
        moodScore: payload.moodScore,
        sleepHours: payload.sleepHours,
        stressLevel: payload.stressLevel,
        boneRetention: nextBio.boneDensityRetentionPercent,
        muscleRetention: nextBio.muscleMassRetentionPercent,
      };
      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nextBio,
        history: [...prev.history.slice(-14), nextPoint],
        completedRoutineIds: prev.completedRoutineIds.includes('psych-checkin-daily')
          ? prev.completedRoutineIds
          : [...prev.completedRoutineIds, 'psych-checkin-daily'],
        healthPoints: prev.healthPoints + 30,
      };
    });
  };

  const addVideoDiaryEntry = (payload: {
    mode: 'video' | 'texto';
    title: string;
    notes: string;
    moodRating: number;
    durationSeconds?: number;
    voiceActiveRatio?: number;
    usedRealMic?: boolean;
    mediaUrl?: string;
  }) => {
    const entryId = `vlog-${Date.now()}`;
    if (payload.mediaUrl) {
      setVideoMediaUrls((prev) => ({ ...prev, [entryId]: payload.mediaUrl! }));
    }
    setState((prev) => {
      const activeMission = MISSIONS_DATA.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA[0];
      const analysis = analyzeDiaryEntryLocally({
        title: payload.title,
        notes: payload.notes,
        mode: payload.mode,
        moodRating: payload.moodRating,
        sleepHours: prev.biomarkers.sleepHours,
        stressLevel: prev.biomarkers.stressLevel,
        durationSeconds: payload.durationSeconds,
        voiceActiveRatio: payload.voiceActiveRatio,
        usedRealMic: payload.usedRealMic,
      });

      const entry: VideoDiaryEntry = {
        id: entryId,
        day: prev.missionDay,
        timestamp: `Día ${prev.missionDay} · Guardado ahora`,
        mode: payload.mode,
        title: payload.title,
        notes: payload.notes,
        moodRating: payload.moodRating,
        durationSeconds: payload.durationSeconds,
        aiIndicators: {
          emotionalTone: analysis.emotionalTone,
          vocalFatigue: analysis.vocalFatigue,
          confinementStress: analysis.confinementStress,
          earthSyncStatus: `En cola cifrada para psicólogos en Tierra (${activeMission.commDelay})`,
          detectedThemes: analysis.detectedThemes,
          clinicalRecommendation: analysis.clinicalRecommendation,
          syncState: 'queued',
        },
      };
      return {
        ...prev,
        videoLogs: [entry, ...prev.videoLogs],
        biomarkers: {
          ...prev.biomarkers,
          moodScore: payload.moodRating,
        },
        healthPoints: prev.healthPoints + 35,
      };
    });
  };

  const syncVideoDiaryToEarth = (entryId: string) => {
    setState((prev) => ({
      ...prev,
      videoLogs: prev.videoLogs.map((log) =>
        log.id === entryId
          ? {
              ...log,
              aiIndicators: {
                ...log.aiIndicators,
                syncState: 'transmitting',
                earthSyncStatus: 'Transmitiendo paquete cifrado hacia Red de Espacio Profundo...',
              },
            }
          : log
      ),
    }));

    setTimeout(() => {
      setState((prev) => {
        const target = prev.videoLogs.find((l) => l.id === entryId);
        if (!target) return prev;
        const feedback =
          target.aiIndicators.confinementStress === 'Elevado'
            ? 'Psicología de Vuelo (Houston/CSA): Alerta recibida. Se programa teleconferencia asíncrona prioritaria y ajuste de carga operativa.'
            : target.aiIndicators.confinementStress === 'Moderado'
              ? 'Psicología de Vuelo: Registro revisado. Recomendamos mantener higiene lumínica ámbar y sesión breve de respiración antes del descanso.'
              : 'Psicología de Vuelo: Indicadores estables y coherentes con la línea base. Sin intervención adicional requerida.';

        return {
          ...prev,
          videoLogs: prev.videoLogs.map((log) =>
            log.id === entryId
              ? {
                  ...log,
                  aiIndicators: {
                    ...log.aiIndicators,
                    syncState: 'acknowledged',
                    earthSyncStatus: 'Confirmado por Psicología de Tierra (Houston/CSA)',
                    earthFeedback: feedback,
                  },
                }
              : log
          ),
          healthPoints: prev.healthPoints + 10,
        };
      });
    }, 2200);
  };

  const addInspirationItem = (item: Omit<InspirationItem, 'id'>) => {
    setState((prev) => ({
      ...prev,
      inspirationItems: [{ ...item, id: `insp-${Date.now()}` }, ...prev.inspirationItems],
      healthPoints: prev.healthPoints + 15,
    }));
  };

  const removeInspirationItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      inspirationItems: prev.inspirationItems.filter((item) => item.id !== id),
    }));
  };

  const resetDemoData = () => {
    setState((prev) =>
      buildDefaultState(prev.missionId, prev.astronaut, true, true, prev.startupSessionEpoch + 1)
    );
    setActiveCrisisScenario(null);
    setCrisisAlertBanner(null);
    setShouldAutoStartTimer(false);
    setIsSosOpen(false);
  };

  const openSosOverlay = (protocolId?: EmergencyProtocolId) => {
    if (protocolId) {
      setActiveEmergencyProtocolId(protocolId);
    } else if (systemStatuses.brain === 'critical' && activeCrisisScenario === 'microgravity_seizure') {
      setActiveEmergencyProtocolId('seizure');
    } else if (systemStatuses.metabolic === 'critical' && state.biomarkers.glucoseMgDl < 65) {
      setActiveEmergencyProtocolId('syncope');
    } else if (systemStatuses.cardiovascular === 'critical' && state.biomarkers.spo2Percent < 92) {
      setActiveEmergencyProtocolId('hypoxia');
    } else if (systemStatuses.cardiovascular === 'critical') {
      setActiveEmergencyProtocolId('cardiovascular_cpr');
    }
    setIsSosOpen(true);
  };

  const closeSosOverlay = () => {
    setIsSosOpen(false);
  };

  const clearAutoStartTimerFlag = () => {
    setShouldAutoStartTimer(false);
  };

  const simulateLiveCrisis = (scenario: EmergencyCrisisScenario) => {
    setState((prev) => {
      const nextDay = prev.missionDay + 1;
      const nextBio: TelemetryBiomarkers =
        scenario === 'syncope_hypoglycemic'
          ? {
              ...prev.biomarkers,
              glucoseMgDl: 52,
              systolicBP: 82,
              diastolicBP: 50,
              heartRateBpm: 118,
              spo2Percent: 95,
              bodyTempC: 36.0,
            }
          : {
              ...prev.biomarkers,
              heartRateBpm: 126,
              systolicBP: 148,
              diastolicBP: 92,
              spo2Percent: 91,
              stressLevel: 9,
              moodScore: 3,
              bodyTempC: 37.9,
            };

      const nextPoint: HistoryPoint = {
        day: nextDay,
        radiationMsv: nextBio.cumulativeRadiationMsv,
        glucoseMgDl: nextBio.glucoseMgDl,
        wbcCount: nextBio.wbcCount,
        moodScore: nextBio.moodScore,
        sleepHours: nextBio.sleepHours,
        stressLevel: nextBio.stressLevel,
        boneRetention: nextBio.boneDensityRetentionPercent,
        muscleRetention: nextBio.muscleMassRetentionPercent,
      };

      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nextBio,
        history: [...prev.history.slice(-14), nextPoint],
      };
    });

    playCabinAlertTone(scenario);
    setActiveCrisisScenario(scenario);

    if (scenario === 'syncope_hypoglycemic') {
      setCrisisAlertBanner({
        scenario,
        title: 'ALERTA DE CABINA · Síncope / Shock Hipoglucémico',
        description:
          'Glucosa en 52 mg/dL y presión arterial en 82/50 mmHg. Sistemas Cardiovascular y Metabólico en código Rojo.',
      });
      setActiveEmergencyProtocolId('syncope');
      setShouldAutoStartTimer(false);
    } else {
      setCrisisAlertBanner({
        scenario,
        title: 'ALERTA DE CABINA · Crisis Convulsiva en Microgravedad',
        description:
          'Sensor de cabina detectó movimiento convulsivo anómalo. Sistema Neurológico en Rojo y cronómetro de episodio iniciado.',
      });
      setActiveEmergencyProtocolId('seizure');
      setShouldAutoStartTimer(true);
    }

    setIsSosOpen(true);
  };

  const restoreNominalVitals = () => {
    setState((prev) => {
      const activeMission = MISSIONS_DATA.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA[0];
      const nominalBio = createInitialBiomarkers(activeMission, prev.astronaut);
      const nextDay = prev.missionDay + 1;
      const nextPoint: HistoryPoint = {
        day: nextDay,
        radiationMsv: nominalBio.cumulativeRadiationMsv,
        glucoseMgDl: nominalBio.glucoseMgDl,
        wbcCount: nominalBio.wbcCount,
        moodScore: nominalBio.moodScore,
        sleepHours: nominalBio.sleepHours,
        stressLevel: nominalBio.stressLevel,
        boneRetention: nominalBio.boneDensityRetentionPercent,
        muscleRetention: nominalBio.muscleMassRetentionPercent,
      };
      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nominalBio,
        history: [...prev.history.slice(-14), nextPoint],
      };
    });
    setActiveCrisisScenario(null);
    setCrisisAlertBanner(null);
    setShouldAutoStartTimer(false);
  };

  const value: MissionContextValue = {
    isHydrated,
    hasCompletedWelcome: state.hasCompletedWelcome,
    isOnboarded: state.isOnboarded,
    mission,
    astronaut: state.astronaut,
    missionDay: state.missionDay,
    activeTab: state.activeTab,
    setActiveTab,
    devices: devicesWithStatus,
    biomarkers: state.biomarkers,
    history: state.history,
    routines,
    detectedRisks,
    shouldShowRiskBriefing,
    shouldShowRoutineModal,
    hasPendingRoutineModal,
    acknowledgeRiskBriefing,
    acknowledgeRoutineModal,
    reopenRiskBriefing,
    reopenRoutineModal,
    exercises,
    supplementsChecked: state.supplementsChecked,
    psychRoutinesChecked: state.psychRoutinesChecked,
    streakDays: state.streakDays,
    healthPoints: state.healthPoints,
    readinessScore,
    systemStatuses,
    globalTriage,
    videoLogs: state.videoLogs,
    videoMediaUrls,
    inspirationItems: state.inspirationItems,
    pvtHistory: state.pvtHistory ?? [],
    completeWelcome,
    reopenWelcome,
    completeOnboarding,
    reopenOnboarding,
    toggleDevice,
    setAllAvailableDevicesConnection,
    recordTelemetryScan,
    triggerDemoAnomaly,
    toggleRoutineTask,
    toggleExerciseTask,
    toggleSupplement,
    togglePsychRoutine,
    completeBreathingSession,
    savePvtSession,
    addMentalCheckIn,
    addVideoDiaryEntry,
    syncVideoDiaryToEarth,
    addInspirationItem,
    removeInspirationItem,
    resetDemoData,
    isSosOpen,
    activeEmergencyProtocolId,
    activeCrisisScenario,
    crisisAlertBanner,
    shouldAutoStartTimer,
    openSosOverlay,
    closeSosOverlay,
    setActiveEmergencyProtocolId,
    simulateLiveCrisis,
    restoreNominalVitals,
    clearAutoStartTimerFlag,
  };

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) {
    throw new Error('useMission debe usarse dentro de MissionProvider');
  }
  return ctx;
}
