import { MissionType } from '@/data/missionsData';

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
  statusLabel: 'Óptima' | 'Fatiga Leve' | 'Alerta Circadiana';
}

export interface DiaryLexicalAnalysis {
  emotionalTone: string;
  vocalFatigue: string;
  confinementStress: 'Bajo' | 'Moderado' | 'Elevado';
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
];

const FATIGUE_MARKERS = [
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
];

const STRESS_MARKERS = [
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
];

export function evaluatePvtSession(
  trialsMs: number[],
  falseStarts: number,
  day: number
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

  const statusLabel: PvtSessionResult['statusLabel'] =
    alertnessScore >= 78 && lapses === 0
      ? 'Óptima'
      : alertnessScore >= 55 && lapses <= 1
        ? 'Fatiga Leve'
        : 'Alerta Circadiana';

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return {
    id: `pvt-${Date.now()}`,
    day,
    timestamp: `Día ${day} · ${hh}:${mm} local`,
    trialsMs: valid.map((v) => Math.round(v)),
    meanRtMs,
    fastestRtMs,
    lapses,
    falseStarts,
    alertnessScore,
    statusLabel,
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
}): DiaryLexicalAnalysis {
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

  const detectedThemes: string[] = [];
  if (
    combined.includes('sueñ') ||
    combined.includes('suen') ||
    combined.includes('dorm') ||
    combined.includes('insom') ||
    combined.includes('luz') ||
    params.sleepHours < 6.5
  ) {
    detectedThemes.push('Higiene Circadiana / Sueño');
  }
  if (
    combined.includes('famil') ||
    combined.includes('casa') ||
    combined.includes('tierra') ||
    combined.includes('nostalg') ||
    combined.includes('extrañ')
  ) {
    detectedThemes.push('Vínculo Terrestre / Nostalgia');
  }
  if (
    combined.includes('equipo') ||
    combined.includes('tripul') ||
    combined.includes('compañ') ||
    combined.includes('cabina')
  ) {
    detectedThemes.push('Cohesión de Tripulación');
  }
  if (
    combined.includes('eva') ||
    combined.includes('caminata') ||
    combined.includes('turno') ||
    combined.includes('maniobra') ||
    combined.includes('rover')
  ) {
    detectedThemes.push('Carga Operativa');
  }
  if (posHits > 0 && stressHits === 0) {
    detectedThemes.push('Regulación Positiva');
  }
  if (detectedThemes.length === 0) {
    detectedThemes.push('Bitácora de Seguimiento');
  }

  const lexicalRaw = posHits - stressHits * 1.2 - fatHits * 0.8;
  const lexicalScore = Math.max(-3, Math.min(3, Math.round(lexicalRaw)));

  const compositeStress =
    params.stressLevel + stressHits * 1.1 + fatHits * 0.7 - posHits * 0.6 + (params.moodRating <= 5 ? 1.5 : 0);

  const confinementStress: 'Bajo' | 'Moderado' | 'Elevado' =
    compositeStress >= 7.5 || params.moodRating <= 4
      ? 'Elevado'
      : compositeStress >= 5 || params.moodRating <= 6
        ? 'Moderado'
        : 'Bajo';

  let emotionalTone = 'Equilibrio emocional positivo';
  if (confinementStress === 'Elevado') {
    emotionalTone =
      stressHits > fatHits
        ? 'Sobrecarga emocional / aislamiento detectado'
        : 'Desgaste anímico y fatiga acumulada';
  } else if (confinementStress === 'Moderado') {
    emotionalTone =
      fatHits > 0
        ? 'Cansancio leve con alerta de descanso'
        : 'Oscilación anímica moderada (monitoreo activo)';
  } else if (posHits >= 2) {
    emotionalTone = 'Resiliencia alta y enfoque operativo';
  }

  let vocalFatigue = 'N/A (Bitácora escrita)';
  if (params.mode === 'video') {
    const duration = params.durationSeconds ?? 0;
    const ratio = params.voiceActiveRatio;
    if (params.usedRealMic && typeof ratio === 'number' && duration >= 2) {
      const pct = Math.round(ratio * 100);
      if (ratio < 0.28 || params.sleepHours < 6) {
        vocalFatigue = `Elevada · micro-pausas frecuentes (${pct}% voz activa, ${duration}s)`;
      } else if (ratio < 0.48 || fatHits > 0) {
        vocalFatigue = `Moderada · cadencia pausada (${pct}% voz activa, ${duration}s)`;
      } else {
        vocalFatigue = `Baja · prosodia fluida (${pct}% voz activa, ${duration}s)`;
      }
    } else if (duration >= 2) {
      vocalFatigue =
        params.sleepHours < 6.5 || fatHits > 0
          ? `Moderada estimada en simulador (${duration}s)`
          : `Baja estimada en simulador (${duration}s)`;
    } else {
      vocalFatigue = 'Sin audio capturado (solo registro contextual)';
    }
  }

  let clinicalRecommendation =
    'Mantener rutina circadiana y registrar próximo check-in al cierre de turno.';
  if (confinementStress === 'Elevado') {
    clinicalRecommendation =
      'Activar 4 ciclos de respiración 4-4-4-4, abrir "Mi Ancla en la Tierra" y priorizar envío prioritario a Psicología de Tierra.';
  } else if (detectedThemes.includes('Higiene Circadiana / Sueño')) {
    clinicalRecommendation =
      'Cambiar iluminación de cabina a Ámbar 1800K 60 min antes de dormir y completar un Test PVT al despertar.';
  } else if (detectedThemes.includes('Vínculo Terrestre / Nostalgia')) {
    clinicalRecommendation =
      'Reproducir paisaje sonoro familiar en "Mi Ancla en la Tierra" y programar mensaje asíncrono a familia.';
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
}): MissionPhaseInsight {
  const progressPercent = Math.min(
    100,
    Math.max(1, Math.round((params.missionDay / Math.max(1, params.mission.durationDays)) * 100))
  );
  const isThirdQuarterWindow = progressPercent >= 50 && progressPercent <= 78;

  const phaseTitle =
    progressPercent < 25
      ? 'Fase 1 · Adaptación Orbital / Cabina'
      : progressPercent < 50
        ? 'Fase 2 · Ritmo Operativo Estable'
        : progressPercent <= 78
          ? 'Fase 3 · Ventana "Tercer Cuarto de Misión"'
          : 'Fase 4 · Preparación de Retorno';

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
    'Equilibrio neuroconductual estable. Mantén anclaje circadiano y pausas activas.';
  if (isThirdQuarterWindow && resilienceScore < 72) {
    summary =
      'Mitad avanzada de misión con señales de desgaste acumulativo; refuerza cohesión y conexión terrestre.';
  } else if (isThirdQuarterWindow) {
    summary =
      'En ventana de tercer cuarto de misión: buen control actual, se recomienda sostener rituales semanales.';
  } else if (resilienceScore < 65) {
    summary =
      'Carga de estrés o déficit de sueño reduce la reserva cognitiva; prioriza descanso protegido.';
  }

  return {
    progressPercent,
    phaseTitle,
    isThirdQuarterWindow,
    resilienceScore: Math.max(15, Math.min(100, resilienceScore)),
    summary,
  };
}
