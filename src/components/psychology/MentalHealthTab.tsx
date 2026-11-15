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

  // Check-in form state
  const [moodScore, setMoodScore] = useState<number>(biomarkers.moodScore);
  const [sleepHours, setSleepHours] = useState<number>(biomarkers.sleepHours);
  const [stressLevel, setStressLevel] = useState<number>(biomarkers.stressLevel);
  const [crewCohesion, setCrewCohesion] = useState<number>(biomarkers.crewCohesion);
  const [checkInSaved, setCheckInSaved] = useState(false);

  // Video Diary & Webcam state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFallback, setCameraFallback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [diaryMode, setDiaryMode] = useState<'video' | 'texto'>('video');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');

  // Breathing pacer (Box breathing: 4-4-4-4)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathTick, setBreathTick] = useState(0);

  // Native Web Audio API ambient soundscape
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ stop: () => void } | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Custom inspiration anchor upload
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="text-xs">
              <p className="font-bold text-amber-200">
                Contramedida Emocional Sugerida (Aislamiento y Sueño)
              </p>
              <p className="mt-0.5 text-amber-100/80">
                Detectamos descenso de ánimo ({biomarkers.moodScore}/10) o descanso reducido (
                {biomarkers.sleepHours}h). Te recomendamos abrir tu Muro de Inspiración familiar o
                realizar 2 minutos de respiración guiada.
              </p>
            </div>
          </div>
          <a
            href="#muro-inspiracion"
            className="shrink-0 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
          >
            Ir a Mi Ancla en la Tierra
          </a>
        </div>
      )}

      {/* Row 1: Daily Mood/Sleep Check-in + Psychological Routines */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveCheckIn}
          className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smile className="h-5 w-5 text-cyan-400" />
                Check-in Emocional y Calidad de Sueño
              </h2>
              <p className="text-xs text-slate-400">
                Monitorea el impacto del confinamiento y los ciclos de luz en {mission.shortName}.
              </p>
            </div>
            {checkInSaved && (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                ¡Guardado!
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Estado de Ánimo</span>
                <span className="font-mono font-bold text-emerald-300">{moodScore}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Horas de Sueño</span>
                <span className="font-mono font-bold text-cyan-300">{sleepHours} h</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Estrés por Confinamiento</span>
                <span className="font-mono font-bold text-amber-300">{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Cohesión de Tripulación</span>
                <span className="font-mono font-bold text-sky-300">{crewCohesion}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={crewCohesion}
                onChange={(e) => setCrewCohesion(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Registrar Check-in del Día (+30 pts)
          </button>
        </form>

        {/* Daily & Weekly Psychological Routines + Breathing Pacer */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wind className="h-5 w-5 text-emerald-400" />
              Rutinas Psicológicas (Diarias y Semanales)
            </h2>
            <p className="text-xs text-slate-400">
              Regulación de cortisol, higiene circadiana y prevención del desgaste de &quot;tercer
              cuarto de misión&quot;.
            </p>
          </div>

          {/* Interactive Box Breathing Pacer */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/85 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/15 transition-transform duration-1000 ${
                  breathingActive
                    ? breathTick < 8
                      ? 'scale-110'
                      : 'scale-90'
                    : 'scale-100'
                }`}
              >
                <Wind className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Respiración Guiada Anti-Cortisol (4-4-4-4)
                </p>
                <p className="mt-0.5 text-xs font-medium text-emerald-300">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
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
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    checked
                      ? 'border-emerald-500/35 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      checked ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        checked ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Video Diary & Written Log (Camera + AI Evaluation for Earth Psychologists) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-cyan-400" />
                Video-Diario Diario y Bitácora Psicológica
              </h2>
              <p className="text-xs text-slate-400">
                Analiza indicadores emocionales en local y empaqueta la sesión para expertos en
                Tierra ({mission.commDelay}).
              </p>
            </div>
            <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
              <button
                type="button"
                onClick={() => setDiaryMode('video')}
                className={`rounded-lg px-3 py-1 font-semibold ${
                  diaryMode === 'video' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                Modo Video
              </button>
              <button
                type="button"
                onClick={() => setDiaryMode('texto')}
                className={`rounded-lg px-3 py-1 font-semibold ${
                  diaryMode === 'texto' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                Diario Escrito
              </button>
            </div>
          </div>

          {diaryMode === 'video' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
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
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/15 animate-pulse">
                      <Camera className="h-7 w-7 text-cyan-300" />
                    </div>
                    <p className="text-xs font-semibold text-cyan-300">
                      Simulador de Cámara de Cabina Activo
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      (Sin permisos de webcam o sin hardware físico: capturando biometría simulada)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center px-4">
                    <VideoOff className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400">
                      Activa la cámara web o el simulador para grabar tu Video-Diario del día.
                    </p>
                  </div>
                )}

                {isRecording && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    REC 00:{String(recordSeconds).padStart(2, '0')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25"
                  >
                    <Camera className="h-4 w-4" />
                    Activar Cámara / Simulador
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRecording((r) => !r)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold ${
                        isRecording
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                      {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <textarea
              rows={3}
              value={diaryNotes}
              onChange={(e) => setDiaryNotes(e.target.value)}
              placeholder="Escribe tus pensamientos del día o notas para los psicólogos de misión..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Sparkles className="h-4 w-4" />
              Analizar y Guardar en Bitácora (+35 pts)
            </button>
          </form>
        </div>

        {/* AI / Psychologist Indicators Feed */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-sky-400" />
              Evaluación Psicológica (IA Local & Tierra)
            </h3>
            <p className="text-xs text-slate-400">
              Historial de registros con indicadores de tono emocional y fatiga por confinamiento.
            </p>
          </div>

          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {videoLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{log.title}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                    {log.mode === 'video' ? 'Video-Diario' : 'Escrito'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{log.timestamp}</p>
                <p className="text-xs leading-relaxed text-slate-300">{log.notes}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
                  <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                    <span className="text-slate-500 block">Tono IA:</span>
                    {log.aiIndicators.emotionalTone}
                  </div>
                  <div className="rounded bg-slate-900 px-2 py-1 text-slate-300">
                    <span className="text-slate-500 block">Fatiga Vocal:</span>
                    {log.aiIndicators.vocalFatigue}
                  </div>
                </div>
                <p className="text-[10px] text-emerald-300/90">
                  ✓ {log.aiIndicators.earthSyncStatus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Historical Mental Health Chart (Native SVG) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Moon className="h-5 w-5 text-cyan-400" />
              Evolución de Salud Mental y Sueño en la Misión
            </h2>
            <p className="text-xs text-slate-400">
              Seguimiento desde el Día 1 hasta el día actual de la misión (escala 0–10 / horas).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Ánimo
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-300">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Horas Sueño
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Estrés
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
            {/* Horizontal grid lines */}
            {[2, 4, 6, 8, 10].map((v) => {
              const y = toY10(v);
              return (
                <g key={v}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text x={8} y={y + 4} fill="#64748b" fontSize="10">
                    {v}
                  </text>
                </g>
              );
            })}

            <path d={moodPath} fill="none" stroke="#34d399" strokeWidth="2.5" />
            <path d={sleepPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
            <path d={stressPath} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />

            {history.map((pt, i) => (
              <g key={pt.day}>
                <circle cx={toX(i)} cy={toY10(pt.moodScore)} r="3.5" fill="#34d399" />
                <circle cx={toX(i)} cy={toY10(pt.sleepHours)} r="3.5" fill="#22d3ee" />
                <circle cx={toX(i)} cy={toY10(pt.stressLevel)} r="3" fill="#fbbf24" />
                <text
                  x={toX(i)}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
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
        className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400" />
              Muro de Inspiración y Conexión Terrestre (&quot;Mi Ancla en la Tierra&quot;)
            </h2>
            <p className="text-xs text-slate-400">
              Fotos familiares, recuerdos de la Tierra y paisajes sonoros relajantes sintetizados
              nativamente para reducir el cortisol en cabina.
            </p>
          </div>
          {playingSoundId && (
            <button
              type="button"
              onClick={stopAmbientSound}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300"
            >
              <VolumeX className="h-4 w-4" />
              Silenciar Audio
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {inspirationItems.map((item) => {
            const isPlaying = playingSoundId === item.soundId;
            const gradientMap = {
              amber: 'from-amber-500/20 via-slate-900 to-slate-950 border-amber-500/30',
              cyan: 'from-cyan-500/20 via-slate-900 to-slate-950 border-cyan-500/30',
              emerald: 'from-emerald-500/20 via-slate-900 to-slate-950 border-emerald-500/30',
              rose: 'from-rose-500/20 via-slate-900 to-slate-950 border-rose-500/30',
            }[item.palette];

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border bg-gradient-to-b p-4 space-y-3 ${gradientMap}`}
              >
                <div className="space-y-2.5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-28 w-full rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 text-center">
                      <div>
                        <span className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                          {item.category}
                        </span>
                        <p className="mt-1.5 text-[11px] text-slate-400">{item.durationOrDate}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">{item.subtitle}</p>
                  </div>
                  <p className="text-xs italic leading-relaxed text-slate-200">{item.quote}</p>
                </div>

                <button
                  type="button"
                  onClick={() => playAmbientSound(item.soundId)}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    isPlaying
                      ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                      : 'border-slate-700 bg-slate-950/80 text-slate-200 hover:border-cyan-400/50'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {isPlaying ? 'Reproduciendo (Pausar)' : item.soundLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload New Family Photo / Memory */}
        <form
          onSubmit={handleAddAnchor}
          className="rounded-xl border border-slate-800 bg-slate-950/75 p-4 grid gap-3 md:grid-cols-4 md:items-end"
        >
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-300">
              Título del recuerdo o foto
            </label>
            <input
              type="text"
              value={newAnchorTitle}
              onChange={(e) => setNewAnchorTitle(e.target.value)}
              placeholder="Ej. Foto con mi hija en la playa"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-300">
              Mensaje de ánimo
            </label>
            <input
              type="text"
              value={newAnchorQuote}
              onChange={(e) => setNewAnchorQuote(e.target.value)}
              placeholder="Ej. ¡Nos vemos al regreso de Marte!"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-300">
              Foto o imagen (opcional)
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-cyan-300 hover:border-cyan-400">
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
            className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-400"
          >
            Agregar a Mi Ancla
          </button>
        </form>
      </section>
    </div>
  );
}
