'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Brain,
  Camera,
  CheckCircle2,
  Heart,
  ImagePlus,
  Moon,
  Pause,
  Play,
  Radio,
  Smile,
  Sparkles,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';

export function MentalHealthTab() {
  const {
    mission,
    biomarkers,
    history,
    videoLogs,
    inspirationItems,
    psychRoutinesChecked,
    addMentalCheckIn,
    addVideoDiaryEntry,
    addInspirationItem,
    togglePsychRoutine,
  } = useMission();

  const [moodScore, setMoodScore] = useState<number>(biomarkers.moodScore);
  const [sleepHours, setSleepHours] = useState<number>(biomarkers.sleepHours);
  const [stressLevel, setStressLevel] = useState<number>(biomarkers.stressLevel);
  const [crewCohesion, setCrewCohesion] = useState<number>(biomarkers.crewCohesion);
  const [checkInSaved, setCheckInSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFallback, setCameraFallback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [diaryMode, setDiaryMode] = useState<'video' | 'texto'>('video');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathTick, setBreathTick] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ stop: () => void } | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  const [newAnchorTitle, setNewAnchorTitle] = useState('');
  const [newAnchorQuote, setNewAnchorQuote] = useState('');
  const [newAnchorImage, setNewAnchorImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathTick((t) => (t + 1) % 16);
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    setCameraFallback(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraFallback(true);
        setCameraActive(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraFallback(true);
      setCameraActive(true);
    }
  };

  const stopWebcam = () => {
    setIsRecording(false);
    setCameraActive(false);
    setCameraFallback(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  };

  const stopAmbientSound = () => {
    if (audioNodesRef.current) {
      audioNodesRef.current.stop();
      audioNodesRef.current = null;
    }
    setPlayingSoundId(null);
  };

  const playAmbientSound = (soundId: string) => {
    if (playingSoundId === soundId) {
      stopAmbientSound();
      return;
    }
    stopAmbientSound();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current ?? new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.08;
      masterGain.connect(ctx.destination);

      if (soundId === 'rain' || soundId === 'ocean') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = soundId === 'rain' ? 950 : 380;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        audioNodesRef.current = {
          stop: () => {
            try {
              whiteNoise.stop();
              masterGain.disconnect();
            } catch {
              // ignore
            }
          },
        };
      } else {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = soundId === 'forest' ? 174 : 136.1;
        osc2.frequency.value = soundId === 'forest' ? 261.6 : 204.1;
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();
        audioNodesRef.current = {
          stop: () => {
            try {
              osc1.stop();
              osc2.stop();
              masterGain.disconnect();
            } catch {
              // ignore
            }
          },
        };
      }
      setPlayingSoundId(soundId);
    } catch {
      setPlayingSoundId(null);
    }
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    addMentalCheckIn({ moodScore, sleepHours, stressLevel, crewCohesion });
    setCheckInSaved(true);
    setTimeout(() => setCheckInSaved(false), 3500);
  };

  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() && !diaryNotes.trim()) return;
    addVideoDiaryEntry({
      mode: diaryMode,
      title: diaryTitle.trim() || `Registro Día ${history[history.length - 1]?.day ?? 45}`,
      notes:
        diaryNotes.trim() ||
        'Sesión de video-diario grabada para evaluación de tono vocal y bienestar emocional.',
      moodRating: moodScore,
    });
    setDiaryTitle('');
    setDiaryNotes('');
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const handleAnchorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewAnchorImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAnchor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnchorTitle.trim()) return;
    addInspirationItem({
      title: newAnchorTitle.trim(),
      subtitle: 'Recuerdo personal cargado a bordo',
      category: 'Familia',
      durationOrDate: 'Guardado localmente · Offline',
      quote: newAnchorQuote.trim() || '"Siempre mirando las mismas estrellas."',
      imageUrl: newAnchorImage,
      palette: 'cyan',
      soundId: 'forest',
      soundLabel: 'Audio: Bosque tranquilo',
    });
    setNewAnchorTitle('');
    setNewAnchorQuote('');
    setNewAnchorImage(undefined);
  };

  const breathPhase =
    breathTick < 4
      ? 'Inhala profundo (4 s)'
      : breathTick < 8
        ? 'Mantén el aire (4 s)'
        : breathTick < 12
          ? 'Exhala lento (4 s)'
          : 'Pausa en calma (4 s)';

  // SVG Mental History Chart calculations
  const chartW = 620;
  const chartH = 210;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (idx: number) =>
    padL + (history.length <= 1 ? plotW / 2 : (idx / (history.length - 1)) * plotW);
  const toY10 = (val: number) => padT + plotH - (Math.min(10, Math.max(0, val)) / 10) * plotH;

  const moodPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.moodScore).toFixed(1)}`)
    .join(' ');
  const sleepPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.sleepHours).toFixed(1)}`)
    .join(' ');
  const stressPath = history
    .map(
      (pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY10(pt.stressLevel).toFixed(1)}`
    )
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Low Mood Countermeasure Alert */}
      {(biomarkers.moodScore <= 6 || biomarkers.sleepHours < 6.5) && (
        <div className="dt-animate-panel rounded-2xl border border-warning/35 bg-warning-container p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-xs text-on-warning-container">
              <p className="font-bold font-display">
                Contramedida Emocional Sugerida (Aislamiento y Sueño)
              </p>
              <p className="mt-0.5">
                Detectamos descenso de ánimo ({biomarkers.moodScore}/10) o descanso reducido (
                {biomarkers.sleepHours}h). Te recomendamos abrir tu Muro de Inspiración familiar o
                realizar 2 minutos de respiración guiada.
              </p>
            </div>
          </div>
          <a
            href="#muro-inspiracion"
            className="shrink-0 cursor-pointer rounded-xl bg-warning px-3.5 py-2 text-center text-xs font-bold text-surface dt-transition hover:-translate-y-0.5 hover:bg-warning-hover hover:shadow-sm active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
          >
            Ir a Mi Ancla en la Tierra
          </a>
        </div>
      )}

      {/* Row 1: Daily Mood/Sleep Check-in + Psychological Routines */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveCheckIn}
          className="lg:col-span-6 rounded-2xl border border-outline bg-surface-container p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <Smile className="h-5 w-5 text-primary" />
                Check-in Emocional y Calidad de Sueño
              </h2>
              <p className="text-xs text-on-surface-variant">
                Monitorea el impacto del confinamiento y los ciclos de luz en {mission.shortName}.
              </p>
            </div>
            {checkInSaved && (
              <span className="dt-animate-panel rounded-full border border-primary/30 bg-primary-container px-2.5 py-1 text-[11px] font-semibold text-on-primary-container">
                ¡Guardado!
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">Estado de Ánimo</span>
                <span className="font-mono font-bold text-primary">{moodScore}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full cursor-pointer accent-primary"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">Horas de Sueño</span>
                <span className="font-mono font-bold text-telemetry">{sleepHours} h</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full cursor-pointer accent-telemetry"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">Estrés por Confinamiento</span>
                <span className="font-mono font-bold text-warning">{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full cursor-pointer accent-warning"
              />
            </div>

            <div className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface font-medium">Cohesión de Tripulación</span>
                <span className="font-mono font-bold text-secondary">{crewCohesion}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={crewCohesion}
                onChange={(e) => setCrewCohesion(Number(e.target.value))}
                className="w-full cursor-pointer accent-secondary"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            Registrar Check-in del Día (+30 pts)
          </button>
        </form>

        {/* Daily & Weekly Psychological Routines + Breathing Pacer */}
        <div className="lg:col-span-6 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="border-b border-outline-variant pb-3">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Wind className="h-5 w-5 text-primary" />
              Rutinas Psicológicas (Diarias y Semanales)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Regulación de cortisol, higiene circadiana y prevención del desgaste de &quot;tercer
              cuarto de misión&quot;.
            </p>
          </div>

          {/* Interactive Box Breathing Pacer */}
          <div className="rounded-xl border border-primary/30 bg-primary-container p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-surface-container transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  breathingActive
                    ? breathTick < 8
                      ? 'scale-110 shadow-[0_0_0_6px_rgba(47,93,70,0.14)]'
                      : 'scale-90'
                    : 'scale-100'
                }`}
              >
                <Wind className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-primary-container font-display">
                  Respiración Guiada Anti-Cortisol (4-4-4-4)
                </p>
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  {breathingActive ? breathPhase : 'Presiona iniciar para bajar pulsaciones'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setBreathingActive((b) => !b);
                setBreathTick(0);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              {breathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {breathingActive ? 'Pausar' : 'Iniciar'}
            </button>
          </div>

          <div className="space-y-2">
            {[
              {
                key: 'breathing' as const,
                title: 'Diaria: Sesión de respiración guiada (2 min)',
                desc: 'Reduce el estrés agudo tras maniobras o alertas de cabina.',
              },
              {
                key: 'circadianLight' as const,
                title: 'Diaria: Ajuste de luz circadiana ámbar pre-sueño',
                desc: 'Compensa la pérdida del ciclo natural solar (vital en 16 amaneceres/día).',
              },
              {
                key: 'weeklyResilience' as const,
                title: 'Semanal: Revisión de resiliencia "Tercer Cuarto de Misión"',
                desc: 'Refuerza motivación y conexión interpersonal cuando cae la novedad inicial.',
              },
            ].map((item) => {
              const checked = psychRoutinesChecked[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => togglePsychRoutine(item.key)}
                  className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    checked
                      ? 'border-primary/30 bg-primary-container/55 hover:bg-primary-container/75'
                      : 'border-outline bg-surface-container-low hover:border-primary hover:bg-surface-container'
                  }`}
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 dt-transition group-hover:scale-110 ${
                      checked ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold font-display ${
                        checked
                          ? 'line-through text-on-surface-variant'
                          : 'text-on-surface'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Video Diary & Written Log */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <Video className="h-5 w-5 text-primary" />
                Video-Diario Diario y Bitácora Psicológica
              </h2>
              <p className="text-xs text-on-surface-variant">
                Analiza indicadores emocionales en local y empaqueta la sesión para expertos en
                Tierra ({mission.commDelay}).
              </p>
            </div>
            <div className="flex rounded-xl border border-outline bg-surface-container-low p-1 text-xs">
              <button
                type="button"
                onClick={() => setDiaryMode('video')}
                className={`cursor-pointer rounded-lg px-3 py-1 font-semibold dt-transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                  diaryMode === 'video'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                Modo Video
              </button>
              <button
                type="button"
                onClick={() => setDiaryMode('texto')}
                className={`cursor-pointer rounded-lg px-3 py-1 font-semibold dt-transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                  diaryMode === 'texto'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                Diario Escrito
              </button>
            </div>
          </div>

          {diaryMode === 'video' && (
            <div className="dt-animate-panel rounded-2xl border border-outline bg-surface-container-low p-4 space-y-3">
              {/* Optical Dark Viewport (reuses viewport-surface #1A241E) */}
              <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-viewport-border bg-viewport-surface">
                {cameraActive && !cameraFallback ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : cameraActive && cameraFallback ? (
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-primary bg-primary-container animate-pulse">
                      <Camera className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-on-viewport font-display">
                      Simulador de Cámara de Cabina Activo
                    </p>
                    <p className="mt-1 text-[11px] text-on-viewport/75">
                      (Sin permisos de webcam o sin hardware físico: capturando biometría simulada)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center px-4">
                    <VideoOff className="h-8 w-8 text-on-viewport/50 mb-2" />
                    <p className="text-xs text-on-viewport/80">
                      Activa la cámara web o el simulador para grabar tu Video-Diario del día.
                    </p>
                  </div>
                )}

                {isRecording && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 font-mono text-[11px] font-bold text-on-secondary">
                    <span className="h-2 w-2 rounded-full bg-on-secondary animate-ping" />
                    REC 00:{String(recordSeconds).padStart(2, '0')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Camera className="h-4 w-4" />
                    Activar Cámara / Simulador
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRecording((r) => !r)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${
                        isRecording
                          ? 'bg-danger text-on-secondary hover:bg-danger-hover focus-visible:ring-danger/40'
                          : 'bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-primary/35'
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                      {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="cursor-pointer rounded-xl border border-outline bg-surface-container px-3 py-2 text-xs font-medium text-on-surface dt-transition hover:-translate-y-px hover:border-primary/40 hover:bg-surface-container-high active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      Apagar Cámara
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveDiary} className="space-y-3">
            <input
              type="text"
              value={diaryTitle}
              onChange={(e) => setDiaryTitle(e.target.value)}
              placeholder="Título de la entrada (ej. Balance emocional tras caminata espacial)"
              className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <textarea
              rows={3}
              value={diaryNotes}
              onChange={(e) => setDiaryNotes(e.target.value)}
              placeholder="Escribe tus pensamientos del día o notas para los psicólogos de misión..."
              className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
            >
              <Sparkles className="h-4 w-4" />
              Analizar y Guardar en Bitácora (+35 pts)
            </button>
          </form>
        </div>

        {/* AI / Psychologist Indicators Feed */}
        <div className="lg:col-span-5 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
          <div className="border-b border-outline-variant pb-3">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Brain className="h-5 w-5 text-telemetry" />
              Evaluación Psicológica (IA Local & Tierra)
            </h3>
            <p className="text-xs text-on-surface-variant">
              Historial de registros con indicadores de tono emocional y fatiga por confinamiento.
            </p>
          </div>

          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {videoLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-on-surface font-display">
                    {log.title}
                  </span>
                  <span className="rounded-md border border-telemetry/25 bg-telemetry-container px-2 py-0.5 text-[10px] font-semibold text-on-telemetry-container font-mono">
                    {log.mode === 'video' ? 'Video-Diario' : 'Escrito'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-mono">{log.timestamp}</p>
                <p className="text-xs leading-relaxed text-on-surface">{log.notes}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-outline-variant text-[10px]">
                  <div className="rounded-lg border border-outline bg-surface-container px-2 py-1 text-on-surface">
                    <span className="text-on-surface-variant block">Tono IA:</span>
                    {log.aiIndicators.emotionalTone}
                  </div>
                  <div className="rounded-lg border border-outline bg-surface-container px-2 py-1 text-on-surface">
                    <span className="text-on-surface-variant block">Fatiga Vocal:</span>
                    {log.aiIndicators.vocalFatigue}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-primary">
                  ✓ {log.aiIndicators.earthSyncStatus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Historical Mental Health Chart (Native SVG) */}
      <section className="rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Moon className="h-5 w-5 text-telemetry" />
              Evolución de Salud Mental y Sueño en la Misión
            </h2>
            <p className="text-xs text-on-surface-variant">
              Seguimiento desde el Día 1 hasta el día actual de la misión (escala 0–10 / horas).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Ánimo
            </span>
            <span className="inline-flex items-center gap-1.5 text-telemetry">
              <span className="h-2.5 w-2.5 rounded-full bg-telemetry" /> Horas Sueño
            </span>
            <span className="inline-flex items-center gap-1.5 text-warning">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Estrés
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full min-w-[460px] h-56"
            role="img"
            aria-label="Gráfica histórica de evolución mental en la misión"
          >
            {[2, 4, 6, 8, 10].map((v) => {
              const y = toY10(v);
              return (
                <g key={v}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="#E6E2D8"
                    strokeDasharray="4 4"
                  />
                  <text x={8} y={y + 4} fill="#55635B" fontSize="10">
                    {v}
                  </text>
                </g>
              );
            })}

            <path d={moodPath} fill="none" stroke="#2F5D46" strokeWidth="2.5" />
            <path d={sleepPath} fill="none" stroke="#2B5B6C" strokeWidth="2.5" />
            <path d={stressPath} fill="none" stroke="#B54708" strokeWidth="2" strokeDasharray="5 3" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toY10(pt.moodScore)} r="3.5" fill="#2F5D46" />
                <circle cx={toX(i)} cy={toY10(pt.sleepHours)} r="3.5" fill="#2B5B6C" />
                <circle cx={toX(i)} cy={toY10(pt.stressLevel)} r="3" fill="#B54708" />
                <text
                  x={toX(i)}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="#55635B"
                  fontSize="10"
                >
                  D{pt.day}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Row 4: Family Inspiration Vault ("Mi Ancla en la Tierra") */}
      <section
        id="muro-inspiracion"
        className="rounded-2xl border border-outline bg-surface-container p-5 space-y-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant pb-3">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Heart className="h-5 w-5 text-danger" />
              Muro de Inspiración y Conexión Terrestre (&quot;Mi Ancla en la Tierra&quot;)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Fotos familiares, recuerdos de la Tierra y paisajes sonoros relajantes sintetizados
              nativamente para reducir el cortisol en cabina.
            </p>
          </div>
          {playingSoundId && (
            <button
              type="button"
              onClick={stopAmbientSound}
              className="dt-animate-panel inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-danger/35 bg-danger-container px-3 py-1.5 text-xs font-semibold text-on-danger-container dt-transition hover:-translate-y-px hover:border-danger active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
            >
              <VolumeX className="h-4 w-4 text-danger" />
              Silenciar Audio
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {inspirationItems.map((item) => {
            const isPlaying = playingSoundId === item.soundId;
            const cardTheme = {
              amber: 'border-warning/30 bg-warning-container/45',
              cyan: 'border-telemetry/30 bg-telemetry-container/45',
              emerald: 'border-primary/30 bg-primary-container/55',
              rose: 'border-danger/30 bg-danger-container/45',
            }[item.palette];

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 space-y-3 dt-transition ${cardTheme}`}
              >
                <div className="space-y-2.5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-28 w-full rounded-xl object-cover border border-outline"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-xl border border-outline bg-surface-container px-3 text-center">
                      <div>
                        <span className="inline-block rounded-full border border-outline bg-surface-container-low px-2.5 py-0.5 text-[10px] font-semibold text-primary font-display">
                          {item.category}
                        </span>
                        <p className="mt-1.5 text-[11px] text-on-surface-variant font-mono">
                          {item.durationOrDate}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-on-surface font-display">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <p className="text-xs italic leading-relaxed text-on-surface">{item.quote}</p>
                </div>

                <button
                  type="button"
                  onClick={() => playAmbientSound(item.soundId)}
                  className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    isPlaying
                      ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
                      : 'border-outline bg-surface-container text-on-surface hover:border-primary/45 hover:bg-surface-container-low'
                  }`}
                >
                  <Volume2 className={`h-3.5 w-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? 'Reproduciendo (Pausar)' : item.soundLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload New Family Photo / Memory */}
        <form
          onSubmit={handleAddAnchor}
          className="rounded-xl border border-outline bg-surface-container-low p-4 grid gap-3 md:grid-cols-4 md:items-end"
        >
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
              Título del recuerdo o foto
            </label>
            <input
              type="text"
              value={newAnchorTitle}
              onChange={(e) => setNewAnchorTitle(e.target.value)}
              placeholder="Ej. Foto con mi hija en la playa"
              className="w-full rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
              Mensaje de ánimo
            </label>
            <input
              type="text"
              value={newAnchorQuote}
              onChange={(e) => setNewAnchorQuote(e.target.value)}
              placeholder="Ej. ¡Nos vemos al regreso de Marte!"
              className="w-full rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
              Foto o imagen (opcional)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs font-medium text-primary dt-transition hover:-translate-y-px hover:border-primary hover:bg-primary-container/35 active:translate-y-0 active:scale-[0.98]">
              <ImagePlus className="h-4 w-4" />
              {newAnchorImage ? 'Imagen cargada ✓' : 'Subir foto familiar'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAnchorPhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            Agregar a Mi Ancla
          </button>
        </form>
      </section>
    </div>
  );
}
