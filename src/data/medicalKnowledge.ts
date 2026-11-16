import { Language } from '@/i18n/types';

export type TriageLevel = 'nominal' | 'warning' | 'critical';

export type BodySystemId =
  | 'brain'
  | 'cardiovascular'
  | 'immune'
  | 'metabolic'
  | 'musculoskeletal';

export interface BodySystemGuide {
  id: BodySystemId;
  title: string;
  shortLabel: string;
  linkedTab: 'psychology' | 'sensors' | 'survival' | 'musculoskeletal';
  whySpaceAffectsIt: string;
  nominalSummary: string;
  warningAction: string;
  criticalAction: string;
}

export const BODY_SYSTEM_GUIDES_EN: Record<BodySystemId, BodySystemGuide> = {
  brain: {
    id: 'brain',
    title: 'Brain, Sleep & Mental Health',
    shortLabel: 'Brain & Mind',
    linkedTab: 'psychology',
    whySpaceAffectsIt:
      'Isolation, confinement, circadian disruption, and cephalad fluid shift (SANS syndrome) impact mood, rest quality, and cognitive sharpness.',
    nominalSummary:
      'Stable circadian rhythm, restorative rest, and psychological resilience within expected operational baselines.',
    warningAction:
      'Complete 2 minutes of guided box breathing, adjust cabin lighting, and open your Inspiration Wall ("My Earth Anchor").',
    criticalAction:
      'Activate emotional decompression protocol: record a Video-Diary entry for Earth flight psychologists and prioritize a protected rest block.',
  },
  cardiovascular: {
    id: 'cardiovascular',
    title: 'Cardiovascular System & Oxygenation',
    shortLabel: 'Heart & O₂',
    linkedTab: 'sensors',
    whySpaceAffectsIt:
      'In microgravity the heart works less against gravity and loses plasma volume; in habitats and rovers, lunar dust or CO₂ buildup can compromise oxygen saturation (SpO₂%).',
    nominalSummary:
      'Heart rate, blood pressure, and oxygen saturation SpO₂% remain aligned with your pre-flight terrestrial medical baseline.',
    warningAction:
      'Hydrate with electrolytes (500 ml), check cabin ventilation/CO₂ levels, and repeat oximeter scan in 15 minutes.',
    criticalAction:
      'Halt physical exertion immediately, deploy cabin supplemental oxygen, and transmit an urgent packet to the flight surgeon.',
  },
  immune: {
    id: 'immune',
    title: 'Immune System & Blood',
    shortLabel: 'Blood & Defenses',
    linkedTab: 'survival',
    whySpaceAffectsIt:
      'Cosmic radiation (mSv), microgravity, and stress cortisol alter white blood cell (leukocyte) distribution and can reactivate latent viruses.',
    nominalSummary:
      'Leukocyte count and cumulative radiation exposure remain inside the safe threshold for your clinical history.',
    warningAction:
      'Reinforce closed-cabin hygiene, prioritize 7.5+ hours of sleep, take antioxidant supplementation, and avoid unnecessary time outside shielded modules.',
    criticalAction:
      'Activate partial preventive crew isolation, shelter in the highest radiation-shielded module, and run hematology monitoring every 12h.',
  },
  metabolic: {
    id: 'metabolic',
    title: 'Metabolism, Nutrition & Glucose',
    shortLabel: 'Glucose & Energy',
    linkedTab: 'survival',
    whySpaceAffectsIt:
      'Microgravity induces temporary insulin resistance, while high-expenditure EVA operations can cause sharp drops in blood glucose (hypoglycemia).',
    nominalSummary:
      'Capillary blood glucose (mg/dL) aligned with your pre-flight resting metabolic baseline.',
    warningAction:
      'If low (<75 mg/dL), consume gel or freeze-dried fruit (15g fast carbs). If high (>135 mg/dL), hydrate and perform 15 min of light cycling.',
    criticalAction:
      'Suspend Rover driving or EVA operations immediately; correct severe hypoglycemia with emergency glucose ration and re-test after 15 minutes.',
  },
  musculoskeletal: {
    id: 'musculoskeletal',
    title: 'Bone Density, Muscles & Joints',
    shortLabel: 'Bones & Muscle',
    linkedTab: 'musculoskeletal',
    whySpaceAffectsIt:
      'Without constant 1g Earth loading, astronauts can lose 1% to 1.5% bone mineral density per month alongside postural muscle atrophy and stress on previously operated joints.',
    nominalSummary:
      'Optimal adherence to bone/muscle loading sessions while respecting prior surgery joint adaptations.',
    warningAction:
      'Complete today’s adapted resistance session and confirm Vitamin D (800 IU) and Calcium (1,000 mg) intake.',
    criticalAction:
      'Projected loss exceeds safe limit or acute joint pain present: switch to isometric unloading protocol and notify the rehabilitation medical team.',
  },
};

