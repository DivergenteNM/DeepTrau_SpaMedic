import type React from 'react';
import {
  AstronautProfile,
  BloodType,
  ImmuneStatus,
  LOW_IMMUNE_STATUS_EN,
  LOW_IMMUNE_STATUS_ES,
  PRELOADED_ASTRONAUTS_EN,
  getCanonicalImmuneStatus,
} from '@/data/astronautsData';
import { Language } from '@/i18n/types';

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
  LOW_IMMUNE_STATUS_EN,
  LOW_IMMUNE_STATUS_ES,
];

export interface NumericRangeSpec {
  label: string;
  min: number;
  max: number;
  unit: string;
  maxDigits: number;
  fallback: number;
}

export const ASTRONAUT_LIMITS_EN = {
  name: { minLength: 3, maxLength: 60 },
  role: { minLength: 3, maxLength: 60 },
  age: {
    label: 'Age',
    min: 22,
    max: 65,
    unit: 'years',
    maxDigits: 3,
    fallback: 36,
  } satisfies NumericRangeSpec,
  baselineGlucose: {
    label: 'Baseline glucose',
    min: 65,
    max: 140,
    unit: 'mg/dL',
    maxDigits: 3,
    fallback: 90,
  } satisfies NumericRangeSpec,
  baselineSystolic: {
    label: 'Systolic BP',
    min: 90,
    max: 150,
    unit: 'mmHg',
    maxDigits: 3,
    fallback: 118,
  } satisfies NumericRangeSpec,
  baselineDiastolic: {
    label: 'Diastolic BP',
    min: 55,
    max: 100,
    unit: 'mmHg',
    maxDigits: 3,
    fallback: 76,
  } satisfies NumericRangeSpec,
  minPulsePressure: 15,
  baselineHR: {
    label: 'Resting HR',
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

export const ASTRONAUT_LIMITS_ES = {
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

export const ASTRONAUT_LIMITS = ASTRONAUT_LIMITS_EN;

export function getAstronautLimits(lang: Language = 'en') {
  return lang === 'es' ? ASTRONAUT_LIMITS_ES : ASTRONAUT_LIMITS_EN;
}

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
  spec: NumericRangeSpec,
  lang: Language
): { value: number | null; error?: string } {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {
      value: null,
      error:
        lang === 'es'
          ? `Campo obligatorio (${spec.min}–${spec.max} ${spec.unit}).`
          : `Required field (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      value: null,
      error:
        lang === 'es'
          ? 'Ingresa solo números enteros positivos.'
          : 'Enter positive whole integers only.',
    };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num)) {
    return {
      value: null,
      error: lang === 'es' ? 'Valor numérico fuera de rango.' : 'Numeric value out of range.',
    };
  }
  if (num < spec.min) {
    return {
      value: num,
      error:
        lang === 'es'
          ? `${spec.label} debajo del límite humano permitido (${spec.min}–${spec.max} ${spec.unit}).`
          : `${spec.label} is below safe human limit (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  if (num > spec.max) {
    return {
      value: num,
      error:
        lang === 'es'
          ? `${spec.label} humanamente imposible o fuera de rango (${spec.min}–${spec.max} ${spec.unit}).`
          : `${spec.label} is physiologically out of range (${spec.min}–${spec.max} ${spec.unit}).`,
    };
  }
  return { value: num };
}

function validateCommaSeparatedMedicalList(
  rawValue: string,
  fieldLabel: string,
  example: string,
  lang: Language
): { items: string[]; error?: string } {
  const limits = getAstronautLimits(lang);
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { items: [] };
  }
  if (trimmed.length > limits.listField.maxLength) {
    return {
      items: [],
      error:
        lang === 'es'
          ? `Máximo ${limits.listField.maxLength} caracteres en ${fieldLabel}.`
          : `Maximum ${limits.listField.maxLength} characters in ${fieldLabel}.`,
    };
  }
  if (/[<>{}[\]]/.test(trimmed)) {
    return {
      items: [],
      error:
        lang === 'es'
          ? 'No se permiten los caracteres <, >, {, }, [ o ].'
          : 'Characters <, >, {, }, [, or ] are not allowed.',
    };
  }

  const items = trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return {
      items: [],
      error:
        lang === 'es'
          ? `Escribe una descripción válida (ej. ${example}) o deja el campo vacío.`
          : `Enter a valid description (e.g., ${example}) or leave empty.`,
    };
  }
  if (items.length > limits.listField.maxItems) {
    return {
      items: items.slice(0, limits.listField.maxItems),
      error:
        lang === 'es'
          ? `Máximo ${limits.listField.maxItems} entradas separadas por coma.`
          : `Maximum ${limits.listField.maxItems} comma-separated entries.`,
    };
  }
  for (const item of items) {
    if (item.length > limits.listField.maxItemLength) {
      return {
        items,
        error:
          lang === 'es'
            ? `Cada registro debe tener máximo ${limits.listField.maxItemLength} caracteres.`
            : `Each entry must be at most ${limits.listField.maxItemLength} characters.`,
      };
    }
    if (countLetters(item) < 2) {
      return {
        items,
        error:
          lang === 'es'
            ? `Cada registro en ${fieldLabel} debe ser texto médico legible (ej. ${example}).`
            : `Each entry in ${fieldLabel} must be readable medical text (e.g., ${example}).`,
      };
    }
  }

  return { items };
}

/** Validates all fields of the astronaut registration and baseline medical form. */
export function validateAstronautForm(
  draft: AstronautFormDraft,
  lang: Language = 'en'
): AstronautValidationResult {
  const limits = getAstronautLimits(lang);
  const errors: Partial<Record<AstronautFieldKey, string>> = {};

  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    errors.name =
      lang === 'es'
        ? 'El nombre del astronauta es obligatorio.'
        : 'Astronaut full name is required.';
  } else if (/\d/.test(trimmedName)) {
    errors.name =
      lang === 'es'
        ? 'El nombre humano no puede contener números.'
        : 'Human name cannot contain numbers.';
  } else if (!/^[\p{L}\s.'-]+$/u.test(trimmedName)) {
    errors.name =
      lang === 'es'
        ? 'Usa solo letras, espacios, puntos, guiones o apóstrofes.'
        : 'Use letters, spaces, periods, hyphens, or apostrophes only.';
  } else if (trimmedName.length < limits.name.minLength) {
    errors.name =
      lang === 'es'
        ? `Ingresa al menos ${limits.name.minLength} caracteres.`
        : `Enter at least ${limits.name.minLength} characters.`;
  } else if (trimmedName.length > limits.name.maxLength) {
    errors.name =
      lang === 'es'
        ? `Máximo ${limits.name.maxLength} caracteres.`
        : `Maximum ${limits.name.maxLength} characters.`;
  } else if (countLetters(trimmedName) < 2) {
    errors.name =
      lang === 'es' ? 'Ingresa un nombre completo válido.' : 'Enter a valid full name.';
  }

  const trimmedRole = draft.role.trim();
  if (!trimmedRole) {
    errors.role =
      lang === 'es' ? 'El rol en la misión es obligatorio.' : 'Mission role is required.';
  } else if (trimmedRole.length < limits.role.minLength) {
    errors.role =
      lang === 'es'
        ? `Ingresa al menos ${limits.role.minLength} caracteres para el rol.`
        : `Enter at least ${limits.role.minLength} characters for the role.`;
  } else if (trimmedRole.length > limits.role.maxLength) {
    errors.role =
      lang === 'es'
        ? `Máximo ${limits.role.maxLength} caracteres.`
        : `Maximum ${limits.role.maxLength} characters.`;
  } else if (!/^[\p{L}\p{N}\s.,\-/()]+$/u.test(trimmedRole)) {
    errors.role =
      lang === 'es'
        ? 'Contiene símbolos no permitidos en el rol de misión.'
        : 'Contains unsupported symbols in mission role.';
  } else if (countLetters(trimmedRole) < 3) {
    errors.role =
      lang === 'es'
        ? 'El rol debe describir una función válida (mínimo 3 letras).'
        : 'Role must describe a valid mission function (at least 3 letters).';
  }

  if (!VALID_BLOOD_TYPES.includes(draft.bloodType)) {
    errors.bloodType =
      lang === 'es'
        ? 'Selecciona un grupo sanguíneo humano válido.'
        : 'Select a valid human blood type.';
  }

  if (!VALID_IMMUNE_STATUSES.includes(draft.immuneStatus)) {
    errors.immuneStatus =
      lang === 'es'
        ? 'Selecciona un estado inmunológico válido.'
        : 'Select a valid immune status.';
  }

  const ageCheck = validateIntegerField(draft.age, limits.age, lang);
  if (ageCheck.error) errors.age = ageCheck.error;

  const glucoseCheck = validateIntegerField(draft.baselineGlucose, limits.baselineGlucose, lang);
  if (glucoseCheck.error) errors.baselineGlucose = glucoseCheck.error;

  const systolicCheck = validateIntegerField(
    draft.baselineSystolic,
    limits.baselineSystolic,
    lang
  );
  if (systolicCheck.error) errors.baselineSystolic = systolicCheck.error;

  const diastolicCheck = validateIntegerField(
    draft.baselineDiastolic,
    limits.baselineDiastolic,
    lang
  );
  if (diastolicCheck.error) errors.baselineDiastolic = diastolicCheck.error;

  if (
    systolicCheck.value !== null &&
    diastolicCheck.value !== null &&
    !systolicCheck.error &&
    !diastolicCheck.error
  ) {
    if (diastolicCheck.value >= systolicCheck.value) {
      errors.baselineDiastolic =
        lang === 'es'
          ? `Incoherencia fisiológica: la diastólica (${diastolicCheck.value}) debe ser menor que la sistólica (${systolicCheck.value} mmHg).`
          : `Physiological mismatch: diastolic (${diastolicCheck.value}) must be lower than systolic (${systolicCheck.value} mmHg).`;
    } else if (systolicCheck.value - diastolicCheck.value < limits.minPulsePressure) {
      errors.baselineDiastolic =
        lang === 'es'
          ? `Presión de pulso incompatible: la sistólica debe superar a la diastólica por al menos ${limits.minPulsePressure} mmHg.`
          : `Incompatible pulse pressure: systolic must exceed diastolic by at least ${limits.minPulsePressure} mmHg.`;
    }
  }

  const hrCheck = validateIntegerField(draft.baselineHR, limits.baselineHR, lang);
  if (hrCheck.error) errors.baselineHR = hrCheck.error;

  const surgeriesCheck = validateCommaSeparatedMedicalList(
    draft.surgeryInput,
    lang === 'es' ? 'cirugías' : 'surgeries',
    lang === 'es' ? 'Cirugía de menisco' : 'Meniscus surgery',
    lang
  );
  if (surgeriesCheck.error) errors.surgeryInput = surgeriesCheck.error;

  const allergiesCheck = validateCommaSeparatedMedicalList(
    draft.allergiesInput,
    lang === 'es' ? 'alergias' : 'allergies',
    lang === 'es' ? 'Penicilina' : 'Penicillin',
    lang
  );
  if (allergiesCheck.error) errors.allergiesInput = allergiesCheck.error;

  const trimmedNotes = draft.clinicalNotes.trim();
  if (trimmedNotes) {
    if (trimmedNotes.length > limits.notes.maxLength) {
      errors.clinicalNotes =
        lang === 'es'
          ? `Máximo ${limits.notes.maxLength} caracteres en notas médicas.`
          : `Maximum ${limits.notes.maxLength} characters in clinical notes.`;
    } else if (/[<>{}]/.test(trimmedNotes)) {
      errors.clinicalNotes =
        lang === 'es'
          ? 'No se permiten los caracteres <, >, { o }.'
          : 'Characters <, >, {, or } are not allowed.';
    } else if (
      trimmedNotes.length < limits.notes.minLengthIfPresent ||
      countLetters(trimmedNotes) < 3
    ) {
      errors.clinicalNotes =
        lang === 'es'
          ? 'Si agregas notas clínicas, escribe al menos 5 caracteres descriptivos.'
          : 'If adding clinical notes, enter at least 5 descriptive characters.';
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
export function sanitizeAstronautProfile(
  profile: AstronautProfile,
  lang: Language = 'en'
): AstronautProfile {
  const limits = getAstronautLimits(lang);
  const fallback = PRELOADED_ASTRONAUTS_EN[0];
  const rawName = typeof profile.name === 'string' ? profile.name.trim() : '';
  const safeName =
    rawName.length >= limits.name.minLength && !/\d/.test(rawName) && countLetters(rawName) >= 2
      ? rawName.slice(0, limits.name.maxLength)
      : fallback.name;

  const rawRole = typeof profile.role === 'string' ? profile.role.trim() : '';
  const safeRole =
    rawRole.length >= limits.role.minLength && countLetters(rawRole) >= 3
      ? rawRole.slice(0, limits.role.maxLength)
      : lang === 'es'
        ? 'Especialista de Misión'
        : 'Mission Specialist';

  const safeAge = clampInteger(profile.age, limits.age);
  const safeBloodType: BloodType = VALID_BLOOD_TYPES.includes(profile.bloodType)
    ? profile.bloodType
    : fallback.bloodType;
  const safeImmune: ImmuneStatus = getCanonicalImmuneStatus(
    profile.clinicalHistory?.immuneStatus,
    lang
  );

  const safeGlucose = clampInteger(
    profile.clinicalHistory?.baselineGlucose,
    limits.baselineGlucose
  );
  const safeSystolic = clampInteger(
    profile.clinicalHistory?.baselineSystolic,
    limits.baselineSystolic
  );
  const rawDiastolic = clampInteger(
    profile.clinicalHistory?.baselineDiastolic,
    limits.baselineDiastolic
  );
  const maxAllowedDiastolic = Math.min(
    limits.baselineDiastolic.max,
    safeSystolic - limits.minPulsePressure
  );
  const safeDiastolic = Math.max(
    limits.baselineDiastolic.min,
    Math.min(rawDiastolic, maxAllowedDiastolic)
  );
  const safeHR = clampInteger(profile.clinicalHistory?.baselineHR, limits.baselineHR);

  const safeSurgeries = Array.isArray(profile.clinicalHistory?.priorSurgeries)
    ? profile.clinicalHistory.priorSurgeries
        .map((s) =>
          typeof s === 'string' ? s.trim().slice(0, limits.listField.maxItemLength) : ''
        )
        .filter((s) => countLetters(s) >= 2)
        .slice(0, limits.listField.maxItems)
    : [];

  const safeAllergies = Array.isArray(profile.clinicalHistory?.allergies)
    ? profile.clinicalHistory.allergies
        .map((a) =>
          typeof a === 'string' ? a.trim().slice(0, limits.listField.maxItemLength) : ''
        )
        .filter((a) => countLetters(a) >= 2)
        .slice(0, limits.listField.maxItems)
    : [];

  const rawNotes =
    typeof profile.clinicalHistory?.notes === 'string'
      ? profile.clinicalHistory.notes.trim().slice(0, limits.notes.maxLength)
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
      priorSurgeries:
        safeSurgeries.length > 0
          ? safeSurgeries
          : [lang === 'es' ? 'Sin cirugías previas' : 'No prior surgeries'],
      allergies:
        safeAllergies.length > 0 ? safeAllergies : [lang === 'es' ? 'Ninguna conocida' : 'None known'],
      baselineGlucose: safeGlucose,
      baselineBP: `${safeSystolic}/${safeDiastolic} mmHg`,
      baselineSystolic: safeSystolic,
      baselineDiastolic: safeDiastolic,
      baselineHR: safeHR,
      notes:
        rawNotes ||
        (lang === 'es'
          ? 'Expediente clínico validado previo al despegue.'
          : 'Pre-launch clinical record validated.'),
    },
  };
}
