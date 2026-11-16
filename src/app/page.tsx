'use client';

import React, { useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { WelcomeHome } from '@/components/home/WelcomeHome';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { TopTelemetryBar } from '@/components/layout/TopTelemetryBar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { CommandDashboard } from '@/components/dashboard/CommandDashboard';
import { SensorHubTab } from '@/components/sensors/SensorHubTab';
import { MentalHealthTab } from '@/components/psychology/MentalHealthTab';
import { BoneMuscleTab } from '@/components/musculoskeletal/BoneMuscleTab';
import { MissionMonitorTab } from '@/components/survival/MissionMonitorTab';
import { SosEmergencyOverlay } from '@/components/emergency/SosEmergencyOverlay';

export default function HomePage() {
  const {
    language,
    isHydrated,
    hasCompletedWelcome,
    isOnboarded,
    activeTab,
    completeWelcome,
  } = useMission();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-primary font-display">
            {language === 'es'
              ? 'Inicializando telemetría médica DeepTrau...'
              : 'Initializing DeepTrau medical telemetry...'}
          </p>
        </div>
      </main>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="relative min-h-screen bg-surface text-on-surface">
        <div aria-hidden={!hasCompletedWelcome} inert={!hasCompletedWelcome}>
          <OnboardingFlow />
        </div>
        {!hasCompletedWelcome && <WelcomeHome onStart={completeWelcome} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <TopTelemetryBar />

      <div className="flex flex-1 min-w-0">
        <SidebarNav
          isDesktopOpen={isDesktopSidebarOpen}
          onToggleDesktop={() => setIsDesktopSidebarOpen((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 dt-transition">
          <div
            className={`mx-auto w-full transition-[max-width] duration-250 ease-[cubic-bezier(0.2,0,0,1)] ${
              isDesktopSidebarOpen ? 'max-w-7xl' : 'max-w-[1440px]'
            }`}
          >
            <div className="mb-4 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label={language === 'es' ? 'Abrir menú lateral' : 'Open side menu'}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-outline bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              >
                <PanelLeftOpen className="h-4 w-4 text-primary dt-transition group-hover:scale-105" />
                <span>{language === 'es' ? 'Menú DeepTrau' : 'DeepTrau Menu'}</span>
              </button>
            </div>

            <div key={activeTab} className="dt-animate-enter">
              {activeTab === 'dashboard' && <CommandDashboard />}
              {activeTab === 'sensors' && <SensorHubTab />}
              {activeTab === 'psychology' && <MentalHealthTab />}
              {activeTab === 'musculoskeletal' && <BoneMuscleTab />}
              {activeTab === 'survival' && <MissionMonitorTab />}
            </div>
          </div>
        </main>
      </div>

      <SosEmergencyOverlay />
    </div>
  );
}
