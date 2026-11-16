import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'DeepTrau SOS: Consola de Emergencia Médica Espacial',
  description:
    'Consola médica de emergencia espacial con protocolos autónomos, cronómetro de episodio, mapa corporal interactivo y empaquetado de telemetría hacia Tierra.',
};

export default function SosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
