'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Cpu,
  Power,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { DeviceId, useMission } from '@/context/MissionContext';
import { renderDeviceIcon, SensorDetailModal } from './SensorDetailModal';

type SensorFilter = 'all' | 'connected' | 'disconnected' | 'unavailable';

export function SensorHubTab() {
  const {
    mission,
    devices,
    toggleDevice,
    setAllAvailableDevicesConnection,
    triggerDemoAnomaly,
  } = useMission();

  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId | null>(null);
  const [filter, setFilter] = useState<SensorFilter>('all');
  const [isManageOpen, setIsManageOpen] = useState(false);

  const counts = useMemo(() => {
    const connected = devices.filter((d) => d.availableInMission && d.connected).length;
    const disconnected = devices.filter((d) => d.availableInMission && !d.connected).length;
    const unavailable = devices.filter((d) => !d.availableInMission).length;
    return {
      all: devices.length,
      connected,
      disconnected,
      unavailable,
    };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (filter === 'connected') return devices.filter((d) => d.availableInMission && d.connected);
    if (filter === 'disconnected')
      return devices.filter((d) => d.availableInMission && !d.connected);
    if (filter === 'unavailable') return devices.filter((d) => !d.availableInMission);
    return devices;
  }, [devices, filter]);

  const selectedDevice = useMemo(
    () => (selectedDeviceId ? devices.find((d) => d.id === selectedDeviceId) ?? null : null),
    [devices, selectedDeviceId]
  );

  const availableDevices = useMemo(
    () => devices.filter((d) => d.availableInMission),
    [devices]
  );

  return (
    <div className="space-y-5">
      {/* Compact Mission Equipment Header */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary-container px-2 py-0.5 font-mono text-[11px] font-semibold text-on-primary-container">
                {mission.shortName}
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                {mission.gravityLabel}
              </span>
            </div>
            <h2 className="flex items-center gap-2 text-[22px] leading-[28px] font-bold text-on-surface font-display">
              <Cpu className="h-5 w-5 text-primary" />
              Sensores y Herramientas de Cabina
            </h2>
            <p className="text-xs text-on-surface-variant">
              Activa o pausa el equipamiento disponible en esta misión. Haz clic en cualquier tarjeta
              para ver la guía de medición, pruebas y datos extendidos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-container px-3 py-1 font-mono text-[11px] font-bold text-on-primary-container">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {counts.connected} Conectado{counts.connected === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface-container-low px-3 py-1 font-mono text-[11px] font-semibold text-on-surface-variant">
              {counts.disconnected} Desconectado{counts.disconnected === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface-container-high px-3 py-1 font-mono text-[11px] font-semibold text-on-surface-variant">
              {counts.unavailable} No disponible{counts.unavailable === 1 ? '' : 's'}
            </span>

            <button
              type="button"
              onClick={() => setIsManageOpen((prev) => !prev)}
              aria-expanded={isManageOpen}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold font-display dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                isManageOpen
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-primary/35 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Gestionar sensores</span>
            </button>
          </div>
        </div>

        {/* Collapsible Sensor Management Drawer */}
        {isManageOpen && (
          <div className="dt-animate-panel rounded-xl border border-outline bg-surface-container-low p-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant pb-3">
              <div>
                <p className="text-xs font-bold text-on-surface font-display">
                  Control rápido de equipamiento · {mission.name}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Habilita todos los sensores embarcados o pasa a modo manual para ahorro energético.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllAvailableDevicesConnection(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/35 bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Conectar disponibles ({availableDevices.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllAvailableDevicesConnection(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface-variant font-display dt-transition hover:-translate-y-px hover:border-primary/40 hover:text-on-surface active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>Pasar a modo manual</span>
                </button>
              </div>
            </div>

            {/* Quick Individual Toggle Pills */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {renderDeviceIcon(dev.id, 'h-4 w-4 shrink-0')}
                    <span className="truncate font-semibold text-on-surface font-display">
                      {dev.shortName}
                    </span>
                  </div>
                  {dev.availableInMission ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dev.connected}
                      onClick={() => toggleDevice(dev.id)}
                      className={`shrink-0 cursor-pointer rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold dt-transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                        dev.connected
                          ? 'border-primary/35 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                          : 'border-outline bg-surface-container-low text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
                      }`}
                    >
                      {dev.connected ? 'ON' : 'OFF'}
                    </button>
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] text-on-surface-variant">
                      N/D
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Discrete Test Scenarios Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-3">
              <span className="text-[11px] font-semibold text-on-surface-variant font-display">
                Pruebas de alertas en sensores:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => triggerDemoAnomaly('solar_storm')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-danger/35 bg-danger-container/75 px-2.5 py-1 text-[11px] font-semibold text-on-danger-container font-display dt-transition hover:-translate-y-px hover:border-danger hover:bg-danger-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
                >
                  <ShieldAlert className="h-3 w-3 text-danger" />
                  <span>Tormenta Solar</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerDemoAnomaly('hypoglycemia_immune')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-warning/35 bg-warning-container/75 px-2.5 py-1 text-[11px] font-semibold text-on-warning-container font-display dt-transition hover:-translate-y-px hover:border-warning hover:bg-warning-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/35"
                >
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span>Hipoglucemia + Inmune</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerDemoAnomaly('nominal')}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant font-display dt-transition hover:-translate-y-px hover:border-primary/40 hover:text-on-surface active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restablecer Nominal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-outline-variant pt-3">
          {(
            [
              { id: 'all', label: `Todos (${counts.all})` },
              { id: 'connected', label: `Conectados (${counts.connected})` },
              { id: 'disconnected', label: `Desconectados (${counts.disconnected})` },
              { id: 'unavailable', label: `No disponibles (${counts.unavailable})` },
            ] as const
          ).map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                  active
                    ? 'border-primary/40 bg-primary-container text-on-primary-container'
                    : 'border-outline bg-surface-container-low text-on-surface-variant hover:border-primary/35 hover:text-on-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Clean Minimalist Sensor Cards Grid */}
      {filteredDevices.length === 0 ? (
        <div className="rounded-2xl border border-outline bg-surface-container p-8 text-center text-xs text-on-surface-variant">
          No hay sensores en esta categoría para{' '}
          <span className="font-semibold text-on-surface">{mission.shortName}</span>.
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((dev) => {
            const isAvailable = dev.availableInMission;
            const isConnected = isAvailable && dev.connected;
            const hasAlert = isConnected && dev.status !== 'nominal';

            const cardClasses = !isAvailable
              ? 'border-outline bg-surface-container-low/75 opacity-80 hover:opacity-100 hover:border-outline'
              : !isConnected
                ? 'border-outline bg-surface-container-low hover:border-primary/45 hover:bg-surface-container'
                : dev.status === 'critical'
                  ? 'border-danger/50 bg-danger-container/25 hover:border-danger'
                  : dev.status === 'warning'
                    ? 'border-warning/45 bg-warning-container/25 hover:border-warning'
                    : 'border-outline bg-surface-container hover:border-primary/55';

            return (
              <article
                key={dev.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDeviceId(dev.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDeviceId(dev.id);
                  }
                }}
                aria-label={`Abrir guía y pruebas de ${dev.shortName}`}
                className={`group flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border p-5 dt-transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(47,93,70,0.22)] active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${cardClasses}`}
              >
                {/* Row 1: Icon + Name + Connection Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border dt-transition group-hover:scale-105 ${
                        isConnected
                          ? 'border-outline bg-surface-container-low'
                          : 'border-outline bg-surface-container'
                      }`}
                    >
                      {renderDeviceIcon(dev.id, 'h-5 w-5')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-on-surface font-display">
                        {dev.shortName}
                      </h3>
                      <p className="truncate text-[11px] text-on-surface-variant">
                        {dev.categoryLabel}
                      </p>
                    </div>
                  </div>

                  {isAvailable ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isConnected}
                      aria-label={
                        isConnected
                          ? `Desconectar ${dev.shortName}`
                          : `Conectar ${dev.shortName}`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDevice(dev.id);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 dt-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                        isConnected
                          ? 'border-primary bg-primary'
                          : 'border-outline bg-surface-container-high hover:border-primary/45'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-surface-container shadow-xs dt-transition ${
                          isConnected ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-outline bg-surface-container-high px-2 py-0.5 font-mono text-[10px] font-semibold text-on-surface-variant">
                      <Ban className="h-3 w-3" />
                      <span>N/D</span>
                    </span>
                  )}
                </div>

                {/* Row 2: Main Reading / Inactive / Mission Restriction */}
                <div className="min-h-[44px] flex flex-col justify-center">
                  {!isAvailable ? (
                    <p className="text-xs font-medium text-on-surface-variant">
                      No embarcado en {mission.shortName}
                    </p>
                  ) : isConnected ? (
                    <div>
                      <p className="font-mono text-xl leading-tight font-bold tracking-tight text-on-surface">
                        {dev.lastReading}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
                        {dev.unit}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-on-surface-variant font-display">
                        En espera · Pausado
                      </p>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant">
                        Protocolo clínico manual activo
                      </p>
                    </div>
                  )}
                </div>

                {/* Row 3: Connection Badge + Alert Indicator (if applicable) */}
                <div className="flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-semibold ${
                      !isAvailable
                        ? 'border-outline bg-surface-container-high text-on-surface-variant'
                        : isConnected
                          ? 'border-primary/30 bg-primary-container text-on-primary-container'
                          : 'border-outline bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        !isAvailable
                          ? 'bg-on-surface-variant/60'
                          : isConnected
                            ? 'bg-primary'
                            : 'bg-on-surface-variant'
                      }`}
                    />
                    {!isAvailable
                      ? 'No disponible en esta misión'
                      : isConnected
                        ? 'Conectado'
                        : 'Desconectado'}
                  </span>

                  {hasAlert ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${
                        dev.status === 'critical'
                          ? 'border-danger/40 bg-danger-container text-on-danger-container'
                          : 'border-warning/40 bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {dev.status === 'critical' ? (
                        <ShieldAlert className="h-3 w-3 text-danger" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-warning" />
                      )}
                      {dev.status === 'critical' ? 'Crítico' : 'Precaución'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary opacity-80 dt-transition group-hover:translate-x-0.5 group-hover:opacity-100 font-display">
                      <span>Guía y pruebas</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Detail, Measurement Guide & Diagnostics Modal */}
      <SensorDetailModal
        device={selectedDevice}
        onClose={() => setSelectedDeviceId(null)}
      />
    </div>
  );
}
