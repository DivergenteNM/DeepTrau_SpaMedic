export type BloodType = 'O-' | 'O+' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type ImmuneStatus =
  | 'Normal'
  | 'Defensas Bajas (Tendencia a leucopenia/reactivación viral)';

export interface AstronautProfile {
  id: string;
  name: string;
  role: string;
  age: number;
  bloodType: BloodType;
  avatarBadge: string;
  clinicalHistory: {
    immuneStatus: ImmuneStatus;
    priorSurgeries: string[];
    allergies: string[];
    baselineGlucose: number; // mg/dL
    baselineBP: string; // e.g., "116/74 mmHg"
    baselineSystolic: number;
    baselineDiastolic: number;
    baselineHR: number; // bpm
    notes: string;
  };
}

export const PRELOADED_ASTRONAUTS: AstronautProfile[] = [
  {
    id: 'elena-vance',
    name: 'Cmdr. Elena Vance',
    role: 'Comandante de Misión',
    age: 38,
    bloodType: 'O-',
    avatarBadge: 'EV',
    clinicalHistory: {
      immuneStatus: 'Defensas Bajas (Tendencia a leucopenia/reactivación viral)',
      priorSurgeries: ['Cirugía de menisco en rodilla derecha (2023)'],
      allergies: ['Penicilina'],
      baselineGlucose: 88,
      baselineBP: '116/74 mmHg',
      baselineSystolic: 116,
      baselineDiastolic: 74,
      baselineHR: 58,
      notes:
        'Donante universal (O-). Presentó reactivación leve de estrés inmunológico en simulaciones de confinamiento; requiere umbral de alerta temprana en leucocitos y ejercicios de bajo impacto para rodilla derecha.',
    },
  },
  {
    id: 'mateo-silva',
    name: 'Dr. Mateo Silva',
    role: 'Médico de Tripulación y Geología Planetaria',
    age: 42,
    bloodType: 'A+',
    avatarBadge: 'MS',
    clinicalHistory: {
      immuneStatus: 'Normal',
      priorSurgeries: ['Reparación de manguito rotador en hombro izquierdo (2022)'],
      allergies: ['Ninguna conocida'],
      baselineGlucose: 94,
      baselineBP: '122/78 mmHg',
      baselineSystolic: 122,
      baselineDiastolic: 78,
      baselineHR: 62,
      notes:
        'Sensibilidad moderada a disrupción circadiana (requiere pauta estricta de luz azul/ámbar). Limitar carga axial por encima de la cabeza en hombro izquierdo durante rutinas ARED.',
    },
  },
  {
    id: 'sofia-chen',
    name: 'Ing. Sofía Chen-Ramírez',
    role: 'Ingeniera de Vuelo y Operaciones EVA',
    age: 34,
    bloodType: 'B+',
    avatarBadge: 'SC',
    clinicalHistory: {
      immuneStatus: 'Defensas Bajas (Tendencia a leucopenia/reactivación viral)',
      priorSurgeries: ['Sin cirugías previas'],
      allergies: ['Látex sintético'],
      baselineGlucose: 82,
      baselineBP: '112/70 mmHg',
      baselineSystolic: 112,
      baselineDiastolic: 70,
      baselineHR: 55,
      notes:
        'Línea base glucémica baja (82 mg/dL) con tendencia a hipoglucemia reactiva tras caminatas espaciales intensas; reforzar colación de glucosa antes de sesiones prolongadas y control inmune semanal.',
    },
  },
];
