'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MISSIONS_DATA, MissionExercisePreset, MissionId, MissionType } from '@/data/missionsData';
import { AstronautProfile, PRELOADED_ASTRONAUTS } from '@/data/astronautsData';
import {
  BodySystemId,
  DEFAULT_INSPIRATION_ITEMS,
  TriageLevel,
} from '@/data/medicalKnowledge';

export type AppTabId = 'dashboard' | 'sensors' | 'psychology' | 'musculoskeletal' | 'survival';

export type DeviceId =
  | 'glucometer'
  | 'hematology'
  | 'vitals_cuff'
  | 'dosimeter'
  | 'ultrasound';

export interface DeviceConnection {
  id: DeviceId;
  name: string;
  shortName: string;
  description: string;
  unit: string;
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

export interface DailyRoutineItem {
  id: string;
  title: string;
  category: 'Escaneo' | 'Psicología' | 'Ejercicio' | 'Nutrición' | 'Manual';
  linkedDeviceId?: DeviceId;
  usesManualFallback: boolean;
  reason: string;
  completed: boolean;
  points: number;
}

export interface VideoDiaryEntry {
  id: string;
  day: number;
  timestamp: string;
  mode: 'video' | 'texto';
  title: string;
  notes: string;
  moodRating: number;
  aiIndicators: {
    emotionalTone: string;
    vocalFatigue: string;
    confinementStress: 'Bajo' | 'Moderado' | 'Elevado';
    earthSyncStatus: string;
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
}

export type DemoScenario =
  | 'nominal'
  | 'solar_storm'
  | 'hypoglycemia_immune'
  | 'isolation_fatigue';

interface StoredState {
  isOnboarded: boolean;
  missionId: MissionId;
  astronaut: AstronautProfile;
  missionDay: number;
  activeTab: AppTabId;
  devices: DeviceConnection[];
  biomarkers: TelemetryBiomarkers;
  history: HistoryPoint[];
  completedRoutineIds: string[];
  completedExerciseIds: string[];
  supplementsChecked: { vitaminD: boolean; calcium: boolean; hydration: boolean };
  psychRoutinesChecked: { breathing: boolean; circadianLight: boolean; weeklyResilience: boolean };
  streakDays: number;
  healthPoints: number;
  videoLogs: VideoDiaryEntry[];
  inspirationItems: InspirationItem[];
}

interface MissionContextValue {
  isHydrated: boolean;
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
  inspirationItems: InspirationItem[];
  completeOnboarding: (missionId: MissionId, astronautProfile: AstronautProfile) => void;
  reopenOnboarding: () => void;
  toggleDevice: (deviceId: DeviceId) => void;
  recordTelemetryScan: (partial: Partial<TelemetryBiomarkers>, customNote?: string) => void;
  triggerDemoAnomaly: (scenario: DemoScenario) => void;
  toggleRoutineTask: (taskId: string) => void;
  toggleExerciseTask: (exerciseId: string) => void;
  toggleSupplement: (key: 'vitaminD' | 'calcium' | 'hydration') => void;
  togglePsychRoutine: (key: 'breathing' | 'circadianLight' | 'weeklyResilience') => void;
  addMentalCheckIn: (payload: {
    moodScore: number;
    sleepHours: number;
    stressLevel: number;
    crewCohesion: number;
  }) => void;
  addVideoDiaryEntry: (payload: {
    mode: 'video' | 'texto';
    title: string;
    notes: string;
    moodRating: number;
  }) => void;
  addInspirationItem: (item: Omit<InspirationItem, 'id'>) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'deeptrau_mvp_state_v1';
const LEGACY_STORAGE_KEY = 'astrohealth_mvp_state_v1';

const MissionContext = createContext<MissionContextValue | null>(null);

function createInitialDevices(biomarkers: TelemetryBiomarkers): DeviceConnection[] {
  return [
    {
      id: 'glucometer',
      name: 'Glucómetro y Analizador Metabólico Capilar',
      shortName: 'Glucómetro',
      description: 'Mide glucosa en sangre (mg/dL) para prevenir hipoglucemia o resistencia insulínica.',
      unit: 'mg/dL',
      connected: true,
      lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
      lastUpdated: 'Hoy · 08:15 UTC',
      status: 'nominal',
    },
    {
      id: 'hematology',
      name: 'Analizador Hematológico e Inmune Portátil',
      shortName: 'Sangre / Defensas',
      description: 'Evalúa leucocitos (células/µL) y biomarcadores de respuesta inmunológica.',
      unit: 'células/µL',
      connected: true,
      lastReading: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
      lastUpdated: 'Hoy · 08:20 UTC',
      status: 'nominal',
    },
    {
      id: 'vitals_cuff',
      name: 'Oxímetro de Pulso y Tensiómetro Orbital',
      shortName: 'Oxígeno y Presión',
      description: 'Registra SpO₂%, presión arterial (mmHg) y frecuencia cardíaca (bpm).',
      unit: 'SpO₂% / mmHg',
      connected: true,
      lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
      lastUpdated: 'En vivo',
      status: 'nominal',
    },
    {
      id: 'dosimeter',
      name: 'Dosímetro Personal de Radiación (Tecnología CSA)',
      shortName: 'Dosímetro CSA',
      description: 'Mide tasa diaria y dosis acumulada de radiación ionizante en mSv.',
      unit: 'mSv',
      connected: true,
      lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv acum.`,
      lastUpdated: 'En vivo',
      status: 'nominal',
    },
    {
      id: 'ultrasound',
      name: 'Escáner de Ultrasonido Portátil Multi-Órgano',
      shortName: 'Ultrasonido',
      description: 'Inspección óptica neuro-ocular (SANS), flujo vascular y masa muscular profunda.',
      unit: 'Imagen / Doppler',
      connected: true,
      lastReading: biomarkers.ultrasoundStatus,
      lastUpdated: 'Hace 2 días',
      status: 'nominal',
    },
  ];
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
      aiIndicators: {
        emotionalTone: 'Estable y resiliente',
        vocalFatigue: 'Leve (fin de turno)',
        confinementStress: 'Bajo',
        earthSyncStatus: `Empaquetado para envío asíncrono (${mission.commDelay})`,
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
        earthSyncStatus: 'Sincronizado en registro médico local',
      },
    },
  ];
}

function buildDefaultState(
  missionId: MissionId = 'deep-space-transit',
  astronaut: AstronautProfile = PRELOADED_ASTRONAUTS[0],
  isOnboarded = false
): StoredState {
  const mission = MISSIONS_DATA.find((m) => m.id === missionId) ?? MISSIONS_DATA[0];
  const biomarkers = createInitialBiomarkers(mission, astronaut);
  return {
    isOnboarded,
    missionId: mission.id,
    astronaut,
    missionDay: 45,
    activeTab: 'dashboard',
    devices: createInitialDevices(biomarkers),
    biomarkers,
    history: generateInitialHistory(mission, astronaut),
    completedRoutineIds: ['psych-checkin-daily'],
    completedExerciseIds: [],
    supplementsChecked: { vitaminD: true, calcium: false, hydration: true },
    psychRoutinesChecked: { breathing: false, circadianLight: true, weeklyResilience: false },
    streakDays: 12,
    healthPoints: 1480,
    videoLogs: createInitialVideoLogs(mission),
    inspirationItems: DEFAULT_INSPIRATION_ITEMS,
  };
}

function evaluateSystemStatuses(
  biomarkers: TelemetryBiomarkers,
  mission: MissionType,
  astronaut: AstronautProfile
): Record<BodySystemId, TriageLevel> {
  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

  // 1. Brain & Mental Health
  let brain: TriageLevel = 'nominal';
  if (
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
  if (biomarkers.spo2Percent < 92 || biomarkers.systolicBP >= 150 || biomarkers.heartRateBpm >= 115) {
    cardiovascular = 'critical';
  } else if (
    biomarkers.spo2Percent < 95 ||
    bpDelta >= 18 ||
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

  // 4. Metabolic & Glucose (crossed with personal baseline)
  let metabolic: TriageLevel = 'nominal';
  if (biomarkers.glucoseMgDl < 65 || biomarkers.glucoseMgDl >= 175) {
    metabolic = 'critical';
  } else if (biomarkers.glucoseMgDl < 75 || biomarkers.glucoseMgDl >= 135) {
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
    if (dev.id === 'glucometer') {
      return {
        ...dev,
        lastReading: `${biomarkers.glucoseMgDl} mg/dL`,
        status: statuses.metabolic,
      };
    }
    if (dev.id === 'hematology') {
      return {
        ...dev,
        lastReading: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
        status: statuses.immune,
      };
    }
    if (dev.id === 'vitals_cuff') {
      return {
        ...dev,
        lastReading: `${biomarkers.spo2Percent}% SpO₂ · ${biomarkers.systolicBP}/${biomarkers.diastolicBP}`,
        status: statuses.cardiovascular,
      };
    }
    if (dev.id === 'dosimeter') {
      return {
        ...dev,
        lastReading: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv (${biomarkers.dailyRadiationMsv.toFixed(2)}/día)`,
        status: statuses.immune,
      };
    }
    return {
      ...dev,
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

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed && parsed.missionId && parsed.astronaut) {
          setState(parsed);
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
    () => evaluateSystemStatuses(state.biomarkers, mission, state.astronaut),
    [state.biomarkers, mission, state.astronaut]
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
    const items: DailyRoutineItem[] = mission.recommendedScans.map((scan) => {
      const isConnected = connectedMap.get(scan.deviceId) ?? false;
      return {
        id: scan.id,
        title: isConnected ? scan.title : scan.manualFallbackTitle,
        category: isConnected ? 'Escaneo' : 'Manual',
        linkedDeviceId: scan.deviceId,
        usesManualFallback: !isConnected,
        reason: isConnected
          ? scan.reason
          : `Herramienta desconectada: protocolo adaptado a autoevaluación clínica (${scan.reason})`,
        completed: state.completedRoutineIds.includes(scan.id),
        points: scan.points,
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
      },
      {
        id: 'exercise-daily-protocol',
        title:
          state.astronaut.clinicalHistory.priorSurgeries.some(
            (s) => !s.toLowerCase().includes('sin cirug')
          )
            ? 'Entrenamiento óseo y muscular adaptado a historial quirúrgico'
            : `Rutina física diaria (${mission.gravityLabel})`,
        category: 'Ejercicio',
        usesManualFallback: false,
        reason: 'Contrarresta pérdida ósea (1-1.5%/mes) y protege articulaciones.',
        completed: state.completedRoutineIds.includes('exercise-daily-protocol'),
        points: 40,
      },
      {
        id: 'nutrition-calcium-daily',
        title: 'Hidratación controlada + Vitamina D y Calcio',
        category: 'Nutrición',
        usesManualFallback: false,
        reason: 'Soporta remineralización ósea y estabilidad metabólica.',
        completed: state.completedRoutineIds.includes('nutrition-calcium-daily'),
        points: 20,
      }
    );

    return items;
  }, [mission, state.devices, state.completedRoutineIds, state.astronaut]);

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

  const completeOnboarding = (missionId: MissionId, astronautProfile: AstronautProfile) => {
    const selectedMission = MISSIONS_DATA.find((m) => m.id === missionId) ?? MISSIONS_DATA[0];
    const newBiomarkers = createInitialBiomarkers(selectedMission, astronautProfile);
    setState({
      ...buildDefaultState(selectedMission.id, astronautProfile, true),
      biomarkers: newBiomarkers,
      devices: createInitialDevices(newBiomarkers),
      history: generateInitialHistory(selectedMission, astronautProfile),
      videoLogs: createInitialVideoLogs(selectedMission),
    });
  };

  const reopenOnboarding = () => {
    setState((prev) => ({ ...prev, isOnboarded: false }));
  };

  const setActiveTab = (tab: AppTabId) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const toggleDevice = (deviceId: DeviceId) => {
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === deviceId ? { ...d, connected: !d.connected, lastUpdated: 'Actualizado ahora' } : d
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
      return {
        ...prev,
        missionDay: nextDay,
        biomarkers: nextBio,
        history: [...prev.history.slice(-14), nextPoint],
        healthPoints: prev.healthPoints + 25,
      };
    });
  };

