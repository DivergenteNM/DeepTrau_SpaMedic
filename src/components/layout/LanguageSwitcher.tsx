'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { Language } from '@/i18n/types';

interface LanguageSwitcherProps {
  variant?: 'default' | 'floating';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useMission();

  const options: { id: Language; label: string; ariaLabel: string }[] = [
    { id: 'en', label: 'EN', ariaLabel: 'Switch language to English' },
    { id: 'es', label: 'ES', ariaLabel: 'Cambiar idioma a Español' },
  ];

  const containerClasses =
    variant === 'floating'
      ? 'fixed top-4 right-5 z-30 inline-flex items-center gap-1 rounded-xl border border-outline bg-surface-container/95 p-1 backdrop-blur-md shadow-[0_8px_20px_-10px_rgba(26,36,30,0.18)] sm:top-6 sm:right-8'
      : 'inline-flex items-center gap-1 rounded-xl border border-outline bg-surface-container-low p-0.5';

  return (
    <div
      role="group"
      aria-label={language === 'es' ? 'Selector de idioma' : 'Language selector'}
      className={containerClasses}
    >
      <Globe className="ml-1.5 mr-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      {options.map((opt) => {
        const isActive = language === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLanguage(opt.id)}
            aria-pressed={isActive}
            aria-label={opt.ariaLabel}
            className={`cursor-pointer rounded-lg px-2 py-1 font-mono text-[11px] font-bold dt-transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
              isActive
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
