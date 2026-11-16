import { Language } from '@/i18n/types';

export type MissionId =
  | 'deep-space-transit'
  | 'planetary-habitat'
  | 'space-station'
  | 'surface-rover';

export type RadiationRiskLevel =
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Extreme'
  | 'Bajo'
  | 'Moderado'
  | 'Alto'
  | 'Extremo';

export type ExerciseFrequency = 'Daily' | 'Weekly' | 'Diaria' | 'Semanal';
export type JointLoadLevel =
  | 'Low impact'
  | 'Moderate impact'
  | 'High impact'
  | 'Bajo impacto'
  | 'Impacto moderado'
  | 'Alto impacto';

export function isDailyFrequency(freq: string): boolean {
  return freq === 'Daily' || freq === 'Diaria';
}

export function isHighImpactLoad(load: string): boolean {
  return load === 'High impact' || load === 'Alto impacto';
}

export function isExtremeRadiation(level: string): boolean {
  return level === 'Extreme' || level === 'Extremo';
}

export function isHighRadiation(level: string): boolean {
  return level === 'High' || level === 'Alto';
}

export interface MissionExercisePreset {
  id: string;
  name: string;
  machine: string;
  durationMin: number;
  frequency: ExerciseFrequency;
  targetSystem: string;
  jointLoad: JointLoadLevel;
  affectedJoints: ('rodilla' | 'hombro' | 'columna' | 'knee' | 'shoulder' | 'spine')[];
  alternativeName?: string;
  alternativeDescription?: string;
}

export interface MissionType {
  id: MissionId;
  name: string;
  shortName: string;
  subtitle: string;
  gravityLabel: string;
  gravityG: number;
  commDelay: string;
  commDelayMinutes: number;
  radiationRiskLevel: RadiationRiskLevel;
  dailyRadiationRateMsv: number;
  missionLimitMsv: number;
  warningLimitMsv: number;
  durationDays: number;
  cabinEnvironment: string;
  primaryHazards: string[];
  whatChangesMedically: string[];
  medicalPriorities: string[];
  recommendedScans: {
    id: string;
    title: string;
    deviceId: 'glucometer' | 'hematology' | 'vitals_cuff' | 'dosimeter' | 'ultrasound';
    manualFallbackTitle: string;
    reason: string;
    points: number;
  }[];
  defaultExercises: MissionExercisePreset[];
}

