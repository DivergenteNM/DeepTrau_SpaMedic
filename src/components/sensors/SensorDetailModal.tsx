'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  FlaskConical,
  HeartPulse,
  ImagePlus,
  LineChart,
  Play,
  Power,
  Radiation,
  ScanLine,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Wind,
  X,
} from 'lucide-react';
import { DeviceConnection, DeviceId, useMission } from '@/context/MissionContext';

interface SensorDetailModalProps {
  device: DeviceConnection | null;
  onClose: () => void;
}

type ModalSectionTab = 'all' | 'guide' | 'tests' | 'extended';

interface DiagnosticTestSpec {
  id: string;
  title: string;
  subtitle: string;
  passedMetric: string;
}

interface SensorGuideSpec {
  steps: string[];
  manualFallback: string;
  ranges: {
    nominal: string;
    warning: string;
    critical: string;
  };
  tests: DiagnosticTestSpec[];
}

const SENSOR_GUIDES: Record<DeviceId, SensorGuideSpec> = {
  vitals_cuff: {
    steps: [
      'Coloca el brazalete orbital en el brazo izquierdo a la altura del corazón en reposo.',
      'Inserta el dedo índice en el dedal infrarrojo del oxímetro sin humedad ni obstrucciones.',
      'Permanece inmóvil durante 30 segundos sin hablar mientras el ciclo oscilométrico mide.',
      'Confirma que SpO₂%, presión arterial y pulso se sincronicen con tu línea base EHR.',
    ],
    manualFallback:
      'Cuenta pulsaciones en la arteria radial durante 30 s (×2), inspecciona coloración ungueal/labial y evalúa mareo al incorporarte.',
    ranges: {
      nominal: 'SpO₂ ≥95% · PA <140/90 · FC 50–94 bpm',
      warning: 'SpO₂ 92–94% · ΔPA ≥18 · FC 95–114 bpm',
      critical: 'SpO₂ <92% · PA ≤90 o ≥150 · FC ≥115 bpm',
    },
    tests: [
      {
        id: 'cuff-baro',
        title: 'Calibración barométrica del brazalete',
        subtitle: 'Compensación de presión de cabina en tiempo real',
        passedMetric: '±1.1 mmHg · Cero verificado',
      },
      {
        id: 'cuff-led',
        title: 'Test óptico LED rojo / infrarrojo',
        subtitle: 'Verifica ganancia fotodiodo para lectura de SpO₂%',
        passedMetric: 'Relación S/R 42 dB · Óptimo',
      },
      {
        id: 'cuff-ble',
        title: 'Test de enlace telemétrico con consola',
        subtitle: 'Latencia y pérdida de paquetes hacia bus médico',
        passedMetric: '11 ms · 0% pérdida de trama',
      },
    ],
  },
  dosimeter: {
    steps: [
      'Porta el dosímetro personal en el bolsillo pectoral del uniforme o sobre el chaleco EVA.',
      'Comprueba que la ventana del sensor de silicio no esté cubierta por placas metálicas.',
      'Tras actividad solar o tránsito geomagnético, acerca el módulo al lector de cabina.',
      'Contrasta la tasa diaria (mSv/día) frente al presupuesto acumulado seguro de la misión.',
    ],
    manualFallback:
      'Registra las horas acumuladas fuera del módulo blindado y consulta los avisos de clima espacial en navegación.',
    ranges: {
      nominal: 'Tasa <2.8 mSv/día · Acum. bajo umbral de alerta',
      warning: 'Tasa ≥2.8 mSv/día o sobre umbral de precaución',
      critical: 'Tasa ≥5.0 mSv/día o límite de misión superado',
    },
    tests: [
      {
        id: 'dos-silicon',
        title: 'Verificación de diodo detector CSA',
        subtitle: 'Ruido térmico de fondo en cámara de silicio',
        passedMetric: 'Fondo 0.02 µSv/h · Estable',
      },
      {
        id: 'dos-alarm',
        title: 'Autotest de umbral de tormenta solar',
        subtitle: 'Simula pulso de partículas para disparo de alerta',
        passedMetric: 'Umbral 2.8 mSv/d · Operativo',
      },
      {
        id: 'dos-mem',
        title: 'Integridad de memoria dosimétrica local',
        subtitle: 'Validación CRC de serie histórica acumulada',
        passedMetric: '100% bloques íntegros',
      },
    ],
  },
  glucometer: {
    steps: [
      'Limpia la yema del dedo anular con toallita estéril y espera 15 segundos a que seque.',
      'Inserta la tira reactiva en la cámara térmica hasta que el equipo marque "Listo".',
      'Realiza la punción capilar lateral sin presionar en exceso para no diluir la muestra.',
      'Registra el contexto (ayunas, pre-EVA o post-ingesta) para validar contra tu basal EHR.',
    ],
    manualFallback:
      'Evalúa temblor fino en manos, sudoración fría, visión borrosa o fatiga cognitiva repentina antes de operar.',
    ranges: {
      nominal: '75 – 134 mg/dL (óptimo basal 75–125)',
      warning: '65–74 mg/dL o 135–174 mg/dL',
      critical: '<65 mg/dL (hipoglucemia) o ≥175 mg/dL',
    },
    tests: [
      {
        id: 'gluc-ctrl',
        title: 'Calibración con solución de control',
        subtitle: 'Verificación de curva enzimática estándar',
        passedMetric: 'Desviación 1.4% · Calibrado',
      },
      {
        id: 'gluc-temp',
        title: 'Estabilidad térmica de cámara reactiva',
        subtitle: 'Control PID interno para precisión capilar en 0g',
        passedMetric: '37.0 °C · Estable',
      },
      {
        id: 'gluc-strip',
        title: 'Lectura óptica de lote de tiras',
        subtitle: 'Comprueba humedad de cartucho y caducidad',
        passedMetric: 'Humedad 11% · Lote vigente',
      },
    ],
  },
  hematology: {
    steps: [
      'Invierte suavemente el cartucho microfluídico durante 10 segundos para homogeneizar en 0g.',
      'Deposita la micromuestra capilar en el puerto sellado evitando burbujas de aire.',
      'Introduce el cartucho en la bahía óptica hasta escuchar el bloqueo magnético.',
      'Espera 90 segundos mientras la citometría portátil calcula el conteo leucocitario.',
    ],
    manualFallback:
      'Autoexamen de ganglios cervicales/axilares, revisión de mucosa oral, fatiga inusual y toma de temperatura oral.',
    ranges: {
      nominal: '>4,500 cél/µL (o >4,100 con EHR normal)',
      warning: '3,601–4,500 cél/µL (vigilancia inmune)',
      critical: '≤3,600 cél/µL (≤3,200 si EHR normal)',
    },
    tests: [
      {
        id: 'hem-laser',
        title: 'Alineación láser de citometría',
        subtitle: 'Verifica enfoque óptico del canal de conteo celular',
        passedMetric: 'Foco 0.4 µm · Alineado',
      },
      {
        id: 'hem-bubble',
        title: 'Purga acústica de microburbujas 0g',
        subtitle: 'Garantiza flujo laminar sin aire en microgravedad',
        passedMetric: '0 burbujas detectadas',
      },
      {
        id: 'hem-reagent',
        title: 'Integridad de reactivos inmunes',
        subtitle: 'Transmitancia óptica del cartucho de referencia',
        passedMetric: 'Estabilidad 99.4% · OK',
      },
    ],
  },
  ultrasound: {
    steps: [
      'Asegura tus pies al anclaje de cabina para estabilizar la postura durante el escaneo.',
      'Aplica gel hidrosoluble sobre el transductor lineal evitando dispersión en cabina.',
      'Coloca la sonda sobre párpado cerrado (control SANS) o tercio medio del cuádriceps.',
      'Guarda el barrido transversal y carga la captura para análisis local o enlace Tierra.',
    ],
    manualFallback:
      'Test de rejilla de Amsler para agudeza visual, autoevaluación de presión cefálica y cinta métrica muscular.',
    ranges: {
      nominal: 'Sin edema neuro-ocular ni atrofia muscular',
      warning: 'Edema neuro-ocular leve o pérdida muscular',
      critical: 'Progresión SANS con déficit visual agudo',
    },
    tests: [
      {
        id: 'us-crystal',
        title: 'Test de elementos piezoeléctricos',
        subtitle: 'Diagnóstico de los 64 canales del transductor lineal',
        passedMetric: '64/64 canales activos',
      },
      {
        id: 'us-doppler',
        title: 'Calibración de profundidad Doppler SANS',
        subtitle: 'Ajuste acústico para vaina del nervio óptico (3 mm)',
        passedMetric: 'Resolución 0.12 mm · Óptimo',
      },
      {
        id: 'us-dicom',
        title: 'Buffer DICOM cifrado local-first',
        subtitle: 'Verifica empaquetado para envío asíncrono a Tierra',
        passedMetric: 'Cola lista · Cifrado AES-256',
      },
    ],
  },
  eva_spirometer: {
    steps: [
      'Ejecuta la medición en la esclusa inmediatamente después de retirar el casco EVA.',
      'Acopla la boquilla antimicrobiana y sella los labios tras una inspiración máxima.',
      'Exhala de forma continua 6 segundos mientras el sensor infrarrojo mide temperatura.',
      'Si estuviste expuesto a regolito fino, repite el control tras purgar el aire de esclusa.',
    ],
    manualFallback:
      'Cuenta respiraciones por minuto en reposo, evalúa tos irritativa o sibilancias y registra temperatura oral.',
    ranges: {
      nominal: '35.9–37.7 °C · SpO₂ ≥95% · Flujo limpio',
      warning: '35.3–35.8 o 37.8–38.4 °C · SpO₂ 92–94%',
      critical: '≤35.2 o ≥38.5 °C · SpO₂ <92% post-EVA',
    },
    tests: [
      {
        id: 'eva-flow',
        title: 'Puesta a cero de turbina espiratoria',
        subtitle: 'Calibra el caudalímetro a presión actual de esclusa',
        passedMetric: 'Cero ±0.01 L/s · Verificado',
      },
      {
        id: 'eva-ir',
        title: 'Test de termómetro infrarrojo central',
        subtitle: 'Comprueba referencia térmica frente a cuerpo negro',
        passedMetric: 'Precisión ±0.1 °C · OK',
      },
      {
        id: 'eva-dust',
        title: 'Inspección óptica de filtro anti-regolito',
        subtitle: 'Detecta obstrucción por polvo lunar o marciano',
        passedMetric: 'Filtro limpio · 98% caudal',
      },
    ],
  },
};