export const BODY_SYSTEM_GUIDES_ES: Record<BodySystemId, BodySystemGuide> = {
  brain: {
    id: 'brain',
    title: 'Cerebro, Sueño y Salud Mental',
    shortLabel: 'Cerebro y Mente',
    linkedTab: 'psychology',
    whySpaceAffectsIt:
      'El aislamiento, el confinamiento, la disrupción circadiana y el desplazamiento de fluidos hacia el cráneo (síndrome SANS) impactan el ánimo, el descanso y la agudeza cognitiva.',
    nominalSummary:
      'Ritmo circadiano estable, descanso reparador y resiliencia psicológica dentro de parámetros esperados.',
    warningAction:
      'Realiza 2 minutos de respiración guiada, ajusta la iluminación de cabina y abre tu Muro de Inspiración ("Mi Ancla en la Tierra").',
    criticalAction:
      'Activa el protocolo de descarga emocional: registra un Video-Diario para los psicólogos de vuelo en Tierra y prioriza un bloque de descanso protegido.',
  },
  cardiovascular: {
    id: 'cardiovascular',
    title: 'Sistema Cardiovascular y Oxigenación',
    shortLabel: 'Corazón y O₂',
    linkedTab: 'sensors',
    whySpaceAffectsIt:
      'En microgravedad el corazón trabaja menos contra la gravedad y pierde volumen plasmático; en hábitats y rovers el polvo lunar o el CO₂ pueden comprometer la saturación de oxígeno (SpO₂%).',
    nominalSummary:
      'Frecuencia cardíaca, presión arterial y saturación de oxígeno SpO₂% en equilibrio con la línea base terrestre del expediente.',
    warningAction:
      'Hidratación con electrolitos (500 ml), verifica la ventilación/CO₂ de la cabina y repite el escaneo con el oxímetro en 15 minutos.',
    criticalAction:
      'Detén esfuerzo físico de inmediato, usa oxígeno suplementario de cabina y transmite paquete urgente al cirujano de vuelo.',
  },
  immune: {
    id: 'immune',
    title: 'Sistema Inmunitario y Sangre',
    shortLabel: 'Sangre y Defensas',
    linkedTab: 'survival',
    whySpaceAffectsIt:
      'La radiación cósmica (mSv), la microgravedad y el cortisol por estrés alteran la distribución de glóbulos blancos (leucocitos) y pueden reactivar virus latentes.',
    nominalSummary:
      'Conteo leucocitario y carga de radiación acumulada dentro del corredor seguro para tu historial clínico.',
    warningAction:
      'Refuerza higiene en cabina cerrada, prioriza 7.5+ horas de sueño, toma suplementación antioxidante y evita exposición innecesaria fuera del módulo blindado.',
    criticalAction:
      'Activa aislamiento preventivo parcial de tripulación, refúgiate en zona de mayor blindaje contra radiación e inicia monitoreo hematológico cada 12h.',
  },
  metabolic: {
    id: 'metabolic',
    title: 'Metabolismo, Nutrición y Glucosa',
    shortLabel: 'Glucosa y Energía',
    linkedTab: 'survival',
    whySpaceAffectsIt:
      'La microgravedad induce resistencia temporal a la insulina y, al mismo tiempo, las operaciones EVA de alto desgaste pueden provocar caídas bruscas de glucosa (hipoglucemia).',
    nominalSummary:
      'Glucemia capilar (mg/dL) alineada con el metabolismo basal previo al vuelo.',
    warningAction:
      'Si está baja (<75 mg/dL), ingiere gel o fruta liofilizada (15g carbohidratos rápidos). Si está alta (>135 mg/dL), hidrátate y realiza 15 min de ciclismo ligero.',
    criticalAction:
      'Suspende conducción de Rover o EVA al instante; corrige hipoglucemia severa con ración de emergencia y valida lectura a los 15 minutos.',
  },
  musculoskeletal: {
    id: 'musculoskeletal',
    title: 'Densidad Ósea, Músculos y Articulaciones',
    shortLabel: 'Huesos y Músculo',
    linkedTab: 'musculoskeletal',
    whySpaceAffectsIt:
      'Sin la carga constante de 1g terrestre, los astronautas pueden perder entre 1% y 1.5% de densidad mineral ósea al mes y masa muscular postural, además de sobrecargar articulaciones con cirugías previas.',
    nominalSummary:
      'Adherencia óptima a las sesiones de carga ósea/muscular respetando las adaptaciones por cirugías previas.',
    warningAction:
      'Completa la sesión adaptada de resistencia del día y verifica tu ingesta de Vitamina D (800 UI) y Calcio (1000 mg).',
    criticalAction:
      'Pérdida proyectada superior al límite seguro o dolor articular agudo: cambia a protocolo isométrico de descarga y notifica al equipo médico de rehabilitación.',
  },
};

