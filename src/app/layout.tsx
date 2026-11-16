import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { MissionProvider } from '@/context/MissionContext';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  adjustFontFallback: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'DeepTrau | Space Medical Telemetry (NASA Space Apps)',
  description:
    'DeepTrau SpaMedic: autonomous aerospace medical software for monitoring physical health, space radiation, metabolism, and psychology for astronauts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-surface text-on-surface font-sans antialiased">
        <MissionProvider>{children}</MissionProvider>
      </body>
    </html>
  );
}
