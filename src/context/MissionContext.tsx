'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  MISSIONS_DATA_EN,
  MissionExercisePreset,
  MissionId,
  MissionType,
  getMissionsData,
  isDailyFrequency,
  isExtremeRadiation,
  isHighRadiation,
} from '@/data/missionsData';
import {
  AstronautProfile,
  PRELOADED_ASTRONAUTS_EN,
  getPreloadedAstronauts,
  hasPriorSurgeries,
  isLowImmuneStatus,
  localizeAstronautProfile,
} from '@/data/astronautsData';
import { sanitizeAstronautProfile } from '@/utils/astronautValidation';
import {
  BodySystemId,
  TriageLevel,
  getDefaultInspirationItems,
} from '@/data/medicalKnowledge';
import { EmergencyProtocolId } from '@/data/emergencyProtocolsData';
import {
  analyzeMissionAndAstronautRisks,
  MissionRiskItem,
} from '@/utils/missionRiskAnalysis';
import {
  ConfinementStressLevel,
  PvtSessionResult,
  analyzeDiaryEntryLocally,
  localizePvtStatus,
  localizeStressLevel,
} from '@/utils/psychologyAnalysis';
import { Language, formatNumberLocale } from '@/i18n/types';

export type AppTabId = 'dashboard' | 'sensors' | 'psychology' | 'musculoskeletal' | 'survival';

export type DeviceId =
  | 'vitals_cuff'
  | 'dosimeter'
  | 'glucometer'
  | 'hematology'
  | 'ultrasound'
  | 'eva_spirometer';

export type UltrasoundStatus =
  | 'Normal'
  | 'Mild Neuro-Ocular Edema'
  | 'Mild Muscle Atrophy'
  | 'Edema Neuro-Ocular Leve'
  | 'Atrofia Muscular Leve';

export function isMildSansEdema(status: string): boolean {
  return status === 'Mild Neuro-Ocular Edema' || status === 'Edema Neuro-Ocular Leve';
}

export function isMildMuscleAtrophy(status: string): boolean {
  return status === 'Mild Muscle Atrophy' || status === 'Atrofia Muscular Leve';
}

export function localizeUltrasoundStatus(status: UltrasoundStatus, lang: Language): UltrasoundStatus {
  if (isMildSansEdema(status)) {
    return lang === 'es' ? 'Edema Neuro-Ocular Leve' : 'Mild Neuro-Ocular Edema';
  }
  if (isMildMuscleAtrophy(status)) {
    return lang === 'es' ? 'Atrofia Muscular Leve' : 'Mild Muscle Atrophy';
  }
  return 'Normal';
}

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
  wbcCount: number; // cells/µL (normal 4500 - 10500)
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
  ultrasoundStatus: UltrasoundStatus;
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
  category:
    | 'Scan'
    | 'Psychology'
    | 'Exercise'
    | 'Nutrition'
    | 'Manual'
    | 'Escaneo'
    | 'Psicología'
    | 'Ejercicio'
    | 'Nutrición';
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
    confinementStress: ConfinementStressLevel;
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
  category: 'Family' | 'Earth' | 'Voice Message' | 'Familia' | 'Tierra' | 'Mensaje de Voz';
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
  language: Language;
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
  language: Language;
  setLanguage: (lang: Language) => void;
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
    sleepQuality?: 'Restorative' | 'Fragmented' | 'Insomnia' | 'Reparador' | 'Fragmentado' | 'Insomnio';
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
  resetFullDemoExperience: () => void;
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

const STORAGE_KEY = 'deeptrau_mvp_state_v3_en';

const MissionContext = createContext<MissionContextValue | null>(null);

interface MissionDeviceConfig {
  availableInMission: boolean;
  defaultConnected: boolean;
  defaultLastUpdatedEn: string;
  defaultLastUpdatedEs: string;
  unavailableReasonEn?: string;
  unavailableReasonEs?: string;
}

const MISSION_DEVICE_CONFIG: Record<MissionId, Record<DeviceId, MissionDeviceConfig>> = {
  'deep-space-transit': {
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 08:15 UTC',
      defaultLastUpdatedEs: 'Hoy · 08:15 UTC',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 08:20 UTC',
      defaultLastUpdatedEs: 'Hoy · 08:20 UTC',
    },
    ultrasound: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Standby · Last check 2 days ago',
      defaultLastUpdatedEs: 'En espera · Último control hace 2 días',
    },
    eva_spirometer: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Not onboarded',
      defaultLastUpdatedEs: 'No embarcado',
      unavailableReasonEn:
        'Exclusive to surface missions with EVA airlocks and regolith dust exposure',
      unavailableReasonEs:
        'Exclusivo para misiones de superficie con esclusas EVA y exposición a regolito',
    },
  },
  'planetary-habitat': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 07:50 UTC',
      defaultLastUpdatedEs: 'Hoy · 07:50 UTC',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 08:05 UTC',
      defaultLastUpdatedEs: 'Hoy · 08:05 UTC',
    },
    eva_spirometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Standby · Activate after EVA walk',
      defaultLastUpdatedEs: 'En espera · Activar tras caminata EVA',
    },
    ultrasound: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Not onboarded',
      defaultLastUpdatedEs: 'No embarcado',
      unavailableReasonEn: 'SANS imaging module assigned to 0g orbital missions',
      unavailableReasonEs: 'Módulo de imagenología SANS asignado a misiones orbitales 0g',
    },
  },
  'space-station': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    ultrasound: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live · Earth Link',
      defaultLastUpdatedEs: 'En vivo · Enlace Tierra',
    },
    hematology: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 08:20 UTC',
      defaultLastUpdatedEs: 'Hoy · 08:20 UTC',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Standby · Fasting capillary check',
      defaultLastUpdatedEs: 'En espera · Control capilar en ayunas',
    },
    eva_spirometer: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Not onboarded',
      defaultLastUpdatedEs: 'No embarcado',
      unavailableReasonEn: 'Exclusive to planetary surface EVA operations',
      unavailableReasonEs: 'Exclusivo para operaciones EVA en superficie planetaria',
    },
  },
  'surface-rover': {
    vitals_cuff: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    dosimeter: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Live',
      defaultLastUpdatedEs: 'En vivo',
    },
    glucometer: {
      availableInMission: true,
      defaultConnected: true,
      defaultLastUpdatedEn: 'Today · 07:40 UTC',
      defaultLastUpdatedEs: 'Hoy · 07:40 UTC',
    },
    eva_spirometer: {
      availableInMission: true,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Standby · Cabin air and filter check',
      defaultLastUpdatedEs: 'En espera · Control de aire y filtros de cabina',
    },
    hematology: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Not onboarded',
      defaultLastUpdatedEs: 'No embarcado',
      unavailableReasonEn: 'Optical analyzer excluded due to Rover cabin vibration and volume',
      unavailableReasonEs: 'Analizador óptico excluido por vibración y volumen en cabina del Rover',
    },
    ultrasound: {
      availableInMission: false,
      defaultConnected: false,
      defaultLastUpdatedEn: 'Not onboarded',
      defaultLastUpdatedEs: 'No embarcado',
      unavailableReasonEn: 'Multi-organ scanner remains at the main habitat base',
      unavailableReasonEs: 'Escáner multi-órgano permanece en la base principal',
    },
  },
};

