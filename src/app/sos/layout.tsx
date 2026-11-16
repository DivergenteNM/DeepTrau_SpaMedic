import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'DeepTrau SOS: Space Medical Emergency Console',
  description:
    'Autonomous space medical emergency console featuring gravity-adapted protocols, episode stopwatch, interactive body map, and Earth telemetry downlink.',
};

export default function SosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
