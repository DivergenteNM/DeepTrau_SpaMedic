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

const BLOOD_TYPES: BloodType[] = ['O-', 'O+', 'A+', 'A-', 'B+', 'AB+'];

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

  const [name, setName] = useState<string>(currentAstronaut.name);
  const [role, setRole] = useState<string>(currentAstronaut.role);
  const [age, setAge] = useState<number>(currentAstronaut.age);
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
  const [baselineGlucose, setBaselineGlucose] = useState<number>(
    currentAstronaut.clinicalHistory.baselineGlucose
  );
  const [baselineSystolic, setBaselineSystolic] = useState<number>(
    currentAstronaut.clinicalHistory.baselineSystolic
  );
  const [baselineDiastolic, setBaselineDiastolic] = useState<number>(
    currentAstronaut.clinicalHistory.baselineDiastolic
  );
  const [baselineHR, setBaselineHR] = useState<number>(
    currentAstronaut.clinicalHistory.baselineHR
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    currentAstronaut.clinicalHistory.notes
  );

  const selectedMission =
    MISSIONS_DATA.find((m) => m.id === selectedMissionId) ?? MISSIONS_DATA[0];

  const applyPresetAstronaut = (preset: AstronautProfile) => {
    setSelectedTemplateId(preset.id);
    setName(preset.name);
    setRole(preset.role);
    setAge(preset.age);
    setBloodType(preset.bloodType);
    setImmuneStatus(preset.clinicalHistory.immuneStatus);
    setSurgeryInput(preset.clinicalHistory.priorSurgeries.join(', '));
    setAllergiesInput(preset.clinicalHistory.allergies.join(', '));
    setBaselineGlucose(preset.clinicalHistory.baselineGlucose);
    setBaselineSystolic(preset.clinicalHistory.baselineSystolic);
    setBaselineDiastolic(preset.clinicalHistory.baselineDiastolic);
    setBaselineHR(preset.clinicalHistory.baselineHR);
    setClinicalNotes(preset.clinicalHistory.notes);
  };

  const handleLaunchMission = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = name.trim() || 'Astronauta en Misión';
    const parts = cleanedName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0] ?? 'A'}${parts[1][0] ?? 'S'}`.toUpperCase()
        : cleanedName.slice(0, 2).toUpperCase();

    const surgeries = surgeryInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allergies = allergiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalProfile: AstronautProfile = {
      id: selectedTemplateId || 'custom-astronaut',
      name: cleanedName,
      role: role.trim() || 'Especialista de Misión',
      age: Number(age) || 36,
      bloodType,
      avatarBadge: initials,
      clinicalHistory: {
        immuneStatus,
        priorSurgeries: surgeries.length > 0 ? surgeries : ['Sin cirugías previas'],
        allergies: allergies.length > 0 ? allergies : ['Ninguna conocida'],
        baselineGlucose: Number(baselineGlucose) || 90,
        baselineBP: `${baselineSystolic}/${baselineDiastolic} mmHg`,
        baselineSystolic: Number(baselineSystolic) || 118,
        baselineDiastolic: Number(baselineDiastolic) || 76,
        baselineHR: Number(baselineHR) || 60,
        notes: clinicalNotes.trim() || 'Expediente clínico validado previo al despegue.',
      },
    };

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
              onSubmit={handleLaunchMission}
              className="grid gap-6 rounded-2xl border border-outline bg-surface-container p-6 lg:grid-cols-3"
            >
              <div data-choreo="astro-form" className="space-y-4 lg:col-span-2">
                <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold text-on-surface font-display">
                    Datos del Astronauta e Historial Médico Pre-Vuelo
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Nombre completo del astronauta
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Cmdr. Elena Vance"
                      className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Rol en la misión
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Edad
                    </label>
                    <input
                      type="number"
                      min={22}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Tipo de Sangre
                    </label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value as BloodType)}
                      className="w-full cursor-pointer rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    >
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Estado Inmunológico Base
                    </label>
                    <select
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Cirugías o lesiones previas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={surgeryInput}
                      onChange={(e) => setSurgeryInput(e.target.value)}
                      placeholder="Ej. Cirugía de menisco en rodilla derecha"
                      className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Alergias registradas
                    </label>
                    <input
                      type="text"
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      placeholder="Ej. Penicilina"
                      className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                {/* Baseline Vitals */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Glucosa Basal (mg/dL)
                    </label>
                    <input
                      type="number"
                      min={65}
                      max={140}
                      value={baselineGlucose}
                      onChange={(e) => setBaselineGlucose(Number(e.target.value))}
                      className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Sistólica Base (mmHg)
                    </label>
                    <input
                      type="number"
                      min={90}
                      max={150}
                      value={baselineSystolic}
                      onChange={(e) => setBaselineSystolic(Number(e.target.value))}
                      className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      Diastólica Base (mmHg)
                    </label>
                    <input
                      type="number"
                      min={55}
                      max={100}
                      value={baselineDiastolic}
                      onChange={(e) => setBaselineDiastolic(Number(e.target.value))}
                      className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                      FC Reposo (bpm)
                    </label>
                    <input
                      type="number"
                      min={42}
                      max={95}
                      value={baselineHR}
                      onChange={(e) => setBaselineHR(Number(e.target.value))}
                      className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                    Notas médicas previas al lanzamiento
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2 text-sm text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
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
                      <div className="flex items-center gap-2 font-semibold text-telemetry font-display">
                        <Activity className="h-4 w-4" />
                        Línea Base Metabólica y Vital
                      </div>
                      <p className="mt-1 text-on-surface-variant font-mono text-[11px]">
                        Glucosa: {baselineGlucose} mg/dL · PA: {baselineSystolic}/{baselineDiastolic}{' '}
                        mmHg · FC: {baselineHR} bpm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
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
