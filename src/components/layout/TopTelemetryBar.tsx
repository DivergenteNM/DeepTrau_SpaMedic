'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ChevronLeft,
  Clock,
  Droplets,
  Gauge,
  Home,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DemoScenario, useMission } from '@/context/MissionContext';
import { TriageLevel } from '@/data/medicalKnowledge';
import { LanguageSwitcher } from './LanguageSwitcher';

export function TopTelemetryBar() {
  const {
    language,
    mission,
    astronaut,
    missionDay,
    globalTriage,
    reopenOnboarding,
    triggerDemoAnomaly,
    resetDemoData,
    resetFullDemoExperience,
    openSosOverlay,
    simulateLiveCrisis,
    restoreNominalVitals,
    activeCrisisScenario,
  } = useMission();

  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
  const [isCrisisMenuOpen, setIsCrisisMenuOpen] = useState(false);
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTestDrawerOpen && !isCrisisMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTestDrawerOpen(false);
        setIsCrisisMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerContainerRef.current &&
        !drawerContainerRef.current.contains(event.target as Node)
      ) {
        setIsTestDrawerOpen(false);
        setIsCrisisMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTestDrawerOpen, isCrisisMenuOpen]);

  const triageBadgeMap: Record<
    TriageLevel,
    { label: string; classes: string; icon: React.ReactNode }
  > = {
    nominal: {
      label: language === 'es' ? 'ESTADO NOMINAL' : 'NOMINAL STATUS',
      classes: 'border-primary/30 bg-primary-container text-on-primary-container',
      icon: <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
    },
    warning: {
      label: language === 'es' ? 'PRECAUCIÓN ACTIVA' : 'ACTIVE CAUTION',
      classes: 'border-warning/35 bg-warning-container text-on-warning-container',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
    },
    critical: {
      label: language === 'es' ? 'ALERTA CRÍTICA' : 'CRITICAL ALERT',
      classes: 'border-danger/45 bg-danger-container text-on-danger-container animate-pulse',
      icon: <ShieldAlert className="h-3.5 w-3.5 text-danger" />,
    },
  };

  const badge = triageBadgeMap[globalTriage];
  const hasLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

  const scenarios: { id: DemoScenario; label: string; style: string }[] = [
    {
      id: 'nominal',
      label: 'Nominal',
      style:
        'border-primary/30 bg-primary-container/60 text-on-primary-container hover:bg-primary-container',
    },
    {
      id: 'solar_storm',
      label: language === 'es' ? 'Tormenta Solar' : 'Solar Storm',
      style:
        'border-danger/35 bg-danger-container/70 text-on-danger-container hover:bg-danger-container',
    },
    {
      id: 'hypoglycemia_immune',
      label: language === 'es' ? 'Glucosa + Defensas' : 'Glucose + Defenses',
      style:
        'border-warning/35 bg-warning-container/70 text-on-warning-container hover:bg-warning-container',
    },
    {
      id: 'isolation_fatigue',
      label: language === 'es' ? 'Fatiga Mental' : 'Mental Fatigue',
      style:
        'border-telemetry/35 bg-telemetry-container/70 text-on-telemetry-container hover:bg-telemetry-container',
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-surface-container/95 backdrop-blur-md">
      <div className="relative flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
        {/* Left: Clean Inline Mission & Astronaut Summary */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mission Pill */}
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span className="truncate text-xs font-bold text-on-surface font-display">
              {mission.shortName}
            </span>
            <span className="text-xs text-outline">|</span>
            <span className="shrink-0 font-mono text-xs font-semibold text-primary">
              {language === 'es' ? 'DÍA' : 'DAY'} {missionDay}/{mission.durationDays}
            </span>
          </div>

          {/* Subtle Inline Clinical Metadata */}
          <div className="hidden items-center gap-2.5 text-xs text-on-surface-variant md:flex">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              <span>{mission.gravityLabel}</span>
            </span>

            <span className="hidden h-3.5 w-px bg-outline xl:inline-block" />

            <span className="hidden items-center gap-1.5 xl:inline-flex">
              <Radio className="h-3.5 w-3.5 text-telemetry" />
              <span>
                {language === 'es' ? 'Enlace' : 'Link'}: {mission.commDelay}
              </span>
            </span>

            <span className="h-3.5 w-px bg-outline" />

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-on-surface font-display">{astronaut.name}</span>
              <span className="inline-flex items-center gap-0.5 rounded-md border border-danger/30 bg-danger-container px-1.5 py-0.5 font-mono text-[11px] font-bold text-on-danger-container">
                <Droplets className="h-2.5 w-2.5 text-danger" />
                {astronaut.bloodType}
              </span>
              {hasLowImmune && (
                <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 text-[11px] font-semibold text-on-warning-container">
                  {language === 'es' ? 'Defensas Bajas' : 'Low Defenses'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Language Switcher + Global Triage + Simulate Crisis + SOS + Slide-Out Test Drawer */}
        <div ref={drawerContainerRef} className="relative flex shrink-0 items-center gap-2">
          <LanguageSwitcher />

          <div
            className={`hidden md:inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold font-display sm:px-3 sm:text-xs ${badge.classes}`}
          >
            {badge.icon}
            <span className="hidden lg:inline">{badge.label}</span>
          </div>

          {/* Discrete Live Crisis Demo Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCrisisMenuOpen((prev) => !prev);
                setIsTestDrawerOpen(false);
              }}
              aria-expanded={isCrisisMenuOpen}
              title={
                language === 'es'
                  ? 'Simular Crisis en Vivo para demostración'
                  : 'Simulate Live Crisis for demo'
              }
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40 ${
                activeCrisisScenario
                  ? 'border-warning bg-warning-container text-on-warning-container'
                  : 'border-outline bg-surface-container-low text-on-surface-variant hover:-translate-y-px hover:border-warning/50 hover:bg-warning-container/45 hover:text-on-surface'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-warning" />
              <span className="hidden sm:inline">
                {language === 'es' ? 'Simular Crisis' : 'Simulate Crisis'}
              </span>
            </button>

            {isCrisisMenuOpen && (
              <div className="dt-animate-panel absolute right-0 top-[calc(100%+8px)] z-40 w-80 rounded-2xl border border-outline bg-surface-container p-3 shadow-[0_14px_32px_-12px_rgba(26,36,30,0.20)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                    {language === 'es' ? 'Simular Crisis en Vivo' : 'Simulate Live Crisis'}
                  </span>
                  <span className="font-mono text-[10px] text-warning font-semibold">DEMO</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCrisisMenuOpen(false);
                    simulateLiveCrisis('syncope_hypoglycemic');
                  }}
                  className="w-full cursor-pointer rounded-xl border border-danger/35 bg-danger-container/60 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-danger hover:bg-danger-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <p className="text-xs font-bold text-on-danger-container font-display">
                    {language === 'es'
                      ? '1. Síncope / Shock Hipoglucémico'
                      : '1. Syncope / Hypoglycemic Shock'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-on-danger-container/90">
                    {language === 'es'
                      ? 'Glucosa a 52 mg/dL, PA 82/50 mmHg, alerta de cabina y SOS automático.'
                      : 'Glucose at 52 mg/dL, BP 82/50 mmHg, cabin alert & auto-SOS.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCrisisMenuOpen(false);
                    simulateLiveCrisis('microgravity_seizure');
                  }}
                  className="w-full cursor-pointer rounded-xl border border-warning/40 bg-warning-container/65 p-2.5 text-left dt-transition hover:-translate-y-px hover:border-warning hover:bg-warning-container active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
                >
                  <p className="text-xs font-bold text-on-warning-container font-display">
                    {language === 'es'
                      ? '2. Crisis Convulsiva en Microgravedad'
                      : '2. Microgravity Seizure Episode'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-on-warning-container/90">
                    {language === 'es'
                      ? 'Alerta neurológica en Rojo, guía de contención 0g y cronómetro activo.'
                      : 'Neuro Code Red alert, 0g restraint guide & active stopwatch.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCrisisMenuOpen(false);
                    restoreNominalVitals();
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/35 bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>
                    {language === 'es'
                      ? 'Restablecer Signos Nominales'
                      : 'Restore Nominal Vitals'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Always-Visible Global SOS Emergency Button */}
          <button
            type="button"
            onClick={() => {
              setIsTestDrawerOpen(false);
              setIsCrisisMenuOpen(false);
              openSosOverlay();
            }}
            className="group relative inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-danger bg-danger px-3 py-1.5 text-xs font-bold tracking-wide text-on-primary font-display shadow-[0_6px_16px_-6px_rgba(180,35,24,0.55)] dt-transition hover:-translate-y-px hover:bg-danger-hover hover:shadow-[0_10px_20px_-6px_rgba(180,35,24,0.65)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/45"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-on-primary" />
            </span>
            <AlertOctagon className="h-3.5 w-3.5 shrink-0 dt-transition group-hover:scale-110" />
            <span>{language === 'es' ? 'SOS EMERGENCIA' : 'SOS EMERGENCY'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsTestDrawerOpen((prev) => !prev);
              setIsCrisisMenuOpen(false);
            }}
            aria-expanded={isTestDrawerOpen}
            aria-controls="deeptrau-test-drawer"
            title={
              language === 'es'
                ? 'Desplegar controles de pruebas y cambio de misión'
                : 'Open test scenarios & mission controls'
            }
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:px-3 ${
              isTestDrawerOpen
                ? 'border-primary/40 bg-primary-container text-on-primary-container'
                : 'border-outline bg-surface-container-low text-on-surface hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-high'
            }`}
          >
            <ChevronLeft
              className={`h-3.5 w-3.5 dt-transition transition-transform ${
                isTestDrawerOpen ? '-rotate-90 text-primary' : 'text-on-surface-variant'
              }`}
            />
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{language === 'es' ? 'Pruebas' : 'Tests'}</span>
          </button>

          {/* Slide-Out Test & Mission Controls Navbar */}
          <div
            id="deeptrau-test-drawer"
            aria-hidden={!isTestDrawerOpen}
            inert={!isTestDrawerOpen}
            className={`absolute right-4 top-[calc(100%+8px)] z-40 w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-outline bg-surface-container p-3.5 shadow-[0_14px_32px_-12px_rgba(26,36,30,0.18)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-auto sm:min-w-[440px] sm:max-w-[580px] lg:right-6 ${
              isTestDrawerOpen
                ? 'translate-y-0 translate-x-0 opacity-100 scale-100 pointer-events-auto'
                : '-translate-y-1 translate-x-4 opacity-0 scale-[0.97] pointer-events-none'
            }`}
          >
            <div className="flex flex-col gap-3">
              {/* Header row inside slide-out panel */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface font-display">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {language === 'es'
                    ? 'Simulador de Pruebas y Misión'
                    : 'Test & Mission Simulator'}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestDrawerOpen(false);
                      resetFullDemoExperience();
                    }}
                    title={
                      language === 'es'
                        ? 'Limpiar sesión local y reiniciar el recorrido completo desde la portada'
                        : 'Clear local session and restart full walkthrough from welcome screen'
                    }
                    className="group inline-flex cursor-pointer items-center gap-1 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:-translate-y-px hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Home className="h-3.5 w-3.5 dt-transition group-hover:scale-105" />
                    <span>{language === 'es' ? 'Desde Portada' : 'From Home'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetDemoData}
                    title={
                      language === 'es'
                        ? 'Reiniciar métricas de demostración en la misión actual'
                        : 'Reset demo metrics in current mission'
                    }
                    className="group inline-flex cursor-pointer items-center gap-1 rounded-xl border border-outline bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface-variant dt-transition hover:-translate-y-px hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RotateCcw className="h-3.5 w-3.5 dt-transition group-hover:-rotate-45" />
                    <span>{language === 'es' ? 'Reiniciar' : 'Reset'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTestDrawerOpen(false);
                      reopenOnboarding();
                    }}
                    className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <RefreshCw className="h-3.5 w-3.5 dt-transition group-hover:rotate-90" />
                    <span>
                      {language === 'es'
                        ? 'Cambiar Misión / Astronauta'
                        : 'Switch Mission / Astronaut'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Simulation scenario buttons */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low p-1.5">
                <span className="px-1.5 text-[11px] font-semibold text-on-surface-variant">
                  {language === 'es' ? 'Simular:' : 'Simulate:'}
                </span>
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => triggerDemoAnomaly(sc.id)}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${sc.style}`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {/* Compact Clinical & Local-First Autonomy Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2 text-[11px] text-on-surface-variant">
                <div className="flex flex-wrap items-center gap-2 md:hidden">
                  <span className="font-semibold text-on-surface">{astronaut.name}</span>
                  <span>· {astronaut.bloodType}</span>
                  <span>· {mission.gravityLabel}</span>
                </div>
                {mission.commDelayMinutes >= 1 ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-warning" />
                    <span>
                      {language === 'es'
                        ? `Autonomía Médica Offline activa · Enlace con Tierra: ${mission.commDelay}.`
                        : `Offline Medical Autonomy active · Earth Link: ${mission.commDelay}.`}
                    </span>
                  </div>
                ) : (
                  <span>
                    {language === 'es'
                      ? `Enlace en tiempo real con Tierra (${mission.commDelay}).`
                      : `Real-time Earth link (${mission.commDelay}).`}
                  </span>
                )}
                <span className="font-mono text-[10px] tracking-wide text-on-surface-variant">
                  LOCAL-FIRST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