export const BODY_SYSTEM_GUIDES = BODY_SYSTEM_GUIDES_EN;

export function getBodySystemGuides(lang: Language): Record<BodySystemId, BodySystemGuide> {
  return lang === 'es' ? BODY_SYSTEM_GUIDES_ES : BODY_SYSTEM_GUIDES_EN;
}

export interface InspirationItemPreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'Family' | 'Earth' | 'Voice Message' | 'Familia' | 'Tierra' | 'Mensaje de Voz';
  durationOrDate: string;
  quote: string;
  palette: 'cyan' | 'emerald' | 'amber' | 'rose';
  soundId: 'rain' | 'ocean' | 'forest' | 'heartbeat';
  soundLabel: string;
  audioUrl?: string;
}

export const DEFAULT_INSPIRATION_ITEMS_EN: InspirationItemPreset[] = [
  {
    id: 'insp-1',
    title: 'Breakfast at Home — Family Message',
    subtitle: 'AI-synthesized English family audio (Google Gemini / Lyria, Nov 2026)',
    category: 'Family',
    durationOrDate: 'AI Audio (Gemini Lyria) · ~90 s · Offline',
    quote: '"Every night we step into the yard and look up at the sky. We are with you on every orbit!"',
    palette: 'amber',
    soundId: 'forest',
    soundLabel: 'Play: Breakfast at Home',
    audioUrl: '/audio/video_familiar.mp3',
  },
  {
    id: 'insp-2',
    title: 'Rain Over the South Pacific',
    subtitle: 'High-definition Earth soundscape and bioacoustic rain audio',
    category: 'Earth',
    durationOrDate: 'Relaxing loop · Cortisol reduction',
    quote: 'The sound of rainfall and ocean waves lowers heart rate inside sealed spacecraft cabins.',
    palette: 'cyan',
    soundId: 'rain',
    soundLabel: 'Audio: Earth Rainfall',
  },
  {
    id: 'insp-3',
    title: 'Sunset Waves Along the Coast',
    subtitle: 'Visual Earth anchor designed for Third-Quarter mission windows',
    category: 'Earth',
    durationOrDate: 'Immersive loop · Circadian therapy',
    quote: 'Recalling open terrestrial horizons mitigates psychological fatigue during prolonged confinement.',
    palette: 'emerald',
    soundId: 'ocean',
    soundLabel: 'Audio: Ocean Waves',
  },
  {
    id: 'insp-4',
    title: 'Bridge Back Home (Voice Letter)',
    subtitle: 'AI-synthesized encouragement piece (Google Gemini / Lyria 3, 60 BPM)',
    category: 'Voice Message',
    durationOrDate: 'AI Audio (Gemini Lyria 3) · 60 BPM · Offline',
    quote: '"Your daily medical discipline is the safe bridge bringing you home."',
    palette: 'rose',
    soundId: 'heartbeat',
    soundLabel: 'Play: Bridge Back Home',
    audioUrl: '/audio/carta_de_voz.mp3',
  },
];