  const triggerDemoAnomaly = (scenario: DemoScenario) => {
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
      return {
        ...prev,
        completedExerciseIds: nextIds,
        healthPoints: exists ? Math.max(0, prev.healthPoints - 30) : prev.healthPoints + 30,
        biomarkers: {
          ...prev.biomarkers,
          boneDensityRetentionPercent: Number(
            Math.min(100, Math.max(92, prev.biomarkers.boneDensityRetentionPercent + delta)).toFixed(1)
          ),
          muscleMassRetentionPercent: Number(
            Math.min(100, Math.max(92, prev.biomarkers.muscleMassRetentionPercent + delta)).toFixed(1)
          ),
        },
      };
    });
  };

  const toggleSupplement = (key: 'vitaminD' | 'calcium' | 'hydration') => {
    setState((prev) => ({
      ...prev,
      supplementsChecked: {
        ...prev.supplementsChecked,
        [key]: !prev.supplementsChecked[key],
      },
      healthPoints: prev.healthPoints + 10,
    }));
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

  const addMentalCheckIn = (payload: {
    moodScore: number;
    sleepHours: number;
    stressLevel: number;
    crewCohesion: number;
  }) => {
    setState((prev) => {
      const nextDay = prev.missionDay + 1;
      const nextBio: TelemetryBiomarkers = {
        ...prev.biomarkers,
        ...payload,
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
  }) => {
    setState((prev) => {
      const activeMission = MISSIONS_DATA.find((m) => m.id === prev.missionId) ?? MISSIONS_DATA[0];
      const stressLabel: 'Bajo' | 'Moderado' | 'Elevado' =
        payload.moodRating <= 4 ? 'Elevado' : payload.moodRating <= 6 ? 'Moderado' : 'Bajo';
      const entry: VideoDiaryEntry = {
        id: `vlog-${Date.now()}`,
        day: prev.missionDay,
        timestamp: `Día ${prev.missionDay} · Guardado ahora`,
        mode: payload.mode,
        title: payload.title,
        notes: payload.notes,
        moodRating: payload.moodRating,
        aiIndicators: {
          emotionalTone:
            payload.moodRating >= 7
              ? 'Equilibrio emocional positivo'
              : payload.moodRating >= 5
                ? 'Alerta leve de desmotivación (tercer cuarto)'
                : 'Fatiga emocional — activar ancla terrestre',
          vocalFatigue:
            payload.mode === 'video'
              ? prev.biomarkers.sleepHours < 6.5
                ? 'Moderada (micro-pausas detectadas)'
                : 'Baja / Voz clara'
              : 'N/A (Bitácora escrita)',
          confinementStress: stressLabel,
          earthSyncStatus: `En cola cifrada para psicólogos en Tierra (${activeMission.commDelay})`,
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

  const addInspirationItem = (item: Omit<InspirationItem, 'id'>) => {
    setState((prev) => ({
      ...prev,
      inspirationItems: [{ ...item, id: `insp-${Date.now()}` }, ...prev.inspirationItems],
      healthPoints: prev.healthPoints + 15,
    }));
  };

  const resetDemoData = () => {
    const fresh = buildDefaultState(state.missionId, state.astronaut, true);
    setState(fresh);
  };

  const value: MissionContextValue = {
    isHydrated,
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
    exercises,
    supplementsChecked: state.supplementsChecked,
    psychRoutinesChecked: state.psychRoutinesChecked,
    streakDays: state.streakDays,
    healthPoints: state.healthPoints,
    readinessScore,
    systemStatuses,
    globalTriage,
    videoLogs: state.videoLogs,
    inspirationItems: state.inspirationItems,
    completeOnboarding,
    reopenOnboarding,
    toggleDevice,
    recordTelemetryScan,
    triggerDemoAnomaly,
    toggleRoutineTask,
    toggleExerciseTask,
    toggleSupplement,
    togglePsychRoutine,
    addMentalCheckIn,
    addVideoDiaryEntry,
    addInspirationItem,
    resetDemoData,
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
