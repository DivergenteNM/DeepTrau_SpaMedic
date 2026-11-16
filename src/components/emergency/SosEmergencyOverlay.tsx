'use client';

import React, { useEffect } from 'react';
import { useMission } from '@/context/MissionContext';
import SosCommandWorkspace from '@/components/emergency/SosCommandWorkspace';

export function SosEmergencyOverlay() {
  const { isSosOpen, closeSosOverlay } = useMission();

  useEffect(() => {
    if (!isSosOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSosOverlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSosOpen, closeSosOverlay]);

  if (!isSosOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[var(--dt-surface)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-emergency-title"
    >
      <SosCommandWorkspace
        mode="overlay"
        onBack={closeSosOverlay}
        titleId="sos-emergency-title"
      />
    </div>
  );
}
