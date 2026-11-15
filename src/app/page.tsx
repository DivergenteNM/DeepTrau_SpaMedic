'use client';

import React from 'react';
import { useMission } from '@/context/MissionContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { TopTelemetryBar } from '@/components/layout/TopTelemetryBar';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { CommandDashboard } from '@/components/dashboard/CommandDashboard';
import { SensorHubTab } from '@/components/sensors/SensorHubTab';
import { MentalHealthTab } from '@/components/psychology/MentalHealthTab';
import { BoneMuscleTab } from '@/components/musculoskeletal/BoneMuscleTab';
import { MissionMonitorTab } from '@/components/survival/MissionMonitorTab';

export default function HomePage() {
  const { isHydrated, isOnboarded, activeTab } = useMission();

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm font-medium text-cyan-300">
            Inicializando telemetría médica AstroHealth...
          </p>
        </div>
      </main>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopTelemetryBar />

      <div className="flex flex-1 flex-col lg:flex-row">
        <SidebarNav />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <CommandDashboard />}
          {activeTab === 'sensors' && <SensorHubTab />}
          {activeTab === 'psychology' && <MentalHealthTab />}
          {activeTab === 'musculoskeletal' && <BoneMuscleTab />}
          {activeTab === 'survival' && <MissionMonitorTab />}
        </main>
      </div>
    </div>
  );
}
