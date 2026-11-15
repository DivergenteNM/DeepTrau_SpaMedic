import {
  AstronautProfile,
  BloodType,
  ImmuneStatus,
  PRELOADED_ASTRONAUTS,
} from '@/data/astronautsData';

export const VALID_BLOOD_TYPES: BloodType[] = [
  'O-',
  'O+',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
];

export const VALID_IMMUNE_STATUSES: ImmuneStatus[] = [
  'Normal',
  'Defensas Bajas (Tendencia a leucopenia/reactivación viral)',
];

export interface NumericRangeSpec {
  label: string;
  min: number;
  max: number;
  unit: string;
  maxDigits: number;
  fallback: number;
}

export const ASTRONAUT_LIMITS = {
  name: { minLength: 3, maxLength: 60 },
  role: { minLength: 3, maxLength: 60 },
  age: {
    label: 'Edad',
    min: 22,
    max: 65,
    unit: 'años',
    maxDigits: 3,
    fallback: 36,
  } satisfies NumericRangeSpec,
  baselineGlucose: {
    label: 'Glucosa basal',
    min: 65,
    max: 140,
    unit: 'mg/dL',
    maxDigits: 3,
    fallback: 90,
  } satisfies NumericRangeSpec,
  baselineSystolic: {
    label: 'Presión sistólica',
    min: 90,
    max: 150,
    unit: 'mmHg',
    maxDigits: 3,
    fallback: 118,
  } satisfies NumericRangeSpec,
  baselineDiastolic: {
    label: 'Presión diastólica',
    min: 55,
    max: 100,
    unit: 'mmHg',
    maxDigits: 3,
    fallback: 76,
  } satisfies NumericRangeSpec,
  minPulsePressure: 15,
  baselineHR: {
    label: 'FC en reposo',
    min: 42,
    max: 95,
    unit: 'bpm',
    maxDigits: 3,
    fallback: 60,
  } satisfies NumericRangeSpec,
  listField: {
    maxLength: 180,
    maxItems: 6,
    maxItemLength: 60,
  },
  notes: {
    minLengthIfPresent: 5,
    maxLength: 350,
  },
} as const;

export type AstronautFieldKey =
  | 'name'
  | 'role'
  | 'age'
  | 'bloodType'
  | 'immuneStatus'
  | 'surgeryInput'
  | 'allergiesInput'
  | 'baselineGlucose'
  | 'baselineSystolic'
  | 'baselineDiastolic'
  | 'baselineHR'
  | 'clinicalNotes';

export interface AstronautFormDraft {
  name: string;
  role: string;
  age: string;
  bloodType: BloodType;
  immuneStatus: ImmuneStatus;
  surgeryInput: string;
  allergiesInput: string;
  baselineGlucose: string;
  baselineSystolic: string;
  baselineDiastolic: string;
  baselineHR: string;
  clinicalNotes: string;
}

export interface AstronautValidationResult {
  isValid: boolean;
  errors: Partial<Record<AstronautFieldKey, string>>;
  parsed: {
    age: number | null;
    baselineGlucose: number | null;
    baselineSystolic: number | null;
    baselineDiastolic: number | null;
    baselineHR: number | null;
    surgeries: string[];
    allergies: string[];
  };
}

/** Strips non-digit characters and limits total digits for integer telemetry inputs. */
export function sanitizeIntegerInput(value: string, maxDigits: number): string {
  return value.replace(/\D/g, '').slice(0, maxDigits);
}

/** Prevents exponential, sign, and decimal keys inside integer-only inputs. */
export function preventNonIntegerKey(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
    e.preventDefault();
  }
}

function countLetters(text: string): number {
  return (text.match(/\p{L}/gu) ?? []).length;
}

