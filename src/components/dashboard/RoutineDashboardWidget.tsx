'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Cpu,
  Maximize2,
  Wrench,
} from 'lucide-react';
import { DailyRoutineItem, useMission } from '@/context/MissionContext';

interface RoutineDashboardWidgetProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isHiddenForFlight?: boolean;
  justDocked?: boolean;
  isStaticPreview?: boolean;
  onOpenFocusMode?: () => void;
}

function getTaskRowClasses(task: DailyRoutineItem, compact = false): string {
  const spacing = compact ? 'px-3 py-2.5' : 'p-3.5';
  if (task.completed) {
    return `border-primary/30 bg-primary-container/50 hover:bg-primary-container/75 ${spacing}`;
  }
  if (task.priority === 'overdue') {
    return `border-danger/45 bg-danger-container/30 hover:border-danger hover:bg-danger-container/45 ${spacing}`;
  }
  if (task.priority === 'urgent') {
    return `border-warning/45 bg-warning-container/35 hover:border-warning hover:bg-warning-container/55 ${spacing}`;
  }
  return `border-outline bg-surface-container-low hover:border-primary hover:bg-surface-container ${spacing}`;
}

export function RoutineDashboardWidget({
  containerRef,
  isHiddenForFlight = false,
  justDocked = false,
  isStaticPreview = false,
  onOpenFocusMode,
}: RoutineDashboardWidgetProps) {
  const {
    mission,
    astronaut,
    missionDay,
    routines,
    devices,
    toggleRoutineTask,
    setActiveTab,
  } = useMission();

  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = routines.filter((r) => r.completed).length;
  const pendingTasks = routines.filter((r) => !r.completed);
  const pendingCount = pendingTasks.length;
  const overduePendingCount = pendingTasks.filter((r) => r.priority === 'overdue').length;
  const disconnectedCount = devices.filter((d) => !d.connected).length;
  const progressPct =
    routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 100;
  const earnedPoints = routines
    .filter((r) => r.completed)
    .reduce((acc, item) => acc + item.points, 0);

  // In compact mode, show up to the 2 most critical pending items (already priority-sorted)
  const compactCriticalPreview = pendingTasks.slice(0, 2);
  const remainingHiddenCount = Math.max(0, routines.length - compactCriticalPreview.length);

  const statusBadge =
    pendingCount === 0
      ? {
          label: '¡Completa!',
          classes: 'border-primary/35 bg-primary-container text-on-primary-container',
        }
      : overduePendingCount > 0
        ? {
            label: `${overduePendingCount} atrasada${overduePendingCount > 1 ? 's' : ''}`,
            classes: 'border-danger/40 bg-danger-container text-on-danger-container',
          }
        : {
            label: `${pendingCount} pend.`,
            classes: 'border-warning/35 bg-warning-container text-on-warning-container',
          };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-outline bg-surface-container p-4 sm:p-5 space-y-3.5 transition-opacity duration-150 ${
        isHiddenForFlight ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
      } ${justDocked ? 'dt-dock-landed' : ''}`}
    >
      {/* Compact Header */}
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] leading-[22px] font-bold text-on-surface font-display">
              Rutina del Día · Día {missionDay}
            </h2>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${statusBadge.classes}`}
            >
              {statusBadge.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            <span className="font-semibold text-primary">{mission.shortName}</span> ·{' '}
            {devices.length - disconnectedCount}/{devices.length} sensores conectados
            {disconnectedCount > 0 ? ' (modo manual activo)' : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isStaticPreview && onOpenFocusMode && (
            <button
              type="button"
              onClick={onOpenFocusMode}
              title="Abrir rutina en vista de enfoque"
              className="group inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container-low px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-high hover:text-on-surface active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <Maximize2 className="h-3.5 w-3.5 text-primary dt-transition group-hover:scale-105" />
              <span className="hidden sm:inline">Enfoque</span>
            </button>
          )}

          <button
            type="button"
            disabled={isStaticPreview}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls="routine-expanded-detail"
            className="group inline-flex cursor-pointer items-center gap-1 rounded-lg border border-primary/30 bg-primary-container/65 px-2.5 py-1.5 text-[11px] font-bold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:border-primary hover:bg-primary-container active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-default"
          >
            <span>{isExpanded ? 'Contraer' : 'Ver detalle'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-primary dt-transition ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-on-surface-variant">
            Progreso:{' '}
            <span className="font-mono font-bold text-on-surface">
              {completedCount}/{routines.length}
            </span>{' '}
            ({progressPct}%)
          </span>
          <span className="font-mono font-semibold text-primary">+{earnedPoints} pts hoy</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full rounded-full transition-[width,background-color] duration-300 ${
              pendingCount === 0 ? 'bg-primary' : overduePendingCount > 0 ? 'bg-warning' : 'bg-primary'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Compact Preview OR Full Expanded Accordion */}
      {!isExpanded ? (
        <div className="space-y-2">
          {compactCriticalPreview.length > 0 ? (
            <>
              {compactCriticalPreview.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  disabled={isStaticPreview}
                  onClick={() => toggleRoutineTask(task.id)}
                  className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-default ${getTaskRowClasses(
                    task,
                    true
                  )}`}
                >
                  <span className="shrink-0 dt-transition group-hover:scale-110">
                    <Circle className="h-4 w-4 text-on-surface-variant" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-on-surface font-display">
                        {task.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {task.priority === 'overdue' && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-danger/40 bg-danger-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-danger-container">
                            <AlertOctagon className="h-2.5 w-2.5 text-danger" />
                            Atrasada
                          </span>
                        )}
                        {task.priority === 'urgent' && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-warning-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-warning-container">
                            <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                            Urgente
                          </span>
                        )}
                        <span className="rounded-md border border-outline bg-surface-container px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                          +{task.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {remainingHiddenCount > 0 && !isStaticPreview && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-outline bg-surface-container-low/65 px-3 py-2 text-[11px] font-medium text-on-surface-variant dt-transition hover:border-primary/45 hover:bg-surface-container-low hover:text-on-surface active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <span>
                    +{remainingHiddenCount} tarea{remainingHiddenCount > 1 ? 's' : ''} en la rutina (
                    {completedCount} completada{completedCount === 1 ? '' : 's'})
                  </span>
                  <span className="font-semibold text-primary font-display">Desplegar todas</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary-container/55 px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-on-primary-container font-display">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>Rutina diaria completada al 100%</span>
              </div>
              {!isStaticPreview && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="cursor-pointer text-[11px] font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  Revisar lista
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div id="routine-expanded-detail" className="dt-animate-panel space-y-3">
          {disconnectedCount > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/35 bg-warning-container p-3 text-xs text-on-warning-container">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <span className="font-semibold">
                  {disconnectedCount} herramienta(s) desconectada(s):
                </span>{' '}
                DeepTrau adaptó automáticamente esos escaneos a protocolos clínicos manuales sin
                hardware.
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {routines.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleRoutineTask(task.id)}
                className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${getTaskRowClasses(
                  task,
                  false
                )}`}
              >
                <span className="mt-0.5 shrink-0 dt-transition group-hover:scale-110">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-on-surface-variant" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold font-display ${
                        task.completed
                          ? 'line-through text-on-surface-variant'
                          : 'text-on-surface'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!task.completed && task.priority === 'overdue' && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-danger/40 bg-danger-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-danger-container">
                          <AlertOctagon className="h-2.5 w-2.5 text-danger" />
                          {task.priorityLabel}
                        </span>
                      )}
                      {!task.completed && task.priority === 'urgent' && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-warning-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-warning-container">
                          <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                          Urgente
                        </span>
                      )}
                      {task.usesManualFallback && (
                        <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 text-[10px] font-semibold text-on-warning-container">
                          Modo Manual
                        </span>
                      )}
                      <span className="rounded-md border border-outline bg-surface-container px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        +{task.points} pts
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    {!task.completed && task.urgencyContext
                      ? `${task.urgencyContext} · ${task.reason}`
                      : task.reason}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant pt-3 text-xs">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <AlertCircle className="h-3.5 w-3.5 text-primary" />
              {astronaut.clinicalHistory.immuneStatus !== 'Normal'
                ? 'EHR: Alerta inmune temprana activa'
                : 'EHR: Parámetros base sincronizados'}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('sensors')}
              className="group inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary dt-transition hover:-translate-y-px hover:bg-primary-container/60 hover:text-primary-hover active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <Cpu className="h-3.5 w-3.5 dt-transition group-hover:rotate-12" />
              Gestionar sensores
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
