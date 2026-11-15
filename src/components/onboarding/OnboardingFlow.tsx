'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Droplets,
  Orbit,
  Radio,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { MISSIONS_DATA, MissionId } from '@/data/missionsData';
import {
  AstronautProfile,
  BloodType,
  ImmuneStatus,
  PRELOADED_ASTRONAUTS,
} from '@/data/astronautsData';
import { useMission } from '@/context/MissionContext';
import {
  ASTRONAUT_LIMITS,
  AstronautFieldKey,
  AstronautFormDraft,
  VALID_BLOOD_TYPES,
  preventNonIntegerKey,
  sanitizeAstronautProfile,
  sanitizeIntegerInput,
  validateAstronautForm,
} from '@/utils/astronautValidation';

const MISSION_ICONS: Record<MissionId, React.ReactNode> = {
  'deep-space-transit': <Rocket className="h-6 w-6 text-primary" />,
  'planetary-habitat': <Building2 className="h-6 w-6 text-warning" />,
  'space-station': <Orbit className="h-6 w-6 text-secondary" />,
  'surface-rover': <Compass className="h-6 w-6 text-telemetry" />,
};

const RISK_BADGE_STYLES: Record<string, string> = {
  Bajo: 'bg-primary-container text-on-primary-container border-primary/30',
  Moderado: 'bg-telemetry-container text-on-telemetry-container border-telemetry/30',
  Alto: 'bg-warning-container text-on-warning-container border-warning/30',
  Extremo: 'bg-danger-container text-on-danger-container border-danger/30',
};