function validateIntegerField(
  rawValue: string,
  spec: NumericRangeSpec
): { value: number | null; error?: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      value: null,
      error: `Campo obligatorio (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      value: null,
      error: 'Ingresa solo números enteros positivos.',
    };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num)) {
    return { value: null, error: 'Valor numérico fuera de rango.' };
  }
  if (num < spec.min) {
    return {
      value: num,
      error: `${spec.label} debajo del límite humano permitido (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  if (num > spec.max) {
    return {
      value: num,
      error: `${spec.label} humanamente imposible o fuera de rango (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  return { value: num };
}

function validateCommaSeparatedMedicalList(
  rawValue: string,
  fieldLabel: string,
  example: string
): { items: string[]; error?: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { items: [] };
  }
  if (trimmed.length > ASTRONAUT_LIMITS.listField.maxLength) {
    return {
      items: [],
      error: `Máximo ${ASTRONAUT_LIMITS.listField.maxLength} caracteres en ${fieldLabel}.`,
    };
  }
  if (/[<>{}[\]]/.test(trimmed)) {
    return {
      items: [],
      error: 'No se permiten los caracteres <, >, {, }, [ o ].',
    };
  }

  const items = trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return {
      items: [],
      error: `Escribe una descripción válida (ej. ${example}) o deja el campo vacío.`,
    };
  }
  if (items.length > ASTRONAUT_LIMITS.listField.maxItems) {
    return {
      items: items.slice(0, ASTRONAUT_LIMITS.listField.maxItems),
      error: `Máximo ${ASTRONAUT_LIMITS.listField.maxItems} entradas separadas por coma.`,
    };
  }
  for (const item of items) {
    if (item.length > ASTRONAUT_LIMITS.listField.maxItemLength) {
      return {
        items,
        error: `Cada registro debe tener máximo ${ASTRONAUT_LIMITS.listField.maxItemLength} caracteres.`,
      };
    }
    if (countLetters(item) < 2) {
      return {
        items,
        error: `Cada registro en ${fieldLabel} debe ser texto médico legible (ej. ${example}).`,
      };
    }
  }

  return { items };
}

/** Validates all fields of the astronaut registration and baseline medical form. */
export function validateAstronautForm(draft: AstronautFormDraft): AstronautValidationResult {
  const errors: Partial<Record<AstronautFieldKey, string>> = {};

  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    errors.name = 'El nombre del astronauta es obligatorio.';
  } else if (/\d/.test(trimmedName)) {
    errors.name = 'El nombre humano no puede contener números.';
  } else if (!/^[\p{L}\s.'-]+$/u.test(trimmedName)) {
    errors.name = 'Usa solo letras, espacios, puntos, guiones o apóstrofes.';
  } else if (trimmedName.length < ASTRONAUT_LIMITS.name.minLength) {
    errors.name = `Ingresa al menos ${ASTRONAUT_LIMITS.name.minLength} caracteres.`;
  } else if (trimmedName.length > ASTRONAUT_LIMITS.name.maxLength) {
    errors.name = `Máximo ${ASTRONAUT_LIMITS.name.maxLength} caracteres.`;
  } else if (countLetters(trimmedName) < 2) {
    errors.name = 'Ingresa un nombre completo válido.';
  }

  const trimmedRole = draft.role.trim();
  if (!trimmedRole) {
    errors.role = 'El rol en la misión es obligatorio.';
  } else if (trimmedRole.length < ASTRONAUT_LIMITS.role.minLength) {
    errors.role = `Ingresa al menos ${ASTRONAUT_LIMITS.role.minLength} caracteres para el rol.`;
  } else if (trimmedRole.length > ASTRONAUT_LIMITS.role.maxLength) {
    errors.role = `Máximo ${ASTRONAUT_LIMITS.role.maxLength} caracteres.`;
  } else if (!/^[\p{L}\p{N}\s.,\-/()]+$/u.test(trimmedRole)) {
    errors.role = 'Contiene símbolos no permitidos en el rol de misión.';
  } else if (countLetters(trimmedRole) < 3) {
    errors.role = 'El rol debe describir una función válida (mínimo 3 letras).';
  }

  if (!VALID_BLOOD_TYPES.includes(draft.bloodType)) {
    errors.bloodType = 'Selecciona un grupo sanguíneo humano válido.';
  }

  if (!VALID_IMMUNE_STATUSES.includes(draft.immuneStatus)) {
    errors.immuneStatus = 'Selecciona un estado inmunológico válido.';
  }

  const ageCheck = validateIntegerField(draft.age, ASTRONAUT_LIMITS.age);
  if (ageCheck.error) errors.age = ageCheck.error;

  const glucoseCheck = validateIntegerField(
    draft.baselineGlucose,
    ASTRONAUT_LIMITS.baselineGlucose
  );
  if (glucoseCheck.error) errors.baselineGlucose = glucoseCheck.error;

  const systolicCheck = validateIntegerField(
    draft.baselineSystolic,
    ASTRONAUT_LIMITS.baselineSystolic
  );
  if (systolicCheck.error) errors.baselineSystolic = systolicCheck.error;

  const diastolicCheck = validateIntegerField(
    draft.baselineDiastolic,
    ASTRONAUT_LIMITS.baselineDiastolic
  );
  if (diastolicCheck.error) errors.baselineDiastolic = diastolicCheck.error;

  if (
    systolicCheck.value !== null &&
    diastolicCheck.value !== null &&
    !systolicCheck.error &&
    !diastolicCheck.error
  ) {
    if (diastolicCheck.value >= systolicCheck.value) {
      errors.baselineDiastolic = `Incoherencia fisiológica: la diastólica (${diastolicCheck.value}) debe ser menor que la sistólica (${systolicCheck.value} mmHg).`;
    } else if (systolicCheck.value - diastolicCheck.value < ASTRONAUT_LIMITS.minPulsePressure) {
      errors.baselineDiastolic = `Presión de pulso incompatible: la sistólica debe superar a la diastólica por al menos ${ASTRONAUT_LIMITS.minPulsePressure} mmHg.`;
    }
  }

  const hrCheck = validateIntegerField(draft.baselineHR, ASTRONAUT_LIMITS.baselineHR);
  if (hrCheck.error) errors.baselineHR = hrCheck.error;

  const surgeriesCheck = validateCommaSeparatedMedicalList(
    draft.surgeryInput,
    'cirugías',
    'Cirugía de menisco'
  );
  if (surgeriesCheck.error) errors.surgeryInput = surgeriesCheck.error;

  const allergiesCheck = validateCommaSeparatedMedicalList(
    draft.allergiesInput,
    'alergias',
    'Penicilina'
  );
  if (allergiesCheck.error) errors.allergiesInput = allergiesCheck.error;

  const trimmedNotes = draft.clinicalNotes.trim();
  if (trimmedNotes) {
    if (trimmedNotes.length > ASTRONAUT_LIMITS.notes.maxLength) {
      errors.clinicalNotes = `Máximo ${ASTRONAUT_LIMITS.notes.maxLength} caracteres en notas médicas.`;
    } else if (/[<>{}]/.test(trimmedNotes)) {
      errors.clinicalNotes = 'No se permiten los caracteres <, >, { o }.';
    } else if (
      trimmedNotes.length < ASTRONAUT_LIMITS.notes.minLengthIfPresent ||
      countLetters(trimmedNotes) < 3
    ) {
      errors.clinicalNotes =
        'Si agregas notas clínicas, escribe al menos 5 caracteres descriptivos.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsed: {
      age: ageCheck.value,
      baselineGlucose: glucoseCheck.value,
      baselineSystolic: systolicCheck.value,
      baselineDiastolic: diastolicCheck.value,
      baselineHR: hrCheck.value,
      surgeries: surgeriesCheck.items,
      allergies: allergiesCheck.items,
    },
  };
}

function clampInteger(value: unknown, spec: NumericRangeSpec): number {
  const num = typeof value === 'number' ? Math.round(value) : Number(value);
  if (!Number.isFinite(num)) return spec.fallback;
  return Math.min(spec.max, Math.max(spec.min, num));
}

/** Ensures any persisted or submitted AstronautProfile remains within human medical bounds. */
export function sanitizeAstronautProfile(profile: AstronautProfile): AstronautProfile {
  const fallback = PRELOADED_ASTRONAUTS[0];
  const rawName = typeof profile.name === 'string' ? profile.name.trim() : '';
  const safeName =
    rawName.length >= ASTRONAUT_LIMITS.name.minLength &&
    !/\d/.test(rawName) &&
    countLetters(rawName) >= 2
      ? rawName.slice(0, ASTRONAUT_LIMITS.name.maxLength)
      : fallback.name;

  const rawRole = typeof profile.role === 'string' ? profile.role.trim() : '';
  const safeRole =
    rawRole.length >= ASTRONAUT_LIMITS.role.minLength && countLetters(rawRole) >= 3
      ? rawRole.slice(0, ASTRONAUT_LIMITS.role.maxLength)
      : 'Especialista de Misión';

  const safeAge = clampInteger(profile.age, ASTRONAUT_LIMITS.age);
  const safeBloodType: BloodType = VALID_BLOOD_TYPES.includes(profile.bloodType)
    ? profile.bloodType
    : fallback.bloodType;
  const safeImmune: ImmuneStatus = VALID_IMMUNE_STATUSES.includes(
    profile.clinicalHistory?.immuneStatus
  )
    ? profile.clinicalHistory.immuneStatus
    : 'Normal';

  const safeGlucose = clampInteger(
    profile.clinicalHistory?.baselineGlucose,
    ASTRONAUT_LIMITS.baselineGlucose
  );
  const safeSystolic = clampInteger(
    profile.clinicalHistory?.baselineSystolic,
    ASTRONAUT_LIMITS.baselineSystolic
  );
  const rawDiastolic = clampInteger(
    profile.clinicalHistory?.baselineDiastolic,
    ASTRONAUT_LIMITS.baselineDiastolic
  );
  const maxAllowedDiastolic = Math.min(
    ASTRONAUT_LIMITS.baselineDiastolic.max,
    safeSystolic - ASTRONAUT_LIMITS.minPulsePressure
  );
  const safeDiastolic = Math.max(
    ASTRONAUT_LIMITS.baselineDiastolic.min,
    Math.min(rawDiastolic, maxAllowedDiastolic)
  );
  const safeHR = clampInteger(profile.clinicalHistory?.baselineHR, ASTRONAUT_LIMITS.baselineHR);

  const safeSurgeries = Array.isArray(profile.clinicalHistory?.priorSurgeries)
    ? profile.clinicalHistory.priorSurgeries
        .map((s) => (typeof s === 'string' ? s.trim().slice(0, ASTRONAUT_LIMITS.listField.maxItemLength) : ''))
        .filter((s) => countLetters(s) >= 2)
        .slice(0, ASTRONAUT_LIMITS.listField.maxItems)
    : [];

  const safeAllergies = Array.isArray(profile.clinicalHistory?.allergies)
    ? profile.clinicalHistory.allergies
        .map((a) => (typeof a === 'string' ? a.trim().slice(0, ASTRONAUT_LIMITS.listField.maxItemLength) : ''))
        .filter((a) => countLetters(a) >= 2)
        .slice(0, ASTRONAUT_LIMITS.listField.maxItems)
    : [];

  const rawNotes =
    typeof profile.clinicalHistory?.notes === 'string'
      ? profile.clinicalHistory.notes.trim().slice(0, ASTRONAUT_LIMITS.notes.maxLength)
      : '';

  const parts = safeName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? 'A'}${parts[1][0] ?? 'S'}`.toUpperCase()
      : safeName.slice(0, 2).toUpperCase();

  return {
    id: typeof profile.id === 'string' && profile.id.trim() ? profile.id : 'custom-astronaut',
    name: safeName,
    role: safeRole,
    age: safeAge,
    bloodType: safeBloodType,
    avatarBadge: initials,
    clinicalHistory: {
      immuneStatus: safeImmune,
      priorSurgeries: safeSurgeries.length > 0 ? safeSurgeries : ['Sin cirugías previas'],
      allergies: safeAllergies.length > 0 ? safeAllergies : ['Ninguna conocida'],
      baselineGlucose: safeGlucose,
      baselineBP: `${safeSystolic}/${safeDiastolic} mmHg`,
      baselineSystolic: safeSystolic,
      baselineDiastolic: safeDiastolic,
      baselineHR: safeHR,
      notes: rawNotes || 'Expediente clínico validado previo al despegue.',
    },
  };
}
