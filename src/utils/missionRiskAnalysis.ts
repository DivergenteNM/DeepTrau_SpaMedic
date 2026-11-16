import { AstronautProfile } from '@/data/astronautsData';
import { BodySystemId, TriageLevel } from '@/data/medicalKnowledge';
import { MissionType } from '@/data/missionsData';
import type {
  DailyRoutineItem,
  DeviceConnection,
  EmergencyCrisisScenario,
  TelemetryBiomarkers,
} from '@/context/MissionContext';

export type RiskSeverity = 'critical' | 'warning';

export interface MissionRiskItem {
  id: string;
  severity: RiskSeverity;
  category: string;
  problem: string;
  detectedMetric: string;
  action: string;
  priorityScore: number;
}

interface RiskAnalysisInput {
  mission: MissionType;
  astronaut: AstronautProfile;
  biomarkers: TelemetryBiomarkers;
  systemStatuses: Record<BodySystemId, TriageLevel>;
  routines: DailyRoutineItem[];
  devices: DeviceConnection[];
  activeCrisisScenario: EmergencyCrisisScenario | null;
}

/**
 * Evaluates astronaut EHR, live biomarkers, routine backlog, and mission hazards
 * to surface the 2-4 most likely risks for today (or an empty array when nominal).
 */
export function analyzeMissionAndAstronautRisks({
  mission,
  astronaut,
  biomarkers,
  systemStatuses,
  routines,
  devices,
  activeCrisisScenario,
}: RiskAnalysisInput): MissionRiskItem[] {
  const candidates: MissionRiskItem[] = [];

  const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';
  const priorSurgeries = astronaut.clinicalHistory.priorSurgeries.filter(
    (s) => !s.toLowerCase().includes('sin cirug')
  );
  const hasPriorSurgery = priorSurgeries.length > 0;
  const hasCircadianSensitivity = astronaut.clinicalHistory.notes
    .toLowerCase()
    .includes('circadian');

  const overduePending = routines.filter((r) => !r.completed && r.isOverdue);
  const disconnectedDevices = devices.filter((d) => !d.connected);

  // 1. Immune & Latent Viral Reactivation Risk
  if (
    systemStatuses.immune === 'critical' ||
    systemStatuses.immune === 'warning' ||
    (isLowImmune &&
      (biomarkers.wbcCount <= 4600 ||
        mission.radiationRiskLevel === 'Extremo' ||
        mission.radiationRiskLevel === 'Alto'))
  ) {
    const isCritical =
      systemStatuses.immune === 'critical' || biomarkers.wbcCount <= (isLowImmune ? 3600 : 3200);
    candidates.push({
      id: 'risk-immune-defenses',
      severity: isCritical ? 'critical' : 'warning',
      category: 'Inmunidad',
      problem: isCritical
        ? 'Inmunosupresión severa y alto riesgo de infección en cabina cerrada'
        : 'Descenso inmunitario y posible reactivación viral latente',
      detectedMetric: `Leucocitos ${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL · ${
        isLowImmune ? 'EHR: Defensas bajas previas' : 'Umbral hematológico en vigilancia'
      }`,
      action: isCritical
        ? 'Aíslate preventivamente de cargas biológicas, repite panel hematológico en 12 h y prioriza descanso inmediato.'
        : 'Completa hoy el análisis hematológico, extrema higiene en cabina y asegura al menos 7.5 h de sueño.',
      priorityScore: isCritical ? 98 : 78,
    });
  }

  // 2. Space Radiation & Solar Particle Risk
  const radExceededLimit =
    biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv || biomarkers.dailyRadiationMsv >= 5.0;
  const radWarningLevel =
    biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv ||
    biomarkers.dailyRadiationMsv >= 2.8 ||
    mission.radiationRiskLevel === 'Extremo' ||
    (mission.radiationRiskLevel === 'Alto' && mission.id === 'surface-rover') ||
    (mission.radiationRiskLevel === 'Alto' &&
      biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv * 0.5);

  if (radExceededLimit || radWarningLevel) {
    candidates.push({
      id: 'risk-radiation-exposure',
      severity: radExceededLimit ? 'critical' : 'warning',
      category: 'Radiación',
      problem: radExceededLimit
        ? 'Límite operacional de radiación superado con riesgo celular agudo'
        : mission.id === 'surface-rover'
          ? 'Exposición solar directa sin blindaje de hábitat durante excursión'
          : 'Exposición ionizante elevada fuera de protección atmosférica',
      detectedMetric: `Dosis ${biomarkers.cumulativeRadiationMsv.toFixed(1)}/${mission.missionLimitMsv} mSv · Tasa ${biomarkers.dailyRadiationMsv.toFixed(2)} mSv/día (${mission.shortName})`,
      action: radExceededLimit
        ? 'Refúgiate de inmediato en el módulo de mayor blindaje (agua/polietileno) y suspende salidas EVA.'
        : 'Realiza la lectura del dosímetro CSA al iniciar turno y mantén identificado el refugio contra tormenta solar.',
      priorityScore: radExceededLimit ? 99 : mission.radiationRiskLevel === 'Extremo' ? 76 : 68,
    });
  }

  // 3. Cardiovascular & Oxygenation Risk
  if (systemStatuses.cardiovascular !== 'nominal') {
    const isCritical = systemStatuses.cardiovascular === 'critical';
    const isHypoxic = biomarkers.spo2Percent < 95;
    candidates.push({
      id: 'risk-cardio-oxygen',
      severity: isCritical ? 'critical' : 'warning',
      category: 'Cardio y O₂',
      problem: isHypoxic
        ? 'Caída de oxigenación arterial o aire de cabina comprometido'
        : 'Inestabilidad tensional y sobrecarga cardiovascular en vuelo',
      detectedMetric: `SpO₂ ${biomarkers.spo2Percent}% · PA ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · FC ${biomarkers.heartRateBpm} bpm`,
      action: isCritical
        ? 'Detén esfuerzo físico al instante, usa oxígeno suplementario de cabina y abre el panel SOS si hay mareo.'
        : 'Revisa los depuradores de CO₂/O₂ de cabina, hidrátate con 500 ml de electrolitos y repite medición en 15 min.',
      priorityScore: isCritical ? 97 : 79,
    });
  }

  // 4. Metabolic / Glucose Risk (EHR low baseline or EVA/Rover stress or altered glycemia)
  const hasLowBaselineEvaRisk =
    astronaut.clinicalHistory.baselineGlucose < 85 &&
    (mission.id === 'planetary-habitat' || mission.id === 'surface-rover');
  if (systemStatuses.metabolic !== 'nominal' || hasLowBaselineEvaRisk) {
    const isCritical = systemStatuses.metabolic === 'critical';
    const isHighGlucose = biomarkers.glucoseMgDl >= 135;
    candidates.push({
      id: 'risk-metabolic-glucose',
      severity: isCritical ? 'critical' : 'warning',
      category: 'Metabolismo',
      problem: isHighGlucose
        ? 'Resistencia insulínica e hiperglucemia inducida por microgravedad'
        : 'Hipoglucemia reactiva con pérdida de reflejos y riesgo de síncope',
      detectedMetric: `Glucosa actual ${biomarkers.glucoseMgDl} mg/dL · Base EHR: ${astronaut.clinicalHistory.baselineGlucose} mg/dL (${mission.shortName})`,
      action: isHighGlucose
        ? 'Refuerza hidratación sin azúcares simples, realiza 15 min de ciclismo suave y repite escaneo capilar.'
        : 'Ingiere 15 g de carbohidratos complejos antes de maniobras EVA/Rover y verifica glucómetro antes de operar.',
      priorityScore: isCritical ? 96 : 74,
    });
  }

  // 5. Brain, Sleep, Circadian Fatigue, Stress & SANS Risk
  const hasSleepOrMentalRisk =
    systemStatuses.brain !== 'nominal' ||
    (hasCircadianSensitivity && biomarkers.sleepHours < 7.0);

  if (hasSleepOrMentalRisk) {
    const isCritical =
      systemStatuses.brain === 'critical' || activeCrisisScenario === 'microgravity_seizure';
    const hasSans = biomarkers.ultrasoundStatus === 'Edema Neuro-Ocular Leve';
    candidates.push({
      id: 'risk-brain-circadian',
      severity: isCritical ? 'critical' : 'warning',
      category: hasSans ? 'Neuro-Ocular' : 'Sueño y Estrés',
      problem: hasSans
        ? 'Desplazamiento cefálico de fluidos con signos iniciales de SANS'
        : isCritical
          ? 'Fatiga aguda y sobrecarga neurocognitiva con riesgo de error operativo'
          : 'Desajuste circadiano y acumulación de estrés por confinamiento',
      detectedMetric: `Sueño ${biomarkers.sleepHours} h · Estrés ${biomarkers.stressLevel}/10 · Ánimo ${biomarkers.moodScore}/10${
        hasSans ? ' · Eco: Edema ocular leve' : ''
      }`,
      action: hasSans
        ? 'Completa hoy el ultrasonido ocular de control, registra cualquier cambio visual y eleva reporte a Tierra.'
        : 'Activa iluminación ámbar 60 min antes de dormir, realiza 2 min de respiración 4-4-4-4 y registra tu check-in emocional.',
      priorityScore: isCritical ? 95 : 72,
    });
  }

  // 6. Musculoskeletal & Prior Surgery Load Risk
  const hasBoneMuscleRisk =
    systemStatuses.musculoskeletal !== 'nominal' ||
    (hasPriorSurgery &&
      (mission.gravityG === 0 ||
        mission.id === 'planetary-habitat' ||
        biomarkers.boneDensityRetentionPercent < 99.0 ||
        biomarkers.muscleMassRetentionPercent < 98.5));

  if (hasBoneMuscleRisk) {
    const isCritical = systemStatuses.musculoskeletal === 'critical';
    candidates.push({
      id: 'risk-musculoskeletal-surgery',
      severity: isCritical ? 'critical' : 'warning',
      category: 'Óseo / Articular',
      problem: hasPriorSurgery
        ? `Riesgo de sobrecarga en zona operada (${priorSurgeries[0]})`
        : 'Descalcificación ósea y pérdida de tono muscular por baja gravedad',
      detectedMetric: `Hueso ${biomarkers.boneDensityRetentionPercent}% · Músculo ${biomarkers.muscleMassRetentionPercent}% · ${
        hasPriorSurgery ? priorSurgeries[0] : mission.gravityLabel
      }`,
      action: hasPriorSurgery
        ? 'Ejecuta únicamente la variante adaptada sin impacto axial directo y confirma Calcio + Vitamina D hoy.'
        : 'Prioriza la sesión diaria de resistencia ósea (ARED/T2) y verifica tu toma de Vitamina D y Calcio.',
      priorityScore: isCritical ? 90 : 66,
    });
  }

  // 7. Overdue Tasks or Disconnected Telemetry Sensors
  if (overduePending.length > 0 || disconnectedDevices.length > 0) {
    const hasSevereOverdue = overduePending.some((t) => (t.overdueDays ?? 1) >= 2);
    const problemText =
      overduePending.length > 0 && disconnectedDevices.length > 0
        ? 'Controles médicos atrasados con pérdida parcial de telemetría'
        : overduePending.length > 0
          ? `${overduePending.length} control(es) médico(s) atrasado(s) sin cierre de ciclo`
          : `${disconnectedDevices.length} sensor(es) desconectado(s) sin lectura automática`;

    const metricParts: string[] = [];
    if (overduePending.length > 0) {
      metricParts.push(
        `Atraso en: ${overduePending
          .slice(0, 2)
          .map((t) => `${t.title.split('(')[0].trim()} (${t.priorityLabel})`)
          .join(' · ')}`
      );
    }
    if (disconnectedDevices.length > 0) {
      metricParts.push(
        `Offline: ${disconnectedDevices.map((d) => d.shortName).join(', ')}`
      );
    }

    candidates.push({
      id: 'risk-overdue-telemetry',
      severity: 'warning',
      category: 'Adherencia',
      problem: problemText,
      detectedMetric: metricParts.join(' · '),
      action:
        overduePending.length > 0
          ? 'Resuelve primero las tareas marcadas como ATRASADAS en tu rutina diaria antes de iniciar maniobras.'
          : 'Aplica los protocolos clínicos manuales alternativos en la rutina o reconecta los sensores en el Hub.',
      priorityScore: hasSevereOverdue ? 75 : 64,
    });
  }

  // Sort strictly by severity ('critical' first) then priorityScore descending, capped at 4 items
  return candidates
    .sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      return b.priorityScore - a.priorityScore;
    })
    .slice(0, 4);
}
