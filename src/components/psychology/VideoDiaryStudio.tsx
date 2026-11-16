'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  Camera,
  CheckCircle2,
  Mic,
  MicOff,
  Radio,
  Send,
  Sparkles,
  Video,
  VideoOff,
} from 'lucide-react';
import { useMission } from '@/context/MissionContext';
import { analyzeDiaryEntryLocally } from '@/utils/psychologyAnalysis';

interface VideoDiaryStudioProps {
  currentMoodScore: number;
}

export function VideoDiaryStudio({ currentMoodScore }: VideoDiaryStudioProps) {
  const {
    mission,
    missionDay,
    biomarkers,
    videoLogs,
    videoMediaUrls,
    addVideoDiaryEntry,
    syncVideoDiaryToEarth,
  } = useMission();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const voiceSamplesRef = useRef<{ active: number; total: number }>({ active: 0, total: 0 });

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFallback, setCameraFallback] = useState(false);
  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | undefined>(undefined);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [voiceLevels, setVoiceLevels] = useState<number[]>(new Array(12).fill(8));
  const [measuredVoiceRatio, setMeasuredVoiceRatio] = useState<number | undefined>(undefined);

  const [diaryMode, setDiaryMode] = useState<'video' | 'texto'>('video');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  // Ensure <video> always receives the stream after mounting or mode toggle
  useEffect(() => {
    if (diaryMode === 'video' && cameraActive && !cameraFallback && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [diaryMode, cameraActive, cameraFallback]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const stopAudioMeter = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      analyserRef.current = null;
    }
    setVoiceLevels(new Array(12).fill(8));
  };

  const stopAllHardware = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    stopAudioMeter();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setCameraActive(false);
    setCameraFallback(false);
    setHasAudioTrack(false);
  };

  useEffect(() => {
    return () => {
      stopAllHardware();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLiveAudioMeter = (stream: MediaStream) => {
    stopAudioMeter();
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setHasAudioTrack(false);
      return;
    }
    setHasAudioTrack(true);
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastUiUpdate = 0;

      const tick = (now: number) => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);

        if (now - lastUiUpdate > 85) {
          lastUiUpdate = now;
          const bars: number[] = [];
          let energySum = 0;
          for (let i = 0; i < 12; i++) {
            const val = data[i + 1] ?? 0;
            energySum += val;
            bars.push(Math.max(8, Math.min(100, Math.round((val / 255) * 100))));
          }
          setVoiceLevels(bars);

          const avgEnergy = energySum / 12;
          if (mediaRecorderRef.current?.state === 'recording') {
            voiceSamplesRef.current.total += 1;
            if (avgEnergy > 18) {
              voiceSamplesRef.current.active += 1;
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setHasAudioTrack(false);
    }
  };

  // Simulated meter wave while recording in fallback mode
  useEffect(() => {
    if (!isRecording || !cameraFallback) return;
    const interval = setInterval(() => {
      setVoiceLevels(
        Array.from({ length: 12 }, (_, idx) => {
          const wave = Math.sin(Date.now() / 220 + idx * 0.7) * 28 + 42;
          return Math.max(10, Math.min(92, Math.round(wave)));
        })
      );
    }, 120);
    return () => {
      clearInterval(interval);
      setVoiceLevels(new Array(12).fill(8));
    };
  }, [isRecording, cameraFallback]);

  const startWebcam = async () => {
    setCameraFallback(false);
    setPendingMediaUrl(undefined);
    setRecordedDuration(0);
    setMeasuredVoiceRatio(undefined);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraFallback(true);
      setCameraActive(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraActive(true);
      startLiveAudioMeter(stream);
    } catch {
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = videoOnly;
        setCameraActive(true);
        setHasAudioTrack(false);
      } catch {
        setCameraFallback(true);
        setCameraActive(true);
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setPendingMediaUrl(undefined);
      setRecordSeconds(0);
      setRecordedDuration(0);
      setMeasuredVoiceRatio(undefined);
      voiceSamplesRef.current = { active: 0, total: 0 };

      if (!cameraFallback && streamRef.current && typeof MediaRecorder !== 'undefined') {
        try {
          recordedChunksRef.current = [];
          const recorder = new MediaRecorder(streamRef.current);
          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) {
              recordedChunksRef.current.push(ev.data);
            }
          };
          recorder.onstop = () => {
            if (recordedChunksRef.current.length > 0) {
              const blob = new Blob(recordedChunksRef.current, {
                type: recorder.mimeType || 'video/webm',
              });
              const url = URL.createObjectURL(blob);
              setPendingMediaUrl(url);
            }
            const { active, total } = voiceSamplesRef.current;
            if (total > 0) {
              setMeasuredVoiceRatio(active / total);
            }
          };
          mediaRecorderRef.current = recorder;
          recorder.start(250);
        } catch {
          // Continue with timer-only fallback if MediaRecorder refuses mimeType
        }
      }
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setRecordedDuration(recordSeconds);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
  };

  const livePreview = useMemo(
    () =>
      analyzeDiaryEntryLocally({
        title: diaryTitle,
        notes: diaryNotes,
        mode: diaryMode,
        moodRating: currentMoodScore,
        sleepHours: biomarkers.sleepHours,
        stressLevel: biomarkers.stressLevel,
        durationSeconds: isRecording ? recordSeconds : recordedDuration,
        voiceActiveRatio: measuredVoiceRatio,
        usedRealMic: hasAudioTrack && !cameraFallback,
      }),
    [
      diaryTitle,
      diaryNotes,
      diaryMode,
      currentMoodScore,
      biomarkers.sleepHours,
      biomarkers.stressLevel,
      isRecording,
      recordSeconds,
      recordedDuration,
      measuredVoiceRatio,
      hasAudioTrack,
      cameraFallback,
    ]
  );

  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() && !diaryNotes.trim() && !pendingMediaUrl && recordedDuration === 0) {
      return;
    }

    const finalDuration = isRecording ? recordSeconds : recordedDuration;
    if (isRecording) {
      toggleRecording();
    }

    addVideoDiaryEntry({
      mode: diaryMode,
      title: diaryTitle.trim() || `Registro Día ${missionDay}`,
      notes:
        diaryNotes.trim() ||
        (finalDuration > 0
          ? `Sesión multimedia de ${finalDuration}s capturada en cabina para seguimiento psicológico.`
          : 'Bitácora de seguimiento emocional en órbita.'),
      moodRating: currentMoodScore,
      durationSeconds: finalDuration > 0 ? finalDuration : undefined,
      voiceActiveRatio: measuredVoiceRatio,
      usedRealMic: hasAudioTrack && !cameraFallback,
      mediaUrl: pendingMediaUrl,
    });

    setDiaryTitle('');
    setDiaryNotes('');
    setRecordSeconds(0);
    setRecordedDuration(0);
    setPendingMediaUrl(undefined);
    setMeasuredVoiceRatio(undefined);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3200);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Capture Studio & Local NLP Preview */}
      <div className="lg:col-span-7 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
              <Video className="h-5 w-5 text-primary" />
              Video-Diario y Bitácora Psicológica
            </h2>
            <p className="text-xs text-on-surface-variant">
              Captura real de video/audio en cabina, análisis léxico local y envío asíncrono a
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
            <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-viewport-border bg-viewport-surface">
              {pendingMediaUrl && !isRecording ? (
                <video
                  src={pendingMediaUrl}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : cameraActive && !cameraFallback ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : cameraActive && cameraFallback ? (
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-primary bg-primary-container">
                    <Camera className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-on-viewport font-display">
                    Modo Simulador de Cabina Activo
                  </p>
                  <p className="mt-1 text-[11px] text-on-viewport/75 max-w-sm">
                    Sin cámara o micrófono físico disponible: la grabación estima la duración y
                    analiza tu relato escrito localmente.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center px-4">
                  <VideoOff className="h-8 w-8 text-on-viewport/50 mb-2" />
                  <p className="text-xs text-on-viewport/80 max-w-sm">
                    Activa cámara y micrófono para grabar un clip reproducible con análisis de
                    energía vocal en tiempo real.
                  </p>
                </div>
              )}

              {isRecording && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 font-mono text-[11px] font-bold text-on-secondary">
                  <span className="h-2 w-2 rounded-full bg-on-secondary animate-ping" />
                  REC 00:{String(recordSeconds).padStart(2, '0')}
                </span>
              )}

              {cameraActive && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-outline/30 bg-viewport-surface/85 px-2.5 py-1.5 text-[10px] text-on-viewport backdrop-blur-xs">
                  {hasAudioTrack && !cameraFallback ? (
                    <Mic className="h-3.5 w-3.5 text-primary-container" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5 text-warning-container" />
                  )}
                  <div className="flex items-end gap-0.5 h-3.5">
                    {voiceLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className="w-1 rounded-full bg-primary-container transition-[height] duration-100"
                        style={{ height: `${Math.max(20, lvl)}%` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono">
                    {hasAudioTrack && !cameraFallback ? 'Audio activo' : 'Simulador'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <Camera className="h-4 w-4" />
                    Activar Cámara y Micrófono
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${
                        isRecording
                          ? 'bg-danger text-on-secondary hover:bg-danger-hover focus-visible:ring-danger/40'
                          : 'bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-primary/35'
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                      {isRecording ? 'Detener Grabación' : pendingMediaUrl ? 'Grabar Nuevo Clip' : 'Iniciar Grabación'}
                    </button>
                    <button
                      type="button"
                      onClick={stopAllHardware}
                      className="cursor-pointer rounded-xl border border-outline bg-surface-container px-3 py-2 text-xs font-medium text-on-surface dt-transition hover:-translate-y-px hover:border-primary/40 hover:bg-surface-container-high active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      Apagar Cámara
                    </button>
                  </>
                )}
              </div>

              {pendingMediaUrl && !isRecording && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-container px-2.5 py-1 text-[11px] font-semibold text-on-primary-container">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Clip listo ({recordedDuration}s)
                </span>
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
            placeholder="Describe cómo dormiste, tu nivel de estrés, nostalgia o relación con la tripulación..."
            className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />

          {/* Live Local Analysis Preview */}
          {(diaryTitle.trim().length > 0 || diaryNotes.trim().length > 0 || recordedDuration > 0) && (
            <div className="dt-animate-panel rounded-xl border border-telemetry/25 bg-telemetry-container/45 p-3 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-on-telemetry-container font-display">
                  Pre-análisis Local en Cabina: {livePreview.emotionalTone}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold font-mono ${
                    livePreview.confinementStress === 'Elevado'
                      ? 'border-danger/35 bg-danger-container text-on-danger-container'
                      : livePreview.confinementStress === 'Moderado'
                        ? 'border-warning/35 bg-warning-container text-on-warning-container'
                        : 'border-primary/35 bg-primary-container text-on-primary-container'
                  }`}
                >
                  Estrés: {livePreview.confinementStress}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {livePreview.detectedThemes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-md border border-outline bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-surface"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Sugerencia: {livePreview.clinicalRecommendation}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={
                !diaryTitle.trim() && !diaryNotes.trim() && !pendingMediaUrl && recordedDuration === 0
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary dt-transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_8px_18px_-8px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
            >
              <Sparkles className="h-4 w-4" />
              Analizar y Guardar en Bitácora (+35 pts)
            </button>
            {savedBanner && (
              <span className="dt-animate-panel rounded-full border border-primary/30 bg-primary-container px-3 py-1 text-[11px] font-semibold text-on-primary-container">
                Entrada guardada y analizada ✓
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Right: Psychologist Evaluation & Asynchronous Earth Sync */}
      <div className="lg:col-span-5 rounded-2xl border border-outline bg-surface-container p-5 space-y-4">
        <div className="border-b border-outline-variant pb-3">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
            <Brain className="h-5 w-5 text-telemetry" />
            Evaluación Psicológica (IA Local & Tierra)
          </h3>
          <p className="text-xs text-on-surface-variant">
            Historial con reproducción local, análisis léxico-vocal y transmisión asíncrona a
            psicólogos de vuelo.
          </p>
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {videoLogs.map((log) => {
            const mediaUrl = videoMediaUrls[log.id];
            const syncState = log.aiIndicators.syncState ?? 'queued';
            const stressBadge =
              log.aiIndicators.confinementStress === 'Elevado'
                ? 'border-danger/35 bg-danger-container text-on-danger-container'
                : log.aiIndicators.confinementStress === 'Moderado'
                  ? 'border-warning/35 bg-warning-container text-on-warning-container'
                  : 'border-primary/35 bg-primary-container text-on-primary-container';

            return (
              <div
                key={log.id}
                className="rounded-xl border border-outline bg-surface-container-low p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-on-surface font-display block">
                      {log.title}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {log.timestamp}
                      {typeof log.durationSeconds === 'number' ? ` · ${log.durationSeconds}s` : ''}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md border border-telemetry/25 bg-telemetry-container px-2 py-0.5 text-[10px] font-semibold text-on-telemetry-container font-mono">
                    {log.mode === 'video' ? 'Video-Diario' : 'Escrito'}
                  </span>
                </div>

                {mediaUrl && (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-h-40 rounded-lg border border-outline bg-viewport-surface"
                  />
                )}

                <p className="text-xs leading-relaxed text-on-surface">{log.notes}</p>

                {log.aiIndicators.detectedThemes && log.aiIndicators.detectedThemes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {log.aiIndicators.detectedThemes.map((theme) => (
                      <span
                        key={theme}
                        className="rounded-md border border-outline bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-surface-variant"
                      >
                        {theme}
                      </span>
                    ))}
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${stressBadge}`}>
                      Estrés {log.aiIndicators.confinementStress}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-outline-variant text-[10px]">
                  <div className="rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-on-surface">
                    <span className="text-on-surface-variant block">Tono Detectado:</span>
                    {log.aiIndicators.emotionalTone}
                  </div>
                  <div className="rounded-lg border border-outline bg-surface-container px-2 py-1.5 text-on-surface">
                    <span className="text-on-surface-variant block">Métrica Vocal:</span>
                    {log.aiIndicators.vocalFatigue}
                  </div>
                </div>

                {log.aiIndicators.clinicalRecommendation && (
                  <p className="rounded-lg border border-outline bg-surface-container px-2.5 py-1.5 text-[11px] text-on-surface-variant">
                    <strong className="text-on-surface">Guía abordo:</strong>{' '}
                    {log.aiIndicators.clinicalRecommendation}
                  </p>
                )}

                {log.aiIndicators.earthFeedback && (
                  <p className="dt-animate-panel rounded-lg border border-primary/30 bg-primary-container/60 px-2.5 py-1.5 text-[11px] text-on-primary-container">
                    {log.aiIndicators.earthFeedback}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[10px] font-medium text-primary">
                    {syncState === 'acknowledged' ? '✓ ' : '• '}
                    {log.aiIndicators.earthSyncStatus}
                  </p>

                  {syncState === 'queued' && (
                    <button
                      type="button"
                      onClick={() => syncVideoDiaryToEarth(log.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-primary/35 bg-primary-container px-2.5 py-1 text-[10px] font-bold text-on-primary-container dt-transition hover:-translate-y-px hover:bg-primary hover:text-on-primary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      <Send className="h-3 w-3" />
                      Transmitir a Tierra (+10 pts)
                    </button>
                  )}

                  {syncState === 'transmitting' && (
                    <span className="rounded-lg border border-telemetry/30 bg-telemetry-container px-2.5 py-1 text-[10px] font-mono font-semibold text-on-telemetry-container animate-pulse">
                      Enviando paquete…
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
