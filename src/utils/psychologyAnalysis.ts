import { MissionType } from '@/data/missionsData';
import { Language } from '@/i18n/types';

export type PvtStatusLabel =
  | 'Optimal'
  | 'Mild Fatigue'
  | 'Circadian Alert'
  | 'Óptima'
  | 'Fatiga Leve'
  | 'Alerta Circadiana';

export type ConfinementStressLevel =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Bajo'
  | 'Moderado'
  | 'Elevado';

export function isCircadianAlertStatus(label: string | undefined): boolean {
  return label === 'Circadian Alert' || label === 'Alerta Circadiana';
}

export function isMildFatigueStatus(label: string | undefined): boolean {
  return label === 'Mild Fatigue' || label === 'Fatiga Leve';
}

export function isHighStressLevel(level: string | undefined): boolean {
  return level === 'High' || level === 'Elevado';
}

export function isModerateStressLevel(level: string | undefined): boolean {
  return level === 'Moderate' || level === 'Moderado';
}

export function localizePvtStatus(label: PvtStatusLabel, lang: Language): PvtStatusLabel {
  if (isCircadianAlertStatus(label)) return lang === 'es' ? 'Alerta Circadiana' : 'Circadian Alert';
  if (isMildFatigueStatus(label)) return lang === 'es' ? 'Fatiga Leve' : 'Mild Fatigue';
  return lang === 'es' ? 'Óptima' : 'Optimal';
}

export function localizeStressLevel(
  level: ConfinementStressLevel,
  lang: Language
): ConfinementStressLevel {
  if (isHighStressLevel(level)) return lang === 'es' ? 'Elevado' : 'High';
  if (isModerateStressLevel(level)) return lang === 'es' ? 'Moderado' : 'Moderate';
  return lang === 'es' ? 'Bajo' : 'Low';
}

export interface PvtSessionResult {
  id: string;
  day: number;
  timestamp: string;
  trialsMs: number[];
  meanRtMs: number;
  fastestRtMs: number;
  lapses: number; // >= 500 ms
  falseStarts: number;
  alertnessScore: number; // 0 - 100
  statusLabel: PvtStatusLabel;
}

export interface DiaryLexicalAnalysis {
  emotionalTone: string;
  vocalFatigue: string;
  confinementStress: ConfinementStressLevel;
  detectedThemes: string[];
  lexicalScore: number; // -3 .. +3
  clinicalRecommendation: string;
}

export interface MissionPhaseInsight {
  progressPercent: number;
  phaseTitle: string;
  isThirdQuarterWindow: boolean;
  resilienceScore: number; // 0 - 100
  summary: string;
}

const POSITIVE_MARKERS = [
  // Spanish
  'bien',
  'calma',
  'tranquilo',
  'tranquila',
  'enfocado',
  'enfocada',
  'equipo',
  'logro',
  'ánimo',
  'animo',
  'descansé',
  'descanse',
  'energía',
  'energia',
  'motivado',
  'motivada',
  'familia',
  'estable',
  'resiliente',
  'agradecido',
  'agradecida',
  'claro',
  // English
  'good',
  'calm',
  'focused',
  'team',
  'crew',
  'success',
  'rested',
  'energy',
  'motivated',
  'family',
  'steady',
  'stable',
  'resilient',
  'grateful',
  'clear',
  'great',
  'solid',
];

const FATIGUE_MARKERS = [
  // Spanish
  'cansado',
  'cansada',
  'agotado',
  'agotada',
  'agotamiento',
  'insomnio',
  'sueño',
  'sueno',
  'pesado',
  'pesada',
  'fatiga',
  'desvelado',
  'desvelada',
  'lento',
  'lenta',
  'niebla',
  'ojos',
  'cefalea',
  // English
  'tired',
  'exhausted',
  'exhaustion',
  'insomnia',
  'sleepy',
  'heavy',
  'fatigue',
  'fatigued',
  'sluggish',
  'slow',
  'foggy',
  'headache',
  'drowsy',
  'drained',
];

const STRESS_MARKERS = [
  // Spanish
  'estrés',
  'estres',
  'ansiedad',
  'aislamiento',
  'encierro',
  'soledad',
  'tensión',
  'tension',
  'frustración',
  'frustracion',
  'nostalgia',
  'triste',
  'tristeza',
  'presión',
  'presion',
  'irritable',
  'desmotivación',
  'desmotivacion',
  'miedo',
  'preocupado',
  'preocupada',
  'conflicto',
  // English
  'stress',
  'stressed',
  'anxiety',
  'anxious',
  'isolated',
  'isolation',
  'confined',
  'confinement',
  'lonely',
  'loneliness',
  'frustrated',
  'frustration',
  'homesick',
  'sad',
  'pressure',
  'overwhelmed',
  'fear',
  'worried',
  'conflict',
];

