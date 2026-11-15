'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Compass,
  Droplets,
  HeartPulse,
  Orbit,
  Radio,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Building2,
} from 'lucide-react';
import { MISSIONS_DATA, MissionId } from '@/data/missionsData';
import { AstronautProfile, BloodType, ImmuneStatus, PRELOADED_ASTRONAUTS } from '@/data/astronautsData';
import { useMission } from '@/context/MissionContext';

const MISSION_ICONS: Record<MissionId, React.ReactNode> = {
  'deep-space-transit': <Rocket className="h-6 w-6 text-cyan-400" />,
  'planetary-habitat': <Building2 className="h-6 w-6 text-amber-400" />,
  'space-station': <Orbit className="h-6 w-6 text-emerald-400" />,
  'surface-rover': <Compass className="h-6 w-6 text-sky-400" />,
};

const RISK_BADGE_STYLES: Record<string, string> = {
  Bajo: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Moderado: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  Alto: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  Extremo: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
};

const BLOOD_TYPES: BloodType[] = ['O-', 'O+', 'A+', 'A-', 'B+', 'AB+'];

export function OnboardingFlow() {
  const { mission: currentMission, astronaut: currentAstronaut, completeOnboarding } = useMission();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMissionId, setSelectedMissionId] = useState<MissionId>(currentMission.id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentAstronaut.id);

  // Editable clinical record fields
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
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Subtle Space Telemetry Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.12), transparent 45%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Brand Header */}
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
              <HeartPulse className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  AstroHealth Monitor
                </h1>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                  NASA Space Apps MVP
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Sistema autónomo de telemetría médica, psicología espacial y contramedidas por misión
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                step === 1
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold">
                1
              </span>
              Entorno de Misión
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                step === 2
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold">
                2
              </span>
              Astronauta e Historia Clínica
            </button>
          </div>
        </header>

        {step === 1 ? (
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Paso 1 de 2 · Configuración Operativa
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Selecciona el Entorno de tu Misión Espacial
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Cada entorno adapta los riesgos médicos de la NASA (gravedad, radiación, retraso de
                  comunicación) y ajusta las rutinas diarias del dashboard.
                </p>
              </div>
            </div>

            {/* 4 Mission Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {MISSIONS_DATA.map((m) => {
                const isSelected = m.id === selectedMissionId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMissionId(m.id)}
                    className={`group text-left rounded-2xl border p-5 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900/90 shadow-[0_0_30px_rgba(34,211,238,0.16)]'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950">
                          {MISSION_ICONS[m.id]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{m.name}</h3>
                          <p className="text-xs text-slate-400">{m.subtitle}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          RISK_BADGE_STYLES[m.radiationRiskLevel]
                        }`}
                      >
                        Radiación: {m.radiationRiskLevel}
                      </span>
                    </div>

                    {/* Technical Badges */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                        <span className="text-slate-400 block">Gravedad</span>
                        <span className="font-semibold text-slate-100">{m.gravityLabel}</span>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                        <span className="text-slate-400 block">Enlace con Tierra</span>
                        <span className="font-semibold text-slate-100">{m.commDelay}</span>
                      </div>
                    </div>

                    {/* What changes medically */}
                    <div className="mt-4 space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                        Qué cambia en el monitoreo médico:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {m.whatChangesMedically.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
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
            <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <Radio className="h-4 w-4" />
                  Misión seleccionada: {selectedMission.name}
                </div>
                <p className="text-xs text-slate-400">
                  Prioridades médicas: {selectedMission.medicalPriorities.slice(0, 3).join(' · ')}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Continuar al Expediente del Astronauta
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Paso 2 de 2 · Historia Clínica Pre-Misión (EHR)
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Registro del Astronauta y Línea Base Médica
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Selecciona un perfil pre-cargado por la NASA o edita los datos clínicos antes de
                  iniciar la telemetría para la misión{' '}
                  <span className="font-semibold text-cyan-300">{selectedMission.name}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Cambiar Misión
              </button>
            </div>

            {/* Pre-loaded Astronaut Selector */}
            <div className="grid gap-3 md:grid-cols-3">
              {PRELOADED_ASTRONAUTS.map((astro) => {
                const isActive = selectedTemplateId === astro.id;
                const lowImmune = astro.clinicalHistory.immuneStatus !== 'Normal';
                return (
                  <button
                    key={astro.id}
                    type="button"
                    onClick={() => applyPresetAstronaut(astro)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isActive
                        ? 'border-emerald-400 bg-slate-900 shadow-[0_0_24px_rgba(16,185,129,0.15)]'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-sm font-bold text-emerald-300">
                          {astro.avatarBadge}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{astro.name}</p>
                          <p className="text-[11px] text-slate-400">{astro.role}</p>
                        </div>
                      </div>
                      <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-300">
                        {astro.bloodType}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          lowImmune
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {lowImmune ? 'Defensas Bajas' : 'Inmunidad Normal'}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-slate-300">
                        Glucosa base: {astro.clinicalHistory.baselineGlucose} mg/dL
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clinical Form */}
            <form
              onSubmit={handleLaunchMission}
              className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/75 p-6 lg:grid-cols-3"
            >
              <div className="space-y-4 lg:col-span-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <UserCheck className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-white">
                    Datos del Astronauta e Historial Médico Pre-Vuelo
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Nombre completo del astronauta
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Cmdr. Elena Vance"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Rol en la misión
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Edad</label>
                    <input
                      type="number"
                      min={22}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Tipo de Sangre
                    </label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value as BloodType)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    >
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Estado Inmunológico Base
                    </label>
                    <select
                      value={immuneStatus}
                      onChange={(e) => setImmuneStatus(e.target.value as ImmuneStatus)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
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
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Cirugías o lesiones previas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={surgeryInput}
                      onChange={(e) => setSurgeryInput(e.target.value)}
                      placeholder="Ej. Cirugía de menisco en rodilla derecha"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Alergias registradas
                    </label>
                    <input
                      type="text"
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      placeholder="Ej. Penicilina"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Baseline Vitals */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Glucosa Basal (mg/dL)
                    </label>
                    <input
                      type="number"
                      min={65}
                      max={140}
                      value={baselineGlucose}
                      onChange={(e) => setBaselineGlucose(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Sistólica Base (mmHg)
                    </label>
                    <input
                      type="number"
                      min={90}
                      max={150}
                      value={baselineSystolic}
                      onChange={(e) => setBaselineSystolic(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Diastólica Base (mmHg)
                    </label>
                    <input
                      type="number"
                      min={55}
                      max={100}
                      value={baselineDiastolic}
                      onChange={(e) => setBaselineDiastolic(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      FC Reposo (bpm)
                    </label>
                    <input
                      type="number"
                      min={42}
                      max={95}
                      value={baselineHR}
                      onChange={(e) => setBaselineHR(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Notas médicas previas al lanzamiento
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Right Panel: Live Cross-Reference Preview */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Cruce Inteligente con Historia Clínica
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    AstroHealth cruzará automáticamente estos antecedentes con los sensores de{' '}
                    <span className="font-semibold text-slate-200">{selectedMission.name}</span>:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="flex items-center gap-2 font-semibold text-rose-300">
                        <Droplets className="h-4 w-4" />
                        Sangre {bloodType} & Inmunidad
                      </div>
                      <p className="mt-1 text-slate-400">
                        {immuneStatus !== 'Normal'
                          ? 'Umbral de alerta temprana activado: cualquier caída de leucocitos o pico de radiación disparará protocolo preventivo antes que en un perfil estándar.'
                          : 'Seguimiento estándar de glóbulos blancos frente a radiación cósmica acumulada.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="flex items-center gap-2 font-semibold text-amber-300">
                        {surgeryInput.toLowerCase().includes('rodilla') ||
                        surgeryInput.toLowerCase().includes('hombro') ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        )}
                        Adaptación por Cirugías Previas
                      </div>
                      <p className="mt-1 text-slate-400">
                        {surgeryInput.toLowerCase().includes('rodilla')
                          ? 'Detectada cirugía de rodilla: el planificador reemplazará carrera de alto impacto por ciclismo CEVIS y ARED en rango corto.'
                          : surgeryInput.toLowerCase().includes('hombro')
                            ? 'Detectada cirugía de hombro: se limitarán cargas sobre la cabeza sustituyéndolas por tracción escapular segura.'
                            : 'Sin restricciones articulares detectadas: rutina completa habilitada según gravedad.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="flex items-center gap-2 font-semibold text-cyan-300">
                        <Activity className="h-4 w-4" />
                        Línea Base Metabólica y Vital
                      </div>
                      <p className="mt-1 text-slate-400">
                        Glucosa ref: {baselineGlucose} mg/dL · Presión: {baselineSystolic}/
                        {baselineDiastolic} mmHg · FC: {baselineHR} bpm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {immuneStatus !== 'Normal' && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                      Perfil con sensibilidad inmunológica activada.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.3)] transition hover:bg-emerald-400"
                  >
                    Iniciar Monitorización de Misión
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