export const DEFAULT_INSPIRATION_ITEMS_ES: InspirationItemPreset[] = [
  {
    id: 'insp-1',
    title: 'Breakfast at Home — Mensaje Familiar',
    subtitle: 'Audio en inglés sintetizado con IA (Google Gemini / Lyria, nov. 2026)',
    category: 'Familia',
    durationOrDate: 'Audio IA (Gemini Lyria) · ~90 s · Offline',
    quote: '"Cada noche salimos al jardín a mirar hacia arriba. ¡Estamos contigo en cada órbita!"',
    palette: 'amber',
    soundId: 'forest',
    soundLabel: 'Reproducir: Breakfast at Home',
    audioUrl: '/audio/video_familiar.mp3',
  },
  {
    id: 'insp-2',
    title: 'Lluvia sobre el Pacífico Sur',
    subtitle: 'Paisaje terrestre de alta definición y audio bioacústico',
    category: 'Tierra',
    durationOrDate: 'Bucle relajante · Reducción de cortisol',
    quote: 'El sonido de lluvia y olas reduce la frecuencia cardíaca en entornos de cabina sellada.',
    palette: 'cyan',
    soundId: 'rain',
    soundLabel: 'Audio: Lluvia terrestre',
  },
  {
    id: 'insp-3',
    title: 'Olas al Atardecer en la Costa',
    subtitle: 'Ancla visual de la Tierra para fases de tercer cuarto de misión',
    category: 'Tierra',
    durationOrDate: 'Bucle inmersivo · Terapia circadiana',
    quote: 'Recordar horizontes abiertos mitiga la fatiga espacial por confinamiento prolongado.',
    palette: 'emerald',
    soundId: 'ocean',
    soundLabel: 'Audio: Olas del océano',
  },
  {
    id: 'insp-4',
    title: 'Bridge Back Home (Carta de Voz)',
    subtitle: 'Pieza de aliento sintetizada con IA (Google Gemini / Lyria 3, 60 BPM)',
    category: 'Mensaje de Voz',
    durationOrDate: 'Audio IA (Gemini Lyria 3) · 60 BPM · Offline',
    quote: '"Tu disciplina médica diaria es el puente seguro de regreso a casa."',
    palette: 'rose',
    soundId: 'heartbeat',
    soundLabel: 'Reproducir: Bridge Back Home',
    audioUrl: '/audio/carta_de_voz.mp3',
  },
];

export const DEFAULT_INSPIRATION_ITEMS = DEFAULT_INSPIRATION_ITEMS_EN;

export function getDefaultInspirationItems(lang: Language): InspirationItemPreset[] {
  return lang === 'es' ? DEFAULT_INSPIRATION_ITEMS_ES : DEFAULT_INSPIRATION_ITEMS_EN;
}

export const MEDICAL_TOOLTIPS_EN = {
  glucose: {
    why: 'In space, metabolic shifts and flight stress raise insulin resistance; during intense EVAs, high caloric burn can plummet blood glucose and impair decision-making.',
    how: 'Maintain fasting/pre-EVA levels between 75 and 125 mg/dL. Adjust snacks and hydration.',
  },
  radiation: {
    why: 'Outside Earth’s protective atmosphere, cosmic rays and solar storms damage cellular DNA and suppress immune defenses (measured in millisieverts, mSv).',
    how: 'Monitor cumulative dose and shelter inside the highest-shielded core (water/polyethylene walls) during solar alerts.',
  },
  immune: {
    why: 'Up to 50% of astronauts on long-duration missions experience immune dysregulation driven by elevated cortisol, confinement, and radiation exposure.',
    how: 'Cross-reference white blood cell counts (cells/µL) with pre-launch clinical predispositions.',
  },
  boneMuscle: {
    why: 'Microgravity (0g) or partial gravity reduces mechanical loading on bones and muscles, accelerating demineralization.',
    how: 'Complete daily resistive workouts adapted to prior injuries and supplement Vitamin D + Calcium.',
  },
};

export const MEDICAL_TOOLTIPS_ES = {
  glucose: {
    why: 'En el espacio, los cambios metabólicos y el estrés elevan la resistencia a la insulina; durante caminatas espaciales el gasto calórico puede desplomar la glucosa y nublar la toma de decisiones.',
    how: 'Mantener entre 75 y 125 mg/dL en ayunas/pre-EVA. Ajustar colaciones y rehidratación.',
  },
  radiation: {
    why: 'Fuera de la atmósfera protectora de la Tierra, los rayos cósmicos y tormentas solares dañan el ADN celular y deprimen las defensas inmunes (medido en milisieverts, mSv).',
    how: 'Vigilar dosis acumulada y acudir al refugio con mayor blindaje (agua/polietileno) en alertas solares.',
  },
  immune: {
    why: 'El 50% de los astronautas en misiones largas experimentan alteraciones inmunológicas por cortisol elevado, confinamiento y radiación.',
    how: 'Cruzar el conteo de leucocitos (células/µL) con la predisposición clínica previa al despegue.',
  },
  boneMuscle: {
    why: 'La ausencia de gravedad (0g) o gravedad parcial reduce el estímulo mecánico sobre huesos y músculos, provocando descalcificación acelerada.',
    how: 'Cumplir ejercicio resistivo adaptado a lesiones previas y suplementar Vitamina D + Calcio.',
  },
};

export const MEDICAL_TOOLTIPS = MEDICAL_TOOLTIPS_EN;

export function getMedicalTooltips(lang: Language) {
  return lang === 'es' ? MEDICAL_TOOLTIPS_ES : MEDICAL_TOOLTIPS_EN;
}
