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

export const BODY_SYSTEM_GUIDES: Record<BodySystemId, BodySystemGuide> = {
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

export interface InspirationItemPreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'Familia' | 'Tierra' | 'Mensaje de Voz';
  durationOrDate: string;
  quote: string;
  palette: 'cyan' | 'emerald' | 'amber' | 'rose';
  soundId: 'rain' | 'ocean' | 'forest' | 'heartbeat';
  soundLabel: string;
}

export const DEFAULT_INSPIRATION_ITEMS: InspirationItemPreset[] = [
  {
    id: 'insp-1',
    title: 'Desayuno en Casa — Video Familiar',
    subtitle: 'Mensaje grabado antes del lanzamiento por tu familia',
    category: 'Familia',
    durationOrDate: '01:45 min · Guardado offline',
    quote: '"Cada noche salimos al jardín a mirar hacia arriba. ¡Estamos contigo en cada órbita!"',
    palette: 'amber',
    soundId: 'forest',
    soundLabel: 'Audio: Mañana en el bosque',
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
    title: 'Carta de Voz — Equipo de Tierra y Amigos',
    subtitle: 'Compilación de aliento para días de alta carga operativa',
    category: 'Mensaje de Voz',
    durationOrDate: '02:10 min · Sincronizado',
    quote: '"Tu disciplina médica diaria es el puente seguro de regreso a casa."',
    palette: 'rose',
    soundId: 'heartbeat',
    soundLabel: 'Audio: Pulso calmante 60 bpm',
  },
];

export const MEDICAL_TOOLTIPS = {
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
