'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import {
  Activity,
  Brain,
  Cpu,
  Dumbbell,
  Flame,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Radiation,
  Trophy,
  X,
} from 'lucide-react';
import { AppTabId, useMission } from '@/context/MissionContext';

interface SidebarNavProps {
  isDesktopOpen: boolean;
  onToggleDesktop: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function SidebarNav({
  isDesktopOpen,
  onToggleDesktop,
  isMobileOpen,
  onCloseMobile,
}: SidebarNavProps) {
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

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMobile();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

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

  const renderSidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col gap-4 px-3.5 pt-2.5 pb-4">
      {/* Brand Badge + Sidebar Toggle inside Sidebar */}
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline bg-surface-container p-1">
            <Image
              src="/DeepTrau_logo.webp"
              alt="Logo de DeepTrau"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-on-surface font-display">
              DeepTrau
            </p>
            <p className="truncate text-[11px] text-on-surface-variant">
              SpaMedic · Medicina Espacial
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={isMobileDrawer ? onCloseMobile : onToggleDesktop}
          aria-label={isMobileDrawer ? 'Cerrar menú lateral' : 'Ocultar barra lateral'}
          title={isMobileDrawer ? 'Cerrar menú lateral' : 'Ocultar barra lateral'}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container-low text-on-surface-variant dt-transition hover:border-primary/35 hover:bg-surface-container-high hover:text-on-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {isMobileDrawer ? (
            <X className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="grid grid-cols-1 gap-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                if (isMobileDrawer) {
                  onCloseMobile();
                }
              }}
              className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left dt-transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                isActive
                  ? 'border-primary/35 bg-primary-container text-on-primary-container'
                  : 'border-transparent bg-surface-container text-on-surface hover:translate-x-0.5 hover:border-outline hover:bg-surface-container-low'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`dt-transition group-hover:scale-105 ${
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant group-hover:text-primary'
                  }`}
                >
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
              <div className="flex shrink-0 items-center gap-1.5">
                {item.alert && (
                  <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
                )}
                {item.badge && (
                  <span
                    className={`rounded-lg border px-1.5 py-0.5 font-mono text-[10px] font-semibold dt-transition ${
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
      <div className="space-y-3 rounded-2xl border border-outline bg-surface-container-low p-4">
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
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
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
            <p className="mt-0.5 font-mono text-sm font-bold text-on-warning-container">
              {streakDays} días
            </p>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary-container p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-primary-container">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Puntos
            </div>
            <p className="mt-0.5 font-mono text-sm font-bold text-on-primary-container">
              {healthPoints}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        aria-hidden={!isDesktopOpen}
        inert={!isDesktopOpen}
        className={`hidden shrink-0 overflow-clip border-outline bg-surface-container transition-[width,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block ${
          isDesktopOpen
            ? 'w-72 border-r opacity-100'
            : 'pointer-events-none w-0 border-r-0 opacity-0'
        }`}
      >
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] w-72 overflow-y-auto">
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* Desktop Reopen Handle (outside navbar, shown only when sidebar is collapsed) */}
      {!isDesktopOpen && (
        <div className="hidden shrink-0 pl-3 pt-4 dt-animate-panel lg:block">
          <button
            type="button"
            onClick={onToggleDesktop}
            aria-label="Mostrar barra lateral"
            title="Mostrar barra lateral"
            className="sticky top-[70px] inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container text-on-surface-variant dt-transition hover:scale-105 hover:border-primary/45 hover:bg-surface-container-low hover:text-on-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mobile Slide-Over Sidebar Drawer */}
      <div
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 cursor-pointer bg-on-surface/25 backdrop-blur-[1px]"
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-outline bg-surface-container transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderSidebarContent(true)}
        </aside>
      </div>
    </>
  );
}
