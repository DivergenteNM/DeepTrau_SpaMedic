'use client';

import React from 'react';
import Image from 'next/image';
import {
  Activity,
  Brain,
  Cpu,
  Dumbbell,
  Flame,
  LayoutDashboard,
  Radiation,
  Trophy,
} from 'lucide-react';
import { AppTabId, useMission } from '@/context/MissionContext';

export function SidebarNav() {
  const {
    activeTab,
    setActiveTab,
    routines,
    devices,
    streakDays,
    healthPoints,
    readinessScore,
    systemStatuses,
  } = useMission();

  const completedRoutines = routines.filter((r) => r.completed).length;
  const routinePct =
    routines.length > 0 ? Math.round((completedRoutines / routines.length) * 100) : 0;
  const connectedCount = devices.filter((d) => d.connected).length;

  const navItems: {
    id: AppTabId;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
    alert?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Centro de Comando',
      subtitle: 'Cuerpo humano y rutinas',
      icon: <LayoutDashboard className="h-5 w-5" />,
      badge: `${completedRoutines}/${routines.length}`,
    },
    {
      id: 'sensors',
      label: 'Conectar Herramientas',
      subtitle: 'Hub de sensores y pruebas',
      icon: <Cpu className="h-5 w-5" />,
      badge: `${connectedCount}/${devices.length}`,
    },
    {
      id: 'psychology',
      label: 'Salud Mental y Psicología',
      subtitle: 'Video-diario y ancla terrestre',
      icon: <Brain className="h-5 w-5" />,
      alert: systemStatuses.brain !== 'nominal',
    },
    {
      id: 'musculoskeletal',
      label: 'Densidad Ósea y Músculo',
      subtitle: 'Ejercicio adaptado por gravedad',
      icon: <Dumbbell className="h-5 w-5" />,
      alert: systemStatuses.musculoskeletal !== 'nominal',
    },
    {
      id: 'survival',
      label: 'Monitoreo de Misión',
      subtitle: 'Radiación, sangre y glucosa',
      icon: <Radiation className="h-5 w-5" />,
      alert: systemStatuses.immune !== 'nominal' || systemStatuses.metabolic !== 'nominal',
    },
  ];

  return (
    <aside className="w-full shrink-0 border-b border-outline bg-surface-container lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-5 p-4 lg:sticky lg:top-24">
        {/* Brand Badge */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline bg-surface-container p-1">
            <Image
              src="/DeepTrau_logo.webp"
              alt="Logo de DeepTrau"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-on-surface font-display">
              DeepTrau
            </p>
            <p className="text-[11px] text-on-surface-variant">SpaMedic · Medicina Espacial</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left dt-transition ${
                  isActive
                    ? 'border-primary/35 bg-primary-container text-on-primary-container'
                    : 'border-transparent bg-surface-container text-on-surface hover:border-outline hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-primary' : 'text-on-surface-variant'}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold font-display">{item.label}</p>
                    <p
                      className={`truncate text-[11px] ${
                        isActive ? 'text-on-primary-container/80' : 'text-on-surface-variant'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.alert && <span className="h-2.5 w-2.5 rounded-full bg-warning" />}
                  {item.badge && (
                    <span
                      className={`rounded-lg border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                        isActive
                          ? 'border-primary/30 bg-surface-container text-on-primary-container'
                          : 'border-outline bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Gamification & Readiness Card */}
        <div className="rounded-2xl border border-outline bg-surface-container-low p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface font-display">
              <Activity className="h-4 w-4 text-primary" />
              Índice de Preparación
            </span>
            <span className="font-mono text-sm font-bold text-primary">{readinessScore}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>Rutinas del día</span>
              <span className="font-mono">{routinePct}% completado</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary dt-transition"
                style={{ width: `${routinePct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xl border border-warning/25 bg-warning-container p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-warning-container">
                <Flame className="h-3.5 w-3.5 text-warning" />
                Racha
              </div>
              <p className="mt-0.5 text-sm font-bold text-on-warning-container font-mono">
                {streakDays} días
              </p>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary-container p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-primary-container">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Puntos
              </div>
              <p className="mt-0.5 text-sm font-bold text-on-primary-container font-mono">
                {healthPoints}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
