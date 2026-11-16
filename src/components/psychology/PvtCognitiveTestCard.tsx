'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Play, RotateCcw, Timer } from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { evaluatePvtSession, PvtSessionResult } from '@/utils/psychologyAnalysis';

type PvtPhase = 'idle' | 'waiting' | 'stimulus' | 'feedback' | 'done';

const TOTAL_TRIALS = 5;

export function PvtCognitiveTestCard() {
  const { missionDay, pvtHistory, savePvtSession } = useMission();

  const [phase, setPhase] = useState<PvtPhase>('idle');
  const [trialIndex, setTrialIndex] = useState(0);
  const [trialsMs, setTrialsMs] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [lastTrialMs, setLastTrialMs] = useState<number | null>(null);
  const [falseStartFlash, setFalseStartFlash] = useState(false);
  const [latestResult, setLatestResult] = useState<PvtSessionResult | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stimulusStartRef = useRef<number>(0);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const scheduleNextStimulus = () => {
    clearTimer();
    setFalseStartFlash(false);
    setPhase('waiting');
    const delayMs = 1400 + Math.floor(Math.random() * 2100);
    timeoutRef.current = setTimeout(() => {
      stimulusStartRef.current = performance.now();
      setPhase('stimulus');
    }, delayMs);
  };

  const startTest = () => {
    setTrialIndex(0);
    setTrialsMs([]);
    setFalseStarts(0);
    setLastTrialMs(null);
    setLatestResult(null);
    scheduleNextStimulus();
  };

  const resetTest = () => {
    clearTimer();
    setPhase('idle');
    setTrialIndex(0);
    setTrialsMs([]);
    setFalseStarts(0);
    setLastTrialMs(null);
    setFalseStartFlash(false);
    setLatestResult(null);
  };

  const handlePadClick = () => {
    if (phase === 'waiting') {
      clearTimer();
      setFalseStarts((f) => f + 1);
      setFalseStartFlash(true);
      timeoutRef.current = setTimeout(() => {
        scheduleNextStimulus();
      }, 900);
      return;
    }

    if (phase === 'stimulus') {
      const rt = Math.max(110, Math.round(performance.now() - stimulusStartRef.current));
      const updatedTrials = [...trialsMs, rt];
      setTrialsMs(updatedTrials);
      setLastTrialMs(rt);

      const nextIndex = trialIndex + 1;
      if (nextIndex >= TOTAL_TRIALS) {
        const evaluated = evaluatePvtSession(updatedTrials, falseStarts, missionDay);
        setLatestResult(evaluated);
        setPhase('done');
        savePvtSession(evaluated);
      } else {
        setTrialIndex(nextIndex);
        setPhase('feedback');
        timeoutRef.current = setTimeout(() => {
          scheduleNextStimulus();
        }, 700);
      }
    }
  };

  const lastSaved = latestResult ?? pvtHistory[0] ?? null;

  const statusTone =
    lastSaved?.statusLabel === 'Alerta Circadiana'
      ? 'border-danger/35 bg-danger-container text-on-danger-container'
      : lastSaved?.statusLabel === 'Fatiga Leve'
        ? 'border-warning/35 bg-warning-container text-on-warning-container'
        : 'border-primary/35 bg-primary-container text-on-primary-container';

  return (
    <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-3">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
            <Timer className="h-5 w-5 text-telemetry" />
            Test de Vigilancia Psicomotora (PVT · 5 Estímulos)
          </h2>
          <p className="text-xs text-on-surface-variant">
            Protocolo estándar NASA para medir latencia de reacción (ms), lapsos atencionales y
            fatiga circadiana real.
          </p>
        </div>
        {lastSaved && (
          <div className={`rounded-full border px-3 py-1 text-[11px] font-bold font-mono ${statusTone}`}>
            Alerta Cognitiva: {lastSaved.alertnessScore}% · {lastSaved.statusLabel}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-12 items-stretch">
        {/* Interactive Reaction Pad */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          {phase === 'idle' && (
            <div className="rounded-xl border border-outline bg-surface-container-low p-5 flex flex-col items-center justify-center text-center min-h-[168px] space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-telemetry/30 bg-telemetry-container text-telemetry">
                <Activity className="h-5 w-5" />
              </div>
              <div className="max-w-md space-y-1">
                <p className="text-xs font-bold text-on-surface font-display">
                  Listo para calibración cognitiva (~15 segundos)
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Pulsa el panel solo cuando el indicador cambie a verde clínico. Mediremos tu tiempo
                  real con precisión de milisegundos.
                </p>
              </div>
              <button
                type="button"
                onClick={startTest}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
              >
                <Play className="h-4 w-4" />
                Iniciar Test PVT
              </button>
            </div>
          )}

          {(phase === 'waiting' || phase === 'stimulus' || phase === 'feedback') && (
            <button
              type="button"
              onClick={handlePadClick}
              className={`w-full min-h-[168px] cursor-pointer rounded-xl border-2 p-5 flex flex-col items-center justify-center text-center dt-transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                phase === 'stimulus'
                  ? 'border-primary bg-primary text-on-primary shadow-[0_0_0_4px_rgba(47,93,70,0.2)]'
                  : falseStartFlash
                    ? 'border-danger bg-danger-container text-on-danger-container'
                    : phase === 'feedback'
                      ? 'border-telemetry bg-telemetry-container text-on-telemetry-container'
                      : 'border-outline bg-viewport-surface text-on-viewport'
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-wider opacity-80">
                Estímulo {Math.min(trialIndex + 1, TOTAL_TRIALS)} de {TOTAL_TRIALS}
              </span>
              {phase === 'stimulus' ? (
                <>
                  <p className="mt-2 text-2xl font-bold font-display">¡PULSA AHORA!</p>
                  <p className="mt-1 text-xs opacity-90">Estímulo visual activo</p>
                </>
              ) : falseStartFlash ? (
                <>
                  <p className="mt-2 text-base font-bold font-display flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Anticipación detectada
                  </p>
                  <p className="mt-1 text-xs">Espera al cambio visual antes de pulsar…</p>
                </>
              ) : phase === 'feedback' && lastTrialMs !== null ? (
                <>
                  <p className="mt-2 text-2xl font-bold font-mono">{lastTrialMs} ms</p>
                  <p className="mt-1 text-xs">
                    {lastTrialMs >= 500
                      ? 'Lapso atencional (>= 500 ms)'
                      : lastTrialMs <= 300
                        ? 'Respuesta rápida óptima'
                        : 'Respuesta dentro de rango'}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-base font-bold font-display">Mantén la mirada fija…</p>
                  <p className="mt-1 text-xs opacity-75">Esperando estímulo aleatorio</p>
                </>
              )}
            </button>
          )}

          {phase === 'done' && latestResult && (
            <div className="dt-animate-panel rounded-xl border border-primary/35 bg-primary-container/50 p-4 space-y-3 min-h-[168px] flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-on-primary-container font-display">
                    Evaluación PVT guardada (+20 pts)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={startTest}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface dt-transition hover:-translate-y-px hover:border-primary/45 active:scale-[0.98]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Repetir
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-outline bg-surface-container p-2.5">
                  <p className="text-[10px] text-on-surface-variant">Media RT</p>
                  <p className="font-mono text-sm font-bold text-on-surface">
                    {latestResult.meanRtMs} ms
                  </p>
                </div>
                <div className="rounded-lg border border-outline bg-surface-container p-2.5">
                  <p className="text-[10px] text-on-surface-variant">Mejor RT</p>
                  <p className="font-mono text-sm font-bold text-primary">
                    {latestResult.fastestRtMs} ms
                  </p>
                </div>
                <div className="rounded-lg border border-outline bg-surface-container p-2.5">
                  <p className="text-[10px] text-on-surface-variant">Lapsos / Falsos</p>
                  <p className="font-mono text-sm font-bold text-warning">
                    {latestResult.lapses} / {latestResult.falseStarts}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {latestResult.trialsMs.map((ms, idx) => (
                  <span
                    key={`${ms}-${idx}`}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      ms >= 500
                        ? 'border-warning/35 bg-warning-container text-on-warning-container'
                        : 'border-outline bg-surface-container text-on-surface'
                    }`}
                  >
                    #{idx + 1}: {ms} ms
                  </span>
                ))}
              </div>
            </div>
          )}

          {phase !== 'idle' && phase !== 'done' && (
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>
                Ensayos completados: <strong className="font-mono">{trialsMs.length}/{TOTAL_TRIALS}</strong>
                {falseStarts > 0 ? ` · Anticipaciones: ${falseStarts}` : ''}
              </span>
              <button
                type="button"
                onClick={resetTest}
                className="cursor-pointer rounded-lg border border-outline bg-surface-container-low px-2.5 py-1 text-[11px] font-medium text-on-surface dt-transition hover:bg-surface-container-high active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Historical PVT Baseline Comparison */}
        <div className="lg:col-span-5 rounded-xl border border-outline bg-surface-container-low p-4 flex flex-col justify-between space-y-3">
          <div>
            <p className="text-xs font-bold text-on-surface font-display">
              Comparativa vs Línea Base Orbital
            </p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">
              Umbral óptimo: &lt; 300 ms sin lapsos (&gt;= 500 ms). Refleja deuda de sueño antes
              que la percepción subjetiva.
            </p>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {pvtHistory.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">
                Aún no hay mediciones PVT registradas.
              </p>
            ) : (
              pvtHistory.slice(0, 4).map((item) => {
                const barWidth = Math.max(15, Math.min(100, item.alertnessScore));
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-outline bg-surface-container p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-on-surface-variant">{item.timestamp}</span>
                      <span className="font-mono font-bold text-on-surface">
                        {item.meanRtMs} ms · {item.alertnessScore}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-[width,background-color] duration-300 ${
                          item.alertnessScore >= 78
                            ? 'bg-primary'
                            : item.alertnessScore >= 55
                              ? 'bg-warning'
                              : 'bg-danger'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