export function renderDeviceIcon(id: DeviceId, className = 'h-5 w-5') {
  switch (id) {
    case 'vitals_cuff':
      return <HeartPulse className={`${className} text-primary`} />;
    case 'dosimeter':
      return <Radiation className={`${className} text-warning`} />;
    case 'glucometer':
      return <Droplets className={`${className} text-telemetry`} />;
    case 'hematology':
      return <Activity className={`${className} text-danger`} />;
    case 'ultrasound':
      return <ScanLine className={`${className} text-secondary`} />;
    case 'eva_spirometer':
      return <Wind className={`${className} text-telemetry`} />;
  }
}

export function SensorDetailModal({ device, onClose }: SensorDetailModalProps) {
  const {
    mission,
    astronaut,
    biomarkers,
    history,
    systemStatuses,
    toggleDevice,
    recordTelemetryScan,
  } = useMission();

  const [sectionTab, setSectionTab] = useState<ModalSectionTab>('all');
  const [testStates, setTestStates] = useState<
    Record<string, 'idle' | 'running' | 'passed'>
  >({});
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Per-sensor telemetry simulator inputs
  const [glucoseInput, setGlucoseInput] = useState<number>(biomarkers.glucoseMgDl);
  const [wbcInput, setWbcInput] = useState<number>(biomarkers.wbcCount);
  const [spo2Input, setSpo2Input] = useState<number>(biomarkers.spo2Percent);
  const [systolicInput, setSystolicInput] = useState<number>(biomarkers.systolicBP);
  const [diastolicInput, setDiastolicInput] = useState<number>(biomarkers.diastolicBP);
  const [hrInput, setHrInput] = useState<number>(biomarkers.heartRateBpm);
  const [dailyRadInput, setDailyRadInput] = useState<number>(biomarkers.dailyRadiationMsv);
  const [bodyTempInput, setBodyTempInput] = useState<number>(biomarkers.bodyTempC);
  const [ultrasoundStatus, setUltrasoundStatus] = useState<
    'Normal' | 'Edema Neuro-Ocular Leve' | 'Atrofia Muscular Leve'
  >(biomarkers.ultrasoundStatus);
  const [ultrasoundPreview, setUltrasoundPreview] = useState<string | null>(null);

  // Sync local inputs and reset transient test states when opening another device
  useEffect(() => {
    if (!device) return;
    setSectionTab('all');
    setTestStates({});
    setScanFeedback(null);
    setGlucoseInput(biomarkers.glucoseMgDl);
    setWbcInput(biomarkers.wbcCount);
    setSpo2Input(biomarkers.spo2Percent);
    setSystolicInput(biomarkers.systolicBP);
    setDiastolicInput(biomarkers.diastolicBP);
    setHrInput(biomarkers.heartRateBpm);
    setDailyRadInput(biomarkers.dailyRadiationMsv);
    setBodyTempInput(biomarkers.bodyTempC);
    setUltrasoundStatus(biomarkers.ultrasoundStatus);
  }, [
    device?.id,
    biomarkers.glucoseMgDl,
    biomarkers.wbcCount,
    biomarkers.spo2Percent,
    biomarkers.systolicBP,
    biomarkers.diastolicBP,
    biomarkers.heartRateBpm,
    biomarkers.dailyRadiationMsv,
    biomarkers.bodyTempC,
    biomarkers.ultrasoundStatus,
  ]);

  useEffect(() => {
    if (!device) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [device, onClose]);

  const extendedMetrics = useMemo(() => {
    if (!device) return [];
    const isLowImmune = astronaut.clinicalHistory.immuneStatus !== 'Normal';

    switch (device.id) {
      case 'vitals_cuff':
        return [
          { label: 'Saturación O₂', value: `${biomarkers.spo2Percent}%` },
          { label: 'Presión Arterial', value: `${biomarkers.systolicBP}/${biomarkers.diastolicBP} mmHg` },
          { label: 'Frecuencia Cardíaca', value: `${biomarkers.heartRateBpm} bpm` },
          {
            label: 'Base EHR en Tierra',
            value: `${astronaut.clinicalHistory.baselineBP} · ${astronaut.clinicalHistory.baselineHR} bpm`,
          },
        ];
      case 'dosimeter':
        return [
          {
            label: 'Dosis Acumulada',
            value: `${biomarkers.cumulativeRadiationMsv.toFixed(1)} mSv`,
          },
          {
            label: 'Tasa Diaria',
            value: `${biomarkers.dailyRadiationMsv.toFixed(2)} mSv/día`,
          },
          {
            label: 'Umbral Alerta / Límite',
            value: `${mission.warningLimitMsv} / ${mission.missionLimitMsv} mSv`,
          },
          {
            label: 'Margen Restante',
            value: `${Math.max(
              0,
              mission.missionLimitMsv - biomarkers.cumulativeRadiationMsv
            ).toFixed(1)} mSv`,
          },
        ];
      case 'glucometer':
        return [
          { label: 'Glucemia Actual', value: `${biomarkers.glucoseMgDl} mg/dL` },
          {
            label: 'Línea Base EHR',
            value: `${astronaut.clinicalHistory.baselineGlucose} mg/dL`,
          },
          {
            label: 'Desviación vs Base',
            value: `${biomarkers.glucoseMgDl - astronaut.clinicalHistory.baselineGlucose >= 0 ? '+' : ''}${
              biomarkers.glucoseMgDl - astronaut.clinicalHistory.baselineGlucose
            } mg/dL`,
          },
          {
            label: 'Perfil Metabólico',
            value: mission.id === 'planetary-habitat' ? 'Alta demanda EVA' : 'Nominal en cabina',
          },
        ];
      case 'hematology':
        return [
          {
            label: 'Leucocitos Actuales',
            value: `${biomarkers.wbcCount.toLocaleString('es-ES')} cél/µL`,
          },
          {
            label: 'Inmunidad Pre-Misión',
            value: isLowImmune ? 'Defensas Bajas (EHR)' : 'Normal (EHR)',
          },
          { label: 'Grupo Sanguíneo', value: astronaut.bloodType },
          {
            label: 'Umbral de Alerta',
            value: isLowImmune ? '<4,500 cél/µL' : '<4,100 cél/µL',
          },
        ];
      case 'ultrasound':
        return [
          { label: 'Hallazgo Actual', value: biomarkers.ultrasoundStatus },
          {
            label: 'Masa Muscular',
            value: `${biomarkers.muscleMassRetentionPercent}% retención`,
          },
          {
            label: 'Densidad Ósea',
            value: `${biomarkers.boneDensityRetentionPercent}% retención`,
          },
          { label: 'Enlace con Tierra', value: mission.commDelay },
        ];
      case 'eva_spirometer':
        return [
          { label: 'Temperatura Central', value: `${biomarkers.bodyTempC.toFixed(1)} °C` },
          { label: 'Saturación Post-EVA', value: `${biomarkers.spo2Percent}% SpO₂` },
          { label: 'Gravedad Superficie', value: mission.gravityLabel },
          { label: 'Riesgo Respiratorio', value: mission.primaryHazards[0] ?? 'Control nominal' },
        ];
    }
  }, [device, astronaut, biomarkers, mission]);

  const recentHistoryRows = useMemo(() => {
    if (!device) return [];
    const slice = history.slice(-6);
    switch (device.id) {
      case 'dosimeter':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `${pt.radiationMsv.toFixed(1)} mSv`,
          ratio: Math.min(1, pt.radiationMsv / Math.max(1, mission.missionLimitMsv)),
        }));
      case 'glucometer':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `${pt.glucoseMgDl} mg/dL`,
          ratio: Math.min(1, Math.max(0.1, (pt.glucoseMgDl - 50) / 150)),
        }));
      case 'hematology':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `${pt.wbcCount.toLocaleString('es-ES')}/µL`,
          ratio: Math.min(1, Math.max(0.1, pt.wbcCount / 10500)),
        }));
      case 'ultrasound':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `Músculo ${pt.muscleRetention}% · Óseo ${pt.boneRetention}%`,
          ratio: Math.min(1, Math.max(0.1, (pt.muscleRetention - 90) / 10)),
        }));
      case 'vitals_cuff':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `Sueño ${pt.sleepHours}h · Estrés ${pt.stressLevel}/10`,
          ratio: Math.min(1, Math.max(0.15, 1 - pt.stressLevel / 10)),
        }));
      case 'eva_spirometer':
        return slice.map((pt) => ({
          dayLabel: `Día ${pt.day}`,
          valueLabel: `${pt.radiationMsv.toFixed(1)} mSv acum. · Ánimo ${pt.moodScore}/10`,
          ratio: Math.min(1, Math.max(0.15, pt.moodScore / 10)),
        }));
    }
  }, [device, history, mission.missionLimitMsv]);

  if (!device || typeof document === 'undefined') return null;

  const guide = SENSOR_GUIDES[device.id];
  const isAvailable = device.availableInMission;
  const isConnected = isAvailable && device.connected;

  const runSingleTest = (testId: string) => {
    if (!isConnected) return;
    setTestStates((prev) => ({ ...prev, [testId]: 'running' }));
    window.setTimeout(() => {
      setTestStates((prev) => ({ ...prev, [testId]: 'passed' }));
    }, 450);
  };

  const runAllTests = () => {
    if (!isConnected) return;
    guide.tests.forEach((test, index) => {
      setTestStates((prev) => ({ ...prev, [test.id]: 'running' }));
      window.setTimeout(() => {
        setTestStates((prev) => ({ ...prev, [test.id]: 'passed' }));
      }, 360 + index * 220);
    });
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

  const handleRecordSensorReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    if (device.id === 'glucometer') {
      recordTelemetryScan({ glucoseMgDl: glucoseInput });
    } else if (device.id === 'hematology') {
      recordTelemetryScan({ wbcCount: wbcInput });
    } else if (device.id === 'vitals_cuff') {
      recordTelemetryScan({
        spo2Percent: spo2Input,
        systolicBP: systolicInput,
        diastolicBP: diastolicInput,
        heartRateBpm: hrInput,
      });
    } else if (device.id === 'dosimeter') {
      const nextCumulative = Number(
        (biomarkers.cumulativeRadiationMsv + dailyRadInput).toFixed(1)
      );
      recordTelemetryScan({
        dailyRadiationMsv: dailyRadInput,
        cumulativeRadiationMsv: nextCumulative,
      });
    } else if (device.id === 'ultrasound') {
      const note =
        ultrasoundStatus === 'Normal'
          ? 'Escaneo de ultrasonido portátil sin hallazgos patológicos.'
          : ultrasoundStatus === 'Edema Neuro-Ocular Leve'
            ? 'Leve aplanamiento del polo posterior ocular (SANS). Requiere seguimiento.'
            : 'Disminución discreta de espesor muscular en cuádriceps; reforzar ARED.';
      recordTelemetryScan({ ultrasoundStatus }, note);
    } else if (device.id === 'eva_spirometer') {
      recordTelemetryScan({
        bodyTempC: bodyTempInput,
        spo2Percent: spo2Input,
      });
    }

    setScanFeedback(
      'Lectura registrada en telemetría (+25 pts). El Mapa Corporal y las alertas se actualizaron.'
    );
    window.setTimeout(() => setScanFeedback(null), 4000);
  };

  const connectionBadge = !isAvailable
    ? {
        label: 'No disponible en esta misión',
        classes: 'border-outline bg-surface-container-high text-on-surface-variant',
      }
    : isConnected
      ? {
          label: 'Conectado · Lectura activa',
          classes: 'border-primary/35 bg-primary-container text-on-primary-container',
        }
      : {
          label: 'Desconectado · En espera',
          classes: 'border-outline bg-surface-container-low text-on-surface-variant',
        };

  const triageBadge =
    device.status === 'critical'
      ? {
          label: 'Crítico',
          classes: 'border-danger/40 bg-danger-container text-on-danger-container',
        }
      : device.status === 'warning'
        ? {
            label: 'Precaución',
            classes: 'border-warning/35 bg-warning-container text-on-warning-container',
          }
        : {
            label: 'Nominal',
            classes: 'border-primary/30 bg-primary-container text-on-primary-container',
          };

  const showGuide = sectionTab === 'all' || sectionTab === 'guide';
  const showTests = sectionTab === 'all' || sectionTab === 'tests';
  const showExtended = sectionTab === 'all' || sectionTab === 'extended';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/45 p-3 backdrop-blur-[3px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensor-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="dt-animate-panel flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-outline bg-surface-container shadow-[0_24px_64px_-24px_rgba(26,36,30,0.42)]">
        {/* Sticky Modal Header */}
        <header className="border-b border-outline-variant bg-surface-container-low/70 px-5 py-4 sm:px-6 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline bg-surface-container">
                {renderDeviceIcon(device.id, 'h-5 w-5')}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-outline bg-surface-container px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-on-surface-variant">
                    {device.categoryLabel}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-display text-[11px] font-semibold ${connectionBadge.classes}`}
                  >
                    {connectionBadge.label}
                  </span>
                  {isConnected && (
                    <span
                      className={`rounded-full border px-2 py-0.5 font-display text-[10px] font-bold ${triageBadge.classes}`}
                    >
                      {triageBadge.label}
                    </span>
                  )}
                </div>
                <h2
                  id="sensor-modal-title"
                  className="mt-1 text-lg leading-snug font-bold text-on-surface font-display sm:text-xl"
                >
                  {device.name}
                </h2>
                <p className="mt-0.5 text-xs text-on-surface-variant">{device.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle del sensor"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface-container text-on-surface-variant dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-surface-container-low hover:text-on-surface active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Live Reading Strip + Connection Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline bg-surface-container px-3.5 py-2.5">
            <div>
              <span className="block text-[10px] font-medium uppercase tracking-[0.05em] text-on-surface-variant font-display">
                {!isAvailable
                  ? `Equipamiento en ${mission.shortName}`
                  : isConnected
                    ? `Lectura Principal · ${device.lastUpdated}`
                    : `Estado del Hardware · ${device.lastUpdated}`}
              </span>
              <span className="mt-0.5 block font-mono text-base font-bold text-on-surface">
                {!isAvailable
                  ? 'Sensor no embarcado en esta misión'
                  : isConnected
                    ? device.lastReading
                    : 'Pausado · Protocolo manual activo'}
              </span>
            </div>

            {isAvailable ? (
              <button
                type="button"
                onClick={() => toggleDevice(device.id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold font-display dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                  isConnected
                    ? 'border-primary/35 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                    : 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{isConnected ? 'Desconectar sensor' : 'Conectar sensor'}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface-variant">
                <Ban className="h-3.5 w-3.5" />
                <span>{device.unavailableReason ?? 'No disponible'}</span>
              </span>
            )}
          </div>

          {/* Quick Section Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {(
              [
                { id: 'all', label: 'Vista completa' },
                { id: 'guide', label: 'Cómo tomar la medida' },
                { id: 'tests', label: 'Pruebas y diagnósticos' },
                { id: 'extended', label: 'Datos extendidos' },
              ] as const
            ).map((tab) => {
              const active = sectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSectionTab(tab.id)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-semibold font-display dt-transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    active
                      ? 'border-primary/40 bg-primary-container text-on-primary-container'
                      : 'border-outline bg-surface-container text-on-surface-variant hover:border-primary/35 hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-6">
          {/* SECTION 1: How to Take Measurement */}
          {showGuide && (
            <section className="dt-animate-panel space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface font-display">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Cómo tomar la medida · Protocolo del Astronauta
                </h3>
                <span className="font-mono text-[10px] font-semibold text-on-surface-variant">
                  {mission.gravityLabel}
                </span>
              </div>

              <ol className="grid gap-2.5 sm:grid-cols-2">
                {guide.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-outline-variant bg-surface-container-low p-3 text-xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-[11px] font-bold text-on-primary">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed text-on-surface">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="flex items-start gap-2.5 rounded-xl border border-warning/35 bg-warning-container/60 p-3 text-xs text-on-warning-container">
                <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <span className="font-bold font-display">
                    Protocolo clínico manual (sin sensor):{' '}
                  </span>
                  <span>{guide.manualFallback}</span>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: Diagnostic Tests & Single-Sensor Simulator */}
          {showTests && (
            <section className="dt-animate-panel space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface font-display">
                  <FlaskConical className="h-4 w-4 text-telemetry" />
                  Pruebas y Diagnósticos del Sensor
                </h3>

                {isConnected && (
                  <button
                    type="button"
                    onClick={runAllTests}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/35 bg-primary-container px-2.5 py-1 text-[11px] font-bold text-on-primary-container font-display dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Play className="h-3 w-3" />
                    <span>Ejecutar diagnóstico completo</span>
                  </button>
                )}
              </div>

              {!isAvailable ? (
                <div className="rounded-xl border border-outline bg-surface-container-low p-4 text-xs text-on-surface-variant">
                  Las pruebas de hardware están deshabilitadas porque este sensor no está embarcado
                  en <span className="font-semibold text-on-surface">{mission.name}</span>. Utiliza
                  el protocolo clínico manual detallado arriba.
                </div>
              ) : !isConnected ? (
                <div className="flex flex-col gap-3 rounded-xl border border-outline bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-on-surface-variant">
                    <p className="font-semibold text-on-surface font-display">
                      Sensor desconectado actualmente
                    </p>
                    <p className="mt-0.5">
                      Conéctalo para ejecutar autodiagnósticos de calibración o registrar nuevas
                      lecturas automáticas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDevice(device.id)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-px hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>Conectar ahora</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {guide.tests.map((test) => {
                      const state = testStates[test.id] ?? 'idle';
                      return (
                        <div
                          key={test.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-on-surface font-display">
                              {test.title}
                            </p>
                            <p className="text-[11px] text-on-surface-variant">{test.subtitle}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {state === 'passed' && (
                              <span className="dt-animate-panel inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary-container px-2 py-1 font-mono text-[10px] font-bold text-on-primary-container">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                {test.passedMetric}
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={state === 'running'}
                              onClick={() => runSingleTest(test.id)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-[11px] font-semibold text-on-surface font-display dt-transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary-container/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {state === 'running' ? (
                                <>
                                  <Clock className="h-3 w-3 animate-spin text-primary" />
                                  <span>Probando...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 text-primary" />
                                  <span>{state === 'passed' ? 'Repetir' : 'Probar'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Single-Sensor Reading Simulator */}
                  <form
                    onSubmit={handleRecordSensorReading}
                    className="rounded-xl border border-outline bg-surface-container-low p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface font-display">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Simular o Registrar Medición de este Sensor
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        Actualiza Mapa Corporal y Alertas
                      </span>
                    </div>

                    {scanFeedback && (
                      <div className="dt-animate-panel flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-container px-3 py-2 text-xs font-medium text-on-primary-container">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <span>{scanFeedback}</span>
                      </div>
                    )}

                    {device.id === 'glucometer' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-on-surface">Glucosa Capilar</label>
                          <span className="font-mono font-bold text-telemetry">
                            {glucoseInput} mg/dL
                          </span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={210}
                          value={glucoseInput}
                          onChange={(e) => setGlucoseInput(Number(e.target.value))}
                          className="w-full cursor-pointer accent-telemetry"
                        />
                      </div>
                    )}

                    {device.id === 'hematology' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-on-surface">
                            Conteo de Leucocitos
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
                          className="w-full cursor-pointer accent-danger"
                        />
                      </div>
                    )}

                    {device.id === 'dosimeter' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <label className="font-medium text-on-surface">
                            Dosis Diaria de Radiación
                          </label>
                          <span className="font-mono font-bold text-warning">
                            {dailyRadInput.toFixed(1)} mSv/día
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.3}
                          max={10}
                          step={0.1}
                          value={dailyRadInput}
                          onChange={(e) => setDailyRadInput(Number(e.target.value))}
                          className="w-full cursor-pointer accent-warning"
                        />
                      </div>
                    )}

                    {device.id === 'vitals_cuff' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label className="font-medium text-on-surface">
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
                            className="w-full cursor-pointer accent-primary"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-on-surface-variant">Sistólica</span>
                            <input
                              type="number"
                              min={80}
                              max={190}
                              value={systolicInput}
                              onChange={(e) => setSystolicInput(Number(e.target.value))}
                              className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 font-mono text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                              className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 font-mono text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                              className="mt-0.5 w-full rounded-lg border border-outline bg-surface-container px-2 py-1.5 font-mono text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {device.id === 'ultrasound' && (
                      <div className="space-y-2.5">
                        <select
                          value={ultrasoundStatus}
                          onChange={(e) =>
                            setUltrasoundStatus(
                              e.target.value as
                                | 'Normal'
                                | 'Edema Neuro-Ocular Leve'
                                | 'Atrofia Muscular Leve'
                            )
                          }
                          className="w-full cursor-pointer rounded-lg border border-outline bg-surface-container px-2.5 py-2 text-xs text-on-surface outline-none dt-transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                        >
                          <option value="Normal">Normal (Sin hallazgos)</option>
                          <option value="Edema Neuro-Ocular Leve">
                            Edema Neuro-Ocular Leve (SANS)
                          </option>
                          <option value="Atrofia Muscular Leve">
                            Atrofia Muscular Leve en Cuádriceps
                          </option>
                        </select>

                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-[11px] font-medium text-primary dt-transition hover:-translate-y-px hover:border-primary hover:bg-primary-container/35 active:scale-[0.98]">
                          <ImagePlus className="h-3.5 w-3.5" />
                          <span>Cargar captura de ultrasonido</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUltrasoundImageUpload}
                            className="hidden"
                          />
                        </label>
                        {ultrasoundPreview && (
                          <div className="dt-animate-panel overflow-hidden rounded-lg border border-outline">
                            <img
                              src={ultrasoundPreview}
                              alt="Vista previa de ultrasonido"
                              className="h-24 w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {device.id === 'eva_spirometer' && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label className="font-medium text-on-surface">
                              Temperatura Central
                            </label>
                            <span className="font-mono font-bold text-warning">
                              {bodyTempInput.toFixed(1)} °C
                            </span>
                          </div>
                          <input
                            type="range"
                            min={34.5}
                            max={39.5}
                            step={0.1}
                            value={bodyTempInput}
                            onChange={(e) => setBodyTempInput(Number(e.target.value))}
                            className="w-full cursor-pointer accent-warning"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label className="font-medium text-on-surface">SpO₂ Post-EVA</label>
                            <span className="font-mono font-bold text-primary">{spo2Input}%</span>
                          </div>
                          <input
                            type="range"
                            min={86}
                            max={100}
                            value={spo2Input}
                            onChange={(e) => setSpo2Input(Number(e.target.value))}
                            className="w-full cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary font-display dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                      >
                        <Send className="h-3.5 w-3.5 dt-transition group-hover:translate-x-0.5" />
                        <span>Registrar Nueva Lectura (+25 pts)</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          )}

          {/* SECTION 3: Extended Data, Operational Ranges & Recent History */}
          {showExtended && (
            <section className="dt-animate-panel space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface font-display">
                <LineChart className="h-4 w-4 text-primary" />
                Datos Extendidos, Rangos e Historial Reciente
              </h3>

              {/* Secondary Readouts */}
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {extendedMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-outline-variant bg-surface-container-low p-3"
                  >
                    <span className="block text-[10px] font-medium text-on-surface-variant">
                      {metric.label}
                    </span>
                    <span className="mt-1 block font-mono text-xs font-bold text-on-surface">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Operational Ranges */}
              <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-primary/30 bg-primary-container/50 p-3">
                  <span className="inline-flex items-center gap-1 font-bold text-on-primary-container font-display">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Rango Nominal
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-on-primary-container">
                    {guide.ranges.nominal}
                  </p>
                </div>
                <div className="rounded-xl border border-warning/35 bg-warning-container/60 p-3">
                  <span className="inline-flex items-center gap-1 font-bold text-on-warning-container font-display">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    Precaución
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-on-warning-container">
                    {guide.ranges.warning}
                  </p>
                </div>
                <div className="rounded-xl border border-danger/35 bg-danger-container/60 p-3">
                  <span className="inline-flex items-center gap-1 font-bold text-on-danger-container font-display">
                    <ShieldAlert className="h-3.5 w-3.5 text-danger" />
                    Umbral Crítico
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-on-danger-container">
                    {guide.ranges.critical}
                  </p>
                </div>
              </div>

              {/* Recent History */}
              <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface font-display">
                    Historial Reciente en Misión ({recentHistoryRows.length} registros)
                  </span>
                  {device.id === 'ultrasound' && (
                    <span className="text-[11px] text-on-surface-variant">
                      Nota: {biomarkers.ultrasoundNotes}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {recentHistoryRows.map((row) => (
                    <div key={row.dayLabel} className="flex items-center gap-3 text-xs">
                      <span className="w-14 shrink-0 font-mono text-[11px] font-semibold text-on-surface-variant">
                        {row.dayLabel}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            systemStatuses.immune === 'critical' && device.id === 'dosimeter'
                              ? 'bg-danger'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.round(row.ratio * 100)}%` }}
                        />
                      </div>
                      <span className="min-w-[110px] text-right font-mono text-[11px] font-semibold text-on-surface">
                        {row.valueLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
