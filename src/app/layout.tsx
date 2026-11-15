import type { Metadata } from 'next';
import './globals.css';
import { MissionProvider } from '@/context/MissionContext';

export const metadata: Metadata = {
  title: 'AstroHealth Monitor | Telemetría Médica Espacial (NASA Space Apps)',
  description:
    'Software autónomo de monitorización integral de salud física, radiación, metabolismo y psicología para astronautas en misiones espaciales.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <MissionProvider>{children}</MissionProvider>
      </body>
    </html>
  );
}