export const MISSIONS_DATA_EN: MissionType[] = [
  {
    id: 'deep-space-transit',
    name: 'Deep Space Transit Spacecraft',
    shortName: 'Deep Space Transit',
    subtitle: 'Bound for the Moon (Artemis) or Interplanetary Transit to Mars',
    gravityLabel: '0g Microgravity',
    gravityG: 0,
    commDelay: '12 to 20 min one-way',
    commDelayMinutes: 16,
    radiationRiskLevel: 'Extreme',
    dailyRadiationRateMsv: 1.85,
    warningLimitMsv: 110,
    missionLimitMsv: 180,
    durationDays: 180,
    cabinEnvironment: 'Sealed cabin outside Earth’s magnetosphere',
    primaryHazards: [
      'Galactic cosmic radiation and solar particle events',
      'Distance from Earth (full autonomous medical care required)',
      'Prolonged isolation and confinement in a narrow cabin',
      '0g microgravity (cephalad fluid shift)',
    ],
    whatChangesMedically: [
      'Loss of magnetosphere shielding multiplies daily ionizing radiation dose (mSv).',
      'Communication delay prevents real-time telemedicine: the system guides autonomous decisions.',
      'Fluid shift toward the cranium elevates Spaceflight Associated Neuro-ocular Syndrome (SANS) risk.',
    ],
    medicalPriorities: [
      'Continuous dosimetry and early solar storm warnings',
      'Cross-referenced immune evaluation under radiation stress',
      'Extreme confinement psychology and asynchronous Video-Diary',
      'Daily resistance training to counteract 0g',
    ],
    recommendedScans: [
      {
        id: 'scan-rad-transit',
        title: 'CSA Dosimeter Reading (Cumulative radiation)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Manual log of radiation shielding and acute fatigue symptoms',
        reason: 'Outside the magnetosphere it is critical to watch for solar particle spikes.',
        points: 35,
      },
      {
        id: 'scan-blood-transit',
        title: 'Hematology & Immune Panel (Leukocytes)',
        deviceId: 'hematology',
        manualFallbackTitle: 'Manual lymph node, mucosal, and oral temperature self-exam',
        reason: 'Space radiation and flight stress can reactivate latent viruses.',
        points: 30,
      },
      {
        id: 'scan-ultra-transit',
        title: 'Ocular / Carotid Ultrasound (SANS Check)',
        deviceId: 'ultrasound',
        manualFallbackTitle: 'Visual acuity check and subjective cranial pressure assessment',
        reason: 'Monitors cranial fluid pressure shift in 0g microgravity.',
        points: 30,
      },
      {
        id: 'scan-gluc-transit',
        title: 'Baseline Capillary Glucose Scan',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Self-check for tremor, energy dip, and post-meal appetite',
        reason: 'Microgravity alters insulin sensitivity over prolonged transit.',
        points: 25,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-ared-transit',
        name: 'ARED Vacuum Resistance (Squats & Deadlifts)',
        machine: 'ARED (Advanced Resistive)',
        durationMin: 45,
        frequency: 'Daily',
        targetSystem: 'Hip and femoral bone mineral density',
        jointLoad: 'High impact',
        affectedJoints: ['rodilla', 'columna', 'knee', 'spine'],
        alternativeName: 'Short-Range Adapted ARED + Isometric Leg Press',
        alternativeDescription:
          'Limits knee flexion to 45° and substitutes high axial load with safe isometric contractions.',
      },
      {
        id: 'ex-cevis-transit',
        name: 'CEVIS Cardiovascular Cycling (Intervals)',
        machine: 'CEVIS Cycle Ergometer',
        durationMin: 35,
        frequency: 'Daily',
        targetSystem: 'Aerobic capacity and venous return',
        jointLoad: 'Low impact',
        affectedJoints: [],
      },
      {
        id: 'ex-core-transit',
        name: 'Postural Stabilization & Thoracic Resistance Band',
        machine: '0g Traction Bands',
        durationMin: 25,
        frequency: 'Weekly',
        targetSystem: 'Paraspinal muscles and shoulder girdle',
        jointLoad: 'Moderate impact',
        affectedJoints: ['hombro', 'columna', 'shoulder', 'spine'],
        alternativeName: 'Isometric Scapular Pull without Overhead Elevation',
        alternativeDescription:
          'Prevents forced rotator cuff rotation by keeping elbows below shoulder level.',
      },
    ],
  },
  {
    id: 'planetary-habitat',
    name: 'Planetary or Lunar Habitat',
    shortName: 'Surface Habitat',
    subtitle: 'Pressurized Base on the Moon (0.16g) or Mars (0.38g)',
    gravityLabel: '0.16g Lunar / 0.38g Martian',
    gravityG: 0.38,
    commDelay: '3 s (Moon) to 14 min (Mars)',
    commDelayMinutes: 8,
    radiationRiskLevel: 'High',
    dailyRadiationRateMsv: 1.15,
    warningLimitMsv: 95,
    missionLimitMsv: 150,
    durationDays: 120,
    cabinEnvironment: 'Habitat dome with EVA airlocks and regolith exposure',
    primaryHazards: [
      'Enclosed environment with abrasive fine dust (lunar/Martian regolith)',
      'Physical exhaustion from extravehicular activities (EVA) in pressurized suits',
      'Cumulative surface radiation without a dense magnetic field',
      'Long-duration isolation with a small crew',
    ],
    whatChangesMedically: [
      'Increases SpO2% oxygenation monitoring priority for post-EVA respiratory irritation.',
      'Walking in a rigid pressurized suit spikes glucose burn and joint wear.',
      'Partial gravity aids bones somewhat, but demands targeted muscular conditioning.',
    ],
    medicalPriorities: [
      'Post-EVA respiratory control (SpO2%) and vital signs check',
      'Pre/post spacewalk glucose and electrolyte replenishment',
      'Joint evaluation and muscular fatigue prevention',
      'Long-term mental health and family emotional anchoring',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-hab',
        title: 'Post-EVA Check: Oxygen SpO2% & Blood Pressure',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Manual respiratory rate count and radial pulse check',
        reason: 'Detects mild hypoxia or airway irritation from regolith dust in the airlock.',
        points: 35,
      },
      {
        id: 'scan-gluc-hab',
        title: 'Pre/Post Spacewalk (EVA) Glucometer',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Check energy level, dizziness, and EVA carbohydrate intake',
        reason: 'An EVA burns up to 500 kcal/h and can trigger acute hypoglycemia.',
        points: 30,
      },
      {
        id: 'scan-rad-hab',
        title: 'Surface CSA Dosimetry (Cumulative)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Log total hours spent outside the shielded habitat module',
        reason: 'Tracks cumulative radiation absorbed during surface excursions.',
        points: 25,
      },
      {
        id: 'scan-blood-hab',
        title: 'Immune & Inflammatory Markers',
        deviceId: 'hematology',
        manualFallbackTitle: 'Assessment of throat irritation, skin, and fever',
        reason: 'Surface dust and EVA stress modulate immune defense response.',
        points: 25,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-t2-hab',
        name: 'Weighted T2 Treadmill March (EVA Preparation)',
        machine: 'T2 Treadmill with Harness',
        durationMin: 40,
        frequency: 'Daily',
        targetSystem: 'Lower extremity endurance and tibial bone load',
        jointLoad: 'High impact',
        affectedJoints: ['rodilla', 'knee'],
        alternativeName: 'Partial-Gravity Elliptical / High-Power CEVIS Cycling',
        alternativeDescription:
          'Maintains cardiovascular load and muscular stimulus without repetitive meniscus impact.',
      },
      {
        id: 'ex-upper-hab',
        name: 'Forearm & Grip Strengthening for Pressurized Suit',
        machine: 'ARED + Dynamometer',
        durationMin: 30,
        frequency: 'Daily',
        targetSystem: 'Muscular endurance in pressurized EVA gloves',
        jointLoad: 'Moderate impact',
        affectedJoints: ['hombro', 'shoulder'],
        alternativeName: 'Distal Forearm & Wrist Conditioning without Shoulder Load',
        alternativeDescription:
          'Focuses on grip strength and biceps with upper arm tucked to protect shoulder repair.',
      },
      {
        id: 'ex-mobility-hab',
        name: 'Lumbar Decompression & Post-EVA Joint Mobility',
        machine: 'Anchored Exercise Mat',
        durationMin: 20,
        frequency: 'Weekly',
        targetSystem: 'Myofascial recovery and joint flexibility',
        jointLoad: 'Low impact',
        affectedJoints: [],
      },
    ],
  },
  {
    id: 'space-station',
    name: 'Orbiting Space Station',
    shortName: 'Orbital Station',
    subtitle: 'Low Earth Orbit (ISS) or Lunar Gateway Station',
    gravityLabel: '0g Continuous Microgravity',
    gravityG: 0,
    commDelay: 'Real-time (1 to 3 sec)',
    commDelayMinutes: 0.05,
    radiationRiskLevel: 'Moderate',
    dailyRadiationRateMsv: 0.65,
    warningLimitMsv: 75,
    missionLimitMsv: 120,
    durationDays: 180,
    cabinEnvironment: 'Orbital modules with 16 sunrises and sunsets every 24h',
    primaryHazards: [
      'Zero-gravity field (up to 1.5% monthly bone loss without exercise)',
      'Circadian desynchronization from 16 light/dark cycles per day',
      'Cardiovascular deconditioning in continuous microgravity',
      'Closed-loop atmosphere and water recycling environment',
    ],
    whatChangesMedically: [
      'Priority #1 is completing 2 hours of daily exercise to halt bone demineralization.',
      'Sleep cycle faces severe disruption from 16 daily orbital sunrises.',
      'Real-time ground link enables live flight surgeon review of ultrasound scans.',
    ],
    medicalPriorities: [
      'Strict adherence to bone and muscle density routines (ARED/T2/CEVIS)',
      'Circadian light hygiene and daily sleep duration tracking',
      'Cardiac telemetry and ultrasound synchronization with Earth',
      'Metabolic monitoring plus Vitamin D and Calcium supplementation',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-iss',
        title: 'Resting Cardiac Monitor & Blood Pressure',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Manual resting pulse check and orthostatic dizziness screen',
        reason: 'Evaluates cardiovascular deconditioning in 0g microgravity.',
        points: 30,
      },
      {
        id: 'scan-ultra-iss',
        title: 'Weekly Musculoskeletal / Vascular Ultrasound',
        deviceId: 'ultrasound',
        manualFallbackTitle: 'Manual calf circumference measurement and grip strength check',
        reason: 'Verifies deep muscle mass and venous flow in 0g.',
        points: 35,
      },
      {
        id: 'scan-blood-iss',
        title: 'Orbital Immunity & Defense Check',
        deviceId: 'hematology',
        manualFallbackTitle: 'Daily log of fatigue symptoms and sleep quality',
        reason: 'Sleep loss across 16 orbital sunrises suppresses T-lymphocytes.',
        points: 25,
      },
      {
        id: 'scan-rad-iss',
        title: 'Orbital CSA Dosimeter Reading',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'South Atlantic Anomaly transit log confirmation',
        reason: 'Tracks cumulative radiation across orbital belt crossings.',
        points: 20,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-ared-iss',
        name: 'ARED Bone Protocol (Hip & Spine Axial Load)',
        machine: 'Orbital ARED',
        durationMin: 60,
        frequency: 'Daily',
        targetSystem: 'Spaceflight osteoporosis prevention',
        jointLoad: 'High impact',
        affectedJoints: ['rodilla', 'columna', 'knee', 'spine'],
        alternativeName: 'Moderate-Load ARED + Unilateral Hip Extension',
        alternativeDescription:
          'Replaces deep squats with semi-locked-knee hip extension.',
      },
      {
        id: 'ex-t2-iss',
        name: 'T2 Treadmill Harness Run',
        machine: 'T2 COLBERT Treadmill',
        durationMin: 35,
        frequency: 'Daily',
        targetSystem: 'Controlled impact bone stimulus and VO2max',
        jointLoad: 'High impact',
        affectedJoints: ['rodilla', 'knee'],
        alternativeName: 'High-Cadence CEVIS Cycling',
        alternativeDescription:
          'Replaces repetitive running impact with continuous zero-shock pedaling.',
      },
      {
        id: 'ex-stretch-iss',
        name: '0g Spinal Elongation & Postural Hygiene',
        machine: 'Cabin Anchor Restraint',
        durationMin: 20,
        frequency: 'Weekly',
        targetSystem: 'Intervertebral discs and lumbar pain relief',
        jointLoad: 'Low impact',
        affectedJoints: [],
      },
    ],
  },
  {
    id: 'surface-rover',
    name: 'Pressurized Surface Rover',
    shortName: 'Explorer Rover',
    subtitle: 'Tactical Surface Excursion Mission Away from Base',
    gravityLabel: '0.16g / 0.38g Mobile Ops',
    gravityG: 0.16,
    commDelay: 'Intermittent tactical link (45s - 5 min)',
    commDelayMinutes: 2,
    radiationRiskLevel: 'High',
    dailyRadiationRateMsv: 1.45,
    warningLimitMsv: 55,
    missionLimitMsv: 90,
    durationDays: 14,
    cabinEnvironment: 'Compact mobile cabin without underground shelter',
    primaryHazards: [
      'Rapid exposure to solar storms without habitat shielding',
      'Short/medium-duration confined space with high cognitive load',
      'Risk of hypoglycemia or dehydration during prolonged driving',
      'Small pressurized cabin air quality (CO2 and SpO2)',
    ],
    whatChangesMedically: [
      'Immediate tactical focus: acute vital signs (HR, BP, SpO2%, and glucose).',
      'No heavy ARED/T2 equipment onboard: exercise shifts to isometric and seated mobility.',
      'Solar radiation warnings trigger immediate return-to-base or shielding vest protocol.',
    ],
    medicalPriorities: [
      'Real-time vital signs (SpO2%, heart rate, and blood pressure)',
      'Tactical hypoglycemia prevention during long navigation shifts',
      'Sudden solar radiation alerts on open surface routes',
      'Acute stress and attentional fatigue management',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-rov',
        title: 'Continuous Tactical Scan: SpO2%, Pulse & BP',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Check carotid pulse, nailbed color, and dizziness',
        reason: 'In small cabins, an O2 failure or CO2 spike requires immediate action.',
        points: 35,
      },
      {
        id: 'scan-rad-rov',
        title: 'Solar Storm Alarm (CSA Dosimeter)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Read Rover space weather telemetry console',
        reason: 'The Rover has significantly less radiation shielding than the main habitat.',
        points: 35,
      },
      {
        id: 'scan-gluc-rov',
        title: 'Rapid Capillary Glucose Check (Cognitive Alert)',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Self-check for fine tremor, blurred vision, or irritability',
        reason: 'Hypoglycemia slows driving reflexes over rough planetary terrain.',
        points: 30,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-iso-rov',
        name: 'Seated Leg & Glute Isometric Contractions',
        machine: 'No equipment (Rover Cabin)',
        durationMin: 15,
        frequency: 'Daily',
        targetSystem: 'Venous stasis prevention and muscle tone',
        jointLoad: 'Low impact',
        affectedJoints: [],
      },
      {
        id: 'ex-band-rov',
        name: 'Compact Upper-Body Resistance Band',
        machine: 'Portable Tactical Band',
        durationMin: 20,
        frequency: 'Daily',
        targetSystem: 'Functional strength for emergency maneuvers',
        jointLoad: 'Moderate impact',
        affectedJoints: ['hombro', 'shoulder'],
        alternativeName: 'Scapular Isometrics & Controlled Elbow Flexion',
        alternativeDescription:
          'Maintains upper-body tone within a safe range for prior shoulder surgery.',
      },
      {
        id: 'ex-neck-rov',
        name: 'Cervical Mobility & Cabin Decompression Stretch',
        machine: 'Guided Stretching',
        durationMin: 15,
        frequency: 'Weekly',
        targetSystem: 'Prevents neck stiffness from helmet and seat restraints',
        jointLoad: 'Low impact',
        affectedJoints: [],
      },
    ],
  },
];