function getDeviceTemplates(biomarkers: TelemetryBiomarkers, lang: Language) {
  const formattedWbc = formatNumberLocale(biomarkers.wbcCount, lang);
  const localizedUsStatus = localizeUltrasoundStatus(biomarkers.ultrasoundStatus, lang);

  if (lang === 'es') {
    return [
      {
        id: 'vitals_cuff' as DeviceId,
        name: 'Oxímetro de Pulso y Tensiómetro Orbital',
        shortName: 'Oxígeno y Presión',
        categoryLabel: 'Cardio y O₂',
        description: 'Registra SpO₂%, presión arterial (mmHg) y frecuencia cardíaca (bpm).',
        unit: 'SpO₂% · mmHg',
        lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
        status: 'nominal' as TriageLevel,
      },
      {
        id: 'dosimeter' as DeviceId,
        name: 'Dosímetro Personal de Radiación (Tecnología CSA)',
        shortName: 'Dosímetro CSA',
        categoryLabel: 'Radiación',
        description: 'Mide tasa diaria y dosis acumulada de radiación ionizante en mSv.',
        unit: 'mSv',
        lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
        status: 'nominal' as TriageLevel,
      },
      {
        id: 'glucometer' as DeviceId,
        name: 'Glucómetro y Analizador Metabólico Capilar',
        shortName: 'Glucómetro',
        categoryLabel: 'Metabolismo',
        description: 'Mide glucosa en sangre (mg/dL) para prevenir hipoglucemia o resistencia insulínica.',
        unit: 'mg/dL',
        lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
        status: 'nominal' as TriageLevel,
      },
      {
        id: 'hematology' as DeviceId,
        name: 'Analizador Hematológico e Inmune Portátil',
        shortName: 'Sangre / Defensas',
        categoryLabel: 'Inmunidad',
        description: 'Evalúa leucocitos (células/µL) y biomarcadores de respuesta inmunológica.',
        unit: 'células/µL',
        lastReading: `${formattedWbc} cél/µL`,
        status: 'nominal' as TriageLevel,
      },
      {
        id: 'ultrasound' as DeviceId,
        name: 'Escáner de Ultrasonido Portátil Multi-Órgano',
        shortName: 'Ultrasonido',
        categoryLabel: 'Imagen SANS',
        description: 'Inspección óptica neuro-ocular (SANS), flujo vascular y masa muscular profunda.',
        unit: 'Imagen / Doppler',
        lastReading: localizedUsStatus,
        status: 'nominal' as TriageLevel,
      },
      {
        id: 'eva_spirometer' as DeviceId,
        name: 'Monitor Respiratorio y Térmico de Esclusa EVA',
        shortName: 'Monitor EVA / Aire',
        categoryLabel: 'Respiratorio EVA',
        description: 'Controla temperatura central (°C) y oxigenación tras exposición a regolito.',
        unit: '°C · SpO₂%',
        lastReading: `${biomarkers.bodyTempC.toFixed(1)} °C · ${biomarkers.spo2Percent}% O₂`,
        status: 'nominal' as TriageLevel,
      },
    ];
  }

  return [
    {
      id: 'vitals_cuff' as DeviceId,
      name: 'Pulse Oximeter & Orbital Blood Pressure Cuff',
      shortName: 'Oxygen & BP',
      categoryLabel: 'Cardio & O₂',
      description: 'Tracks SpO₂%, arterial blood pressure (mmHg), and heart rate (bpm).',
      unit: 'SpO₂% · mmHg',
      lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
      status: 'nominal' as TriageLevel,
    },
    {
      id: 'dosimeter' as DeviceId,
      name: 'Personal Radiation Dosimeter (CSA Tech)',
      shortName: 'CSA Dosimeter',
      categoryLabel: 'Radiation',
      description: 'Measures daily exposure rate and cumulative ionizing radiation dose in mSv.',
      unit: 'mSv',
      lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
      status: 'nominal' as TriageLevel,
    },
    {
      id: 'glucometer' as DeviceId,
      name: 'Capillary Glucometer & Metabolic Analyzer',
      shortName: 'Glucometer',
      categoryLabel: 'Metabolism',
      description: 'Measures blood glucose (mg/dL) to prevent hypoglycemia or insulin resistance.',
      unit: 'mg/dL',
      lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
      status: 'nominal' as TriageLevel,
    },
    {
      id: 'hematology' as DeviceId,
      name: 'Portable Hematology & Immune Analyzer',
      shortName: 'Blood / Defenses',
      categoryLabel: 'Immunity',
      description: 'Evaluates white blood cells (cells/µL) and immune response biomarkers.',
      unit: 'cells/µL',
      lastReading: `${formattedWbc} cells/µL`,
      status: 'nominal' as TriageLevel,
    },
    {
      id: 'ultrasound' as DeviceId,
      name: 'Portable Multi-Organ Ultrasound Scanner',
      shortName: 'Ultrasound',
      categoryLabel: 'SANS Imaging',
      description: 'Optical neuro-ocular inspection (SANS), vascular flow, and deep muscle mass.',
      unit: 'Imaging / Doppler',
      lastReading: localizedUsStatus,
      status: 'nominal' as TriageLevel,
    },
    {
      id: 'eva_spirometer' as DeviceId,
      name: 'EVA Airlock Respiratory & Thermal Monitor',
      shortName: 'EVA / Air Monitor',
      categoryLabel: 'EVA Respiratory',
      description: 'Monitors core temperature (°C) and oxygenation after regolith exposure.',
      unit: '°C · SpO₂%',
      lastReading: `${biomarkers.bodyTempC.toFixed(1)} °C · ${biomarkers.spo2Percent}% O₂`,
      status: 'nominal' as TriageLevel,
    },
  ];
}

function translateLastUpdated(raw: string, lang: Language): string {
  if (lang === 'en') {
    if (raw === 'En vivo') return 'Live';
    if (raw === 'En vivo · Enlace Tierra') return 'Live · Earth Link';
    if (raw === 'No embarcado') return 'Not onboarded';
    if (raw === 'Conectado ahora') return 'Connected now';
    if (raw === 'En espera (manual)') return 'Standby (manual)';
    if (raw.startsWith('Hoy · ')) return raw.replace('Hoy · ', 'Today · ');
    if (raw === 'En espera · Último control hace 2 días') return 'Standby · Last check 2 days ago';
    if (raw === 'En espera · Activar tras caminata EVA') return 'Standby · Activate after EVA walk';
    if (raw === 'En espera · Control capilar en ayunas') return 'Standby · Fasting capillary check';
    if (raw === 'En espera · Control de aire y filtros de cabina')
      return 'Standby · Cabin air and filter check';
    if (raw.includes('Recién medido')) {
      return raw.replace('Día ', 'Day ').replace('Recién medido', 'Just measured');
    }
    return raw;
  }

  if (raw === 'Live') return 'En vivo';
  if (raw === 'Live · Earth Link') return 'En vivo · Enlace Tierra';
  if (raw === 'Not onboarded') return 'No embarcado';
  if (raw === 'Connected now') return 'Conectado ahora';
  if (raw === 'Standby (manual)') return 'En espera (manual)';
  if (raw.startsWith('Today · ')) return raw.replace('Today · ', 'Hoy · ');
  if (raw === 'Standby · Last check 2 days ago') return 'En espera · Último control hace 2 días';
  if (raw === 'Standby · Activate after EVA walk') return 'En espera · Activar tras caminata EVA';
  if (raw === 'Standby · Fasting capillary check') return 'En espera · Control capilar en ayunas';
  if (raw === 'Standby · Cabin air and filter check')
    return 'En espera · Control de aire y filtros de cabina';
  if (raw.includes('Just measured')) {
    return raw.replace('Day ', 'Día ').replace('Just measured', 'Recién medido');
  }
  return raw;
}

function createInitialDevices(
  biomarkers: TelemetryBiomarkers,
  mission: MissionType,
  lang: Language = 'en'
): DeviceConnection[] {
  const cfg = MISSION_DEVICE_CONFIG[mission.id];
  const templates = getDeviceTemplates(biomarkers, lang);

  return templates.map((tpl) => {
    const devCfg = cfg[tpl.id];
    return {
      ...tpl,
      availableInMission: devCfg.availableInMission,
      unavailableReason:
        lang === 'es' ? devCfg.unavailableReasonEs : devCfg.unavailableReasonEn,
      connected: devCfg.availableInMission ? devCfg.defaultConnected : false,
      lastUpdated:
        lang === 'es' ? devCfg.defaultLastUpdatedEs : devCfg.defaultLastUpdatedEn,
    };
  });
}

function reconcileDevicesForMission(
  storedDevices: DeviceConnection[] | undefined,
  mission: MissionType,
  biomarkers: TelemetryBiomarkers,
  lang: Language
): DeviceConnection[] {
  const base = createInitialDevices(biomarkers, mission, lang);
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
      lastUpdated: existing.lastUpdated
        ? translateLastUpdated(existing.lastUpdated, lang)
        : template.lastUpdated,
    };
  });
}

function getInitialMissionDay(mission: MissionType): number {
  return mission.id === 'surface-rover' ? 8 : 45;
}

const DEFAULT_US_NOTES_EN = 'No optic nerve edema or jugular venous stasis detected.';
const DEFAULT_US_NOTES_ES = 'Sin edema del nervio óptico ni estasis venosa yugular detectada.';
const ISOLATION_US_NOTES_EN =
  'Mild posterior globe flattening compatible with microgravity cephalad fluid shift.';
const ISOLATION_US_NOTES_ES =
  'Aplanamiento posterior ocular leve compatible con desplazamiento de fluidos en microgravedad.';

