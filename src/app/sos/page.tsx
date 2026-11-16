'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SosCommandWorkspace from '@/components/emergency/SosCommandWorkspace';

export default function SosPage() {
  const router = useRouter();

  return (
    <SosCommandWorkspace
      mode="page"
      onBack={() => router.push('/')}
      titleId="sos-page-heading"
    />
  );
}
