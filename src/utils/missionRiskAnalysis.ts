import {
  AstronautProfile,
  hasPriorSurgeries,
  isLowImmuneStatus,
} from '@/data/astronautsData';
import { BodySystemId, TriageLevel } from '@/data/medicalKnowledge';
import { MissionType, isExtremeRadiation, isHighRadiation } from '@/data/missionsData';
import { Language, formatNumberLocale } from '@/i18n/types';
import type {
  DailyRoutineItem,
  DeviceConnection,
  DeviceId,
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
  lang?: Language;
}

function isMildSansStatus(status: string): boolean {
  return status === 'Mild Neuro-Ocular Edema' || status === 'Edema Neuro-Ocular Leve';
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
  lang = 'en',
}: RiskAnalysisInput): MissionRiskItem[] {
  const candidates: MissionRiskItem[] = [];

  const isLowImmune = isLowImmuneStatus(astronaut.clinicalHistory.immuneStatus);
  const hasSurgeries = hasPriorSurgeries(astronaut.clinicalHistory.priorSurgeries);
  const priorSurgeries = hasSurgeries ? astronaut.clinicalHistory.priorSurgeries : [];
  const hasCircadianSensitivity = astronaut.clinicalHistory.notes
    .toLowerCase()
    .includes('circadian');

  const overduePending = routines.filter((r) => !r.completed && r.isOverdue);
  const recommendedIds = new Set<DeviceId>(mission.recommendedScans.map((s) => s.deviceId));
  const disconnectedDevices = devices.filter(
    (d) => d.availableInMission !== false && !d.connected && recommendedIds.has(d.id)
  );

  const radExtreme = isExtremeRadiation(mission.radiationRiskLevel);
  const radHigh = isHighRadiation(mission.radiationRiskLevel);

  // 1. Immune & Latent Viral Reactivation Risk
  if (
    systemStatuses.immune === 'critical' ||
    systemStatuses.immune === 'warning' ||
    (isLowImmune && (biomarkers.wbcCount <= 4600 || radExtreme || radHigh))
  ) {
    const isCritical =
      systemStatuses.immune === 'critical' || biomarkers.wbcCount <= (isLowImmune ? 3600 : 3200);
    const formattedWbc = formatNumberLocale(biomarkers.wbcCount, lang);
    candidates.push({
      id: 'risk-immune-defenses',
      severity: isCritical ? 'critical' : 'warning',
      category: lang === 'es' ? 'Inmunidad' : 'Immunity',
      problem: isCritical
        ? lang === 'es'
          ? 'Inmunosupresión severa y alto riesgo de infección en cabina cerrada'
          : 'Severe immunosuppression and high infection risk in sealed cabin'
        : lang === 'es'
          ? 'Descenso inmunitario y posible reactivación viral latente'
          : 'Immune decline and potential latent viral reactivation',
      detectedMetric:
        lang === 'es'
          ? `Leucocitos ${formattedWbc} cél/µL · ${
              isLowImmune ? 'EHR: Defensas bajas previas' : 'Umbral hematológico en vigilancia'
            }`
          : `Leukocytes ${formattedWbc} cells/µL · ${
              isLowImmune ? 'EHR: Prior low defenses' : 'Hematological watch threshold'
            }`,
      action: isCritical
        ? lang === 'es'
          ? 'Aíslate preventivamente de cargas biológicas, repite panel hematológico en 12 h y prioriza descanso inmediato.'
          : 'Preventively isolate from bio-loads, repeat hematology panel in 12 h, and prioritize immediate rest.'
        : lang === 'es'
          ? 'Completa hoy el análisis hematológico, extrema higiene en cabina y asegura al menos 7.5 h de sueño.'
          : 'Complete today’s hematology panel, reinforce cabin hygiene, and secure at least 7.5 h of sleep.',
      priorityScore: isCritical ? 98 : 78,
    });
  }

  // 2. Space Radiation & Solar Particle Risk
  const radExceededLimit =
    biomarkers.cumulativeRadiationMsv >= mission.missionLimitMsv ||
    biomarkers.dailyRadiationMsv >= 5.0;
  const radWarningLevel =
    biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv ||
    biomarkers.dailyRadiationMsv >= 2.8 ||
    radExtreme ||
    (radHigh && mission.id === 'surface-rover') ||
    (radHigh && biomarkers.cumulativeRadiationMsv >= mission.warningLimitMsv * 0.5);

  if (radExceededLimit || radWarningLevel) {
    candidates.push({
      id: 'risk-radiation-exposure',
      severity: radExceededLimit ? 'critical' : 'warning',
      category: lang === 'es' ? 'Radiación' : 'Radiation',
      problem: radExceededLimit
        ? lang === 'es'
          ? 'Límite operacional de radiación superado con riesgo celular agudo'
          : 'Operational radiation limit exceeded with acute cellular risk'
        : mission.id === 'surface-rover'
          ? lang === 'es'
            ? 'Exposición solar directa sin blindaje de hábitat durante excursión'
            : 'Direct solar exposure without habitat shielding during rover excursion'
          : lang === 'es'
            ? 'Exposición ionizante elevada fuera de protección atmosférica'
            : 'Elevated ionizing exposure outside atmospheric protection',
      detectedMetric:
        lang === 'es'
          ? `Dosis ${biomarkers.cumulativeRadiationMsv.toFixed(1)}/${mission.missionLimitMsv} mSv · Tasa ${biomarkers.dailyRadiationMsv.toFixed(2)} mSv/día (${mission.shortName})`
          : `Dose ${biomarkers.cumulativeRadiationMsv.toFixed(1)}/${mission.missionLimitMsv} mSv · Rate ${biomarkers.dailyRadiationMsv.toFixed(2)} mSv/day (${mission.shortName})`,
      action: radExceededLimit
        ? lang === 'es'
          ? 'Refúgiate de inmediato en el módulo de mayor blindaje (agua/polietileno) y suspende salidas EVA.'
          : 'Shelter immediately in the highest-shielded module (water/polyethylene) and suspend EVAs.'
        : lang === 'es'
          ? 'Realiza la lectura del dosímetro CSA al iniciar turno y mantén identificado el refugio contra tormenta solar.'
          : 'Take CSA dosimeter reading at shift start and keep solar storm shelter location verified.',
      priorityScore: radExceededLimit ? 99 : radExtreme ? 76 : 68,
    });
  }

  // 3. Cardiovascular & Oxygenation Risk
  if (systemStatuses.cardiovascular !== 'nominal') {
    const isCritical = systemStatuses.cardiovascular === 'critical';
    const isHypoxic = biomarkers.spo2Percent < 95;
    candidates.push({
      id: 'risk-cardio-oxygen',
      severity: isCritical ? 'critical' : 'warning',
      category: lang === 'es' ? 'Cardio y O₂' : 'Cardio & O₂',
      problem: isHypoxic
        ? lang === 'es'
          ? 'Caída de oxigenación arterial o aire de cabina comprometido'
          : 'Arterial oxygenation drop or compromised cabin atmosphere'
        : lang === 'es'
          ? 'Inestabilidad tensional y sobrecarga cardiovascular en vuelo'
          : 'Blood pressure instability and in-flight cardiovascular strain',
      detectedMetric:
        lang === 'es'
          ? `SpO₂ ${biomarkers.spo2Percent}% · PA ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · FC ${biomarkers.heartRateBpm} bpm`
          : `SpO₂ ${biomarkers.spo2Percent}% · BP ${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg · HR ${biomarkers.heartRateBpm} bpm`,
      action: isCritical
        ? lang === 'es'
          ? 'Detén esfuerzo físico al instante, usa oxígeno suplementario de cabina y abre el panel SOS si hay mareo.'
          : 'Halt physical exertion immediately, use cabin supplemental oxygen, and open SOS panel if dizzy.'
        : lang === 'es'
          ? 'Revisa los depuradores de CO₂/O₂ de cabina, hidrátate con 500 ml de electrolitos y repite medición en 15 min.'
          : 'Check cabin CO₂/O₂ scrubbers, hydrate with 500 ml electrolytes, and re-check in 15 min.',
      priorityScore: isCritical ? 97 : 79,
    });
  }

  // 4. Metabolic / Glucose Risk
  const hasLowBaselineEvaRisk =
    astronaut.clinicalHistory.baselineGlucose < 85 &&
    (mission.id === 'planetary-habitat' || mission.id === 'surface-rover');
  if (systemStatuses.metabolic !== 'nominal' || hasLowBaselineEvaRisk) {
    const isCritical = systemStatuses.metabolic === 'critical';
    const isHighGlucose = biomarkers.glucoseMgDl >= 135;
    candidates.push({
      id: 'risk-metabolic-glucose',
      severity: isCritical ? 'critical' : 'warning',
      category: lang === 'es' ? 'Metabolismo' : 'Metabolism',
      problem: isHighGlucose
        ? lang === 'es'
          ? 'Resistencia insulínica e hiperglucemia inducida por microgravedad'
          : 'Microgravity-induced insulin resistance and hyperglycemia'
        : lang === 'es'
          ? 'Hipoglucemia reactiva con pérdida de reflejos y riesgo de síncope'
          : 'Reactive hypoglycemia with slowed reflexes and syncope risk',
      detectedMetric:
        lang === 'es'
          ? `Glucosa actual ${biomarkers.glucoseMgDl} mg/dL · Base EHR: ${astronaut.clinicalHistory.baselineGlucose} mg/dL (${mission.shortName})`
          : `Current glucose ${biomarkers.glucoseMgDl} mg/dL · EHR Base: ${astronaut.clinicalHistory.baselineGlucose} mg/dL (${mission.shortName})`,
      action: isHighGlucose
        ? lang === 'es'
          ? 'Refuerza hidratación sin azúcares simples, realiza 15 min de ciclismo suave y repite escaneo capilar.'
          : 'Reinforce sugar-free hydration, complete 15 min of light cycling, and re-test capillary glucose.'
        : lang === 'es'
          ? 'Ingiere 15 g de carbohidratos complejos antes de maniobras EVA/Rover y verifica glucómetro antes de operar.'
          : 'Consume 15 g complex carbohydrates before EVA/Rover ops and verify glucometer prior to shift.',
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
    const hasSans = isMildSansStatus(biomarkers.ultrasoundStatus);
    candidates.push({
      id: 'risk-brain-circadian',
      severity: isCritical ? 'critical' : 'warning',
      category: hasSans
        ? lang === 'es'
          ? 'Neuro-Ocular'
          : 'Neuro-Ocular'
        : lang === 'es'
          ? 'Sueño y Estrés'
          : 'Sleep & Stress',
      problem: hasSans
        ? lang === 'es'
          ? 'Desplazamiento cefálico de fluidos con signos iniciales de SANS'
          : 'Cephalad fluid shift with early signs of SANS'
        : isCritical
          ? lang === 'es'
            ? 'Fatiga aguda y sobrecarga neurocognitiva con riesgo de error operativo'
            : 'Acute fatigue and neurocognitive overload with operational error risk'
          : lang === 'es'
            ? 'Desajuste circadiano y acumulación de estrés por confinamiento'
            : 'Circadian misalignment and cumulative confinement stress',
      detectedMetric:
        lang === 'es'
          ? `Sueño ${biomarkers.sleepHours} h · Estrés ${biomarkers.stressLevel}/10 · Ánimo ${biomarkers.moodScore}/10${
              hasSans ? ' · Eco: Edema ocular leve' : ''
            }`
          : `Sleep ${biomarkers.sleepHours} h · Stress ${biomarkers.stressLevel}/10 · Mood ${biomarkers.moodScore}/10${
              hasSans ? ' · US: Mild ocular edema' : ''
            }`,
      action: hasSans
        ? lang === 'es'
          ? 'Completa hoy el ultrasonido ocular de control, registra cualquier cambio visual y eleva reporte a Tierra.'
          : 'Complete ocular control ultrasound today, log any visual changes, and uplink report to Earth.'
        : lang === 'es'
          ? 'Activa iluminación ámbar 60 min antes de dormir, realiza 2 min de respiración 4-4-4-4 y registra tu check-in emocional.'
          : 'Switch cabin lighting to 1800K amber 60 min pre-sleep, run 2 min box breathing, and log mood check-in.',
      priorityScore: isCritical ? 95 : 72,
    });
  }

  // 6. Musculoskeletal & Prior Surgery Load Risk
  const hasBoneMuscleRisk =
    systemStatuses.musculoskeletal !== 'nominal' ||
    (hasSurgeries &&
      (mission.gravityG === 0 ||
        mission.id === 'planetary-habitat' ||
        biomarkers.boneDensityRetentionPercent < 99.0 ||
        biomarkers.muscleMassRetentionPercent < 98.5));

  if (hasBoneMuscleRisk) {
    const isCritical = systemStatuses.musculoskeletal === 'critical';
    candidates.push({
      id: 'risk-musculoskeletal-surgery',
      severity: isCritical ? 'critical' : 'warning',
      category: lang === 'es' ? 'Óseo / Articular' : 'Bone & Joint',
      problem: hasSurgeries
        ? lang === 'es'
          ? `Riesgo de sobrecarga en zona operada (${priorSurgeries[0]})`
          : `Joint overload risk on operated site (${priorSurgeries[0]})`
        : lang === 'es'
          ? 'Descalcificación ósea y pérdida de tono muscular por baja gravedad'
          : 'Bone demineralization and muscle atrophy from reduced gravity',
      detectedMetric:
        lang === 'es'
          ? `Hueso ${biomarkers.boneDensityRetentionPercent}% · Músculo ${biomarkers.muscleMassRetentionPercent}% · ${
              hasSurgeries ? priorSurgeries[0] : mission.gravityLabel
            }`
          : `Bone ${biomarkers.boneDensityRetentionPercent}% · Muscle ${biomarkers.muscleMassRetentionPercent}% · ${
              hasSurgeries ? priorSurgeries[0] : mission.gravityLabel
            }`,
      action: hasSurgeries
        ? lang === 'es'
          ? 'Ejecuta únicamente la variante adaptada sin impacto axial directo y confirma Calcio + Vitamina D hoy.'
          : 'Perform only the adapted low-impact workout variant and confirm Calcium + Vitamin D today.'
        : lang === 'es'
          ? 'Prioriza la sesión diaria de resistencia ósea (ARED/T2) y verifica tu toma de Vitamina D y Calcio.'
          : 'Prioritize daily bone resistance training (ARED/T2) and verify Vitamin D + Calcium intake.',
      priorityScore: isCritical ? 90 : 66,
    });
  }

  // 7. Overdue Tasks or Disconnected Telemetry Sensors
  if (overduePending.length > 0 || disconnectedDevices.length > 0) {
    const hasSevereOverdue = overduePending.some((t) => (t.overdueDays ?? 1) >= 2);
    const problemText =
      overduePending.length > 0 && disconnectedDevices.length > 0
        ? lang === 'es'
          ? 'Controles médicos atrasados con pérdida parcial de telemetría'
          : 'Overdue medical checks with partial telemetry loss'
        : overduePending.length > 0
          ? lang === 'es'
            ? `${overduePending.length} control(es) médico(s) atrasado(s) sin cierre de ciclo`
            : `${overduePending.length} overdue medical check(s) awaiting closure`
          : lang === 'es'
            ? `${disconnectedDevices.length} sensor(es) desconectado(s) sin lectura automática`
            : `${disconnectedDevices.length} sensor(s) offline without automated reading`;

    const metricParts: string[] = [];
    if (overduePending.length > 0) {
      metricParts.push(
        `${lang === 'es' ? 'Atraso en' : 'Overdue'}: ${overduePending
          .slice(0, 2)
          .map((t) => `${t.title.split('(')[0].trim()} (${t.priorityLabel})`)
          .join(' · ')}`
      );
    }
    if (disconnectedDevices.length > 0) {
      metricParts.push(`Offline: ${disconnectedDevices.map((d) => d.shortName).join(', ')}`);
    }

    candidates.push({
      id: 'risk-overdue-telemetry',
      severity: 'warning',
      category: lang === 'es' ? 'Adherencia' : 'Adherence',
      problem: problemText,
      detectedMetric: metricParts.join(' · '),
      action:
        overduePending.length > 0
          ? lang === 'es'
            ? 'Resuelve primero las tareas marcadas como ATRASADAS en tu rutina diaria antes de iniciar maniobras.'
            : 'Resolve tasks flagged as OVERDUE in your daily routine before starting mission maneuvers.'
          : lang === 'es'
            ? 'Aplica los protocolos clínicos manuales alternativos en la rutina o reconecta los sensores en el Hub.'
            : 'Apply fallback manual clinical checks in the routine or reconnect sensors in the Hub.',
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