export function evaluatePvtSession(
  trialsMs: number[],
  falseStarts: number,
  day: number,
  lang: Language = 'en'
): PvtSessionResult {
  const valid = trialsMs.length > 0 ? trialsMs : [320];
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const meanRtMs = Math.round(sum / valid.length);
  const fastestRtMs = Math.round(Math.min(...valid));
  const lapses = valid.filter((ms) => ms >= 500).length;

  // Baseline human PVT optimal mean is ~230-310 ms; penalties for >310 ms, lapses, and false starts.
  const rtPenalty = Math.max(0, (meanRtMs - 270) * 0.14);
  const lapsePenalty = lapses * 14;
  const falseStartPenalty = falseStarts * 7;
  const alertnessScore = Math.max(
    18,
    Math.min(100, Math.round(100 - rtPenalty - lapsePenalty - falseStartPenalty))
  );

  const rawStatus: PvtStatusLabel =
    alertnessScore >= 78 && lapses === 0
      ? 'Optimal'
      : alertnessScore >= 55 && lapses <= 1
        ? 'Mild Fatigue'
        : 'Circadian Alert';

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return {
    id: `pvt-${Date.now()}`,
    day,
    timestamp: lang === 'es' ? `Día ${day} · ${hh}:${mm} local` : `Day ${day} · ${hh}:${mm} local`,
    trialsMs: valid.map((v) => Math.round(v)),
    meanRtMs,
    fastestRtMs,
    lapses,
    falseStarts,
    alertnessScore,
    statusLabel: localizePvtStatus(rawStatus, lang),
  };
}

