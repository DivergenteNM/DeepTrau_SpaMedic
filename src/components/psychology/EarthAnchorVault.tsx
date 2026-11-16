'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  Heart,
  ImagePlus,
  Maximize2,
  Pause,
  Play,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { InspirationItem, useMission } from '@/context/MissionContext';

type SoundId = 'rain' | 'ocean' | 'forest' | 'heartbeat';

export function EarthAnchorVault() {
  const { inspirationItems, addInspirationItem, removeInspirationItem } = useMission();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stopAudioFnRef = useRef<(() => void) | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [trackTime, setTrackTime] = useState<{ current: number; duration: number }>({
    current: 0,
    duration: 0,
  });
  const [volume, setVolume] = useState<number>(0.65);
  const [timerMinutes, setTimerMinutes] = useState<0 | 5 | 15>(0);
  const [timerRemainingSec, setTimerRemainingSec] = useState<number>(0);

  const [focusedItem, setFocusedItem] = useState<InspirationItem | null>(null);

  const [newAnchorTitle, setNewAnchorTitle] = useState('');
  const [newAnchorQuote, setNewAnchorQuote] = useState('');
  const [newAnchorCategory, setNewAnchorCategory] =
    useState<InspirationItem['category']>('Familia');
  const [newAnchorSound, setNewAnchorSound] = useState<SoundId>('forest');
  const [newAnchorImage, setNewAnchorImage] = useState<string | undefined>(undefined);

  const stopAllAudio = () => {
    if (stopAudioFnRef.current) {
      stopAudioFnRef.current();
      stopAudioFnRef.current = null;
    }
    masterGainRef.current = null;

    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.src = '';
      htmlAudioRef.current = null;
    }

    setPlayingItemId(null);
    setTrackTime({ current: 0, duration: 0 });
    setTimerRemainingSec(0);
  };

  useEffect(() => {
    if (!focusedItem) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFocusedItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedItem]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        Math.max(0.001, volume * 0.25),
        audioCtxRef.current.currentTime,
        0.08
      );
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (!playingItemId || timerMinutes === 0) return;
    if (timerRemainingSec <= 0) return;

    const interval = setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          stopAllAudio();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playingItemId, timerMinutes, timerRemainingSec]);

  const createBrownNoiseBuffer = (ctx: AudioContext, seconds = 4) => {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      output[i] = lastOut * 3.2;
    }
    return buffer;
  };

  const playSynthesizedSound = (itemId: string, soundId: SoundId) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current ?? new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(Math.max(0.01, volume * 0.25), ctx.currentTime + 0.5);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      const cleanups: (() => void)[] = [];

      if (soundId === 'rain') {
        const bed = ctx.createBufferSource();
        bed.buffer = createBrownNoiseBuffer(ctx, 4);
        bed.loop = true;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1150;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 260;

        bed.connect(hp);
        hp.connect(lp);
        lp.connect(master);
        bed.start();

        const dropTimer = setInterval(() => {
          if (ctx.state !== 'running') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(720 + Math.random() * 520, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now);
          osc.stop(now + 0.2);
        }, 680);

        cleanups.push(() => {
          clearInterval(dropTimer);
          bed.stop();
        });
      } else if (soundId === 'ocean') {
        const surf = ctx.createBufferSource();
        surf.buffer = createBrownNoiseBuffer(ctx, 5);
        surf.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 420;

        const swellGain = ctx.createGain();
        swellGain.gain.value = 0.55;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.11;

        const lfoDepth = ctx.createGain();
        lfoDepth.gain.value = 260;

        const lfoAmp = ctx.createGain();
        lfoAmp.gain.value = 0.35;

        lfo.connect(lfoDepth);
        lfoDepth.connect(filter.frequency);
        lfo.connect(lfoAmp);
        lfoAmp.connect(swellGain.gain);

        surf.connect(filter);
        filter.connect(swellGain);
        swellGain.connect(master);

        surf.start();
        lfo.start();
        cleanups.push(() => {
          surf.stop();
          lfo.stop();
        });
      } else if (soundId === 'forest') {
        const breeze = ctx.createBufferSource();
        breeze.buffer = createBrownNoiseBuffer(ctx, 4);
        breeze.loop = true;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 340;
        bp.Q.value = 0.9;

        const breezeGain = ctx.createGain();
        breezeGain.gain.value = 0.32;
        breeze.connect(bp);
        bp.connect(breezeGain);
        breezeGain.connect(master);
        breeze.start();

        const notes = [261.63, 293.66, 329.63, 392.0, 440.0];
        const chimeTimer = setInterval(() => {
          if (ctx.state !== 'running') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(0.09, now + 0.4);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 2.5);
        }, 2600);

        cleanups.push(() => {
          clearInterval(chimeTimer);
          breeze.stop();
        });
      } else {
        const pad = ctx.createOscillator();
        const padGain = ctx.createGain();
        pad.type = 'sine';
        pad.frequency.value = 110;
        padGain.gain.value = 0.08;
        pad.connect(padGain);
        padGain.connect(master);
        pad.start();

        const triggerBeat = () => {
          if (ctx.state !== 'running') return;
          const now = ctx.currentTime;
          const pulse = (offset: number, freq: number, amp: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + offset);
            osc.frequency.exponentialRampToValueAtTime(34, now + offset + 0.14);
            g.gain.setValueAtTime(0.0001, now + offset);
            g.gain.linearRampToValueAtTime(amp, now + offset + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
            osc.connect(g);
            g.connect(master);
            osc.start(now + offset);
            osc.stop(now + offset + 0.2);
          };
          pulse(0, 62, 0.55);
          pulse(0.24, 52, 0.36);
        };

        triggerBeat();
        const beatTimer = setInterval(triggerBeat, 1000);

        cleanups.push(() => {
          clearInterval(beatTimer);
          pad.stop();
        });
      }

      stopAudioFnRef.current = () => {
        cleanups.forEach((fn) => {
          try {
            fn();
          } catch {
            // ignore
          }
        });
        try {
          master.disconnect();
        } catch {
          // ignore
        }
      };

      setPlayingItemId(itemId);
      if (timerMinutes > 0) {
        setTimerRemainingSec(timerMinutes * 60);
      }
    } catch {
      setPlayingItemId(null);
    }
  };

  const togglePlayItem = (item: InspirationItem) => {
    if (playingItemId === item.id) {
      stopAllAudio();
      return;
    }
    stopAllAudio();

    if (item.audioUrl) {
      try {
        const audio = new Audio(item.audioUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.onloadedmetadata = () => {
          setTrackTime({
            current: audio.currentTime,
            duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          });
        };
        audio.ontimeupdate = () => {
          setTrackTime({
            current: audio.currentTime,
            duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          });
        };
        audio.onended = () => {
          setPlayingItemId(null);
          setTrackTime({ current: 0, duration: 0 });
        };
        htmlAudioRef.current = audio;
        setPlayingItemId(item.id);
        if (timerMinutes > 0) {
          setTimerRemainingSec(timerMinutes * 60);
        }
        void audio.play().catch(() => {
          // Fallback cleanly if browser blocks playback
          setPlayingItemId(null);
        });
      } catch {
        setPlayingItemId(null);
      }
      return;
    }

    playSynthesizedSound(item.id, item.soundId);
  };

  const handleSeekTrack = (seconds: number) => {
    if (!htmlAudioRef.current) return;
    htmlAudioRef.current.currentTime = seconds;
    setTrackTime((prev) => ({ ...prev, current: seconds }));
  };

  const handleSelectTimer = (mins: 0 | 5 | 15) => {
    setTimerMinutes(mins);
    setTimerRemainingSec(playingItemId && mins > 0 ? mins * 60 : 0);
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
    const soundLabels: Record<SoundId, string> = {
      forest: 'Audio: Mañana en el bosque',
      rain: 'Audio: Lluvia terrestre',
      ocean: 'Audio: Olas del océano',
      heartbeat: 'Audio: Pulso calmante 60 bpm',
    };
    const paletteMap: Record<InspirationItem['category'], InspirationItem['palette']> = {
      Familia: 'amber',
      Tierra: 'cyan',
      'Mensaje de Voz': 'rose',
    };

    addInspirationItem({
      title: newAnchorTitle.trim(),
      subtitle: 'Recuerdo personal cargado a bordo',
      category: newAnchorCategory,
      durationOrDate: 'Guardado localmente · Offline',
      quote: newAnchorQuote.trim() || '"Siempre mirando las mismas estrellas."',
      imageUrl: newAnchorImage,
      palette: paletteMap[newAnchorCategory],
      soundId: newAnchorSound,
      soundLabel: soundLabels[newAnchorSound],
    });
    setNewAnchorTitle('');
    setNewAnchorQuote('');
    setNewAnchorImage(undefined);
  };

  const formatClock = (sec: number) => {
    const safe = Math.max(0, Math.floor(sec));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section
      id="muro-inspiracion"
      className="rounded-2xl border border-outline bg-surface-container p-5 space-y-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-outline-variant pb-3">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
            <Heart className="h-5 w-5 text-danger" />
            Muro de Inspiración y Conexión Terrestre (&quot;Mi Ancla en la Tierra&quot;)
          </h2>
          <p className="text-xs text-on-surface-variant">
            Audios familiares reales offline, vista inmersiva de calma y paisajes sonoros
            bioacústicos para reducir el cortisol en cabina.
          </p>
        </div>

        {/* Audio Master Controls + Sleep Timer */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-outline bg-surface-container-low px-3 py-1.5">
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volumen maestro de audios y paisajes sonoros"
              className="w-20 cursor-pointer accent-primary"
            />
            <span className="font-mono text-[10px] font-semibold text-on-surface-variant">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-outline bg-surface-container-low p-1 text-[10px]">
            <Clock className="ml-1.5 h-3.5 w-3.5 text-on-surface-variant" />
            {([0, 5, 15] as const).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectTimer(mins)}
                className={`cursor-pointer rounded-lg px-2 py-1 font-semibold dt-transition ${
                  timerMinutes === mins
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {mins === 0 ? 'Continuo' : `${mins}m`}
              </button>
            ))}
            {playingItemId && timerRemainingSec > 0 && (
              <span className="px-1.5 font-mono font-bold text-primary">
                {formatClock(timerRemainingSec)}
              </span>
            )}
          </div>

          {playingItemId && (
            <button
              type="button"
              onClick={stopAllAudio}
              className="dt-animate-panel inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-danger/35 bg-danger-container px-3 py-1.5 text-xs font-semibold text-on-danger-container dt-transition hover:-translate-y-px hover:border-danger active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
            >
              <VolumeX className="h-4 w-4 text-danger" />
              Silenciar
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {inspirationItems.map((item) => {
          const isPlaying = playingItemId === item.id;
          const isCustom = !['insp-1', 'insp-2', 'insp-3', 'insp-4'].includes(item.id);
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
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-on-surface font-display">{item.title}</h3>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => removeInspirationItem(item.id)}
                        title="Eliminar recuerdo"
                        className="cursor-pointer rounded-lg p-1 text-on-surface-variant dt-transition hover:bg-danger-container hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">{item.subtitle}</p>
                </div>
                <p className="text-xs italic leading-relaxed text-on-surface">{item.quote}</p>
              </div>

              <div className="space-y-2">
                {isPlaying && item.audioUrl && trackTime.duration > 0 && (
                  <div className="dt-animate-panel rounded-xl border border-primary/25 bg-surface-container px-2.5 py-2 space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={trackTime.duration}
                      step={0.5}
                      value={trackTime.current}
                      onChange={(e) => handleSeekTrack(Number(e.target.value))}
                      aria-label={`Progreso de ${item.title}`}
                      className="w-full cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
                      <span>{formatClock(trackTime.current)}</span>
                      <span>{formatClock(trackTime.duration)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => togglePlayItem(item)}
                  className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold dt-transition hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    isPlaying
                      ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
                      : 'border-outline bg-surface-container text-on-surface hover:border-primary/45 hover:bg-surface-container-low'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : item.audioUrl ? (
                    <Play className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  {isPlaying ? 'Reproduciendo (Pausar)' : item.soundLabel}
                </button>

                <button
                  type="button"
                  onClick={() => setFocusedItem(item)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-outline bg-surface-container-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant dt-transition hover:border-primary/40 hover:bg-surface-container hover:text-on-surface active:scale-[0.98]"
                >
                  <Maximize2 className="h-3 w-3" />
                  Abrir en Vista Calma
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Personal Anchor Form */}
      <form
        onSubmit={handleAddAnchor}
        className="rounded-xl border border-outline bg-surface-container-low p-4 grid gap-3 md:grid-cols-6 md:items-end"
      >
        <div className="md:col-span-2">
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
        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
            Paisaje sonoro
          </label>
          <select
            value={newAnchorSound}
            onChange={(e) => setNewAnchorSound(e.target.value as SoundId)}
            className="w-full cursor-pointer rounded-lg border border-outline bg-surface-container px-2.5 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary"
          >
            <option value="forest">Bosque tranquilo</option>
            <option value="rain">Lluvia terrestre</option>
            <option value="ocean">Olas del océano</option>
            <option value="heartbeat">Pulso 60 bpm</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
            Categoría
          </label>
          <select
            value={newAnchorCategory}
            onChange={(e) => setNewAnchorCategory(e.target.value as InspirationItem['category'])}
            className="w-full cursor-pointer rounded-lg border border-outline bg-surface-container px-2.5 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary"
          >
            <option value="Familia">Familia</option>
            <option value="Tierra">Tierra</option>
            <option value="Mensaje de Voz">Mensaje</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
            Mensaje de ánimo
          </label>
          <input
            type="text"
            value={newAnchorQuote}
            onChange={(e) => setNewAnchorQuote(e.target.value)}
            placeholder="Ej. ¡Nos vemos al regreso!"
            className="w-full rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs text-on-surface outline-none dt-transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="md:col-span-3">
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-outline bg-surface-container px-3 py-2 text-xs font-medium text-primary dt-transition hover:-translate-y-px hover:border-primary hover:bg-primary-container/35 active:translate-y-0 active:scale-[0.98]">
            <ImagePlus className="h-4 w-4" />
            {newAnchorImage ? 'Imagen cargada ✓' : 'Subir foto familiar (opcional)'}
            <input
              type="file"
              accept="image/*"
              onChange={handleAnchorPhotoUpload}
              className="hidden"
            />
          </label>
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={!newAnchorTitle.trim()}
            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary dt-transition hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_14px_-6px_rgba(47,93,70,0.45)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 font-display"
          >
            Agregar a Mi Ancla (+15 pts)
          </button>
        </div>
      </form>

      {/* Immersive Focus / Calm Modal rendered into document.body via Portal */}
      {focusedItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Vista calma: ${focusedItem.title}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) setFocusedItem(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/55 p-4 backdrop-blur-[3px] sm:p-6"
          >
            <div className="dt-animate-panel flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-outline bg-surface-container shadow-[0_24px_64px_-24px_rgba(26,36,30,0.42)]">
              <header className="flex items-start justify-between gap-3 border-b border-outline-variant bg-surface-container-low/65 px-5 py-4">
                <div>
                  <span className="inline-block rounded-full border border-primary/30 bg-primary-container px-2.5 py-0.5 text-[10px] font-bold text-on-primary-container font-display">
                    {focusedItem.category} · Modo Calma
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-on-surface font-display">
                    {focusedItem.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{focusedItem.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFocusedItem(null)}
                  aria-label="Cerrar vista calma"
                  className="cursor-pointer rounded-xl border border-outline bg-surface-container p-2 text-on-surface-variant dt-transition hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface active:scale-[0.97]"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {focusedItem.imageUrl ? (
                  <img
                    src={focusedItem.imageUrl}
                    alt={focusedItem.title}
                    className="max-h-64 w-full rounded-xl border border-outline object-cover"
                  />
                ) : (
                  <div className="rounded-xl border border-viewport-border bg-viewport-surface p-6 text-center space-y-2">
                    <svg
                      viewBox="0 0 320 96"
                      className="mx-auto h-24 w-full max-w-xs"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="earthHorizon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2B5B6C" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#2F5D46" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <circle cx="48" cy="22" r="1.5" fill="#F7F5F0" opacity="0.7" />
                      <circle cx="110" cy="14" r="1" fill="#F7F5F0" opacity="0.55" />
                      <circle cx="240" cy="24" r="1.6" fill="#F7F5F0" opacity="0.75" />
                      <circle cx="285" cy="15" r="1.1" fill="#F7F5F0" opacity="0.5" />
                      <path
                        d="M 10 92 Q 160 32 310 92 Z"
                        fill="url(#earthHorizon)"
                        stroke="#DCE9EE"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <p className="text-[11px] font-mono text-on-viewport/80">
                      {focusedItem.durationOrDate}
                    </p>
                  </div>
                )}

                <blockquote className="rounded-xl border border-outline bg-surface-container-low p-4 text-sm italic leading-relaxed text-on-surface">
                  {focusedItem.quote}
                </blockquote>

                {playingItemId === focusedItem.id && focusedItem.audioUrl && trackTime.duration > 0 && (
                  <div className="dt-animate-panel rounded-xl border border-primary/25 bg-surface-container-low px-3.5 py-2.5 space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={trackTime.duration}
                      step={0.5}
                      value={trackTime.current}
                      onChange={(e) => handleSeekTrack(Number(e.target.value))}
                      aria-label={`Progreso de ${focusedItem.title}`}
                      className="w-full cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between font-mono text-[11px] text-on-surface-variant">
                      <span>{formatClock(trackTime.current)}</span>
                      <span>{formatClock(trackTime.duration)}</span>
                    </div>
                  </div>
                )}

                {/* Volume control inside Calm View for intuitive adjustment */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-outline bg-surface-container-low px-3.5 py-2.5">
                  <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-primary" />
                    Volumen del recuerdo
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volumen en vista calma"
                      className="w-28 cursor-pointer accent-primary"
                    />
                    <span className="w-9 text-right font-mono text-[11px] font-semibold text-on-surface">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant bg-surface-container-low/65 px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => togglePlayItem(focusedItem)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold dt-transition hover:-translate-y-px active:scale-[0.985] ${
                    playingItemId === focusedItem.id
                      ? 'bg-danger text-on-secondary hover:bg-danger-hover'
                      : 'bg-primary text-on-primary hover:bg-primary-hover'
                  }`}
                >
                  {playingItemId === focusedItem.id ? (
                    <Pause className="h-4 w-4" />
                  ) : focusedItem.audioUrl ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  {playingItemId === focusedItem.id
                    ? 'Pausar Audio'
                    : focusedItem.soundLabel}
                </button>

                <button
                  type="button"
                  onClick={() => setFocusedItem(null)}
                  className="cursor-pointer rounded-xl border border-outline bg-surface-container px-4 py-2 text-xs font-semibold text-on-surface dt-transition hover:border-primary/40 hover:bg-surface-container-high active:scale-[0.985]"
                >
                  Cerrar Vista Calma
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
