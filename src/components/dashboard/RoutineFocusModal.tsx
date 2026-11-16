'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { DailyRoutineItem, useMission } from '@/context/MissionContext';

interface RoutineFocusModalProps {
  isOpen: boolean;
  showStepIndicator: boolean;
  onRequestDock: (fromRect: DOMRect | null) => void;
}

export function RoutineFocusModal({
  isOpen,
  showStepIndicator,
  onRequestDock,
}: RoutineFocusModalProps) {
  const {
    language,
    mission,
    missionDay,
    routines,
    devices,
    readinessScore,
    toggleRoutineTask,
  } = useMission();

  const modalCardRef = useRef<HTMLDivElement>(null);
  const isDockTriggeredRef = useRef(false);
  const autoDockTimerRef = useRef<number | null>(null);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);

  const triggerManualOrAutoDock = useCallback(() => {
    if (isDockTriggeredRef.current) return;
    isDockTriggeredRef.current = true;
    if (autoDockTimerRef.current !== null) {
      window.clearTimeout(autoDockTimerRef.current);
      autoDockTimerRef.current = null;
    }
    const rect = modalCardRef.current?.getBoundingClientRect() ?? null;
    onRequestDock(rect);
  }, [onRequestDock]);

  useEffect(() => {
    if (isOpen) {
      isDockTriggeredRef.current = false;
      setIsAutoCompleting(false);
    }
    return () => {
      if (autoDockTimerRef.current !== null) {
        window.clearTimeout(autoDockTimerRef.current);
        autoDockTimerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        triggerManualOrAutoDock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, triggerManualOrAutoDock]);

  const completedCount = routines.filter((r) => r.completed).length;
  const pendingCount = routines.length - completedCount;
  const availableDevices = devices.filter((d) => d.availableInMission !== false);
  const disconnectedCount = availableDevices.filter((d) => !d.connected).length;
  const progressPct =
    routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 100;
  const earnedPoints = routines
    .filter((r) => r.completed)
    .reduce((acc, item) => acc + item.points, 0);

  const overdueTasks = useMemo(
    () => routines.filter((r) => r.priority === 'overdue'),
    [routines]
  );
  const urgentTasks = useMemo(
    () => routines.filter((r) => r.priority === 'urgent'),
    [routines]
  );
  const normalTasks = useMemo(
    () => routines.filter((r) => r.priority === 'normal'),
    [routines]
  );

  const handleToggleTask = (task: DailyRoutineItem) => {
    if (isDockTriggeredRef.current || isAutoCompleting) return;

    const willCompleteAll = !task.completed && pendingCount === 1;
    toggleRoutineTask(task.id);

    if (willCompleteAll) {
      setIsAutoCompleting(true);
      autoDockTimerRef.current = window.setTimeout(() => {
        triggerManualOrAutoDock();
      }, 360);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const renderTaskButton = (task: DailyRoutineItem) => {
    const isOverdue = task.priority === 'overdue';
    const isUrgent = task.priority === 'urgent';

    const cardClasses = task.completed
      ? 'border-primary/35 bg-primary-container/55 hover:bg-primary-container/75'
      : isOverdue
        ? 'border-danger/45 bg-surface-container hover:border-danger hover:bg-danger-container/25'
        : isUrgent
          ? 'border-warning/45 bg-surface-container hover:border-warning hover:bg-warning-container/25'
          : 'border-outline bg-surface-container-low hover:border-primary hover:bg-surface-container';

    return (
      <button
        key={task.id}
        type="button"
        onClick={() => handleToggleTask(task)}
        className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${cardClasses}`}
      >
        <span className="mt-0.5 shrink-0 dt-transition group-hover:scale-110">
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle
              className={`h-5 w-5 ${
                isOverdue
                  ? 'text-danger'
                  : isUrgent
                    ? 'text-warning'
                    : 'text-on-surface-variant'
              }`}
            />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={`text-xs font-semibold font-display sm:text-[13px] ${
                task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
              }`}
            >
              {task.title}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {!task.completed && isOverdue && (
                <span className="inline-flex items-center gap-1 rounded-md border border-danger/40 bg-danger-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-danger-container">
                  <Clock className="h-2.5 w-2.5 text-danger" />
                  {task.priorityLabel}
                </span>
              )}
              {!task.completed && isUrgent && (
                <span className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-warning-container px-1.5 py-0.5 font-mono text-[10px] font-bold text-on-warning-container">
                  <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                  {language === 'es' ? 'Urgente hoy' : 'Urgent today'}
                </span>
              )}
              {task.usesManualFallback && (
                <span className="rounded-md border border-warning/30 bg-warning-container px-1.5 py-0.5 text-[10px] font-semibold text-on-warning-container">
                  {language === 'es' ? 'Modo Manual' : 'Manual Mode'}
                </span>
              )}
              <span className="rounded-md border border-outline bg-surface-container px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                +{task.points} pts
              </span>
            </div>
          </div>

          <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">
            {!task.completed && task.urgencyContext ? (
              <>
                <span
                  className={`font-semibold ${
                    isOverdue ? 'text-on-danger-container' : 'text-on-warning-container'
                  }`}
                >
                  {task.urgencyContext}.
                </span>{' '}
                {task.reason}
              </>
            ) : (
              task.reason
            )}
          </p>
        </div>
      </button>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/45 p-3 backdrop-blur-[3px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="routine-focus-title"
      aria-describedby="routine-focus-desc"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          triggerManualOrAutoDock();
        }
      }}
    >
      <div
        ref={modalCardRef}
        className="dt-animate-panel flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline bg-surface-container shadow-[0_24px_64px_-24px_rgba(26,36,30,0.42)]"
      >
        {/* Header */}
        <header className="border-b border-outline-variant bg-surface-container-low/65 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-container px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-on-primary-container">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {language === 'es'
                    ? `Rutina de Hoy · Día ${missionDay}`
                    : `Today's Routine · Day ${missionDay}`}
                </span>
                {showStepIndicator && (
                  <span className="rounded-lg border border-outline bg-surface-container px-2 py-0.5 font-mono text-[11px] font-medium text-on-surface-variant">
                    {language === 'es' ? 'Paso 2 de 2 · Plan Diario' : 'Step 2 of 2 · Daily Plan'}
                  </span>
                )}
                <span className="rounded-lg border border-telemetry/30 bg-telemetry-container px-2 py-0.5 font-mono text-[11px] font-semibold text-on-telemetry-container">
                  {language === 'es' ? 'Aptitud' : 'Readiness'} {readinessScore}%
                </span>
              </div>

              <h2
                id="routine-focus-title"
                className="text-[20px] leading-[26px] font-bold tracking-[-0.015em] text-on-surface font-display sm:text-[22px]"
              >
                {language === 'es'
                  ? 'Plan Médico y Contramedidas del Día'
                  : 'Daily Medical Plan & Countermeasures'}
              </h2>
              <p id="routine-focus-desc" className="text-xs text-on-surface-variant">
                {language === 'es' ? (
                  <>
                    Misión <span className="font-semibold text-primary">{mission.shortName}</span> ·{' '}
                    {availableDevices.length - disconnectedCount}/{availableDevices.length} sensores
                    conectados. Prioriza los pendientes atrasados y urgentes.
                  </>
                ) : (
                  <>
                    Mission <span className="font-semibold text-primary">{mission.shortName}</span> ·{' '}
                    {availableDevices.length - disconnectedCount}/{availableDevices.length} sensors
                    connected. Prioritize overdue and urgent checks.
                  </>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={triggerManualOrAutoDock}
              aria-label={language === 'es' ? 'Continuar al dashboard' : 'Continue to dashboard'}
              title={
                language === 'es' ? 'Acoplar rutina al dashboard' : 'Dock routine to dashboard'
              }
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container text-on-surface-variant dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low hover:text-on-surface active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Strip */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-on-surface-variant">
                {language === 'es' ? 'Avance del turno:' : 'Shift progress:'}{' '}
                <span className="font-mono font-bold text-on-surface">
                  {completedCount}/{routines.length}
                </span>{' '}
                ({progressPct}%)
              </span>
              <span className="font-mono font-semibold text-primary">
                +{earnedPoints} {language === 'es' ? 'pts hoy' : 'pts today'}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width,background-color] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Prioritized Tasks */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 sm:px-6">
          {disconnectedCount > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/35 bg-warning-container p-3 text-xs text-on-warning-container">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <span className="font-semibold">
                  {language === 'es'
                    ? `${disconnectedCount} herramienta(s) desconectada(s):`
                    : `${disconnectedCount} tool(s) disconnected:`}
                </span>{' '}
                {language === 'es'
                  ? 'DeepTrau adaptó esos escaneos a protocolos clínicos manuales prioritarios.'
                  : 'DeepTrau adapted those scans to priority manual clinical protocols.'}
              </div>
            </div>
          )}

          {/* 1. Framed Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <section className="rounded-xl border-2 border-danger/45 bg-danger-container/20 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-danger text-on-primary">
                    <AlertOctagon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.05em] text-on-danger-container font-display">
                      {language === 'es'
                        ? 'Atrasadas de días anteriores'
                        : 'Overdue from previous days'}
                    </h3>
                    <p className="text-[11px] text-on-danger-container/85">
                      {language === 'es'
                        ? 'Requieren resolución prioritaria para cerrar el ciclo clínico previo.'
                        : 'Require priority completion to close out the prior clinical cycle.'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-danger/40 bg-danger-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-danger-container">
                  {overdueTasks.filter((t) => !t.completed).length}{' '}
                  {language === 'es' ? 'pend.' : 'left'}
                </span>
              </div>

              <div className="space-y-2">{overdueTasks.map(renderTaskButton)}</div>
            </section>
          )}

          {/* 2. Framed Urgent Tasks Today */}
          {urgentTasks.length > 0 && (
            <section className="rounded-xl border border-warning/45 bg-warning-container/25 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning text-on-primary">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.05em] text-on-warning-container font-display">
                    {language === 'es' ? 'Prioridad urgente de hoy' : "Today's urgent priority"}
                  </h3>
                </div>
                <span className="rounded-full border border-warning/40 bg-warning-container px-2 py-0.5 font-mono text-[10px] font-bold text-on-warning-container">
                  {urgentTasks.filter((t) => !t.completed).length}{' '}
                  {language === 'es' ? 'pend.' : 'left'}
                </span>
              </div>

              <div className="space-y-2">{urgentTasks.map(renderTaskButton)}</div>
            </section>
          )}

          {/* 3. Standard Scheduled Tasks */}
          {normalTasks.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant font-display">
                {language === 'es'
                  ? `Controles programados del turno (${normalTasks.length})`
                  : `Scheduled shift checks (${normalTasks.length})`}
              </h3>
              <div className="space-y-2">{normalTasks.map(renderTaskButton)}</div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low/65 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs">
            {isAutoCompleting || pendingCount === 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-semibold text-primary font-display">
                  {isAutoCompleting
                    ? language === 'es'
                      ? '¡Rutina del día completada! Acoplando al dashboard...'
                      : 'Daily routine complete! Docking to dashboard...'
                    : language === 'es'
                      ? 'Rutina del día completada al 100%.'
                      : 'Daily routine 100% completed.'}
                </span>
              </>
            ) : (
              <span className="text-on-surface-variant">
                {language === 'es'
                  ? `Se acoplará automáticamente al completar las ${pendingCount} tarea${
                      pendingCount > 1 ? 's' : ''
                    } restante${pendingCount > 1 ? 's' : ''}.`
                  : `Automatically docks upon completing the remaining ${pendingCount} task${
                      pendingCount > 1 ? 's' : ''
                    }.`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={triggerManualOrAutoDock}
            className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:text-sm"
          >
            <span>{language === 'es' ? 'Continuar al dashboard' : 'Continue to dashboard'}</span>
            <ArrowRight className="h-4 w-4 dt-transition group-hover:translate-x-0.5" />
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