export function analyzeDiaryEntryLocally(params: {
  title: string;
  notes: string;
  mode: 'video' | 'texto';
  moodRating: number;
  sleepHours: number;
  stressLevel: number;
  durationSeconds?: number;
  voiceActiveRatio?: number; // 0..1 measured from AnalyserNode
  usedRealMic?: boolean;
  lang?: Language;
}): DiaryLexicalAnalysis {
  const lang = params.lang ?? 'en';
  const combined = `${params.title} ${params.notes}`.toLowerCase();
  const words = combined.split(/\s+/).filter(Boolean);

  let posHits = 0;
  let fatHits = 0;
  let stressHits = 0;

  for (const w of words) {
    const clean = w.replace(/[.,;:!?¿¡"()]/g, '');
    if (POSITIVE_MARKERS.some((m) => clean.includes(m))) posHits += 1;
    if (FATIGUE_MARKERS.some((m) => clean.includes(m))) fatHits += 1;
    if (STRESS_MARKERS.some((m) => clean.includes(m))) stressHits += 1;
  }

  const sleepThemeLabel =
    lang === 'es' ? 'Higiene Circadiana / Sueño' : 'Circadian Hygiene / Sleep';
  const earthThemeLabel =
    lang === 'es' ? 'Vínculo Terrestre / Nostalgia' : 'Earth Bond / Nostalgia';
  const crewThemeLabel = lang === 'es' ? 'Cohesión de Tripulación' : 'Crew Cohesion';
  const opsThemeLabel = lang === 'es' ? 'Carga Operativa' : 'Operational Workload';
  const posThemeLabel = lang === 'es' ? 'Regulación Positiva' : 'Positive Regulation';
  const fallbackThemeLabel = lang === 'es' ? 'Bitácora de Seguimiento' : 'Follow-up Log';

  const detectedThemes: string[] = [];
  if (
    combined.includes('sueñ') ||
    combined.includes('suen') ||
    combined.includes('dorm') ||
    combined.includes('insom') ||
    combined.includes('luz') ||
    combined.includes('sleep') ||
    combined.includes('nap') ||
    combined.includes('rest') ||
    combined.includes('light') ||
    combined.includes('circad') ||
    params.sleepHours < 6.5
  ) {
    detectedThemes.push(sleepThemeLabel);
  }
  if (
    combined.includes('famil') ||
    combined.includes('casa') ||
    combined.includes('tierra') ||
    combined.includes('nostalg') ||
    combined.includes('extrañ') ||
    combined.includes('home') ||
    combined.includes('earth') ||
    combined.includes('miss')
  ) {
    detectedThemes.push(earthThemeLabel);
  }
  if (
    combined.includes('equipo') ||
    combined.includes('tripul') ||
    combined.includes('compañ') ||
    combined.includes('cabina') ||
    combined.includes('crew') ||
    combined.includes('team') ||
    combined.includes('cabin')
  ) {
    detectedThemes.push(crewThemeLabel);
  }
  if (
    combined.includes('eva') ||
    combined.includes('caminata') ||
    combined.includes('spacewalk') ||
    combined.includes('turno') ||
    combined.includes('shift') ||
    combined.includes('maniobra') ||
    combined.includes('maneuver') ||
    combined.includes('rover')
  ) {
    detectedThemes.push(opsThemeLabel);
  }
  if (posHits > 0 && stressHits === 0) {
    detectedThemes.push(posThemeLabel);
  }
  if (detectedThemes.length === 0) {
    detectedThemes.push(fallbackThemeLabel);
  }

  const lexicalRaw = posHits - stressHits * 1.2 - fatHits * 0.8;
  const lexicalScore = Math.max(-3, Math.min(3, Math.round(lexicalRaw)));

  const compositeStress =
    params.stressLevel +
    stressHits * 1.1 +
    fatHits * 0.7 -
    posHits * 0.6 +
    (params.moodRating <= 5 ? 1.5 : 0);

  const rawStress: ConfinementStressLevel =
    compositeStress >= 7.5 || params.moodRating <= 4
      ? 'High'
      : compositeStress >= 5 || params.moodRating <= 6
        ? 'Moderate'
        : 'Low';
  const confinementStress = localizeStressLevel(rawStress, lang);

  let emotionalTone =
    lang === 'es' ? 'Equilibrio emocional positivo' : 'Positive emotional equilibrium';
  if (rawStress === 'High') {
    emotionalTone =
      stressHits > fatHits
        ? lang === 'es'
          ? 'Sobrecarga emocional / aislamiento detectado'
          : 'Emotional overload / isolation detected'
        : lang === 'es'
          ? 'Desgaste anímico y fatiga acumulada'
          : 'Mood wear and cumulative fatigue';
  } else if (rawStress === 'Moderate') {
    emotionalTone =
      fatHits > 0
        ? lang === 'es'
          ? 'Cansancio leve con alerta de descanso'
          : 'Mild fatigue with rest advisory'
        : lang === 'es'
          ? 'Oscilación anímica moderada (monitoreo activo)'
          : 'Moderate mood fluctuation (active monitoring)';
  } else if (posHits >= 2) {
    emotionalTone =
      lang === 'es'
        ? 'Resiliencia alta y enfoque operativo'
        : 'High resilience and operational focus';
  }

  let vocalFatigue = lang === 'es' ? 'N/A (Bitácora escrita)' : 'N/A (Written log)';
  if (params.mode === 'video') {
    const duration = params.durationSeconds ?? 0;
    const ratio = params.voiceActiveRatio;
    if (params.usedRealMic && typeof ratio === 'number' && duration >= 2) {
      const pct = Math.round(ratio * 100);
      if (ratio < 0.28 || params.sleepHours < 6) {
        vocalFatigue =
          lang === 'es'
            ? `Elevada · micro-pausas frecuentes (${pct}% voz activa, ${duration}s)`
            : `High · frequent micro-pauses (${pct}% active voice, ${duration}s)`;
      } else if (ratio < 0.48 || fatHits > 0) {
        vocalFatigue =
          lang === 'es'
            ? `Moderada · cadencia pausada (${pct}% voz activa, ${duration}s)`
            : `Moderate · slower cadence (${pct}% active voice, ${duration}s)`;
      } else {
        vocalFatigue =
          lang === 'es'
            ? `Baja · prosodia fluida (${pct}% voz activa, ${duration}s)`
            : `Low · fluid prosody (${pct}% active voice, ${duration}s)`;
      }
    } else if (duration >= 2) {
      vocalFatigue =
        params.sleepHours < 6.5 || fatHits > 0
          ? lang === 'es'
            ? `Moderada estimada en simulador (${duration}s)`
            : `Moderate estimated in simulator (${duration}s)`
          : lang === 'es'
            ? `Baja estimada en simulador (${duration}s)`
            : `Low estimated in simulator (${duration}s)`;
    } else {
      vocalFatigue =
        lang === 'es'
          ? 'Sin audio capturado (solo registro contextual)'
          : 'No audio captured (contextual log only)';
    }
  }

  let clinicalRecommendation =
    lang === 'es'
      ? 'Mantener rutina circadiana y registrar próximo check-in al cierre de turno.'
      : 'Maintain circadian routine and log next check-in at end of shift.';
  if (rawStress === 'High') {
    clinicalRecommendation =
      lang === 'es'
        ? 'Activar 4 ciclos de respiración 4-4-4-4, abrir "Mi Ancla en la Tierra" y priorizar envío prioritario a Psicología de Tierra.'
        : 'Run 4 cycles of 4-4-4-4 box breathing, open "My Earth Anchor", and prioritize downlink to Earth Psychology.';
  } else if (detectedThemes.includes(sleepThemeLabel)) {
    clinicalRecommendation =
      lang === 'es'
        ? 'Cambiar iluminación de cabina a Ámbar 1800K 60 min antes de dormir y completar un Test PVT al despertar.'
        : 'Switch cabin lighting to 1800K Amber 60 min before sleep and complete a PVT test on waking.';
  } else if (detectedThemes.includes(earthThemeLabel)) {
    clinicalRecommendation =
      lang === 'es'
        ? 'Reproducir paisaje sonoro familiar en "Mi Ancla en la Tierra" y programar mensaje asíncrono a familia.'
        : 'Play family soundscape in "My Earth Anchor" and schedule an async message to family.';
  }

  return {
    emotionalTone,
    vocalFatigue,
    confinementStress,
    detectedThemes: detectedThemes.slice(0, 3),
    lexicalScore,
    clinicalRecommendation,
  };
}

export function computeMissionPhaseInsight(params: {
  missionDay: number;
  mission: MissionType;
  moodScore: number;
  sleepHours: number;
  stressLevel: number;
  crewCohesion: number;
  latestPvtScore?: number;
  lang?: Language;
}): MissionPhaseInsight {
  const lang = params.lang ?? 'en';
  const progressPercent = Math.min(
    100,
    Math.max(1, Math.round((params.missionDay / Math.max(1, params.mission.durationDays)) * 100))
  );
  const isThirdQuarterWindow = progressPercent >= 50 && progressPercent <= 78;

  const phaseTitle =
    progressPercent < 25
      ? lang === 'es'
        ? 'Fase 1 · Adaptación Orbital / Cabina'
        : 'Phase 1 · Orbital / Cabin Adaptation'
      : progressPercent < 50
        ? lang === 'es'
          ? 'Fase 2 · Ritmo Operativo Estable'
          : 'Phase 2 · Steady Operational Rhythm'
        : progressPercent <= 78
          ? lang === 'es'
            ? 'Fase 3 · Ventana "Tercer Cuarto de Misión"'
            : 'Phase 3 · "Third-Quarter" Mission Window'
          : lang === 'es'
            ? 'Fase 4 · Preparación de Retorno'
            : 'Phase 4 · Return Preparation';

  const sleepScore = Math.min(100, Math.max(0, (params.sleepHours / 8) * 100));
  const moodPct = params.moodScore * 10;
  const cohesionPct = params.crewCohesion * 10;
  const calmPct = (11 - params.stressLevel) * 10;
  const baseComposite = moodPct * 0.3 + sleepScore * 0.3 + calmPct * 0.25 + cohesionPct * 0.15;

  const resilienceScore = Math.round(
    typeof params.latestPvtScore === 'number'
      ? baseComposite * 0.8 + params.latestPvtScore * 0.2
      : baseComposite
  );

  let summary =
    lang === 'es'
      ? 'Equilibrio neuroconductual estable. Mantén anclaje circadiano y pausas activas.'
      : 'Stable neurobehavioral equilibrium. Maintain circadian anchoring and active breaks.';
  if (isThirdQuarterWindow && resilienceScore < 72) {
    summary =
      lang === 'es'
        ? 'Mitad avanzada de misión con señales de desgaste acumulativo; refuerza cohesión y conexión terrestre.'
        : 'Late mission mid-point showing cumulative wear signs; reinforce crew cohesion and Earth connection.';
  } else if (isThirdQuarterWindow) {
    summary =
      lang === 'es'
        ? 'En ventana de tercer cuarto de misión: buen control actual, se recomienda sostener rituales semanales.'
        : 'Inside Third-Quarter window: strong current baseline; sustain weekly resilience rituals.';
  } else if (resilienceScore < 65) {
    summary =
      lang === 'es'
        ? 'Carga de estrés o déficit de sueño reduce la reserva cognitiva; prioriza descanso protegido.'
        : 'Elevated stress or sleep deficit is lowering cognitive reserve; prioritize protected rest.';
  }

  return {
    progressPercent,
    phaseTitle,
    isThirdQuarterWindow,
    resilienceScore: Math.max(15, Math.min(100, resilienceScore)),
    summary,
  };
}