export const MISSIONS_DATA_ES: MissionType[] = [
  {
    id: 'deep-space-transit',
    name: 'Nave en Tránsito Profundo',
    shortName: 'Tránsito Profundo',
    subtitle: 'Rumbo a la Luna (Artemis) o Tránsito Interplanetario a Marte',
    gravityLabel: '0g Microgravedad',
    gravityG: 0,
    commDelay: '12 a 20 min por trayecto',
    commDelayMinutes: 16,
    radiationRiskLevel: 'Extremo',
    dailyRadiationRateMsv: 1.85,
    warningLimitMsv: 110,
    missionLimitMsv: 180,
    durationDays: 180,
    cabinEnvironment: 'Cabina sellada fuera de la magnetosfera terrestre',
    primaryHazards: [
      'Radiación cósmica galáctica y partículas solares',
      'Distancia de la Tierra (autonomía médica total)',
      'Aislamiento y confinamiento prolongado en cabina estrecha',
      'Microgravedad 0g (desplazamiento cefálico de fluidos)',
    ],
    whatChangesMedically: [
      'La pérdida de protección de la magnetosfera multiplica la dosis de radiación diaria (mSv).',
      'El retraso de comunicación impide telemedicina en tiempo real: el sistema guía decisiones autónomas.',
      'El desplazamiento de fluidos hacia el cráneo eleva el riesgo de síndrome neuro-ocular (SANS).',
    ],
    medicalPriorities: [
      'Dosimetría continua y alertas tempranas de tormenta solar',
      'Evaluación inmunológica cruzada por estrés radiativo',
      'Psicología del confinamiento extremo y Video-Diario asíncrono',
      'Entrenamiento de resistencia diaria para contrarrestar 0g',
    ],
    recommendedScans: [
      {
        id: 'scan-rad-transit',
        title: 'Lectura de Dosímetro CSA (Radiación acumulada)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Registro manual de blindaje y síntomas de fatiga aguda',
        reason: 'Fuera de la magnetosfera es vital vigilar picos de partículas solares.',
        points: 35,
      },
      {
        id: 'scan-blood-transit',
        title: 'Panel Hematológico e Inmune (Leucocitos)',
        deviceId: 'hematology',
        manualFallbackTitle: 'Autoexamen ganglionar, mucosa y temperatura oral',
        reason: 'La radiación y el estrés espacial pueden reactivar virus latentes.',
        points: 30,
      },
      {
        id: 'scan-ultra-transit',
        title: 'Ultrasonido Ocular / Carotídeo (Control SANS)',
        deviceId: 'ultrasound',
        manualFallbackTitle: 'Prueba de agudeza visual y presión cefálica subjetiva',
        reason: 'Vigila la presión de fluidos hacia la cabeza en 0g.',
        points: 30,
      },
      {
        id: 'scan-gluc-transit',
        title: 'Escaneo Capilar de Glucosa Basal',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Autoevaluación de temblor, energía y apetito post-comida',
        reason: 'La microgravedad altera la sensibilidad a la insulina.',
        points: 25,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-ared-transit',
        name: 'Resistencia al Vacío ARED (Sentadilla y Peso Muerto)',
        machine: 'ARED (Resistencia Avanzada)',
        durationMin: 45,
        frequency: 'Diaria',
        targetSystem: 'Densidad mineral ósea de cadera y fémur',
        jointLoad: 'Alto impacto',
        affectedJoints: ['rodilla', 'columna', 'knee', 'spine'],
        alternativeName: 'ARED Adaptado en Rango Corto + Prensa Isométrica',
        alternativeDescription:
          'Reduce flexión de rodilla a 45° y sustituye carga axial alta por contracciones isométricas seguras.',
      },
      {
        id: 'ex-cevis-transit',
        name: 'Ciclismo Cardiovascular CEVIS (Intervalos)',
        machine: 'Cicloergómetro CEVIS',
        durationMin: 35,
        frequency: 'Diaria',
        targetSystem: 'Capacidad aeróbica y retorno venoso',
        jointLoad: 'Bajo impacto',
        affectedJoints: [],
      },
      {
        id: 'ex-core-transit',
        name: 'Estabilización Postural y Banda Elástica Torácica',
        machine: 'Bandas de Tracción 0g',
        durationMin: 25,
        frequency: 'Semanal',
        targetSystem: 'Músculos paravertebrales y cintura escapular',
        jointLoad: 'Impacto moderado',
        affectedJoints: ['hombro', 'columna', 'shoulder', 'spine'],
        alternativeName: 'Tracción Escapular Isométrica sin Elevación sobre Cabeza',
        alternativeDescription:
          'Evita rotación forzada del manguito rotador manteniendo codos por debajo del nivel del hombro.',
      },
    ],
  },
  {
    id: 'planetary-habitat',
    name: 'Hábitat Planetario o Lunar',
    shortName: 'Hábitat Superficie',
    subtitle: 'Base Presurizada en la Luna (0.16g) o Marte (0.38g)',
    gravityLabel: '0.16g Lunar / 0.38g Marciana',
    gravityG: 0.38,
    commDelay: '3 s (Luna) a 14 min (Marte)',
    commDelayMinutes: 8,
    radiationRiskLevel: 'Alto',
    dailyRadiationRateMsv: 1.15,
    warningLimitMsv: 95,
    missionLimitMsv: 150,
    durationDays: 120,
    cabinEnvironment: 'Domo habitacional con esclusas EVA y exposición a regolito',
    primaryHazards: [
      'Entorno cerrado con polvo fino abrasivo (regolito lunar/marciano)',
      'Desgaste físico por caminatas espaciales (EVA) en traje presurizado',
      'Radiación acumulada en superficie sin campo magnético denso',
      'Aislamiento de larga duración con tripulación reducida',
    ],
    whatChangesMedically: [
      'Aumenta la prioridad de oxigenación SpO2% por posible irritación respiratoria tras EVA.',
      'El esfuerzo de caminar en traje rígido dispara el consumo de glucosa y el desgaste articular.',
      'La gravedad parcial ayuda parcialmente al hueso, pero exige prevención muscular focalizada.',
    ],
    medicalPriorities: [
      'Control respiratorio (SpO2%) y signos vitales tras regreso de EVA',
      'Reposición de glucosa y electrolitos pre/post caminata espacial',
      'Evaluación articular y prevención de fatiga muscular',
      'Salud mental a largo plazo y ancla emocional familiar',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-hab',
        title: 'Control Post-EVA: Oxígeno SpO2% y Presión Arterial',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Conteo manual de frecuencia respiratoria y pulso radial',
        reason: 'Detecta hipoxia leve o irritación respiratoria por regolito en esclusa.',
        points: 35,
      },
      {
        id: 'scan-gluc-hab',
        title: 'Glucómetro Pre/Post Caminata Espacial (EVA)',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Chequeo de energía, mareo e ingesta de carbohidratos EVA',
        reason: 'Una EVA consume hasta 500 kcal/h y puede causar hipoglucemia.',
        points: 30,
      },
      {
        id: 'scan-rad-hab',
        title: 'Dosimetría de Superficie CSA (Acumulado)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Bitácora de tiempo fuera del módulo blindado',
        reason: 'Supervisa la dosis acumulada durante excursiones en superficie.',
        points: 25,
      },
      {
        id: 'scan-blood-hab',
        title: 'Marcadores Inmunes e Inflamatorios',
        deviceId: 'hematology',
        manualFallbackTitle: 'Evaluación de irritación faríngea, piel y fiebre',
        reason: 'El polvo de superficie y el estrés EVA modulan la respuesta inmune.',
        points: 25,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-t2-hab',
        name: 'Marcha con Lastre en Cinta T2 (Preparación EVA)',
        machine: 'Cinta T2 con Arnés',
        durationMin: 40,
        frequency: 'Diaria',
        targetSystem: 'Resistencia de extremidades inferiores y hueso tibial',
        jointLoad: 'Alto impacto',
        affectedJoints: ['rodilla', 'knee'],
        alternativeName: 'Elíptica de Gravedad Parcial / Ciclismo CEVIS de Potencia',
        alternativeDescription:
          'Mantiene carga cardiovascular y estímulo muscular evitando impactos repetitivos en menisco.',
      },
      {
        id: 'ex-upper-hab',
        name: 'Fortalecimiento de Antebrazos y Agarre para Traje Presurizado',
        machine: 'ARED + Dinamómetro',
        durationMin: 30,
        frequency: 'Diaria',
        targetSystem: 'Resistencia muscular en guantes presurizados',
        jointLoad: 'Impacto moderado',
        affectedJoints: ['hombro', 'shoulder'],
        alternativeName: 'Trabajo Distal de Antebrazo y Muñeca sin Carga en Hombro',
        alternativeDescription:
          'Focaliza prensión manual y bíceps con brazo pegado al torso para proteger cirugía de hombro.',
      },
      {
        id: 'ex-mobility-hab',
        name: 'Descarga Lumbar y Movilidad Articular Post-EVA',
        machine: 'Colchoneta de Anclaje',
        durationMin: 20,
        frequency: 'Semanal',
        targetSystem: 'Recuperación miofascial y flexibilidad',
        jointLoad: 'Bajo impacto',
        affectedJoints: [],
      },
    ],
  },
  {
    id: 'space-station',
    name: 'Estación Espacial en Órbita',
    shortName: 'Estación Orbital',
    subtitle: 'Órbita Terrestre Baja (EEI) o Estación Lunar Gateway',
    gravityLabel: '0g Microgravedad Continua',
    gravityG: 0,
    commDelay: 'Tiempo real (1 a 3 seg)',
    commDelayMinutes: 0.05,
    radiationRiskLevel: 'Moderado',
    dailyRadiationRateMsv: 0.65,
    warningLimitMsv: 75,
    missionLimitMsv: 120,
    durationDays: 180,
    cabinEnvironment: 'Módulos orbitales con 16 amaneceres y atardeceres cada 24h',
    primaryHazards: [
      'Campos gravitatorios (pérdida ósea hasta 1.5% mensual sin ejercicio)',
      'Desincronización circadiana por 16 ciclos luz/oscuridad al día',
      'Desacondicionamiento cardiovascular en microgravedad continua',
      'Entorno cerrado con reciclaje continuo de aire y agua',
    ],
    whatChangesMedically: [
      'La prioridad #1 es cumplir 2 horas de ejercicio diario para frenar la desmineralización ósea.',
      'El ciclo de sueño sufre disrupción severa por los 16 amaneceres orbitales diarios.',
      'Hay enlace en vivo con cirujanos de vuelo en Tierra para revisión de ultrasonidos.',
    ],
    medicalPriorities: [
      'Adherencia estricta a rutinas de densidad ósea y muscular (ARED/T2/CEVIS)',
      'Higiene circadiana y monitoreo diario de horas de sueño',
      'Sincronización de telemetría cardíaca y ultrasonido con Tierra',
      'Control metabólico y suplementación de Vitamina D + Calcio',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-iss',
        title: 'Monitor Cardíaco y Presión Arterial en Reposo',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Toma manual de pulso en reposo y prueba de mareo ortostático',
        reason: 'Evalúa el desacondicionamiento cardíaco en microgravedad 0g.',
        points: 30,
      },
      {
        id: 'scan-ultra-iss',
        title: 'Ultrasonido Musculoesquelético / Vascular Semanal',
        deviceId: 'ultrasound',
        manualFallbackTitle: 'Medición manual de perímetro de pantorrilla y fuerza de agarre',
        reason: 'Permite verificar masa muscular profunda y flujo venoso en 0g.',
        points: 35,
      },
      {
        id: 'scan-blood-iss',
        title: 'Chequeo de Defensas e Inmunidad Orbital',
        deviceId: 'hematology',
        manualFallbackTitle: 'Bitácora de síntomas de fatiga y calidad de descanso',
        reason: 'La falta de sueño por los 16 amaneceres deprime los linfocitos T.',
        points: 25,
      },
      {
        id: 'scan-rad-iss',
        title: 'Lectura de Dosímetro Orbital CSA',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Confirmación de paso por Anomalía del Atlántico Sur',
        reason: 'Registra dosis acumulada al cruzar cinturones de radiación en órbita.',
        points: 20,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-ared-iss',
        name: 'Protocolo Óseo ARED (Carga Axial Cadera y Columna)',
        machine: 'ARED Orbital',
        durationMin: 60,
        frequency: 'Diaria',
        targetSystem: 'Prevención de osteoporosis espacial',
        jointLoad: 'Alto impacto',
        affectedJoints: ['rodilla', 'columna', 'knee', 'spine'],
        alternativeName: 'ARED de Carga Moderada + Extensión de Cadera Unilateral',
        alternativeDescription:
          'Sustituye sentadilla profunda por extensión de cadera con rodilla semi-bloqueada.',
      },
      {
        id: 'ex-t2-iss',
        name: 'Carrera con Arnés en Cinta T2',
        machine: 'Cinta T2 COLBERT',
        durationMin: 35,
        frequency: 'Diaria',
        targetSystem: 'Estímulo óseo de impacto controlado y VO2max',
        jointLoad: 'Alto impacto',
        affectedJoints: ['rodilla', 'knee'],
        alternativeName: 'Ciclismo CEVIS de Alta Cadencia',
        alternativeDescription:
          'Reemplaza el impacto repetitivo de carrera por pedaleo continuo sin choque articular.',
      },
      {
        id: 'ex-stretch-iss',
        name: 'Elongación de Columna 0g y Higiene Postural',
        machine: 'Anclaje de Cabina',
        durationMin: 20,
        frequency: 'Semanal',
        targetSystem: 'Discos intervertebrales y control de dolor lumbar',
        jointLoad: 'Bajo impacto',
        affectedJoints: [],
      },
    ],
  },
  {
    id: 'surface-rover',
    name: 'Vehículo Explorador Presurizado',
    shortName: 'Rover Explorador',
    subtitle: 'Misión Táctica de Excursión en Superficie Lejos de la Base',
    gravityLabel: '0.16g / 0.38g Operación Móvil',
    gravityG: 0.16,
    commDelay: 'Enlace táctico intermitente (45s - 5 min)',
    commDelayMinutes: 2,
    radiationRiskLevel: 'Alto',
    dailyRadiationRateMsv: 1.45,
    warningLimitMsv: 55,
    missionLimitMsv: 90,
    durationDays: 14,
    cabinEnvironment: 'Cabina móvil de volumen reducido sin refugio subterráneo',
    primaryHazards: [
      'Exposición rápida a tormentas solares sin blindaje de hábitat',
      'Espacio confinado de corta/media duración y alta carga cognitiva',
      'Riesgo de hipoglucemia o deshidratación durante conducción prolongada',
      'Calidad del aire en cabina presurizada pequeña (CO2 y SpO2)',
    ],
    whatChangesMedically: [
      'Enfoque táctico inmediato: signos vitales agudos (FC, presión arterial, SpO2% y glucosa).',
      'No hay máquinas pesadas ARED/T2 a bordo: el ejercicio pasa a ser isométrico y de movilidad en asiento.',
      'Las alertas de radiación solar activan protocolo inmediato de retorno o uso de chaleco de blindaje.',
    ],
    medicalPriorities: [
      'Signos vitales en tiempo real (SpO2%, frecuencia cardíaca y presión arterial)',
      'Prevención de hipoglucemia táctica durante turnos largos de navegación',
      'Alertas súbitas de radiación solar en ruta abierta',
      'Manejo de estrés agudo y fatiga atencional',
    ],
    recommendedScans: [
      {
        id: 'scan-vitals-rov',
        title: 'Escaneo Táctico Continuo: SpO2%, Pulso y Presión',
        deviceId: 'vitals_cuff',
        manualFallbackTitle: 'Verificación de pulso carotídeo, coloración ungueal y mareo',
        reason: 'En cabinas pequeñas un fallo de O2 o exceso de CO2 requiere acción inmediata.',
        points: 35,
      },
      {
        id: 'scan-rad-rov',
        title: 'Alarma de Tormenta Solar (Dosímetro CSA)',
        deviceId: 'dosimeter',
        manualFallbackTitle: 'Lectura de panel meteorológico espacial del Rover',
        reason: 'El Rover tiene menor blindaje que el hábitat principal.',
        points: 35,
      },
      {
        id: 'scan-gluc-rov',
        title: 'Control Rápido de Glucosa Capilar (Alerta Cognitiva)',
        deviceId: 'glucometer',
        manualFallbackTitle: 'Autoevaluación de temblor fino, visión borrosa o irritabilidad',
        reason: 'La hipoglucemia reduce los reflejos de conducción en terreno irregular.',
        points: 30,
      },
    ],
    defaultExercises: [
      {
        id: 'ex-iso-rov',
        name: 'Contracción Isométrica de Piernas y Glúteos en Cabina',
        machine: 'Sin equipo (Cabina Rover)',
        durationMin: 15,
        frequency: 'Diaria',
        targetSystem: 'Prevención de estasis venosa y tono muscular',
        jointLoad: 'Bajo impacto',
        affectedJoints: [],
      },
      {
        id: 'ex-band-rov',
        name: 'Banda Elástica Compacta de Tren Superior',
        machine: 'Banda Táctica Portátil',
        durationMin: 20,
        frequency: 'Diaria',
        targetSystem: 'Fuerza funcional para maniobras de emergencia',
        jointLoad: 'Impacto moderado',
        affectedJoints: ['hombro', 'shoulder'],
        alternativeName: 'Isometría Escapular y Flexión de Codo Controlada',
        alternativeDescription:
          'Trabaja tono del tren superior manteniendo rango articular seguro para cirugía previa de hombro.',
      },
      {
        id: 'ex-neck-rov',
        name: 'Movilidad Cervical y Descompresión de Cabina',
        machine: 'Estiramiento Guiado',
        durationMin: 15,
        frequency: 'Semanal',
        targetSystem: 'Prevención de contracturas por uso de casco/asiento',
        jointLoad: 'Bajo impacto',
        affectedJoints: [],
      },
    ],
  },
];

export const MISSIONS_DATA: MissionType[] = MISSIONS_DATA_EN;

export function getMissionsData(lang: Language): MissionType[] {
  return lang === 'es' ? MISSIONS_DATA_ES : MISSIONS_DATA_EN;
}