export function OnboardingFlow() {
  const {
    mission: currentMission,
    astronaut: currentAstronaut,
    hasCompletedWelcome,
    completeOnboarding,
    reopenWelcome,
  } = useMission();

  const [step, setStep] = useState<1 | 2>(1);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<1 | 2 | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prevStep = prevStepRef.current;
    prevStepRef.current = step;

    if (prefersReducedMotion || !stepContainerRef.current) return;

    const easeExpo = 'cubic-bezier(0.16, 1, 0.3, 1)';

    if (step === 1 && (prevStep === 2 || (prevStep === null && hasCompletedWelcome))) {
      const heading = stepContainerRef.current.querySelector<HTMLElement>(
        '[data-choreo="onboard-heading"]'
      );
      const cards = stepContainerRef.current.querySelectorAll<HTMLElement>(
        '[data-choreo="mission-card"]'
      );
      const summary = stepContainerRef.current.querySelector<HTMLElement>(
        '[data-choreo="mission-summary-bar"]'
      );

      heading?.animate(
        [
          { transform: 'translate3d(-24px, 0, 0)', opacity: 0 },
          { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        ],
        { duration: 540, easing: easeExpo, fill: 'both' }
      );

      cards.forEach((card, idx) => {
        card.animate(
          [
            { transform: 'translate3d(0, 22px, 0) scale(0.97)', opacity: 0 },
            { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
          ],
          { duration: 580, delay: 45 + idx * 55, easing: easeExpo, fill: 'both' }
        );
      });

      summary?.animate(
        [
          { transform: 'translate3d(0, 20px, 0) scale(0.98)', opacity: 0 },
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        ],
        { duration: 580, delay: 220, easing: easeExpo, fill: 'both' }
      );
      return;
    }

    if (step === 2) {
      const heading = stepContainerRef.current.querySelector<HTMLElement>(
        '[data-choreo="astro-heading"]'
      );
      const cards = stepContainerRef.current.querySelectorAll<HTMLElement>(
        '[data-choreo="astro-card"]'
      );
      const formPanel = stepContainerRef.current.querySelector<HTMLElement>(
        '[data-choreo="astro-form"]'
      );
      const previewPanel = stepContainerRef.current.querySelector<HTMLElement>(
        '[data-choreo="astro-preview"]'
      );

      heading?.animate(
        [
          { transform: 'translate3d(28px, 0, 0)', opacity: 0 },
          { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        ],
        { duration: 620, easing: easeExpo, fill: 'both' }
      );

      cards.forEach((card, idx) => {
        card.animate(
          [
            {
              transform: 'perspective(900px) translate3d(0, 44px, -20px) rotateX(8deg) scale(0.92)',
              opacity: 0,
            },
            {
              transform: 'perspective(900px) translate3d(0, 0, 0) rotateX(0deg) scale(1)',
              opacity: 1,
            },
          ],
          { duration: 680, delay: 70 + idx * 80, easing: easeExpo, fill: 'both' }
        );
      });

      formPanel?.animate(
        [
          { transform: 'translate3d(0, 40px, 0)', opacity: 0 },
          { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        ],
        { duration: 720, delay: 240, easing: easeExpo, fill: 'both' }
      );

      previewPanel?.animate(
        [
          { transform: 'translate3d(32px, 0, 0) scale(0.97)', opacity: 0 },
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        ],
        { duration: 760, delay: 320, easing: easeExpo, fill: 'both' }
      );
    }
  }, [step]);
  const [selectedMissionId, setSelectedMissionId] = useState<MissionId>(currentMission.id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentAstronaut.id);
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState<string>(currentAstronaut.name);
  const [role, setRole] = useState<string>(currentAstronaut.role);
  const [age, setAge] = useState<string>(String(currentAstronaut.age));
  const [bloodType, setBloodType] = useState<BloodType>(currentAstronaut.bloodType);
  const [immuneStatus, setImmuneStatus] = useState<ImmuneStatus>(
    currentAstronaut.clinicalHistory.immuneStatus
  );
  const [surgeryInput, setSurgeryInput] = useState<string>(
    currentAstronaut.clinicalHistory.priorSurgeries.join(', ')
  );
  const [allergiesInput, setAllergiesInput] = useState<string>(
    currentAstronaut.clinicalHistory.allergies.join(', ')
  );
  const [baselineGlucose, setBaselineGlucose] = useState<string>(
    String(currentAstronaut.clinicalHistory.baselineGlucose)
  );
  const [baselineSystolic, setBaselineSystolic] = useState<string>(
    String(currentAstronaut.clinicalHistory.baselineSystolic)
  );
  const [baselineDiastolic, setBaselineDiastolic] = useState<string>(
    String(currentAstronaut.clinicalHistory.baselineDiastolic)
  );
  const [baselineHR, setBaselineHR] = useState<string>(
    String(currentAstronaut.clinicalHistory.baselineHR)
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    currentAstronaut.clinicalHistory.notes
  );
  const [touched, setTouched] = useState<Partial<Record<AstronautFieldKey, boolean>>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  const draft: AstronautFormDraft = {
    name,
    role,
    age,
    bloodType,
    immuneStatus,
    surgeryInput,
    allergiesInput,
    baselineGlucose,
    baselineSystolic,
    baselineDiastolic,
    baselineHR,
    clinicalNotes,
  };
  const validation = validateAstronautForm(draft);
  const errorCount = Object.keys(validation.errors).length;

  const markTouched = (field: AstronautFieldKey) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const getFieldError = (
    field: AstronautFieldKey,
    rawValue: string
  ): string | undefined => {
    const err = validation.errors[field];
    if (!err) return undefined;
    // Show non-empty out-of-range/invalid format errors immediately; wait for blur/submit if empty.
    if (hasAttemptedSubmit || touched[field] || rawValue.trim().length > 0) {
      return err;
    }
    return undefined;
  };

  const fieldInputClass = (hasError: boolean, extra = '') =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:ring-2 ${
      hasError
        ? 'border-danger bg-danger-container/25 focus:border-danger focus:ring-danger/20'
        : 'border-outline bg-surface focus:border-primary focus:ring-primary/15'
    } ${extra}`.trim();

  const selectedMission =
    MISSIONS_DATA.find((m) => m.id === selectedMissionId) ?? MISSIONS_DATA[0];

  const applyPresetAstronaut = (preset: AstronautProfile) => {
    setSelectedTemplateId(preset.id);
    setName(preset.name);
    setRole(preset.role);
    setAge(String(preset.age));
    setBloodType(preset.bloodType);
    setImmuneStatus(preset.clinicalHistory.immuneStatus);
    setSurgeryInput(preset.clinicalHistory.priorSurgeries.join(', '));
    setAllergiesInput(preset.clinicalHistory.allergies.join(', '));
    setBaselineGlucose(String(preset.clinicalHistory.baselineGlucose));
    setBaselineSystolic(String(preset.clinicalHistory.baselineSystolic));
    setBaselineDiastolic(String(preset.clinicalHistory.baselineDiastolic));
    setBaselineHR(String(preset.clinicalHistory.baselineHR));
    setClinicalNotes(preset.clinicalHistory.notes);
    setTouched({});
    setHasAttemptedSubmit(false);
  };

  const handleLaunchMission = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validation.isValid) {
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    const cleanedName = name.trim();
    const parts = cleanedName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0] ?? 'A'}${parts[1][0] ?? 'S'}`.toUpperCase()
        : cleanedName.slice(0, 2).toUpperCase();

    const finalProfile = sanitizeAstronautProfile({
      id: selectedTemplateId || 'custom-astronaut',
      name: cleanedName,
      role: role.trim(),
      age: validation.parsed.age ?? ASTRONAUT_LIMITS.age.fallback,
      bloodType,
      avatarBadge: initials,
      clinicalHistory: {
        immuneStatus,
        priorSurgeries:
          validation.parsed.surgeries.length > 0
            ? validation.parsed.surgeries
            : ['Sin cirugías previas'],
        allergies:
          validation.parsed.allergies.length > 0
            ? validation.parsed.allergies
            : ['Ninguna conocida'],
        baselineGlucose:
          validation.parsed.baselineGlucose ?? ASTRONAUT_LIMITS.baselineGlucose.fallback,
        baselineBP: `${validation.parsed.baselineSystolic}/${validation.parsed.baselineDiastolic} mmHg`,
        baselineSystolic:
          validation.parsed.baselineSystolic ?? ASTRONAUT_LIMITS.baselineSystolic.fallback,
        baselineDiastolic:
          validation.parsed.baselineDiastolic ?? ASTRONAUT_LIMITS.baselineDiastolic.fallback,
        baselineHR: validation.parsed.baselineHR ?? ASTRONAUT_LIMITS.baselineHR.fallback,
        notes: clinicalNotes.trim() || 'Expediente clínico validado previo al despegue.',
      },
    });

    completeOnboarding(selectedMission.id, finalProfile);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface relative">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Brand Header */}
        <header
          data-choreo="onboard-header"
          className="mb-8 flex flex-col gap-4 border-b border-outline pb-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={reopenWelcome}
              title="Ver portada de bienvenida DeepTrau"
              data-choreo="onboard-logo-target"
              className="group flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-outline bg-surface-container-low/70 p-1 dt-transition hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-sm active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <Image
                src="/DeepTrau_logo.webp"
                alt="Logo de DeepTrau"
                width={56}
                height={56}
                className="h-full w-full scale-[1.35] object-contain mix-blend-multiply dt-transition group-hover:scale-[1.42]"
                priority
              />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[28px] leading-[36px] font-bold tracking-[-0.02em] text-on-surface font-display">
                  DeepTrau
                </h1>
                <span className="rounded-full border border-primary/25 bg-primary-container px-2.5 py-0.5 text-[11px] font-semibold text-on-primary-container font-mono">
                  SpaMedic · NASA Space Apps
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Sistema autónomo de telemetría médica, psicología espacial y contramedidas por misión
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-1.5 rounded-xl border border-outline bg-surface-container p-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                step === 1
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold font-mono dt-transition ${
                  step === 1
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                1
              </span>
              Entorno de Misión
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                step === 2
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold font-mono dt-transition ${
                  step === 2
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                2
              </span>
              Astronauta e Historia Clínica
            </button>
          </div>
        </header>

        <div ref={stepContainerRef}>
        {step === 1 ? (
          <section className="space-y-6">
            <div data-choreo="onboard-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
                Paso 1 de 2 · Configuración Operativa
              </p>
              <h2 className="mt-1 text-[22px] leading-[28px] font-bold tracking-[-0.01em] text-on-surface font-display">
                Selecciona el Entorno de tu Misión Espacial
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Cada entorno adapta los riesgos médicos de la NASA (gravedad, radiación, retraso de
                comunicación) y ajusta las rutinas diarias del dashboard.
              </p>
            </div>

            {/* 4 Mission Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {MISSIONS_DATA.map((m) => {
                const isSelected = m.id === selectedMissionId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-choreo="mission-card"
                    onClick={() => setSelectedMissionId(m.id)}
                    className={`group cursor-pointer text-left rounded-2xl border p-5 dt-transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      isSelected
                        ? 'border-primary bg-surface-container dt-selected-ring'
                        : 'border-outline bg-surface-container hover:border-primary/50 hover:bg-surface-container-low hover:shadow-[0_10px_24px_-14px_rgba(47,93,70,0.22)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-outline bg-surface-container-low dt-transition group-hover:scale-105 group-hover:border-primary/35">
                          {MISSION_ICONS[m.id]}
                        </div>
                        <div>
                          <h3 className="text-[18px] leading-[24px] font-semibold text-on-surface font-display">
                            {m.name}
                          </h3>
                          <p className="text-[13px] text-on-surface-variant">{m.subtitle}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold font-mono ${
                          RISK_BADGE_STYLES[m.radiationRiskLevel]
                        }`}
                      >
                        Radiación: {m.radiationRiskLevel}
                      </span>
                    </div>

                    {/* Technical Badges */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2">
                        <span className="text-on-surface-variant block">Gravedad</span>
                        <span className="font-semibold text-on-surface font-display">
                          {m.gravityLabel}
                        </span>
                      </div>
                      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2">
                        <span className="text-on-surface-variant block">Enlace con Tierra</span>
                        <span className="font-semibold text-on-surface font-display">
                          {m.commDelay}
                        </span>
                      </div>
                    </div>

                    {/* What changes medically */}
                    <div className="mt-4 space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary font-display">
                        Qué cambia en el monitoreo médico:
                      </p>
                      <ul className="space-y-1 text-[13px] text-on-surface-variant">
                        {m.whatChangesMedically.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Mission Summary + Continue CTA */}
            <div
              data-choreo="mission-summary-bar"
              className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary-container p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-primary-container font-display">
                  <Radio className="h-4 w-4 text-primary" />
                  Misión seleccionada: {selectedMission.name}
                </div>
                <p className="text-[13px] text-on-primary-container/85">
                  Prioridades médicas: {selectedMission.medicalPriorities.slice(0, 3).join(' · ')}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                Continuar al Expediente del Astronauta
                <ArrowRight className="h-4 w-4 dt-transition group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div
              data-choreo="astro-heading"
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
                  Paso 2 de 2 · Historia Clínica Pre-Misión (EHR)
                </p>
                <h2 className="mt-1 text-[22px] leading-[28px] font-bold tracking-[-0.01em] text-on-surface font-display">
                  Registro del Astronauta y Línea Base Médica
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Selecciona un perfil pre-cargado por la NASA o edita los datos clínicos antes de
                  iniciar la telemetría para{' '}
                  <span className="font-semibold text-primary">{selectedMission.name}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="group inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-outline bg-surface-container px-3.5 py-2 text-xs font-semibold text-on-surface dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                <ChevronLeft className="h-4 w-4 dt-transition group-hover:-translate-x-0.5" />
                Cambiar Misión
              </button>
            </div>

            {/* Pre-loaded Astronaut Selector */}
            <div className="grid gap-4 md:grid-cols-3">
              {PRELOADED_ASTRONAUTS.map((astro) => {
                const isActive = selectedTemplateId === astro.id;
                const lowImmune = astro.clinicalHistory.immuneStatus !== 'Normal';
                return (
                  <button
                    key={astro.id}
                    type="button"
                    data-choreo="astro-card"
                    onClick={() => applyPresetAstronaut(astro)}
                    className={`group cursor-pointer rounded-2xl border p-4 text-left dt-transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      isActive
                        ? 'border-primary bg-surface-container dt-selected-ring'
                        : 'border-outline bg-surface-container hover:border-primary/50 hover:bg-surface-container-low hover:shadow-[0_8px_20px_-12px_rgba(47,93,70,0.2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary-container text-sm font-bold text-on-primary-container dt-transition group-hover:scale-105 font-display">
                          {astro.avatarBadge}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface font-display">
                            {astro.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">{astro.role}</p>
                        </div>
                      </div>
                      <span className="rounded-lg border border-danger/30 bg-danger-container px-2 py-0.5 text-xs font-bold text-on-danger-container font-mono">
                        {astro.bloodType}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-semibold ${
                          lowImmune
                            ? 'bg-warning-container text-on-warning-container border-warning/30'
                            : 'bg-primary-container text-on-primary-container border-primary/30'
                        }`}
                      >
                        {lowImmune ? 'Defensas Bajas' : 'Inmunidad Normal'}
                      </span>
                      <span className="rounded-full border border-outline bg-surface-container-low px-2.5 py-0.5 text-on-surface-variant font-mono">
                        Glucosa: {astro.clinicalHistory.baselineGlucose} mg/dL
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clinical Form */}
            <form
              ref={formRef}
              noValidate
              onSubmit={handleLaunchMission}
              className="grid gap-6 rounded-2xl border border-outline bg-surface-container p-6 lg:grid-cols-3"
            >
              <div data-choreo="astro-form" className="space-y-4 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-on-surface font-display">
                      Datos del Astronauta e Historial Médico Pre-Vuelo
                    </h3>
                  </div>
                  <span className="rounded-full border border-outline bg-surface-container-low px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant font-mono">
                    Validación fisiológica activa
                  </span>
                </div>

                {(() => {
                  const nameError = getFieldError('name', name);
                  const roleError = getFieldError('role', role);
                  return (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="astro-name"
                          className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                        >
                          <span>Nombre completo del astronauta</span>
                          <span className="font-mono text-[10px] font-normal">Solo letras</span>
                        </label>
                        <input
                          id="astro-name"
                          type="text"
                          required
                          maxLength={ASTRONAUT_LIMITS.name.maxLength}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => markTouched('name')}
                          aria-invalid={Boolean(nameError)}
                          aria-describedby={nameError ? 'astro-name-error' : undefined}
                          placeholder="Ej. Cmdr. Elena Vance"
                          className={fieldInputClass(Boolean(nameError))}
                        />
                        {nameError && (
                          <p
                            id="astro-name-error"
                            role="alert"
                            className="mt-1 text-[11px] font-medium text-danger"
                          >
                            {nameError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="astro-role"
                          className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                        >
                          <span>Rol en la misión</span>
                          <span className="font-mono text-[10px] font-normal">
                            {ASTRONAUT_LIMITS.role.minLength}–{ASTRONAUT_LIMITS.role.maxLength} car.
                          </span>
                        </label>
                        <input
                          id="astro-role"
                          type="text"
                          required
                          maxLength={ASTRONAUT_LIMITS.role.maxLength}
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          onBlur={() => markTouched('role')}
                          aria-invalid={Boolean(roleError)}
                          aria-describedby={roleError ? 'astro-role-error' : undefined}
                          placeholder="Ej. Comandante de Misión"
                          className={fieldInputClass(Boolean(roleError))}
                        />
                        {roleError && (
                          <p
                            id="astro-role-error"
                            role="alert"
                            className="mt-1 text-[11px] font-medium text-danger"
                          >
                            {roleError}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="grid gap-4 sm:grid-cols-3">
                  {(() => {
                    const ageError = getFieldError('age', age);
                    return (
                      <div>
                        <label
                          htmlFor="astro-age"
                          className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                        >
                          <span>Edad</span>
                          <span className="font-mono text-[10px] font-normal">
                            {ASTRONAUT_LIMITS.age.min}–{ASTRONAUT_LIMITS.age.max}{' '}
                            {ASTRONAUT_LIMITS.age.unit}
                          </span>
                        </label>
                        <input
                          id="astro-age"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={ASTRONAUT_LIMITS.age.maxDigits}
                          value={age}
                          onKeyDown={preventNonIntegerKey}
                          onChange={(e) =>
                            setAge(
                              sanitizeIntegerInput(e.target.value, ASTRONAUT_LIMITS.age.maxDigits)
                            )
                          }
                          onBlur={() => markTouched('age')}
                          aria-invalid={Boolean(ageError)}
                          aria-describedby={ageError ? 'astro-age-error' : undefined}
                          placeholder="36"
                          className={fieldInputClass(Boolean(ageError), 'font-mono')}
                        />
                        {ageError && (
                          <p
                            id="astro-age-error"
                            role="alert"
                            className="mt-1 text-[11px] font-medium text-danger"
                          >
                            {ageError}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  <div>
                    <label
                      htmlFor="astro-blood"
                      className="mb-1.5 block text-xs font-semibold text-on-surface-variant"
                    >
                      Tipo de Sangre
                    </label>
                    <select
                      id="astro-blood"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value as BloodType)}
                      className="w-full cursor-pointer rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    >
                      {VALID_BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="astro-immune"
                      className="mb-1.5 block text-xs font-semibold text-on-surface-variant"
                    >
                      Estado Inmunológico Base
                    </label>
                    <select
                      id="astro-immune"
                      value={immuneStatus}
                      onChange={(e) => setImmuneStatus(e.target.value as ImmuneStatus)}
                      className="w-full cursor-pointer rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Defensas Bajas (Tendencia a leucopenia/reactivación viral)">
                        Defensas Bajas (Tendencia a leucopenia)
                      </option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const surgeryError = getFieldError('surgeryInput', surgeryInput);
                  const allergyError = getFieldError('allergiesInput', allergiesInput);
                  return (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="astro-surgeries"
                          className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                        >
                          <span>Cirugías o lesiones previas (por coma)</span>
                          <span className="font-mono text-[10px] font-normal">
                            Máx. {ASTRONAUT_LIMITS.listField.maxItems}
                          </span>
                        </label>
                        <input
                          id="astro-surgeries"
                          type="text"
                          maxLength={ASTRONAUT_LIMITS.listField.maxLength}
                          value={surgeryInput}
                          onChange={(e) => setSurgeryInput(e.target.value)}
                          onBlur={() => markTouched('surgeryInput')}
                          aria-invalid={Boolean(surgeryError)}
                          aria-describedby={surgeryError ? 'astro-surgeries-error' : undefined}
                          placeholder="Ej. Cirugía de menisco en rodilla derecha"
                          className={fieldInputClass(Boolean(surgeryError))}
                        />
                        {surgeryError && (
                          <p
                            id="astro-surgeries-error"
                            role="alert"
                            className="mt-1 text-[11px] font-medium text-danger"
                          >
                            {surgeryError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="astro-allergies"
                          className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                        >
                          <span>Alergias registradas</span>
                          <span className="font-mono text-[10px] font-normal">
                            Máx. {ASTRONAUT_LIMITS.listField.maxItems}
                          </span>
                        </label>
                        <input
                          id="astro-allergies"
                          type="text"
                          maxLength={ASTRONAUT_LIMITS.listField.maxLength}
                          value={allergiesInput}
                          onChange={(e) => setAllergiesInput(e.target.value)}
                          onBlur={() => markTouched('allergiesInput')}
                          aria-invalid={Boolean(allergyError)}
                          aria-describedby={allergyError ? 'astro-allergies-error' : undefined}
                          placeholder="Ej. Penicilina"
                          className={fieldInputClass(Boolean(allergyError))}
                        />
                        {allergyError && (
                          <p
                            id="astro-allergies-error"
                            role="alert"
                            className="mt-1 text-[11px] font-medium text-danger"
                          >
                            {allergyError}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Baseline Vitals */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {(
                    [
                      {
                        key: 'baselineGlucose',
                        id: 'astro-glucose',
                        label: 'Glucosa Basal (mg/dL)',
                        value: baselineGlucose,
                        setter: setBaselineGlucose,
                        spec: ASTRONAUT_LIMITS.baselineGlucose,
                      },
                      {
                        key: 'baselineSystolic',
                        id: 'astro-systolic',
                        label: 'Sistólica Base (mmHg)',
                        value: baselineSystolic,
                        setter: setBaselineSystolic,
                        spec: ASTRONAUT_LIMITS.baselineSystolic,
                      },
                      {
                        key: 'baselineDiastolic',
                        id: 'astro-diastolic',
                        label: 'Diastólica Base (mmHg)',
                        value: baselineDiastolic,
                        setter: setBaselineDiastolic,
                        spec: ASTRONAUT_LIMITS.baselineDiastolic,
                      },
                      {
                        key: 'baselineHR',
                        id: 'astro-hr',
                        label: 'FC Reposo (bpm)',
                        value: baselineHR,
                        setter: setBaselineHR,
                        spec: ASTRONAUT_LIMITS.baselineHR,
                      },
                    ] as const
                  ).map((vital) => {
                    const vitalError = getFieldError(vital.key, vital.value);
                    return (
                      <div key={vital.key}>
                        <label
                          htmlFor={vital.id}
                          className="mb-1.5 block text-xs font-semibold text-on-surface-variant"
                        >
                          <span>{vital.label}</span>
                          <span className="mt-0.5 block font-mono text-[10px] font-normal text-on-surface-variant/85">
                            Rango: {vital.spec.min}–{vital.spec.max}
                          </span>
                        </label>
                        <input
                          id={vital.id}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={vital.spec.maxDigits}
                          value={vital.value}
                          onKeyDown={preventNonIntegerKey}
                          onChange={(e) =>
                            vital.setter(
                              sanitizeIntegerInput(e.target.value, vital.spec.maxDigits)
                            )
                          }
                          onBlur={() => markTouched(vital.key)}
                          aria-invalid={Boolean(vitalError)}
                          aria-describedby={vitalError ? `${vital.id}-error` : undefined}
                          placeholder={String(vital.spec.fallback)}
                          className={fieldInputClass(Boolean(vitalError), 'px-3 py-2 font-mono')}
                        />
                        {vitalError && (
                          <p
                            id={`${vital.id}-error`}
                            role="alert"
                            className="mt-1 text-[11px] font-medium leading-snug text-danger"
                          >
                            {vitalError}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const notesError = getFieldError('clinicalNotes', clinicalNotes);
                  return (
                    <div>
                      <label
                        htmlFor="astro-notes"
                        className="mb-1.5 flex items-center justify-between text-xs font-semibold text-on-surface-variant"
                      >
                        <span>Notas médicas previas al lanzamiento</span>
                        <span className="font-mono text-[10px] font-normal">
                          {clinicalNotes.length}/{ASTRONAUT_LIMITS.notes.maxLength}
                        </span>
                      </label>
                      <textarea
                        id="astro-notes"
                        rows={2}
                        maxLength={ASTRONAUT_LIMITS.notes.maxLength}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        onBlur={() => markTouched('clinicalNotes')}
                        aria-invalid={Boolean(notesError)}
                        aria-describedby={notesError ? 'astro-notes-error' : undefined}
                        placeholder="Observaciones médicas previas al despegue (opcional)"
                        className={fieldInputClass(Boolean(notesError), 'py-2')}
                      />
                      {notesError && (
                        <p
                          id="astro-notes-error"
                          role="alert"
                          className="mt-1 text-[11px] font-medium text-danger"
                        >
                          {notesError}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right Panel: Live Cross-Reference Preview */}
              <div
                data-choreo="astro-preview"
                className="flex flex-col justify-between rounded-2xl border border-outline bg-surface-container-low p-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary font-display">
                    <Sparkles className="h-4 w-4" />
                    Cruce Inteligente con Historia Clínica
                  </div>
                  <p className="text-[13px] leading-relaxed text-on-surface-variant">
                    DeepTrau cruzará automáticamente estos antecedentes con los sensores de{' '}
                    <span className="font-semibold text-on-surface">{selectedMission.name}</span>:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="rounded-xl border border-outline bg-surface-container p-3">
                      <div className="flex items-center gap-2 font-semibold text-danger font-display">
                        <Droplets className="h-4 w-4" />
                        Sangre {bloodType} & Inmunidad
                      </div>
                      <p className="mt-1 text-on-surface-variant">
                        {immuneStatus !== 'Normal'
                          ? 'Umbral de alerta temprana activado: cualquier caída de leucocitos o pico de radiación disparará protocolo preventivo antes que en un perfil estándar.'
                          : 'Seguimiento estándar de glóbulos blancos frente a radiación cósmica acumulada.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline bg-surface-container p-3">
                      <div className="flex items-center gap-2 font-semibold text-on-surface font-display">
                        {surgeryInput.toLowerCase().includes('rodilla') ||
                        surgeryInput.toLowerCase().includes('hombro') ? (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        )}
                        Adaptación por Cirugías Previas
                      </div>
                      <p className="mt-1 text-on-surface-variant">
                        {surgeryInput.toLowerCase().includes('rodilla')
                          ? 'Detectada cirugía de rodilla: el planificador reemplazará carrera de alto impacto por ciclismo CEVIS y ARED en rango corto.'
                          : surgeryInput.toLowerCase().includes('hombro')
                            ? 'Detectada cirugía de hombro: se limitarán cargas sobre la cabeza sustituyéndolas por tracción escapular segura.'
                            : 'Sin restricciones articulares detectadas: rutina completa habilitada según gravedad.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline bg-surface-container p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-semibold text-telemetry font-display">
                          <Activity className="h-4 w-4" />
                          Línea Base Metabólica y Vital
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-mono ${
                            validation.errors.baselineGlucose ||
                            validation.errors.baselineSystolic ||
                            validation.errors.baselineDiastolic ||
                            validation.errors.baselineHR
                              ? 'bg-danger-container text-on-danger-container'
                              : 'bg-primary-container text-on-primary-container'
                          }`}
                        >
                          {validation.errors.baselineGlucose ||
                          validation.errors.baselineSystolic ||
                          validation.errors.baselineDiastolic ||
                          validation.errors.baselineHR
                            ? 'Fuera de rango'
                            : 'Válido'}
                        </span>
                      </div>
                      <p className="mt-1 text-on-surface-variant font-mono text-[11px]">
                        Glucosa: {baselineGlucose || '—'} mg/dL · PA:{' '}
                        {baselineSystolic || '—'}/{baselineDiastolic || '—'} mmHg · FC:{' '}
                        {baselineHR || '—'} bpm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {hasAttemptedSubmit && !validation.isValid && (
                    <div
                      role="alert"
                      className="dt-animate-panel flex items-start gap-2 rounded-xl border border-danger/35 bg-danger-container px-3 py-2.5 text-[11px] font-medium text-on-danger-container"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                      <span>
                        Corrige {errorCount === 1 ? 'el campo marcado' : `los ${errorCount} campos marcados`} con datos humanamente posibles para iniciar la monitorización.
                      </span>
                    </div>
                  )}
                  {immuneStatus !== 'Normal' && (
                    <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-container px-3 py-2 text-[11px] font-medium text-on-warning-container">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
                      Perfil con sensibilidad inmunológica activada.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
                  >
                    Iniciar Monitorización de Misión
                    <ArrowRight className="h-4 w-4 dt-transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}