function localizeUltrasoundNotes(notes: string, lang: Language): string {
  if (lang === 'en') {
    if (notes === DEFAULT_US_NOTES_ES) return DEFAULT_US_NOTES_EN;
    if (notes === ISOLATION_US_NOTES_ES) return ISOLATION_US_NOTES_EN;
    if (notes === 'Escaneo de ultrasonido portátil sin hallazgos patológicos.')
      return 'Portable ultrasound scan with no pathological findings.';
    if (notes === 'Leve aplanamiento del polo posterior ocular (SANS). Requiere seguimiento.')
      return 'Mild posterior ocular globe flattening (SANS). Follow-up required.';
    if (notes === 'Disminución discreta de espesor muscular en cuádriceps; reforzar ARED.')
      return 'Mild quadriceps muscle thickness reduction; reinforce ARED.';
    return notes;
  }
  if (notes === DEFAULT_US_NOTES_EN) return DEFAULT_US_NOTES_ES;
  if (notes === ISOLATION_US_NOTES_EN) return ISOLATION_US_NOTES_ES;
  if (notes === 'Portable ultrasound scan with no pathological findings.')
    return 'Escaneo de ultrasonido portátil sin hallazgos patológicos.';
  if (notes === 'Mild posterior ocular globe flattening (SANS). Follow-up required.')
    return 'Leve aplanamiento del polo posterior ocular (SANS). Requiere seguimiento.';
  if (notes === 'Mild quadriceps muscle thickness reduction; reinforce ARED.')
    return 'Disminución discreta de espesor muscular en cuádriceps; reforzar ARED.';
  return notes;
}

function createInitialBiomarkers(
  mission: MissionType,
  astronaut: AstronautProfile,
  missionDay = getInitialMissionDay(mission),
  lang: Language = 'en'
): TelemetryBiomarkers {
  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
  const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');
  const hasLowGlucoseBase = astronaut.clinicalHistory.baselineGlucose < 85;
  const isEvaMission = mission.id === 'planetary-habitat' || mission.id === 'surface-rover';
  const cumulativeRad = Number((missionDay * mission.dailyRadiationRateMsv).toFixed(1));
  const boneDecay = mission.gravityG === 0 ? 0.032 : 0.018;
  const muscleDecay = mission.gravityG === 0 ? 0.045 : 0.025;

  const glucoseMgDl =
    hasLowGlucoseBase && isEvaMission
      ? Math.max(68, astronaut.clinicalHistory.baselineGlucose - 5)
      : isEvaMission
        ? astronaut.clinicalHistory.baselineGlucose - 2
        : astronaut.clinicalHistory.baselineGlucose + 3;

  const sleepHours = hasCircadianNote
    ? mission.id === 'space-station'
      ? 6.2
      : 6.6
    : mission.id === 'space-station'
      ? 6.8
      : 7.4;

  return {
    glucoseMgDl,
    wbcCount: isLowImmune ? 4450 : 6100,
    spo2Percent: mission.id === 'planetary-habitat' ? 97 : 98,
    systolicBP: astronaut.clinicalHistory.baselineSystolic,
    diastolicBP: astronaut.clinicalHistory.baselineDiastolic,
    heartRateBpm: astronaut.clinicalHistory.baselineHR + 4,
    bodyTempC: 36.7,
    dailyRadiationMsv: mission.dailyRadiationRateMsv,
    cumulativeRadiationMsv: cumulativeRad,
    boneDensityRetentionPercent: Number((100 - missionDay * boneDecay).toFixed(1)),
    muscleMassRetentionPercent: Number((100 - missionDay * muscleDecay).toFixed(1)),
    moodScore: hasCircadianNote && mission.id === 'space-station' ? 7 : 8,
    sleepHours,
    stressLevel: hasCircadianNote ? 4 : 3,
    crewCohesion: 9,
    ultrasoundStatus: 'Normal',
    ultrasoundNotes: lang === 'es' ? DEFAULT_US_NOTES_ES : DEFAULT_US_NOTES_EN,
  };
}

function generateInitialHistory(
  mission: MissionType,
  astronaut: AstronautProfile,
  missionDay = getInitialMissionDay(mission),
  currentBiomarkers = createInitialBiomarkers(mission, astronaut, missionDay)
): HistoryPoint[] {
  const days =
    missionDay <= 14
      ? Array.from({ length: missionDay }, (_, i) => i + 1)
      : [1, 5, 10, 15, 20, 25, 30, 35, 40, missionDay];
  const baseGlucose = astronaut.clinicalHistory.baselineGlucose;
  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
  const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');
  const boneDecay = mission.gravityG === 0 ? 0.032 : 0.018;
  const muscleDecay = mission.gravityG === 0 ? 0.045 : 0.025;

  return days.map((day, idx) => {
    const isLast = idx === days.length - 1;
    if (isLast) {
      return {
        day,
        radiationMsv: currentBiomarkers.cumulativeRadiationMsv,
        glucoseMgDl: currentBiomarkers.glucoseMgDl,
        wbcCount: currentBiomarkers.wbcCount,
        moodScore: currentBiomarkers.moodScore,
        sleepHours: currentBiomarkers.sleepHours,
        stressLevel: currentBiomarkers.stressLevel,
        boneRetention: currentBiomarkers.boneDensityRetentionPercent,
        muscleRetention: currentBiomarkers.muscleMassRetentionPercent,
      };
    }

    const rad = Math.min(
      currentBiomarkers.cumulativeRadiationMsv,
      Number((day * mission.dailyRadiationRateMsv * (0.94 + (idx % 2) * 0.04)).toFixed(1))
    );
    const glucoseWave = ((idx % 4) - 1.5) * 4;
    const moodWave = idx >= days.length - 4 && idx <= days.length - 2 ? 7 : 8 + (idx % 2);
    const sleepBase = hasCircadianNote
      ? mission.id === 'space-station'
        ? 6.1
        : 6.5
      : mission.id === 'space-station'
        ? 6.6
        : 7.1;
    const sleepWave = sleepBase + (idx % 3) * 0.25;
    const wbcStart = isLowImmune ? 4850 : 6350;
    const progressRatio = idx / Math.max(1, days.length - 1);
    const wbcTrend = Math.round(
      wbcStart + (currentBiomarkers.wbcCount - wbcStart) * progressRatio + (idx % 2 === 0 ? 90 : -70)
    );

    return {
      day,
      radiationMsv: rad,
      glucoseMgDl: Math.round(baseGlucose + glucoseWave),
      wbcCount: Math.max(3600, wbcTrend),
      moodScore: moodWave,
      sleepHours: Number(sleepWave.toFixed(1)),
      stressLevel: hasCircadianNote ? (idx >= days.length - 4 ? 5 : 4) : idx >= days.length - 4 ? 4 : 3,
      boneRetention: Number((100 - day * boneDecay).toFixed(1)),
      muscleRetention: Number((100 - day * muscleDecay).toFixed(1)),
    };
  });
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

function createInitialVideoLogs(
  mission: MissionType,
  astronaut: AstronautProfile,
  missionDay = getInitialMissionDay(mission),
  lang: Language = 'en'
): VideoDiaryEntry[] {
  const day1 = Math.max(1, missionDay - 3);
  const day2 = Math.max(1, missionDay - 1);
  const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');
  const hasLowGlucoseBase = astronaut.clinicalHistory.baselineGlucose < 85;
  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);

  if (lang === 'es') {
    const firstTitle =
      mission.id === 'surface-rover'
        ? 'Balance de travesía táctica y cohesión en Rover'
        : mission.id === 'space-station'
          ? 'Adaptación a ciclos orbitales y cohesión de cabina'
          : 'Reflexión de tránsito y cohesión de cabina';

    const firstNotes =
      mission.id === 'surface-rover'
        ? 'Turno exigente de exploración en ruta abierta. Un poco de nostalgia al ver fotos familiares, pero la rutina de movilidad en asiento despejó la tensión.'
        : 'Jornada exigente revisando sellos y telemetría de módulo. Un poco de nostalgia al ver fotos familiares, pero la rutina física diaria despejó la mente.';

    const secondTitle = hasCircadianNote
      ? 'Bitácora circadiana: ajuste lumínico y hombro adaptado'
      : hasLowGlucoseBase
        ? 'Control glucémico pre-EVA y bitácora de descanso'
        : isLowImmune
          ? 'Seguimiento de descanso e higiene inmune en cabina'
          : 'Bitácora de sueño y ejercicio adaptado';

    const secondNotes = hasCircadianNote
      ? 'Activé luz ámbar 1800K 60 minutos antes de dormir; noté sueño algo fragmentado por el ritmo de turno, aunque sin molestias en el hombro tras la sesión.'
      : hasLowGlucoseBase
        ? 'Reforcé colación de carbohidratos complejos antes de las maniobras y mantuve energía estable durante toda la jornada.'
        : 'Ajusté la luz ámbar 60 minutos antes de dormir. Dormí de corrido y sin molestias articulares tras la sesión de resistencia.';

    return [
      {
        id: 'vlog-1',
        day: day1,
        timestamp: `Día ${day1} · 20:10 UTC`,
        mode: 'video',
        title: firstTitle,
        notes: firstNotes,
        moodRating: 8,
        durationSeconds: 38,
        aiIndicators: {
          emotionalTone: 'Estable y resiliente',
          vocalFatigue: 'Leve · prosodia estable (fin de turno)',
          confinementStress: 'Bajo',
          earthSyncStatus: `Empaquetado para envío asíncrono (${mission.commDelay})`,
          detectedThemes: ['Vínculo Terrestre / Nostalgia', 'Regulación Positiva'],
          clinicalRecommendation:
            'Mantener anclaje visual con familia y sostener bloque de ejercicio diario.',
          syncState: 'queued',
        },
      },
      {
        id: 'vlog-2',
        day: day2,
        timestamp: `Día ${day2} · 19:45 UTC`,
        mode: 'texto',
        title: secondTitle,
        notes: secondNotes,
        moodRating: hasCircadianNote ? 7 : 8,
        aiIndicators: {
          emotionalTone: hasCircadianNote
            ? 'Enfocado con ligera presión circadiana'
            : 'Positivo / Enfocado',
          vocalFatigue: 'N/A (Bitácora escrita)',
          confinementStress: hasCircadianNote ? 'Moderado' : 'Bajo',
          earthSyncStatus: 'Confirmado por Psicología de Tierra (Houston/CSA)',
          detectedThemes: hasLowGlucoseBase
            ? ['Carga Operativa', 'Regulación Positiva']
            : ['Higiene Circadiana / Sueño', 'Regulación Positiva'],
          clinicalRecommendation: hasCircadianNote
            ? 'Sostener protocolo de luz ámbar 1800K y completar Test PVT de control.'
            : 'Continuar protocolo de luz ámbar 1800K pre-sueño.',
          syncState: 'acknowledged',
          earthFeedback: hasCircadianNote
            ? 'Psicología de Vuelo: Atentos a tu sensibilidad circadiana. Prioriza 1800K antes de dormir y sesión de respiración 4-4-4-4.'
            : 'Psicología de Vuelo: Excelente respuesta circadiana y adherencia. Sin signos de fatiga de tercer cuarto.',
        },
      },
    ];
  }

  const firstTitle =
    mission.id === 'surface-rover'
      ? 'Tactical excursion review & Rover cohesion'
      : mission.id === 'space-station'
        ? 'Orbital cycle adaptation & cabin cohesion'
        : 'Deep-space transit reflection & crew cohesion';

  const firstNotes =
    mission.id === 'surface-rover'
      ? 'Demanding open-route exploration shift. Felt a bit homesick looking at family photos, though seated mobility drills cleared the tension.'
      : 'Demanding shift inspecting module seals and telemetry. Felt a bit nostalgic viewing family photos, though daily resistance workout cleared my mind.';

  const secondTitle = hasCircadianNote
    ? 'Circadian log: lighting adjustment & adapted shoulder'
    : hasLowGlucoseBase
      ? 'Pre-EVA glycemic control & rest log'
      : isLowImmune
        ? 'Rest & cabin immune hygiene follow-up'
        : 'Sleep log & adapted exercise routine';

  const secondNotes = hasCircadianNote
    ? 'Switched to 1800K amber light 60 minutes before sleep; noticed slightly fragmented sleep from shift rhythm, with zero shoulder discomfort after training.'
    : hasLowGlucoseBase
      ? 'Reinforced complex carbohydrate intake prior to maneuvers and maintained steady energy throughout the entire shift.'
      : 'Adjusted cabin lighting to 1800K amber 60 minutes before bed. Slept solidly without joint soreness after resistance workout.';

  return [
    {
      id: 'vlog-1',
      day: day1,
      timestamp: `Day ${day1} · 20:10 UTC`,
      mode: 'video',
      title: firstTitle,
      notes: firstNotes,
      moodRating: 8,
      durationSeconds: 38,
      aiIndicators: {
        emotionalTone: 'Steady and resilient',
        vocalFatigue: 'Mild · stable prosody (end of shift)',
        confinementStress: 'Low',
        earthSyncStatus: `Queued for asynchronous downlink (${mission.commDelay})`,
        detectedThemes: ['Earth Bond / Nostalgia', 'Positive Regulation'],
        clinicalRecommendation:
          'Maintain visual family anchoring and keep daily exercise block consistent.',
        syncState: 'queued',
      },
    },
    {
      id: 'vlog-2',
      day: day2,
      timestamp: `Day ${day2} · 19:45 UTC`,
      mode: 'texto',
      title: secondTitle,
      notes: secondNotes,
      moodRating: hasCircadianNote ? 7 : 8,
      aiIndicators: {
        emotionalTone: hasCircadianNote
          ? 'Focused with mild circadian strain'
          : 'Positive / Focused',
        vocalFatigue: 'N/A (Written log)',
        confinementStress: hasCircadianNote ? 'Moderate' : 'Low',
        earthSyncStatus: 'Acknowledged by Earth Psychology (Houston/CSA)',
        detectedThemes: hasLowGlucoseBase
          ? ['Operational Workload', 'Positive Regulation']
          : ['Circadian Hygiene / Sleep', 'Positive Regulation'],
        clinicalRecommendation: hasCircadianNote
          ? 'Maintain 1800K amber light protocol and complete follow-up PVT test.'
          : 'Continue pre-sleep 1800K amber lighting protocol.',
        syncState: 'acknowledged',
        earthFeedback: hasCircadianNote
          ? 'Flight Psychology: Monitoring your circadian sensitivity. Prioritize 1800K before bed and 4-4-4-4 box breathing.'
          : 'Flight Psychology: Excellent circadian response and adherence. No signs of Third-Quarter fatigue.',
      },
    },
  ];
}

