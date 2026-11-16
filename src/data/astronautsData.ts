import { Language } from '@/i18n/types';

export type BloodType = 'O-' | 'O+' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export type ImmuneStatus =
  | 'Normal'
  | 'Low Defenses (Leukopenia/viral reactivation tendency)'
  | 'Defensas Bajas (Tendencia a leucopenia/reactivación viral)';

export const LOW_IMMUNE_STATUS_EN: ImmuneStatus =
  'Low Defenses (Leukopenia/viral reactivation tendency)';
export const LOW_IMMUNE_STATUS_ES: ImmuneStatus =
  'Defensas Bajas (Tendencia a leucopenia/reactivación viral)';

export function isLowImmuneStatus(status: string | undefined): boolean {
  return Boolean(status && status !== 'Normal');
}

export function getCanonicalImmuneStatus(status: string | undefined, lang: Language): ImmuneStatus {
  if (!status || status === 'Normal') return 'Normal';
  return lang === 'es' ? LOW_IMMUNE_STATUS_ES : LOW_IMMUNE_STATUS_EN;
}

export function hasPriorSurgeries(surgeries: string[] | undefined): boolean {
  if (!Array.isArray(surgeries) || surgeries.length === 0) return false;
  return surgeries.some((s) => {
    const low = s.trim().toLowerCase();
    return (
      low.length > 0 &&
      !low.includes('sin cirug') &&
      !low.includes('no prior surg') &&
      low !== 'none' &&
      low !== 'ninguna'
    );
  });
}

export function hasKnownAllergies(allergies: string[] | undefined): boolean {
  if (!Array.isArray(allergies) || allergies.length === 0) return false;
  return allergies.some((a) => {
    const low = a.trim().toLowerCase();
    return (
      low.length > 0 &&
      !low.includes('ninguna') &&
      !low.includes('none known') &&
      low !== 'none' &&
      !low.includes('no known')
    );
  });
}

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

export const PRELOADED_ASTRONAUTS_EN: AstronautProfile[] = [
  {
    id: 'elena-vance',
    name: 'Cmdr. Elena Vance',
    role: 'Mission Commander',
    age: 38,
    bloodType: 'O-',
    avatarBadge: 'EV',
    clinicalHistory: {
      immuneStatus: LOW_IMMUNE_STATUS_EN,
      priorSurgeries: ['Right knee meniscus surgery (2023)'],
      allergies: ['Penicillin'],
      baselineGlucose: 88,
      baselineBP: '116/74 mmHg',
      baselineSystolic: 116,
      baselineDiastolic: 74,
      baselineHR: 58,
      notes:
        'Universal donor (O-). Exhibited mild immune stress reactivation in confinement simulations; requires early leukocyte alert threshold and low-impact right knee exercises.',
    },
  },
  {
    id: 'mateo-silva',
    name: 'Dr. Mateo Silva',
    role: 'Crew Medical Officer & Planetary Geologist',
    age: 42,
    bloodType: 'A+',
    avatarBadge: 'MS',
    clinicalHistory: {
      immuneStatus: 'Normal',
      priorSurgeries: ['Left shoulder rotator cuff repair (2022)'],
      allergies: ['None known'],
      baselineGlucose: 94,
      baselineBP: '122/78 mmHg',
      baselineSystolic: 122,
      baselineDiastolic: 78,
      baselineHR: 62,
      notes:
        'Moderate sensitivity to circadian disruption (requires strict blue/amber lighting schedule). Limit overhead axial load on left shoulder during ARED routines.',
    },
  },
  {
    id: 'sofia-chen',
    name: 'Eng. Sofía Chen-Ramírez',
    role: 'Flight Engineer & EVA Operations',
    age: 34,
    bloodType: 'B+',
    avatarBadge: 'SC',
    clinicalHistory: {
      immuneStatus: LOW_IMMUNE_STATUS_EN,
      priorSurgeries: ['No prior surgeries'],
      allergies: ['Synthetic latex'],
      baselineGlucose: 82,
      baselineBP: '112/70 mmHg',
      baselineSystolic: 112,
      baselineDiastolic: 70,
      baselineHR: 55,
      notes:
        'Low glycemic baseline (82 mg/dL) with tendency toward reactive hypoglycemia after intense spacewalks; reinforce carbohydrate intake before long sessions and weekly immune checks.',
    },
  },
];

