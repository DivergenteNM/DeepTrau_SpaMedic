'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  HeartPulse,
  ImagePlus,
  PlugZap,
  Power,
  Radiation,
  ScanLine,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { DeviceId, useMission } from '@/context/MissionContext';

const DEVICE_ICONS: Record<DeviceId, React.ReactNode> = {
  glucometer: <Droplets className="h-5 w-5 text-telemetry" />,
  hematology: <Activity className="h-5 w-5 text-danger" />,
  vitals_cuff: <HeartPulse className="h-5 w-5 text-primary" />,
  dosimeter: <Radiation className="h-5 w-5 text-warning" />,
  ultrasound: <ScanLine className="h-5 w-5 text-secondary" />,
};

export function SensorHubTab() {
  const {
    devices,
    biomarkers,
    toggleDevice,
    recordTelemetryScan,
    triggerDemoAnomaly,
    setActiveTab,
  } = useMission();

  const [glucoseInput, setGlucoseInput] = useState<number>(biomarkers.glucoseMgDl);
  const [wbcInput, setWbcInput] = useState<number>(biomarkers.wbcCount);
  const [spo2Input, setSpo2Input] = useState<number>(biomarkers.spo2Percent);
  const [systolicInput, setSystolicInput] = useState<number>(biomarkers.systolicBP);
  const [diastolicInput, setDiastolicInput] = useState<number>(biomarkers.diastolicBP);
  const [hrInput, setHrInput] = useState<number>(biomarkers.heartRateBpm);
  const [dailyRadInput, setDailyRadInput] = useState<number>(biomarkers.dailyRadiationMsv);
  const [ultrasoundStatus, setUltrasoundStatus] = useState<
    'Normal' | 'Edema Neuro-Ocular Leve' | 'Atrofia Muscular Leve'
  >(biomarkers.ultrasoundStatus);
  const [ultrasoundPreview, setUltrasoundPreview] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const handleSubmitTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    const nextCumulative = Number(
      (biomarkers.cumulativeRadiationMsv + dailyRadInput).toFixed(1)
    );
    const note =
      ultrasoundStatus === 'Normal'
        ? 'Escaneo de ultrasonido portátil sin hallazgos patológicos.'
        : ultrasoundStatus === 'Edema Neuro-Ocular Leve'
          ? 'Se observa leve aplanamiento del polo posterior ocular (SANS). Requiere seguimiento.'
          : 'Disminución discreta de espesor muscular en cuádriceps; intensificar ARED.';

    recordTelemetryScan(
      {
        glucoseMgDl: glucoseInput,
        wbcCount: wbcInput,
        spo2Percent: spo2Input,
        systolicBP: systolicInput,
        diastolicBP: diastolicInput,
        heartRateBpm: hrInput,
        dailyRadiationMsv: dailyRadInput,
        cumulativeRadiationMsv: nextCumulative,
        ultrasoundStatus,
      },
      note
    );
    setSavedBanner(
      'Nueva telemetría procesada. El Mapa Corporal y las alertas de misión se actualizaron en tiempo real.'
    );
    setTimeout(() => setSavedBanner(null), 4500);
  };

  const handleUltrasoundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUltrasoundPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const statusPill = (status: 'nominal' | 'warning' | 'critical', connected: boolean) => {
    if (!connected) {
      return 'border-outline bg-surface-container-high text-on-surface-variant';
    }
    if (status === 'critical') {
      return 'border-danger/35 bg-danger-container text-on-danger-container';
    }
    if (status === 'warning') {
      return 'border-warning/35 bg-warning-container text-on-warning-container';
    }
    return 'border-primary/30 bg-primary-container text-on-primary-container';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-outline bg-surface-container p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary font-display">
            Integración Modular Plug & Play
          </p>
          <h2 className="mt-1 text-[22px] leading-[28px] font-bold text-on-surface flex items-center gap-2 font-display">
            <Cpu className="h-5 w-5 text-primary" />
            Hub de Conexión de Herramientas Médicas a Bordo
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Conecta o desconecta los sensores disponibles en tu nave o rover. Si desconectas una
            herramienta, DeepTrau reconfigura el Dashboard a exámenes clínicos manuales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => triggerDemoAnomaly('solar_storm')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-danger/35 bg-danger-container px-3.5 py-2 text-xs font-semibold text-on-danger-container dt-transition hover:opacity-90"
          >
            <ShieldAlert className="h-4 w-4 text-danger" />
            Inyectar Tormenta Solar
          </button>
          <button
            type="button"
            onClick={() => triggerDemoAnomaly('hypoglycemia_immune')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-warning/35 bg-warning-container px-3.5 py-2 text-xs font-semibold text-on-warning-container dt-transition hover:opacity-90"
          >
            <AlertTriangle className="h-4 w-4 text-warning" />
            Simular Hipoglucemia + Baja Inmune
          </button>
        </div>
      </div>

      {/* Device Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className={`rounded-2xl border p-4 dt-transition ${
              dev.connected
                ? 'border-outline bg-surface-container'
                : 'border-outline bg-surface-container-low opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline bg-surface-container-low">
                  {DEVICE_ICONS[dev.id]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface font-display">
                    {dev.shortName}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-mono">{dev.unit}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleDevice(dev.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold dt-transition ${
                  dev.connected
                    ? 'border-primary/30 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                    : 'border-outline bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {dev.connected ? 'Conectado' : 'Desconectado'}
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
              {dev.description}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs">
              <div>
                <span className="block text-[10px] text-on-surface-variant">Última lectura</span>
                <span className="font-mono font-semibold text-on-surface">
                  {dev.connected ? dev.lastReading : 'Modo Manual Activo'}
                </span>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-display ${statusPill(
                  dev.status,
                  dev.connected
                )}`}
              >
                {!dev.connected
                  ? 'Sin Hardware'
                  : dev.status === 'nominal'
                    ? 'Nominal'
                    : dev.status === 'warning'
                      ? 'Precaución'
                      : 'Crítico'}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Telemetry Simulator Form */}
      <form
        onSubmit={handleSubmitTelemetry}
        className="rounded-2xl border border-outline bg-surface-container p-6 space-y-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant pb-4">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <PlugZap className="h-5 w-5 text-primary" />
              Simulador de Escaneo / Ingreso Manual de Telemetría
            </h3>
            <p className="text-xs text-on-surface-variant">
              Ajusta los deslizadores o valores de laboratorio para probar cómo responde DeepTrau
              ante variaciones reales del astronauta.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Ver impacto en Mapa Corporal →
          </button>
        </div>

        {savedBanner && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-container px-4 py-3 text-xs font-medium text-on-primary-container">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            {savedBanner}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Glucose */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-on-surface font-display">
                Glucosa en Sangre
              </label>
              <span className="font-mono font-bold text-telemetry">{glucoseInput} mg/dL</span>
            </div>
            <input
              type="range"
              min={50}
              max={210}
              value={glucoseInput}
              onChange={(e) => setGlucoseInput(Number(e.target.value))}
              className="w-full accent-telemetry"
            />
            <p className="text-[11px] text-on-surface-variant">
              Rango seguro espacial: 75 – 125 mg/dL
            </p>
          </div>

          {/* WBC / Immune */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-on-surface font-display">
                Leucocitos (Defensas)
              </label>
              <span className="font-mono font-bold text-danger">
                {wbcInput.toLocaleString('es-ES')} cél/µL
              </span>
            </div>
            <input
              type="range"
              min={2600}
              max={11000}
              step={50}
              value={wbcInput}
              onChange={(e) => setWbcInput(Number(e.target.value))}
              className="w-full accent-danger"
            />
            <p className="text-[11px] text-on-surface-variant">
              Alerta temprana si el expediente marca Defensas Bajas (&lt;4,500 cél/µL)
            </p>
          </div>

          {/* Radiation */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-on-surface font-display">
                Dosis de Radiación del Día
              </label>
              <span className="font-mono font-bold text-warning">{dailyRadInput} mSv</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={10}
              step={0.1}
              value={dailyRadInput}
              onChange={(e) => setDailyRadInput(Number(e.target.value))}
              className="w-full accent-warning"
            />
            <p className="text-[11px] text-on-surface-variant">
              &gt; 2.8 mSv/día activa alerta solar (Dosimetría CSA)
            </p>
          </div>

          {/* SpO2 */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-on-surface font-display">
                Saturación de Oxígeno (SpO₂)
              </label>
              <span className="font-mono font-bold text-primary">{spo2Input}%</span>
            </div>
            <input
              type="range"
              min={86}
              max={100}
              value={spo2Input}
              onChange={(e) => setSpo2Input(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-[11px] text-on-surface-variant">Óptimo en cabina: 95% – 100%</p>
          </div>

          {/* Blood Pressure & HR */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <label className="block text-xs font-semibold text-on-surface font-display">
              Presión Arterial (mmHg) y Pulso (bpm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-on-surface-variant">Sistólica</span>
                <input
                  type="number"
                  min={80}
                  max={190}
                  value={systolicInput}
                  onChange={(e) => setSystolicInput(Number(e.target.value))}
                  className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-xs text-on-surface font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant">Diastólica</span>
                <input
                  type="number"
                  min={50}
                  max={120}
                  value={diastolicInput}
                  onChange={(e) => setDiastolicInput(Number(e.target.value))}
                  className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-xs text-on-surface font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant">Pulso bpm</span>
                <input
                  type="number"
                  min={40}
                  max={160}
                  value={hrInput}
                  onChange={(e) => setHrInput(Number(e.target.value))}
                  className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-xs text-on-surface font-mono"
                />
              </div>
            </div>
          </div>

          {/* Portable Ultrasound */}
          <div className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-2">
            <label className="block text-xs font-semibold text-on-surface font-display">
              Escáner de Ultrasonido Portátil
            </label>
            <select
              value={ultrasoundStatus}
              onChange={(e) =>
                setUltrasoundStatus(
                  e.target.value as 'Normal' | 'Edema Neuro-Ocular Leve' | 'Atrofia Muscular Leve'
                )
              }
              className="w-full rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-xs text-on-surface"
            >
              <option value="Normal">Normal (Sin hallazgos)</option>
              <option value="Edema Neuro-Ocular Leve">Edema Neuro-Ocular Leve (SANS)</option>
              <option value="Atrofia Muscular Leve">Atrofia Muscular Leve en Cuádriceps</option>
            </select>

            <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-[11px] font-medium text-primary dt-transition hover:border-primary">
              <ImagePlus className="h-3.5 w-3.5" />
              Cargar imagen simulada de ultrasonido
              <input
                type="file"
                accept="image/*"
                onChange={handleUltrasoundImageUpload}
                className="hidden"
              />
            </label>
            {ultrasoundPreview && (
              <div className="mt-2 overflow-hidden rounded-lg border border-outline">
                <img
                  src={ultrasoundPreview}
                  alt="Vista previa de ultrasonido simulado"
                  className="h-20 w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary dt-transition hover:bg-primary-hover font-display"
          >
            <Send className="h-4 w-4" />
            Registrar Nueva Lectura en Telemetría (+25 pts)
          </button>
        </div>
      </form>
    </div>
  );
}