function createInitialPvtHistory(
  astronaut: AstronautProfile,
  mission: MissionType,
  missionDay = getInitialMissionDay(mission),
  lang: Language = 'en'
): PvtSessionResult[] {
  const pvtDay = Math.max(1, missionDay - 2);
  const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');
  const dayStr = lang === 'es' ? `Día ${pvtDay} · 08:30 UTC` : `Day ${pvtDay} · 08:30 UTC`;

  if (hasCircadianNote && mission.id === 'space-station') {
    return [
      {
        id: 'pvt-seed-1',
        day: pvtDay,
        timestamp: dayStr,
        trialsMs: [378, 412, 515, 392, 405],
        meanRtMs: 420,
        fastestRtMs: 378,
        lapses: 1,
        falseStarts: 0,
        alertnessScore: 65,
        statusLabel: localizePvtStatus('Mild Fatigue', lang),
      },
    ];
  }

  if (hasCircadianNote) {
    return [
      {
        id: 'pvt-seed-1',
        day: pvtDay,
        timestamp: dayStr,
        trialsMs: [304, 318, 296, 325, 311],
        meanRtMs: 311,
        fastestRtMs: 296,
        lapses: 0,
        falseStarts: 0,
        alertnessScore: 94,
        statusLabel: localizePvtStatus('Optimal', lang),
      },
    ];
  }

  return [
    {
      id: 'pvt-seed-1',
      day: pvtDay,
      timestamp: dayStr,
      trialsMs: [264, 279, 255, 288, 271],
      meanRtMs: 271,
      fastestRtMs: 255,
      lapses: 0,
      falseStarts: 0,
      alertnessScore: 98,
      statusLabel: localizePvtStatus('Optimal', lang),
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
  missionDay: number,
  lang: Language = 'en'
): Record<string, OverdueRoutineEntry> {
  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
  const hasSurgeries = hasPriorSurgeries(astronaut.clinicalHistory.priorSurgeries);
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
      reasonLabel:
        lang === 'es'
          ? 'Último ultrasonido hace 2 días (control SANS pendiente)'
          : 'Last ultrasound 2 days ago (SANS check pending)',
    };
  } else if (mission.id === 'planetary-habitat') {
    meta['scan-blood-hab'] = {
      fromDay: Math.max(1, missionDay - 1),
      daysLate: 1,
      reasonLabel:
        lang === 'es'
          ? 'Panel inmune pendiente tras excursión EVA del turno anterior'
          : 'Immune panel pending after previous shift EVA excursion',
    };
  }

  meta['nutrition-calcium-daily'] = {
    fromDay: Math.max(1, missionDay - 1),
    daysLate: 1,
    reasonLabel:
      lang === 'es'
        ? 'Suplementación de Calcio y Vitamina D pendiente de ayer'
        : 'Calcium & Vitamin D supplementation pending from yesterday',
  };

  return meta;
}

