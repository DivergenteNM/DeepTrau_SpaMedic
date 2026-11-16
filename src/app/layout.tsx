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
    'DeepTrau SpaMedic: autonomous aerospace medical software for monitoring physical health, space radiation, metabolism, and psychology for astronauts. Code, simulated clinical data, and pitch deck assisted by AI (Google Antigravity); logo generated with OpenAI GPT; Earth Anchor audio synthesized with Google Gemini (Lyria / Lyria 3).',
  keywords: [
    'DeepTrau',
    'NASA Space Apps',
    'Space Medicine',
    'Aerospace Telemetry',
    'AI-assisted software',
    'Google Antigravity',
    'Google Gemini Lyria',
  ],
  authors: [{ name: 'Nicolás Martínez & DeepTrau Team (AI-assisted with Google Antigravity)' }],
  creator: 'DeepTrau Team · AI-assisted development via Google Antigravity',
  other: {
    'ai-disclosure':
      'Code and simulated clinical telemetry data developed with AI assistance (Google Antigravity); visual logo generated with OpenAI GPT; offline Earth Anchor audio synthesized with Google Gemini (Lyria / Lyria 3).',
    'ai-generated-audio': 'Google Gemini (Lyria / Lyria 3, Nov 2026)',
    'ai-generated-logo': 'OpenAI GPT',
    'ai-assisted-code': 'Google Antigravity',
  },
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
