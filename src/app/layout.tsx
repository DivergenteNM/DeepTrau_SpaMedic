import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono, Ubuntu } from 'next/font/google';
import './globals.css';
import { MissionProvider } from '@/context/MissionContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'DeepTrau | Telemetría Médica Espacial (NASA Space Apps)',
  description:
    'DeepTrau SpaMedic: software autónomo de monitorización integral de salud física, radiación, metabolismo y psicología para astronautas en misiones espaciales.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${ubuntu.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-surface text-on-surface font-sans antialiased">
        <MissionProvider>{children}</MissionProvider>
      </body>
    </html>
  );
}