function localizeOverdueMeta(
  meta: Record<string, OverdueRoutineEntry>,
  lang: Language
): Record<string, OverdueRoutineEntry> {
  const next: Record<string, OverdueRoutineEntry> = {};
  for (const [key, entry] of Object.entries(meta)) {
    let reasonLabel = entry.reasonLabel;
    if (lang === 'en') {
      if (reasonLabel === 'Último ultrasonido hace 2 días (control SANS pendiente)') {
        reasonLabel = 'Last ultrasound 2 days ago (SANS check pending)';
      } else if (reasonLabel === 'Panel inmune pendiente tras excursión EVA del turno anterior') {
        reasonLabel = 'Immune panel pending after previous shift EVA excursion';
      } else if (reasonLabel === 'Suplementación de Calcio y Vitamina D pendiente de ayer') {
        reasonLabel = 'Calcium & Vitamin D supplementation pending from yesterday';
      }
    } else {
      if (reasonLabel === 'Last ultrasound 2 days ago (SANS check pending)') {
        reasonLabel = 'Último ultrasonido hace 2 días (control SANS pendiente)';
      } else if (reasonLabel === 'Immune panel pending after previous shift EVA excursion') {
        reasonLabel = 'Panel inmune pendiente tras excursión EVA del turno anterior';
      } else if (reasonLabel === 'Calcium & Vitamin D supplementation pending from yesterday') {
        reasonLabel = 'Suplementación de Calcio y Vitamina D pendiente de ayer';
      }
    }
    next[key] = { ...entry, reasonLabel };
  }
  return next;
}

function buildDefaultState(
  missionId: MissionId = 'deep-space-transit',
  astronaut: AstronautProfile = PRELOADED_ASTRONAUTS_EN[0],
  isOnboarded = false,
  hasCompletedWelcome = false,
  startupSessionEpoch = 1,
  language: Language = 'en'
): StoredState {
  const missions = getMissionsData(language);
  const mission = missions.find((m) => m.id === missionId) ?? missions[0];
  const localizedAstro = localizeAstronautProfile(astronaut, language);
  const missionDay = getInitialMissionDay(mission);
  const biomarkers = createInitialBiomarkers(mission, localizedAstro, missionDay, language);
  const hasCircadianNote = localizedAstro.clinicalHistory.notes.toLowerCase().includes('circadian');
  return {
    language,
    hasCompletedWelcome,
    isOnboarded,
    missionId: mission.id,
    astronaut: localizedAstro,
    missionDay,
    activeTab: 'dashboard',
    devices: createInitialDevices(biomarkers, mission, language),
    biomarkers,
    history: generateInitialHistory(mission, localizedAstro, missionDay, biomarkers),
    completedRoutineIds: hasCircadianNote ? [] : ['psych-checkin-daily'],
    overdueRoutineMeta: computeInitialOverdueMeta(mission, localizedAstro, missionDay, language),
    startupSessionEpoch,
    startupProgress: {
      dateKey: '',
      sessionEpoch: startupSessionEpoch,
      riskBriefingDone: false,
      routineModalDone: false,
    },
    completedExerciseIds: [],
    supplementsChecked: { vitaminD: true, calcium: false, hydration: true },
    psychRoutinesChecked: {
      breathing: false,
      circadianLight: !hasCircadianNote,
      weeklyResilience: false,
    },
    streakDays: 12,
    healthPoints: 1480,
    videoLogs: createInitialVideoLogs(mission, localizedAstro, missionDay, language),
    inspirationItems: getDefaultInspirationItems(language),
    pvtHistory: createInitialPvtHistory(localizedAstro, mission, missionDay, language),
  };
}

function evaluateSystemStatuses(
  biomarkers: TelemetryBiomarkers,
  mission: MissionType,
  astronaut: AstronautProfile,
  activeCrisisScenario: EmergencyCrisisScenario | null = null
): Record<BodySystemId, TriageLevel> {
  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);

  // 1. Brain & Mental Health
  let brain: TriageLevel = 'nominal';
  if (
    activeCrisisScenario === 'microgravity_seizure' ||
    biomarkers.moodScore <= 4 ||
    biomarkers.sleepHours < 5.5 ||
    biomarkers.stressLevel >= 8 ||
    isMildSansEdema(biomarkers.ultrasoundStatus)
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
    isMildMuscleAtrophy(biomarkers.ultrasoundStatus)
  ) {
    musculoskeletal = 'warning';
  }

  return { brain, cardiovascular, immune, metabolic, musculoskeletal };
}