export const PRELOADED_ASTRONAUTS_ES: AstronautProfile[] = [
  {
    id: 'elena-vance',
    name: 'Cmdr. Elena Vance',
    role: 'Comandante de Misión',
    age: 38,
    bloodType: 'O-',
    avatarBadge: 'EV',
    clinicalHistory: {
      immuneStatus: LOW_IMMUNE_STATUS_ES,
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
      immuneStatus: LOW_IMMUNE_STATUS_ES,
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

export const PRELOADED_ASTRONAUTS: AstronautProfile[] = PRELOADED_ASTRONAUTS_EN;

export function getPreloadedAstronauts(lang: Language): AstronautProfile[] {
  return lang === 'es' ? PRELOADED_ASTRONAUTS_ES : PRELOADED_ASTRONAUTS_EN;
}

export function localizeAstronautProfile(
  profile: AstronautProfile,
  lang: Language
): AstronautProfile {
  const targetList = getPreloadedAstronauts(lang);
  const enMatch = PRELOADED_ASTRONAUTS_EN.find((p) => p.id === profile.id);
  const esMatch = PRELOADED_ASTRONAUTS_ES.find((p) => p.id === profile.id);
  const targetPreset = targetList.find((p) => p.id === profile.id);

  if (targetPreset && enMatch && esMatch) {
    const isUnmodifiedPresetField = (val: string, enVal: string, esVal: string) =>
      val === enVal || val === esVal;
    const isUnmodifiedArray = (arr: string[], enArr: string[], esArr: string[]) =>
      arr.join('|') === enArr.join('|') || arr.join('|') === esArr.join('|');

    return {
      ...profile,
      name: isUnmodifiedPresetField(profile.name, enMatch.name, esMatch.name)
        ? targetPreset.name
        : profile.name,
      role: isUnmodifiedPresetField(profile.role, enMatch.role, esMatch.role)
        ? targetPreset.role
        : profile.role,
      clinicalHistory: {
        ...profile.clinicalHistory,
        immuneStatus: getCanonicalImmuneStatus(profile.clinicalHistory.immuneStatus, lang),
        priorSurgeries: isUnmodifiedArray(
          profile.clinicalHistory.priorSurgeries,
          enMatch.clinicalHistory.priorSurgeries,
          esMatch.clinicalHistory.priorSurgeries
        )
          ? targetPreset.clinicalHistory.priorSurgeries
          : profile.clinicalHistory.priorSurgeries,
        allergies: isUnmodifiedArray(
          profile.clinicalHistory.allergies,
          enMatch.clinicalHistory.allergies,
          esMatch.clinicalHistory.allergies
        )
          ? targetPreset.clinicalHistory.allergies
          : profile.clinicalHistory.allergies,
        notes: isUnmodifiedPresetField(
          profile.clinicalHistory.notes,
          enMatch.clinicalHistory.notes,
          esMatch.clinicalHistory.notes
        )
          ? targetPreset.clinicalHistory.notes
          : profile.clinicalHistory.notes,
      },
    };
  }

  // Custom astronaut: translate standard fallback labels
  const translateRole =
    profile.role === 'Especialista de Misión' && lang === 'en'
      ? 'Mission Specialist'
      : profile.role === 'Mission Specialist' && lang === 'es'
        ? 'Especialista de Misión'
        : profile.role;

  const translateSurgeries = profile.clinicalHistory.priorSurgeries.map((s) => {
    if (s === 'Sin cirugías previas' && lang === 'en') return 'No prior surgeries';
    if (s === 'No prior surgeries' && lang === 'es') return 'Sin cirugías previas';
    return s;
  });

  const translateAllergies = profile.clinicalHistory.allergies.map((a) => {
    if (a === 'Ninguna conocida' && lang === 'en') return 'None known';
    if (a === 'None known' && lang === 'es') return 'Ninguna conocida';
    return a;
  });

  const translateNotes =
    profile.clinicalHistory.notes === 'Expediente clínico validado previo al despegue.' &&
    lang === 'en'
      ? 'Pre-launch clinical record validated.'
      : profile.clinicalHistory.notes === 'Pre-launch clinical record validated.' && lang === 'es'
        ? 'Expediente clínico validado previo al despegue.'
        : profile.clinicalHistory.notes;

  return {
    ...profile,
    role: translateRole,
    clinicalHistory: {
      ...profile.clinicalHistory,
      immuneStatus: getCanonicalImmuneStatus(profile.clinicalHistory.immuneStatus, lang),
      priorSurgeries: translateSurgeries,
      allergies: translateAllergies,
      notes: translateNotes,
    },
  };
}
