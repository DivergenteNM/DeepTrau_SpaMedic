'use client';

import React from 'react';
import {
  Activity,
  Brain,
  Cpu,
  Dumbbell,
  Flame,
  HeartPulse,
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
  const routinePct = routines.length > 0 ? Math.round((completedRoutines / routines.length) * 100) : 0;
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
    <aside className="w-full shrink-0 border-b border-slate-800/80 bg-slate-950/80 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-5 p-4 lg:sticky lg:top-24">
        {/* Brand Badge */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10">
            <HeartPulse className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">AstroHealth Monitor</p>
            <p className="text-[11px] text-slate-400">Medicina Espacial Autónoma</p>
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
                className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                  isActive
                    ? 'border-cyan-400/50 bg-cyan-500/15 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                    : 'border-transparent bg-slate-900/40 text-slate-300 hover:border-slate-800 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>{item.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{item.label}</p>
                    <p className="truncate text-[11px] text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.alert && (
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  )}
                  {item.badge && (
                    <span className="rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Gamification & Readiness Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Activity className="h-4 w-4 text-emerald-400" />
              Índice de Preparación
            </span>
            <span className="font-mono text-sm font-bold text-emerald-300">{readinessScore}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Rutinas del día</span>
              <span>{routinePct}% completado</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${routinePct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                <Flame className="h-3.5 w-3.5" />
                Racha
              </div>
              <p className="mt-0.5 text-sm font-bold text-white">{streakDays} días</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
                <Trophy className="h-3.5 w-3.5" />
                Puntos
              </div>
              <p className="mt-0.5 text-sm font-bold text-white">{healthPoints}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