function syncDeviceStatuses(
  devices: DeviceConnection[],
  biomarkers: TelemetryBiomarkers,
  statuses: Record<BodySystemId, TriageLevel>,
  lang: Language
): DeviceConnection[] {
  const formattedWbc = formatNumberLocale(biomarkers.wbcCount, lang);
  const wbcUnitSuffix = lang === 'es' ? 'cél/µL' : 'cells/µL';
  const localizedUs = localizeUltrasoundStatus(biomarkers.ultrasoundStatus, lang);

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
        lastReading: `${formattedWbc} ${wbcUnitSuffix}`,
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
      lastReading: localizedUs,
      status: localizedUs === 'Normal' ? 'nominal' : 'warning',
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
  const [shouldAutoStartTimer, setShouldAutoStartTimer] = useState(false);
  const [videoMediaUrls, setVideoMediaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed && parsed.missionId && parsed.astronaut) {
          const lang: Language = parsed.language === 'es' ? 'es' : 'en';
          const safeAstro = sanitizeAstronautProfile(parsed.astronaut, lang);
          const missions = getMissionsData(lang);
          const parsedMission =
            missions.find((m) => m.id === parsed.missionId) ?? missions[0];
          const defaultMissionDay = getInitialMissionDay(parsedMission);
          const isLegacyRoverOverflow =
            parsedMission.id === 'surface-rover' &&
            parsed.missionDay === 45 &&
            (!parsed.isOnboarded ||
              (Array.isArray(parsed.history) &&
                parsed.history.some((pt) => pt.day === 45) &&
                parsed.history.length === 10));

          if (isLegacyRoverOverflow) {
            setState(
              buildDefaultState(
                parsedMission.id,
                safeAstro,
                Boolean(parsed.isOnboarded),
                Boolean(parsed.hasCompletedWelcome),
                typeof parsed.startupSessionEpoch === 'number' && parsed.startupSessionEpoch >= 1
                  ? parsed.startupSessionEpoch
                  : 1,
                lang
              )
            );
            return;
          }

          const safeMissionDay =
            typeof parsed.missionDay === 'number' && parsed.missionDay >= 1
              ? parsed.missionDay
              : defaultMissionDay;
          const safeEpoch =
            typeof parsed.startupSessionEpoch === 'number' && parsed.startupSessionEpoch >= 1
              ? parsed.startupSessionEpoch
              : 1;
          const safeOverdueMeta =
            parsed.overdueRoutineMeta && typeof parsed.overdueRoutineMeta === 'object'
              ? parsed.overdueRoutineMeta
              : computeInitialOverdueMeta(parsedMission, safeAstro, safeMissionDay, lang);
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

          const fallbackBio = createInitialBiomarkers(parsedMission, safeAstro, safeMissionDay, lang);
          const safeBiomarkers: TelemetryBiomarkers = {
            ...fallbackBio,
            ...parsed.biomarkers,
            bodyTempC: parsed.biomarkers?.bodyTempC ?? fallbackBio.bodyTempC,
          };

          const defaultItems = getDefaultInspirationItems(lang);
          const defaultMap = new Map(defaultItems.map((d) => [d.id, d]));
          const reconciledInspiration = Array.isArray(parsed.inspirationItems)
            ? parsed.inspirationItems.map((item) => {
                const preset = defaultMap.get(item.id);
                return preset ? { ...item, ...preset, imageUrl: item.imageUrl } : item;
              })
            : defaultItems;

          const fallbackHistory = generateInitialHistory(
            parsedMission,
            safeAstro,
            safeMissionDay,
            safeBiomarkers
          );
          const reconciledHistory: HistoryPoint[] =
            Array.isArray(parsed.history) && parsed.history.length > 0
              ? parsed.history.map((pt) => ({
                  day: typeof pt.day === 'number' ? pt.day : safeMissionDay,
                  radiationMsv:
                    typeof pt.radiationMsv === 'number'
                      ? pt.radiationMsv
                      : safeBiomarkers.cumulativeRadiationMsv,
                  glucoseMgDl:
                    typeof pt.glucoseMgDl === 'number'
                      ? pt.glucoseMgDl
                      : safeBiomarkers.glucoseMgDl,
                  wbcCount:
                    typeof pt.wbcCount === 'number' ? pt.wbcCount : safeBiomarkers.wbcCount,
                  moodScore:
                    typeof pt.moodScore === 'number' ? pt.moodScore : safeBiomarkers.moodScore,
                  sleepHours:
                    typeof pt.sleepHours === 'number' ? pt.sleepHours : safeBiomarkers.sleepHours,
                  stressLevel:
                    typeof pt.stressLevel === 'number'
                      ? pt.stressLevel
                      : safeBiomarkers.stressLevel,
                  boneRetention:
                    typeof pt.boneRetention === 'number'
                      ? pt.boneRetention
                      : safeBiomarkers.boneDensityRetentionPercent,
                  muscleRetention:
                    typeof pt.muscleRetention === 'number'
                      ? pt.muscleRetention
                      : safeBiomarkers.muscleMassRetentionPercent,
                }))
              : fallbackHistory;

          const reconciledVideoLogs: VideoDiaryEntry[] =
            Array.isArray(parsed.videoLogs) && parsed.videoLogs.length > 0
              ? parsed.videoLogs.map((log) => {
                  if (log.aiIndicators?.syncState && log.aiIndicators?.detectedThemes) {
                    return log;
                  }
                  const analyzed = analyzeDiaryEntryLocally({
                    title: log.title,
                    notes: log.notes,
                    mode: log.mode,
                    moodRating: log.moodRating ?? safeBiomarkers.moodScore,
                    sleepHours: safeBiomarkers.sleepHours,
                    stressLevel: safeBiomarkers.stressLevel,
                    durationSeconds: log.durationSeconds,
                    lang,
                  });
                  const isSeedAcknowledged = log.id === 'vlog-2';
                  return {
                    ...log,
                    aiIndicators: {
                      ...log.aiIndicators,
                      detectedThemes:
                        log.aiIndicators?.detectedThemes ?? analyzed.detectedThemes,
                      clinicalRecommendation:
                        log.aiIndicators?.clinicalRecommendation ??
                        analyzed.clinicalRecommendation,
                      syncState:
                        log.aiIndicators?.syncState ??
                        (isSeedAcknowledged ? 'acknowledged' : 'queued'),
                      earthFeedback:
                        log.aiIndicators?.earthFeedback ??
                        (isSeedAcknowledged
                          ? lang === 'es'
                            ? 'Psicología de Vuelo: Registro revisado. Sin signos de fatiga de tercer cuarto.'
                            : 'Flight Psychology: Log reviewed. No signs of Third-Quarter fatigue.'
                          : undefined),
                    },
                  };
                })
              : createInitialVideoLogs(parsedMission, safeAstro, safeMissionDay, lang);

          const reconciledPvt =
            Array.isArray(parsed.pvtHistory) && parsed.pvtHistory.length > 0
              ? parsed.pvtHistory
              : createInitialPvtHistory(safeAstro, parsedMission, safeMissionDay, lang);

          setState({
            ...parsed,
            language: lang,
            missionDay: safeMissionDay,
            astronaut: safeAstro,
            biomarkers: safeBiomarkers,
            history: reconciledHistory,
            devices: reconcileDevicesForMission(parsed.devices, parsedMission, safeBiomarkers, lang),
            hasCompletedWelcome: Boolean(parsed.hasCompletedWelcome),
            overdueRoutineMeta: safeOverdueMeta,
            startupSessionEpoch: safeEpoch,
            startupProgress: safeStartupProgress,
            videoLogs: reconciledVideoLogs,
            pvtHistory: reconciledPvt,
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
    if (typeof document !== 'undefined') {
      document.documentElement.lang = state.language;
    }
  }, [state.language]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (!state.hasCompletedWelcome && !state.isOnboarded && state.language === 'en') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [state, isHydrated]);

  const language = state.language;

  const setLanguage = (lang: Language) => {
    setState((prev) => {
      if (prev.language === lang) return prev;
      return {
        ...prev,
        language: lang,
      };
    });
  };

  const mission = useMemo(() => {
    const missions = getMissionsData(language);
    return missions.find((m) => m.id === state.missionId) ?? missions[0];
  }, [state.missionId, language]);

  const astronaut = useMemo(
    () => localizeAstronautProfile(state.astronaut, language),
    [state.astronaut, language]
  );

  const biomarkers = useMemo<TelemetryBiomarkers>(
    () => ({
      ...state.biomarkers,
      ultrasoundStatus: localizeUltrasoundStatus(state.biomarkers.ultrasoundStatus, language),
      ultrasoundNotes: localizeUltrasoundNotes(state.biomarkers.ultrasoundNotes, language),
    }),
    [state.biomarkers, language]
  );

  const systemStatuses = useMemo(
    () => evaluateSystemStatuses(biomarkers, mission, astronaut, activeCrisisScenario),
    [biomarkers, mission, astronaut, activeCrisisScenario]
  );

  const globalTriage: TriageLevel = useMemo(() => {
    const vals = Object.values(systemStatuses);
    if (vals.includes('critical')) return 'critical';
    if (vals.includes('warning')) return 'warning';
    return 'nominal';
  }, [systemStatuses]);

  const devicesWithStatus = useMemo(() => {
    const localizedBase = reconcileDevicesForMission(state.devices, mission, biomarkers, language);
    return syncDeviceStatuses(localizedBase, biomarkers, systemStatuses, language);
  }, [state.devices, mission, biomarkers, systemStatuses, language]);

  const localizedOverdueMeta = useMemo(
    () => localizeOverdueMeta(state.overdueRoutineMeta, language),
    [state.overdueRoutineMeta, language]
  );

  const routines: DailyRoutineItem[] = useMemo(() => {
    const connectedMap = new Map(state.devices.map((d) => [d.id, d.connected]));
    const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
    const hasSurgery = hasPriorSurgeries(astronaut.clinicalHistory.priorSurgeries);
    const hasCircadianNote = astronaut.clinicalHistory.notes.toLowerCase().includes('circadian');

    const urgentLabel = language === 'es' ? 'Urgente hoy' : 'Urgent today';
    const scheduledLabel = language === 'es' ? 'Programada' : 'Scheduled';

    const resolvePriority = (
      id: string,
      linkedDeviceId: DeviceId | undefined,
      usesManualFallback: boolean
    ): Pick<
      DailyRoutineItem,
      'priority' | 'isOverdue' | 'overdueFromDay' | 'overdueDays' | 'priorityLabel' | 'urgencyContext'
    > => {
      const overdue = localizedOverdueMeta?.[id];
      if (overdue) {
        return {
          priority: 'overdue',
          isOverdue: true,
          overdueFromDay: overdue.fromDay,
          overdueDays: overdue.daysLate,
          priorityLabel:
            language === 'es' ? `Atrasada · Día ${overdue.fromDay}` : `Overdue · Day ${overdue.fromDay}`,
          urgencyContext: overdue.reasonLabel,
        };
      }

      if (usesManualFallback) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            language === 'es'
              ? 'Sensor offline · Requiere protocolo clínico manual'
              : 'Sensor offline · Manual clinical protocol required',
        };
      }

      if (
        linkedDeviceId === 'dosimeter' &&
        (systemStatuses.immune !== 'nominal' ||
          isExtremeRadiation(mission.radiationRiskLevel) ||
          isHighRadiation(mission.radiationRiskLevel))
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            systemStatuses.immune !== 'nominal'
              ? language === 'es'
                ? 'Alerta de radiación o inmunidad activa'
                : 'Active radiation or immunity alert'
              : language === 'es'
                ? `Misión con radiación ${mission.radiationRiskLevel.toLowerCase()}`
                : `${mission.radiationRiskLevel} radiation mission environment`,
        };
      }

      if (
        linkedDeviceId === 'hematology' &&
        (systemStatuses.immune !== 'nominal' || isLowImmune)
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext: isLowImmune
            ? language === 'es'
              ? 'EHR: Defensas bajas previas en seguimiento'
              : 'EHR: Prior low defenses under watch'
            : language === 'es'
              ? 'Conteo de leucocitos fuera de rango nominal'
              : 'Leukocyte count outside nominal range',
        };
      }

      if (
        linkedDeviceId === 'glucometer' &&
        (systemStatuses.metabolic !== 'nominal' ||
          (astronaut.clinicalHistory.baselineGlucose < 85 &&
            (mission.id === 'planetary-habitat' || mission.id === 'surface-rover')))
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            systemStatuses.metabolic !== 'nominal'
              ? language === 'es'
                ? 'Glucemia capilar requiere verificación hoy'
                : 'Capillary blood glucose requires verification today'
              : language === 'es'
                ? 'Línea base glucémica baja para operación EVA/Rover'
                : 'Low glycemic baseline for EVA/Rover shift',
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
          priorityLabel: urgentLabel,
          urgencyContext:
            systemStatuses.cardiovascular !== 'nominal'
              ? language === 'es'
                ? 'Alerta cardiovascular o SpO₂% activa'
                : 'Active cardiovascular or SpO₂% alert'
              : language === 'es'
                ? 'Control vital prioritario en cabina/EVA'
                : 'Priority vital signs check for cabin/EVA',
        };
      }

      if (
        linkedDeviceId === 'ultrasound' &&
        (systemStatuses.brain !== 'nominal' || systemStatuses.musculoskeletal !== 'nominal')
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            language === 'es'
              ? 'Seguimiento prioritario neuro-ocular / muscular'
              : 'Priority neuro-ocular / muscular follow-up',
        };
      }

      if (
        id === 'psych-checkin-daily' &&
        (systemStatuses.brain !== 'nominal' || (hasCircadianNote && biomarkers.sleepHours < 7.0))
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            language === 'es'
              ? 'Disrupción circadiana o fatiga detectada hoy'
              : 'Circadian disruption or fatigue detected today',
        };
      }

      if (
        id === 'exercise-daily-protocol' &&
        (systemStatuses.musculoskeletal !== 'nominal' || hasSurgery || mission.gravityG === 0)
      ) {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext: hasSurgery
            ? language === 'es'
              ? 'Sesión adaptada a antecedente quirúrgico'
              : 'Session adapted to surgical history'
            : language === 'es'
              ? `Contramedida clave en ${mission.gravityLabel}`
              : `Key countermeasure in ${mission.gravityLabel}`,
        };
      }

      if (id === 'nutrition-calcium-daily' && systemStatuses.musculoskeletal !== 'nominal') {
        return {
          priority: 'urgent',
          isOverdue: false,
          priorityLabel: urgentLabel,
          urgencyContext:
            language === 'es'
              ? 'Soporte mineral prioritario por retención ósea'
              : 'Priority mineral support for bone retention',
        };
      }

      return {
        priority: 'normal',
        isOverdue: false,
        priorityLabel: scheduledLabel,
      };
    };

    const items: DailyRoutineItem[] = mission.recommendedScans.map((scan) => {
      const isConnected = connectedMap.get(scan.deviceId) ?? false;
      const usesManualFallback = !isConnected;
      return {
        id: scan.id,
        title: isConnected ? scan.title : scan.manualFallbackTitle,
        category: isConnected
          ? language === 'es'
            ? 'Escaneo'
            : 'Scan'
          : 'Manual',
        linkedDeviceId: scan.deviceId,
        usesManualFallback,
        reason: isConnected
          ? scan.reason
          : language === 'es'
            ? `Herramienta desconectada: protocolo adaptado a autoevaluación clínica (${scan.reason})`
            : `Tool disconnected: adapted to manual clinical self-check (${scan.reason})`,
        completed: state.completedRoutineIds.includes(scan.id),
        points: scan.points,
        ...resolvePriority(scan.id, scan.deviceId, usesManualFallback),
      };
    });

    items.push(
      {
        id: 'psych-checkin-daily',
        title:
          language === 'es'
            ? 'Check-in emocional y calidad de sueño + Video-Diario'
            : 'Emotional & sleep quality check-in + Video-Diary',
        category: language === 'es' ? 'Psicología' : 'Psychology',
        usesManualFallback: false,
        reason:
          language === 'es'
            ? 'Previene fatiga por aislamiento y desincronización circadiana.'
            : 'Prevents isolation fatigue and circadian desynchronization.',
        completed: state.completedRoutineIds.includes('psych-checkin-daily'),
        points: 25,
        ...resolvePriority('psych-checkin-daily', undefined, false),
      },
      {
        id: 'exercise-daily-protocol',
        title: hasSurgery
          ? language === 'es'
            ? 'Entrenamiento óseo y muscular adaptado a historial quirúrgico'
            : 'Bone & muscle workout adapted to surgical history'
          : language === 'es'
            ? `Rutina física diaria (${mission.gravityLabel})`
            : `Daily physical routine (${mission.gravityLabel})`,
        category: language === 'es' ? 'Ejercicio' : 'Exercise',
        usesManualFallback: false,
        reason:
          language === 'es'
            ? 'Contrarresta pérdida ósea (1-1.5%/mes) y protege articulaciones.'
            : 'Counteracts bone loss (1–1.5%/mo) and protects operated joints.',
        completed: state.completedRoutineIds.includes('exercise-daily-protocol'),
        points: 40,
        ...resolvePriority('exercise-daily-protocol', undefined, false),
      },
      {
        id: 'nutrition-calcium-daily',
        title:
          language === 'es'
            ? 'Hidratación controlada + Vitamina D y Calcio'
            : 'Controlled hydration + Vitamin D & Calcium',
        category: language === 'es' ? 'Nutrición' : 'Nutrition',
        usesManualFallback: false,
        reason:
          language === 'es'
            ? 'Soporta remineralización ósea y estabilidad metabólica.'
            : 'Supports bone remineralization and metabolic stability.',
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
    localizedOverdueMeta,
    astronaut,
    biomarkers.sleepHours,
    systemStatuses,
    language,
  ]);

  const detectedRisks: MissionRiskItem[] = useMemo(
    () =>
      analyzeMissionAndAstronautRisks({
        mission,
        astronaut,
        biomarkers,
        systemStatuses,
        routines,
        devices: devicesWithStatus,
        activeCrisisScenario,
        lang: language,
      }),
    [
      mission,
      astronaut,
      biomarkers,
      systemStatuses,
      routines,
      devicesWithStatus,
      activeCrisisScenario,
      language,
    ]
  );

  const inspirationItems = useMemo(() => {
    const presetList = getDefaultInspirationItems(language);
    const presetMap = new Map(presetList.map((item) => [item.id, item]));
    return state.inspirationItems.map((item) => {
      const preset = presetMap.get(item.id);
      if (!preset) return item;
      return {
        ...item,
        ...preset,
        imageUrl: item.imageUrl,
      };
    });
  }, [state.inspirationItems, language]);

  const videoLogs = useMemo(() => {
    const seedLogs = createInitialVideoLogs(mission, astronaut, state.missionDay, language);
    const seedMap = new Map(seedLogs.map((l) => [l.id, l]));
    return state.videoLogs.map((log) => {
      const seed = seedMap.get(log.id);
      if (seed) {
        return {
          ...seed,
          aiIndicators: {
            ...seed.aiIndicators,
            syncState: log.aiIndicators.syncState ?? seed.aiIndicators.syncState,
            earthSyncStatus:
              log.aiIndicators.syncState === 'acknowledged'
                ? language === 'es'
                  ? 'Confirmado por Psicología de Tierra (Houston/CSA)'
                  : 'Acknowledged by Earth Psychology (Houston/CSA)'
                : log.aiIndicators.syncState === 'transmitting'
                  ? language === 'es'
                    ? 'Transmitiendo paquete cifrado hacia Red de Espacio Profundo...'
                    : 'Transmitting encrypted packet to Deep Space Network...'
                  : seed.aiIndicators.earthSyncStatus,
            earthFeedback: log.aiIndicators.earthFeedback ?? seed.aiIndicators.earthFeedback,
          },
        };
      }
      return {
        ...log,
        aiIndicators: {
          ...log.aiIndicators,
          confinementStress: localizeStressLevel(log.aiIndicators.confinementStress, language),
        },
      };
    });
  }, [state.videoLogs, mission, astronaut, state.missionDay, language]);

  const pvtHistory = useMemo(() => {
    const basePvt = state.pvtHistory ?? [];
    const seedPvt = createInitialPvtHistory(astronaut, mission, state.missionDay, language)[0];
    return basePvt.map((item) => {
      if (seedPvt && item.id === 'pvt-seed-1') {
        return seedPvt;
      }
      return {
        ...item,
        statusLabel: localizePvtStatus(item.statusLabel, language),
      };
    });
  }, [state.pvtHistory, astronaut, mission, state.missionDay, language]);

  const crisisAlertBanner = useMemo<CrisisAlertBanner | null>(() => {
    if (!activeCrisisScenario) return null;
    if (activeCrisisScenario === 'syncope_hypoglycemic') {
      return language === 'es'
        ? {
            scenario: 'syncope_hypoglycemic',
            title: 'ALERTA DE CABINA · Síncope / Shock Hipoglucémico',
            description:
              'Glucosa en 52 mg/dL y presión arterial en 82/50 mmHg. Sistemas Cardiovascular y Metabólico en código Rojo.',
          }
        : {
            scenario: 'syncope_hypoglycemic',
            title: 'CABIN ALERT · Syncope / Hypoglycemic Shock',
            description:
              'Glucose at 52 mg/dL and blood pressure at 82/50 mmHg. Cardiovascular and Metabolic systems in Code Red.',
          };
    }
    return language === 'es'
      ? {
          scenario: 'microgravity_seizure',
          title: 'ALERTA DE CABINA · Crisis Convulsiva en Microgravedad',
          description:
            'Sensor de cabina detectó movimiento convulsivo anómalo. Sistema Neurológico en Rojo y cronómetro de episodio iniciado.',
        }
      : {
          scenario: 'microgravity_seizure',
          title: 'CABIN ALERT · Seizure Episode in Microgravity',
          description:
            'Cabin sensor detected anomalous convulsive motion. Neurological system in Code Red and episode stopwatch started.',
        };
  }, [activeCrisisScenario, language]);

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
    const surgeryText = astronaut.clinicalHistory.priorSurgeries.join(' ').toLowerCase();
    return mission.defaultExercises.map((ex) => {
      const matchedJoint = ex.affectedJoints.find((joint) => surgeryText.includes(joint));
      const matchedSurgery = matchedJoint
        ? astronaut.clinicalHistory.priorSurgeries.find((s) =>
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
  }, [mission, astronaut, state.completedExerciseIds]);

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
    setState((prev) => {
      const missions = getMissionsData(prev.language);
      const selectedMission = missions.find((m) => m.id === missionId) ?? missions[0];
      const safeProfile = sanitizeAstronautProfile(astronautProfile, prev.language);
      const nextEpoch = prev.startupSessionEpoch + 1;
      return buildDefaultState(
        selectedMission.id,
        safeProfile,
        true,
        true,
        nextEpoch,
        prev.language
      );
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
              lastUpdated: !d.connected
                ? prev.language === 'es'
                  ? 'Conectado ahora'
                  : 'Connected now'
                : prev.language === 'es'
                  ? 'En espera (manual)'
                  : 'Standby (manual)',
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
              lastUpdated: connected
                ? prev.language === 'es'
                  ? 'Conectado ahora'
                  : 'Connected now'
                : prev.language === 'es'
                  ? 'En espera (manual)'
                  : 'Standby (manual)',
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
            ? {
                ...d,
                lastUpdated:
                  prev.language === 'es'
                    ? `Día ${nextDay} · Recién medido`
                    : `Day ${nextDay} · Just measured`,
              }
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
      setShouldAutoStartTimer(false);
    }
    setState((prev) => {
      const missions = getMissionsData(prev.language);
      const activeMission = missions.find((m) => m.id === prev.missionId) ?? missions[0];
      const nextDay = prev.missionDay + 1;
      let nextBio = { ...prev.biomarkers };

      if (scenario === 'nominal') {
        nextBio = createInitialBiomarkers(
          activeMission,
          prev.astronaut,
          getInitialMissionDay(activeMission),
          prev.language
        );
      } else if (scenario === 'solar_storm') {
        nextBio.dailyRadiationMsv = 6.8;
        nextBio.cumulativeRadiationMsv = Number(
          Math.max(
            activeMission.missionLimitMsv + 8,
            prev.biomarkers.cumulativeRadiationMsv + 38
          ).toFixed(1)
        );
        nextBio.wbcCount = isLowImmuneStatus(prev.astronaut.clinicalHistory.immuneStatus)
          ? 3350
          : 3950;
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
        nextBio.ultrasoundStatus = localizeUltrasoundStatus(
          'Mild Neuro-Ocular Edema',
          prev.language
        );
        nextBio.ultrasoundNotes =
          prev.language === 'es' ? ISOLATION_US_NOTES_ES : ISOLATION_US_NOTES_EN;
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

      const activeMission =
        MISSIONS_DATA_EN.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA_EN[0];
      const dailyExerciseIds = activeMission.defaultExercises
        .filter((ex) => isDailyFrequency(ex.frequency))
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
      const isAlert =
        result.statusLabel === 'Circadian Alert' || result.statusLabel === 'Alerta Circadiana';
      const adjustedStress = isAlert
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
    sleepQuality?: 'Restorative' | 'Fragmented' | 'Insomnia' | 'Reparador' | 'Fragmentado' | 'Insomnio';
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
      const lang = prev.language;
      const missions = getMissionsData(lang);
      const activeMission = missions.find((m) => m.id === prev.missionId) ?? missions[0];
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
        lang,
      });

      const entry: VideoDiaryEntry = {
        id: entryId,
        day: prev.missionDay,
        timestamp:
          lang === 'es'
            ? `Día ${prev.missionDay} · Guardado ahora`
            : `Day ${prev.missionDay} · Saved now`,
        mode: payload.mode,
        title: payload.title,
        notes: payload.notes,
        moodRating: payload.moodRating,
        durationSeconds: payload.durationSeconds,
        aiIndicators: {
          emotionalTone: analysis.emotionalTone,
          vocalFatigue: analysis.vocalFatigue,
          confinementStress: analysis.confinementStress,
          earthSyncStatus:
            lang === 'es'
              ? `En cola cifrada para psicólogos en Tierra (${activeMission.commDelay})`
              : `Encrypted queue for Earth psychologists (${activeMission.commDelay})`,
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
                earthSyncStatus:
                  prev.language === 'es'
                    ? 'Transmitiendo paquete cifrado hacia Red de Espacio Profundo...'
                    : 'Transmitting encrypted packet to Deep Space Network...',
              },
            }
          : log
      ),
    }));

    setTimeout(() => {
      setState((prev) => {
        const lang = prev.language;
        const target = prev.videoLogs.find((l) => l.id === entryId);
        if (!target) return prev;
        const stress = target.aiIndicators.confinementStress;
        const isHigh = stress === 'High' || stress === 'Elevado';
        const isMod = stress === 'Moderate' || stress === 'Moderado';
        const feedback = isHigh
          ? lang === 'es'
            ? 'Psicología de Vuelo (Houston/CSA): Alerta recibida. Se programa teleconferencia asíncrona prioritaria y ajuste de carga operativa.'
            : 'Flight Psychology (Houston/CSA): Alert received. Priority async teleconference scheduled and workload adjustment advised.'
          : isMod
            ? lang === 'es'
              ? 'Psicología de Vuelo: Registro revisado. Recomendamos mantener higiene lumínica ámbar y sesión breve de respiración antes del descanso.'
              : 'Flight Psychology: Log reviewed. Recommend keeping 1800K amber light hygiene and a brief breathing session pre-rest.'
            : lang === 'es'
              ? 'Psicología de Vuelo: Indicadores estables y coherentes con la línea base. Sin intervención adicional requerida.'
              : 'Flight Psychology: Indicators stable and aligned with baseline. No additional intervention required.';

        return {
          ...prev,
          videoLogs: prev.videoLogs.map((log) =>
            log.id === entryId
              ? {
                  ...log,
                  aiIndicators: {
                    ...log.aiIndicators,
                    syncState: 'acknowledged',
                    earthSyncStatus:
                      lang === 'es'
                        ? 'Confirmado por Psicología de Tierra (Houston/CSA)'
                        : 'Acknowledged by Earth Psychology (Houston/CSA)',
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

  const clearSessionTransientMedia = () => {
    setVideoMediaUrls((prev) => {
      Object.values(prev).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      return {};
    });
    setActiveCrisisScenario(null);
    setShouldAutoStartTimer(false);
    setIsSosOpen(false);
  };

  const resetDemoData = () => {
    setState((prev) =>
      buildDefaultState(
        prev.missionId,
        prev.astronaut,
        true,
        true,
        prev.startupSessionEpoch + 1,
        prev.language
      )
    );
    clearSessionTransientMedia();
  };

  const resetFullDemoExperience = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
    setState((prev) => {
      const presets = getPreloadedAstronauts(prev.language);
      return buildDefaultState('deep-space-transit', presets[0], false, false, 1, prev.language);
    });
    clearSessionTransientMedia();
  };

  const openSosOverlay = (protocolId?: EmergencyProtocolId) => {
    if (protocolId) {
      setActiveEmergencyProtocolId(protocolId);
    } else if (systemStatuses.brain === 'critical' && activeCrisisScenario === 'microgravity_seizure') {
      setActiveEmergencyProtocolId('seizure');
    } else if (systemStatuses.metabolic === 'critical' && biomarkers.glucoseMgDl < 65) {
      setActiveEmergencyProtocolId('syncope');
    } else if (systemStatuses.cardiovascular === 'critical' && biomarkers.spo2Percent < 92) {
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
      setActiveEmergencyProtocolId('syncope');
      setShouldAutoStartTimer(false);
    } else {
      setActiveEmergencyProtocolId('seizure');
      setShouldAutoStartTimer(true);
    }

    setIsSosOpen(true);
  };

  const restoreNominalVitals = () => {
    setState((prev) => {
      const missions = getMissionsData(prev.language);
      const activeMission = missions.find((m) => m.id === prev.missionId) ?? missions[0];
      const nominalBio = createInitialBiomarkers(
        activeMission,
        prev.astronaut,
        getInitialMissionDay(activeMission),
        prev.language
      );
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
    setShouldAutoStartTimer(false);
  };

  const value: MissionContextValue = {
    language,
    setLanguage,
    isHydrated,
    hasCompletedWelcome: state.hasCompletedWelcome,
    isOnboarded: state.isOnboarded,
    mission,
    astronaut,
    missionDay: state.missionDay,
    activeTab: state.activeTab,
    setActiveTab,
    devices: devicesWithStatus,
    biomarkers,
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
    videoLogs,
    videoMediaUrls,
    inspirationItems,
    pvtHistory,
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
    resetFullDemoExperience,
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
    throw new Error('useMission must be used inside MissionProvider');
  }
  return ctx;
}
