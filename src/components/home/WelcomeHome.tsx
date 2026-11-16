'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Orbit, Radio } from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface WelcomeHomeProps {
  onStart: () => void;
}

const EASE_EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_POWER4_IN_OUT = 'cubic-bezier(0.76, 0, 0.24, 1)';
const EASE_POWER3_IN = 'cubic-bezier(0.7, 0, 0.84, 0)';

export function WelcomeHome({ onStart }: WelcomeHomeProps) {
  const { language } = useMission();
  const [isLaunching, setIsLaunching] = useState(false);

  const stageRef = useRef<HTMLElement>(null);
  const shutterTLRef = useRef<HTMLDivElement>(null);
  const shutterTRRef = useRef<HTMLDivElement>(null);
  const shutterBLRef = useRef<HTMLDivElement>(null);
  const shutterBRRef = useRef<HTMLDivElement>(null);
  const seamHRef = useRef<HTMLDivElement>(null);
  const seamVRef = useRef<HTMLDivElement>(null);

  const outerRingRef = useRef<HTMLDivElement>(null);
  const middleRingRef = useRef<HTMLDivElement>(null);
  const innerSvgRef = useRef<SVGSVGElement>(null);

  const logoFlightRef = useRef<HTMLDivElement>(null);
  const logoInnerRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);

  const wordLeftRef = useRef<HTMLSpanElement>(null);
  const wordRightRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const repoLinkRef = useRef<HTMLAnchorElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);

  // Act I: Entrance choreography when mounting welcome view
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    outerRingRef.current?.animate(
      [
        { transform: 'scale(0.35) rotate(-45deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ],
      { duration: 1100, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    middleRingRef.current?.animate(
      [
        { transform: 'scale(0.45) rotate(60deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ],
      { duration: 1200, delay: 80, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    innerSvgRef.current?.animate(
      [
        { transform: 'scale(0.6) rotate(-90deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ],
      { duration: 1250, delay: 140, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    logoInnerRef.current?.animate(
      [
        { transform: 'translate3d(0, 34px, 0) scale(0.72)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
      ],
      { duration: 950, delay: 100, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    wordLeftRef.current?.animate(
      [
        { transform: 'translate3d(0, 115%, 0) rotate(2deg)' },
        { transform: 'translate3d(0, 0%, 0) rotate(0deg)' },
      ],
      { duration: 820, delay: 220, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    wordRightRef.current?.animate(
      [
        { transform: 'translate3d(0, 115%, 0) rotate(2deg)' },
        { transform: 'translate3d(0, 0%, 0) rotate(0deg)' },
      ],
      { duration: 820, delay: 310, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    descRef.current?.animate(
      [
        { transform: 'translate3d(0, 24px, 0)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      ],
      { duration: 780, delay: 420, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    ctaWrapRef.current?.animate(
      [
        { transform: 'translate3d(0, 28px, 0) scale(0.92)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
      ],
      { duration: 820, delay: 520, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    repoLinkRef.current?.animate(
      [
        { transform: 'translate3d(0, 12px, 0)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0)', opacity: 0.65 },
      ],
      { duration: 760, delay: 620, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    creditRef.current?.animate(
      [
        { transform: 'translate3d(0, 12px, 0)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0)', opacity: 0.65 },
      ],
      { duration: 760, delay: 620, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );
  }, []);

  // Act II & III: Multi-stage spatial choreography into Mission Selection
  const handleStartChoreography = () => {
    if (isLaunching) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onStart();
      return;
    }

    setIsLaunching(true);

    shockwaveRef.current?.animate(
      [
        { transform: 'scale(0.55)', opacity: 0.85 },
        { transform: 'scale(3.6)', opacity: 0 },
      ],
      { duration: 680, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    ctaWrapRef.current?.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { transform: 'translate3d(0, -6px, 0) scale(0.95)', opacity: 1, offset: 0.28 },
        { transform: 'translate3d(0, 56px, 0) scale(0.86)', opacity: 0 },
      ],
      { duration: 420, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    descRef.current?.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        { transform: 'translate3d(0, 42px, 0) scale(0.94)', opacity: 0 },
      ],
      { duration: 360, delay: 40, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    repoLinkRef.current?.animate(
      [
        { transform: 'translate3d(0, 0, 0)', opacity: 0.65 },
        { transform: 'translate3d(-16px, 16px, 0)', opacity: 0 },
      ],
      { duration: 300, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    creditRef.current?.animate(
      [
        { transform: 'translate3d(0, 0, 0)', opacity: 0.65 },
        { transform: 'translate3d(16px, 16px, 0)', opacity: 0 },
      ],
      { duration: 300, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    wordLeftRef.current?.animate(
      [
        { transform: 'translate3d(0, 0%, 0)' },
        { transform: 'translate3d(-18px, -120%, 0)' },
      ],
      { duration: 400, delay: 60, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    wordRightRef.current?.animate(
      [
        { transform: 'translate3d(0, 0%, 0)' },
        { transform: 'translate3d(18px, -120%, 0)' },
      ],
      { duration: 400, delay: 120, easing: EASE_POWER3_IN, fill: 'forwards' }
    );

    outerRingRef.current?.animate(
      [
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(2.9) rotate(160deg)', opacity: 0 },
      ],
      { duration: 840, delay: 120, easing: EASE_POWER4_IN_OUT, fill: 'forwards' }
    );

    middleRingRef.current?.animate(
      [
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(2.35) rotate(-140deg)', opacity: 0 },
      ],
      { duration: 780, delay: 150, easing: EASE_POWER4_IN_OUT, fill: 'forwards' }
    );

    innerSvgRef.current?.animate(
      [
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'scale(3.4) rotate(220deg)', opacity: 0 },
      ],
      { duration: 820, delay: 100, easing: EASE_POWER4_IN_OUT, fill: 'forwards' }
    );

    seamHRef.current?.animate(
      [
        { transform: 'scaleX(0)', opacity: 0 },
        { transform: 'scaleX(1)', opacity: 1, offset: 0.35 },
        { transform: 'scaleX(1)', opacity: 0 },
      ],
      { duration: 540, delay: 120, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    seamVRef.current?.animate(
      [
        { transform: 'scaleY(0)', opacity: 0 },
        { transform: 'scaleY(1)', opacity: 1, offset: 0.35 },
        { transform: 'scaleY(1)', opacity: 0 },
      ],
      { duration: 540, delay: 120, easing: EASE_EXPO_OUT, fill: 'forwards' }
    );

    const shutterTiming: KeyframeAnimationOptions = {
      duration: 840,
      delay: 320,
      easing: EASE_POWER4_IN_OUT,
      fill: 'forwards',
    };

    shutterTLRef.current?.animate(
      [
        { transform: 'translate3d(0%, 0%, 0)' },
        { transform: 'translate3d(-104%, -104%, 0)' },
      ],
      shutterTiming
    );
    shutterTRRef.current?.animate(
      [
        { transform: 'translate3d(0%, 0%, 0)' },
        { transform: 'translate3d(104%, -104%, 0)' },
      ],
      shutterTiming
    );
    shutterBLRef.current?.animate(
      [
        { transform: 'translate3d(0%, 0%, 0)' },
        { transform: 'translate3d(-104%, 104%, 0)' },
      ],
      shutterTiming
    );
    shutterBRRef.current?.animate(
      [
        { transform: 'translate3d(0%, 0%, 0)' },
        { transform: 'translate3d(104%, 104%, 0)' },
      ],
      shutterTiming
    );

    const targetLogoEl = document.querySelector<HTMLElement>('[data-choreo="onboard-logo-target"]');
    if (logoFlightRef.current && targetLogoEl) {
      const fromRect = logoFlightRef.current.getBoundingClientRect();
      const toRect = targetLogoEl.getBoundingClientRect();

      const fromCenterX = fromRect.left + fromRect.width / 2;
      const fromCenterY = fromRect.top + fromRect.height / 2;
      const toCenterX = toRect.left + toRect.width / 2;
      const toCenterY = toRect.top + toRect.height / 2;

      const deltaX = toCenterX - fromCenterX;
      const deltaY = toCenterY - fromCenterY;
      const scaleTarget = Math.max(0.28, toRect.width / fromRect.width);

      targetLogoEl.style.opacity = '0';

      const flightAnim = logoFlightRef.current.animate(
        [
          {
            transform: 'translate3d(0px, 0px, 0) scale(1)',
            opacity: 1,
          },
          {
            transform: `translate3d(${deltaX * 0.35}px, ${deltaY * 0.55 - 28}px, 0) scale(${
              (1 + scaleTarget) * 0.48
            })`,
            opacity: 1,
            offset: 0.46,
          },
          {
            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleTarget})`,
            opacity: 1,
          },
        ],
        {
          duration: 780,
          delay: 220,
          easing: EASE_POWER4_IN_OUT,
          fill: 'forwards',
        }
      );

      flightAnim.onfinish = () => {
        targetLogoEl.style.opacity = '1';
        targetLogoEl.animate(
          [
            {
              transform: 'scale(0.88)',
              boxShadow: '0 0 0 0px rgba(47, 93, 70, 0.38)',
            },
            {
              transform: 'scale(1.06)',
              boxShadow: '0 0 0 10px rgba(47, 93, 70, 0)',
              offset: 0.55,
            },
            {
              transform: 'scale(1)',
              boxShadow: '0 0 0 0px rgba(47, 93, 70, 0)',
            },
          ],
          { duration: 520, easing: EASE_EXPO_OUT }
        );

        logoFlightRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 140,
          fill: 'forwards',
        });
      };
    }

    const onboardHeader = document.querySelector<HTMLElement>('[data-choreo="onboard-header"]');
    const onboardHeading = document.querySelector<HTMLElement>('[data-choreo="onboard-heading"]');
    const missionCards = document.querySelectorAll<HTMLElement>('[data-choreo="mission-card"]');
    const missionSummary = document.querySelector<HTMLElement>(
      '[data-choreo="mission-summary-bar"]'
    );

    onboardHeader?.animate(
      [
        { transform: 'translate3d(0, -36px, 0)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      ],
      { duration: 720, delay: 420, easing: EASE_EXPO_OUT, fill: 'both' }
    );

    onboardHeading?.animate(
      [
        {
          transform: 'translate3d(0, 34px, 0)',
          clipPath: 'inset(0 0 100% 0)',
          opacity: 0,
        },
        {
          transform: 'translate3d(0, 0, 0)',
          clipPath: 'inset(0 0 0% 0)',
          opacity: 1,
        },
      ],
      { duration: 760, delay: 480, easing: EASE_EXPO_OUT, fill: 'both' }
    );

    missionCards.forEach((card, idx) => {
      card.animate(
        [
          {
            transform: 'perspective(900px) translate3d(0, 68px, -30px) rotateX(10deg) scale(0.9)',
            opacity: 0,
          },
          {
            transform: 'perspective(900px) translate3d(0, 0, 0) rotateX(0deg) scale(1)',
            opacity: 1,
          },
        ],
        {
          duration: 820,
          delay: 540 + idx * 90,
          easing: EASE_EXPO_OUT,
          fill: 'both',
        }
      );
    });

    missionSummary?.animate(
      [
        { transform: 'translate3d(0, 44px, 0) scale(0.96)', opacity: 0 },
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
      ],
      { duration: 760, delay: 880, easing: EASE_EXPO_OUT, fill: 'both' }
    );

    window.setTimeout(() => {
      onStart();
    }, 1360);
  };

  return (
    <section
      ref={stageRef}
      aria-label={
        language === 'es'
          ? 'Portada de bienvenida DeepTrau SpaMedic'
          : 'DeepTrau SpaMedic welcome screen'
      }
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 text-on-surface sm:px-6 lg:px-8"
    >
      {/* Floating EN | ES Switcher */}
      <LanguageSwitcher variant="floating" />

      {/* 4-quadrant architectural shutters over mineral surface (#F7F5F0) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          ref={shutterTLRef}
          className="absolute left-0 top-0 h-[50.5%] w-[50.5%] border-b border-r border-outline-variant/60 bg-surface will-change-transform"
        />
        <div
          ref={shutterTRRef}
          className="absolute right-0 top-0 h-[50.5%] w-[50.5%] border-b border-l border-outline-variant/60 bg-surface will-change-transform"
        />
        <div
          ref={shutterBLRef}
          className="absolute bottom-0 left-0 h-[50.5%] w-[50.5%] border-r border-t border-outline-variant/60 bg-surface will-change-transform"
        />
        <div
          ref={shutterBRRef}
          className="absolute bottom-0 right-0 h-[50.5%] w-[50.5%] border-l border-t border-outline-variant/60 bg-surface will-change-transform"
        />

        <div
          ref={seamHRef}
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/45 opacity-0"
        />
        <div
          ref={seamVRef}
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/45 opacity-0"
        />
      </div>

      {/* Orbital calibration rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <div
          ref={outerRingRef}
          className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full border border-outline-variant/85 sm:h-[520px] sm:w-[520px] will-change-transform"
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-primary/40 bg-primary-container" />
          <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-secondary/50" />
        </div>

        <div
          ref={middleRingRef}
          className="absolute flex h-[280px] w-[280px] items-center justify-center rounded-full border border-dashed border-primary/25 sm:h-[400px] sm:w-[400px] will-change-transform"
        />

        <svg
          ref={innerSvgRef}
          viewBox="0 0 640 640"
          className="absolute h-[440px] w-[440px] text-primary/20 sm:h-[640px] sm:w-[640px] will-change-transform"
          fill="none"
        >
          <circle
            cx="320"
            cy="320"
            r="300"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeDasharray="14 22"
          />
          <circle cx="320" cy="20" r="5" className="fill-primary/45" />
          <circle cx="620" cy="320" r="4" className="fill-telemetry/45" />
          <circle cx="20" cy="320" r="4" className="fill-secondary/45" />
        </svg>

        <div
          ref={shockwaveRef}
          className="absolute h-44 w-44 rounded-full border-2 border-primary/45 opacity-0 will-change-transform"
        />
      </div>

      {/* Central Welcome Content */}
      <div className="relative z-20 flex w-full max-w-2xl flex-col items-center text-center">
        <div
          ref={logoFlightRef}
          className="relative mb-2 flex h-36 w-44 items-center justify-center will-change-transform sm:h-44 sm:w-52"
        >
          <div
            ref={logoInnerRef}
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
          >
            <Image
              src="/DeepTrau_logo.webp"
              alt={language === 'es' ? 'Icono de DeepTrau SpaMedic' : 'DeepTrau SpaMedic Icon'}
              width={220}
              height={220}
              priority
              className="h-full w-full scale-[1.45] object-contain mix-blend-multiply select-none"
            />
          </div>
        </div>

        <h1 className="flex flex-wrap items-baseline justify-center gap-x-3 font-display text-4xl font-bold tracking-[-0.02em] text-on-surface sm:text-5xl">
          <span className="inline-block overflow-hidden py-1">
            <span ref={wordLeftRef} className="inline-block will-change-transform">
              DeepTrau
            </span>
          </span>
          <span className="inline-block overflow-hidden py-1">
            <span ref={wordRightRef} className="inline-block text-primary will-change-transform">
              SpaMedic
            </span>
          </span>
        </h1>

        <p
          ref={descRef}
          className="mt-4 max-w-xl text-base leading-relaxed text-on-surface-variant will-change-transform sm:text-lg"
        >
          {language === 'es'
            ? 'Sistema autónomo de telemetría médica, psicología espacial y contramedidas por misión'
            : 'Autonomous aerospace medical telemetry, space psychology, and mission countermeasures'}
        </p>

        <div ref={ctaWrapRef} className="mt-8 will-change-transform">
          <button
            type="button"
            disabled={isLaunching}
            onClick={handleStartChoreography}
            className="group relative inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-primary-hover/30 bg-gradient-to-br from-secondary via-primary to-primary-hover px-8 py-3.5 font-display text-base font-semibold text-on-primary shadow-[0_10px_24px_-8px_rgba(47,93,70,0.45)] dt-transition hover:-translate-y-0.5 hover:from-primary hover:via-primary hover:to-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:translate-y-0 active:scale-[0.99] disabled:cursor-default"
          >
            {isLaunching ? (
              <>
                <Orbit className="h-4 w-4 animate-spin text-primary-container" />
                <span className="font-mono text-xs tracking-[0.06em] uppercase">
                  {language === 'es'
                    ? 'Acoplando Entorno de Misión...'
                    : 'Docking Mission Environment...'}
                </span>
                <Radio className="h-4 w-4 text-primary-container" />
              </>
            ) : (
              <>
                <span>{language === 'es' ? 'Comenzar' : 'Start'}</span>
                <ArrowRight className="h-4 w-4 dt-transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>

      <a
        ref={repoLinkRef}
        href="https://github.com/DivergenteNM/DeepTrau_SpaMedic"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-5 z-20 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-on-surface-variant opacity-65 dt-transition hover:text-primary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md px-1 py-0.5 will-change-transform sm:bottom-6 sm:left-8"
      >
        <span>{language === 'es' ? 'Repositorio GitHub' : 'GitHub Repository'}</span>
        <ExternalLink className="h-3 w-3" />
      </a>

      <p
        ref={creditRef}
        className="pointer-events-none absolute bottom-4 right-5 z-20 select-none text-xs font-medium tracking-wide text-on-surface-variant opacity-65 will-change-transform sm:bottom-6 sm:right-8"
      >
        By: Nicolás Martínez
      </p>
    </section>
  );
}
