// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import {
  BIOME_MUSIC_SCORES,
  BiomeMusicScore,
  DrumStep,
  JUKEBOX_TO_BIOME,
  SynthTimbre,
  computeNoteSteps,
  midiToFreq,
} from './biomeMusic';
import { BiomeId } from './types';

class GameAudio {
  private ctx: AudioContext | null = null;
  private muted = false;
  private unlocked = false;
  private currentBiome: BiomeId | null = null;

  // Master music chain: musicGain -> musicFilter -> compressor -> ctx.destination
  private musicMasterGain: GainNode | null = null;
  private musicWarmFilter: BiquadFilterNode | null = null;
  private musicCompressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Sequencer state
  private seqTimer: number | null = null;
  private seqActive = false;
  private seqStep = 0;
  private nextNoteTime = 0;
  private activeScore: BiomeMusicScore | null = null;
  private visibilityHooked = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(m: boolean): void {
    this.muted = m;
    if (this.musicMasterGain && this.ctx) {
      const target = m || !this.seqActive ? 0 : (this.activeScore?.masterVolume ?? 0.1);
      this.musicMasterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private hookVisibility(): void {
    if (this.visibilityHooked || typeof document === 'undefined') return;
    this.visibilityHooked = true;
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.musicMasterGain) return;
      if (document.hidden) {
        this.musicMasterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      } else if (this.seqActive && !this.muted) {
        this.nextNoteTime = Math.max(this.nextNoteTime, this.ctx.currentTime + 0.06);
        this.musicMasterGain.gain.setTargetAtTime(
          this.activeScore?.masterVolume ?? 0.1,
          this.ctx.currentTime,
          0.12
        );
      }
    });
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined' || !this.unlocked) return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.hookVisibility();
    return this.ctx;
  }

  private ensureMusicBus(ctx: AudioContext): GainNode | null {
    try {
      if (!this.musicMasterGain || !this.musicWarmFilter || !this.musicCompressor) {
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const comp = ctx.createDynamicsCompressor();

        filter.type = 'lowpass';
        filter.frequency.value = this.activeScore?.padWarmthHz ?? 4000;
        filter.Q.value = 0.6;

        comp.threshold.value = -16;
        comp.knee.value = 18;
        comp.ratio.value = 4;
        comp.attack.value = 0.01;
        comp.release.value = 0.2;

        gain.gain.value = 0;

        gain.connect(filter);
        filter.connect(comp);
        comp.connect(ctx.destination);

        this.musicMasterGain = gain;
        this.musicWarmFilter = filter;
        this.musicCompressor = comp;
      }
      return this.musicMasterGain;
    } catch {
      return null;
    }
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const len = Math.floor(ctx.sampleRate * 0.25);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buf;
    return buf;
  }

  public unlock(): void {
    this.unlocked = true;
    const ctx = this.ensureContext();
    if (ctx && this.currentBiome && !this.seqActive) {
      const b = this.currentBiome;
      this.currentBiome = null;
      this.updateBiomeAmbience(b);
    }
  }

  public updateBiomeAmbience(biome: BiomeId): void {
    const sameBiome = this.currentBiome === biome && this.seqActive;
    this.currentBiome = biome;
    const score = BIOME_MUSIC_SCORES[biome] ?? BIOME_MUSIC_SCORES.silver_ash;
    this.activeScore = score;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const bus = this.ensureMusicBus(ctx);
    if (!bus) return;

    try {
      if (this.musicWarmFilter) {
        this.musicWarmFilter.frequency.setTargetAtTime(score.padWarmthHz, ctx.currentTime, 0.35);
      }

      if (!sameBiome) {
        // Gentle melodic restart on biome transition
        this.seqStep = 0;
        this.nextNoteTime = ctx.currentTime + 0.08;
      }

      this.seqActive = true;
      const targetVol = this.muted || (typeof document !== 'undefined' && document.hidden)
        ? 0
        : score.masterVolume;
      bus.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.25);

      if (this.seqTimer === null && typeof window !== 'undefined') {
        this.seqTimer = window.setInterval(() => this.schedulerTick(), 45);
      }
    } catch {
      // Ignore audio errors in headless environments
    }
  }

  public stopAmbience(): void {
    this.seqActive = false;
    if (this.seqTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.seqTimer);
      this.seqTimer = null;
    }
    if (this.musicMasterGain && this.ctx) {
      try {
        this.musicMasterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private schedulerTick(): void {
    if (!this.seqActive || !this.ctx || !this.activeScore || !this.musicMasterGain) return;
    if (this.muted || this.ctx.state !== 'running') {
      this.nextNoteTime = this.ctx.currentTime + 0.06;
      return;
    }
    if (typeof document !== 'undefined' && document.hidden) return;

    const score = this.activeScore;
    const stepDuration = 60 / score.bpm / score.subdivision;
    const scheduleAhead = 0.14;

    if (this.nextNoteTime < this.ctx.currentTime - 0.2) {
      this.nextNoteTime = this.ctx.currentTime + 0.04;
    }

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
      this.scheduleStep(this.ctx, this.musicMasterGain, score, this.seqStep, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.seqStep = (this.seqStep + 1) % 32;
    }
  }

  private scheduleStep(
    ctx: AudioContext,
    dest: AudioNode,
    score: BiomeMusicScore,
    step: number,
    time: number,
    stepDur: number
  ): void {
    // 1. Warm sustained chord pad every 8 steps (1 bar)
    if (step % 8 === 0) {
      const chordIdx = Math.floor(step / 8) % score.chords.length;
      const chord = score.chords[chordIdx];
      const chordDur = stepDur * 7.8;
      chord.forEach((midi, idx) => {
        this.playPadVoice(ctx, dest, midiToFreq(midi), time, chordDur, idx === 0 ? 0.16 : 0.12);
      });
    }

    // 2. Expressive Lead Melody with computed legato sustain
    const melMidi = score.melody[step];
    if (melMidi !== null && melMidi !== undefined) {
      const holdSteps = computeNoteSteps(score.melody, step, 4);
      const dur = Math.max(stepDur * 0.85, holdSteps * stepDur * 0.94);
      const accent = step % 8 === 0 ? 1.12 : step % 4 === 0 ? 1.04 : 0.94;
      this.playTimbreNote(ctx, dest, score.leadTimbre, midiToFreq(melMidi), time, dur, 0.34 * accent);
    }

    // 3. Complementary Counter-Melody / Arpeggio
    const arpMidi = score.counterArp[step];
    if (arpMidi !== null && arpMidi !== undefined) {
      this.playTimbreNote(ctx, dest, score.arpTimbre, midiToFreq(arpMidi), time, stepDur * 1.15, 0.17);
    }

    // 4. Anchoring Bassline
    const bassMidi = score.bass[step];
    if (bassMidi !== null && bassMidi !== undefined) {
      const holdBass = computeNoteSteps(score.bass, step, 3);
      this.playBassVoice(ctx, dest, midiToFreq(bassMidi), time, holdBass * stepDur * 0.9, 0.32);
    }

    // 5. Gentle Percussion Groove
    const drum = score.drums[step];
    if (drum) {
      this.playDrumVoice(ctx, dest, drum, time);
    }
  }

  private playPadVoice(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    dur: number,
    vol: number
  ): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + Math.min(0.28, dur * 0.25));
    g.gain.setValueAtTime(vol * 0.8, time + dur * 0.72);
    g.gain.exponentialRampToValueAtTime(0.0005, time + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private playBassVoice(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    dur: number,
    vol: number
  ): void {
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(420, time);
    filt.frequency.exponentialRampToValueAtTime(160, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0005, time + dur);
    osc.connect(filt);
    filt.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private playTimbreNote(
    ctx: AudioContext,
    dest: AudioNode,
    timbre: SynthTimbre,
    freq: number,
    time: number,
    dur: number,
    vol: number
  ): void {
    const osc = ctx.createOscillator();
    const over = ctx.createOscillator();
    const overGain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    const env = ctx.createGain();

    let attack = 0.015;
    let overRatio = 2;
    let overLevel = 0.22;

    if (timbre === 'flute') {
      osc.type = 'sine';
      over.type = 'triangle';
      overRatio = 2;
      overLevel = 0.14;
      attack = Math.min(0.06, dur * 0.2);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(2400, time);
    } else if (timbre === 'celesta' || timbre === 'musicbox') {
      osc.type = 'sine';
      over.type = 'sine';
      overRatio = timbre === 'musicbox' ? 3 : 2;
      overLevel = 0.28;
      attack = 0.005;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(5000, time);
    } else if (timbre === 'harp' || timbre === 'koto' || timbre === 'lute') {
      osc.type = 'triangle';
      over.type = 'sine';
      overRatio = timbre === 'koto' ? 2 : 1.5;
      overLevel = 0.2;
      attack = 0.004;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(3400, time);
      filt.frequency.exponentialRampToValueAtTime(750, time + dur);
    } else if (timbre === 'organ') {
      osc.type = 'triangle';
      over.type = 'sine';
      overRatio = 2;
      overLevel = 0.35;
      attack = 0.04;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(2100, time);
    } else if (timbre === 'horn') {
      osc.type = 'sawtooth';
      over.type = 'triangle';
      overRatio = 1;
      overLevel = 0.4;
      attack = 0.03;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(1600, time);
      filt.frequency.linearRampToValueAtTime(950, time + dur);
    } else if (timbre === 'clockwork') {
      osc.type = 'triangle';
      over.type = 'square';
      overRatio = 2;
      overLevel = 0.1;
      attack = 0.003;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(2900, time);
      filt.frequency.exponentialRampToValueAtTime(900, time + dur);
    } else {
      // synthlead
      osc.type = 'sawtooth';
      over.type = 'triangle';
      overRatio = 0.5;
      overLevel = 0.35;
      attack = 0.014;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(2800, time);
      filt.frequency.exponentialRampToValueAtTime(1100, time + dur);
    }

    osc.frequency.setValueAtTime(freq, time);
    over.frequency.setValueAtTime(freq * overRatio, time);
    overGain.gain.setValueAtTime(overLevel, time);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(vol, time + attack);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0008, vol * 0.48), time + Math.min(dur * 0.6, attack + 0.18));
    env.gain.exponentialRampToValueAtTime(0.0005, time + dur);

    osc.connect(filt);
    over.connect(overGain);
    overGain.connect(filt);
    filt.connect(env);
    env.connect(dest);

    osc.start(time);
    over.start(time);
    osc.stop(time + dur + 0.02);
    over.stop(time + dur + 0.02);
  }

  private playDrumVoice(ctx: AudioContext, dest: AudioNode, kind: DrumStep, time: number): void {
    if (!kind) return;
    if (kind === 'K') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.11);
      g.gain.setValueAtTime(0.28, time);
      g.gain.exponentialRampToValueAtTime(0.0005, time + 0.14);
      osc.connect(g);
      g.connect(dest);
      osc.start(time);
      osc.stop(time + 0.15);
    } else if (kind === 'S') {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(1400, time);
      filt.Q.value = 0.9;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14, time);
      g.gain.exponentialRampToValueAtTime(0.0005, time + 0.11);
      src.connect(filt);
      filt.connect(g);
      g.connect(dest);
      src.start(time);
      src.stop(time + 0.12);
    } else if (kind === 'H') {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      const filt = ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.setValueAtTime(5200, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, time);
      g.gain.exponentialRampToValueAtTime(0.0005, time + 0.045);
      src.connect(filt);
      filt.connect(g);
      g.connect(dest);
      src.start(time);
      src.stop(time + 0.05);
    } else if (kind === 'T') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(980, time);
      osc.frequency.exponentialRampToValueAtTime(640, time + 0.04);
      g.gain.setValueAtTime(0.1, time);
      g.gain.exponentialRampToValueAtTime(0.0005, time + 0.055);
      osc.connect(g);
      g.connect(dest);
      osc.start(time);
      osc.stop(time + 0.06);
    }
  }

  /** Plays a multi-voice jukebox preview bar matching the selected Sanctuary track */
  public playJukeboxPreview(trackId: string): void {
    if (this.muted) return;
    this.unlock();
    const ctx = this.ensureContext();
    if (!ctx) return;
    const bus = this.ensureMusicBus(ctx);
    if (!bus) return;

    const mappedBiome = JUKEBOX_TO_BIOME[trackId] ?? 'silver_ash';
    const score = BIOME_MUSIC_SCORES[mappedBiome];
    const stepDur = 60 / score.bpm / score.subdivision;
    const now = ctx.currentTime + 0.03;

    try {
      bus.gain.setTargetAtTime(score.masterVolume, now, 0.04);
      for (let i = 0; i < 8; i++) {
        this.scheduleStep(ctx, bus, score, i, now + i * stepDur, stepDur);
      }
      if (!this.seqActive) {
        bus.gain.setTargetAtTime(0, now + stepDur * 8.2, 0.16);
      }
    } catch {
      // Ignore audio errors
    }
  }

  public playTone(
    freq: number,
    duration = 0.14,
    type: OscillatorType = 'triangle',
    volume = 0.08
  ): void {
    this.tone(freq, freq, duration, type, volume, 0);
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.08,
    delay = 0
  ): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const jitter = 1 + (Math.random() - 0.5) * 0.06;
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freqStart * jitter), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd * jitter), now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  public playJump(wall = false): void {
    if (wall) {
      this.tone(240, 520, 0.09, 'triangle', 0.09);
    } else {
      this.tone(190, 440, 0.095, 'triangle', 0.09);
    }
  }

  public playDash(superTech = false): void {
    if (superTech) {
      this.tone(420, 140, 0.14, 'sawtooth', 0.11);
      this.tone(660, 880, 0.12, 'triangle', 0.07, 0.02);
    } else {
      this.tone(340, 110, 0.12, 'sawtooth', 0.1);
      this.tone(220, 90, 0.09, 'square', 0.05);
    }
  }

  public playLand(heavy = false): void {
    this.tone(heavy ? 130 : 165, 55, heavy ? 0.09 : 0.05, 'triangle', heavy ? 0.09 : 0.05);
  }

  public playSpring(): void {
    this.tone(260, 720, 0.15, 'triangle', 0.1);
    this.tone(390, 860, 0.12, 'sine', 0.06, 0.03);
  }

  public playCrystal(): void {
    this.tone(587.33, 880, 0.08, 'sine', 0.08);
    this.tone(880, 1174.66, 0.11, 'triangle', 0.07, 0.04);
  }

  public playRelic(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, n * 1.02, 0.12, 'triangle', 0.085, i * 0.055);
    });
  }

  public playKeyOrSwitch(): void {
    this.tone(440, 660, 0.09, 'sine', 0.08);
    this.tone(660, 990, 0.13, 'triangle', 0.08, 0.05);
  }

  public playDeath(): void {
    this.tone(280, 70, 0.22, 'sawtooth', 0.12);
    this.tone(190, 52, 0.25, 'square', 0.09, 0.04);
  }

  public playRespawn(): void {
    this.tone(220, 440, 0.11, 'sine', 0.06);
  }

  public playEnemyHit(killed = false): void {
    if (killed) {
      this.tone(360, 95, 0.14, 'sawtooth', 0.1);
      this.tone(520, 780, 0.1, 'triangle', 0.07, 0.03);
    } else {
      this.tone(240, 140, 0.08, 'square', 0.08);
    }
  }

  public playParry(): void {
    this.tone(620, 1240, 0.11, 'triangle', 0.11);
    this.tone(930, 1480, 0.13, 'sine', 0.08, 0.02);
  }

  public playDialogueBlip(pitch = 1): void {
    this.tone(320 * pitch, 340 * pitch, 0.035, 'square', 0.035);
  }

  public playCrumble(): void {
    this.tone(140, 65, 0.14, 'sawtooth', 0.06);
  }

  public playVictory(): void {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((n, i) => {
      this.tone(n, n, 0.3, 'triangle', 0.08, i * 0.08);
    });
  }

  public playBossRoar(): void {
    this.tone(130, 58, 0.36, 'sawtooth', 0.12);
    this.tone(92, 46, 0.42, 'square', 0.08, 0.05);
  }

  public playBossLaser(): void {
    this.tone(680, 210, 0.22, 'sawtooth', 0.1);
    this.tone(1120, 420, 0.16, 'triangle', 0.07, 0.02);
  }

  public playWaveStart(): void {
    const notes = [392.0, 493.88, 587.33];
    notes.forEach((n, i) => {
      this.tone(n, n * 1.05, 0.12, 'triangle', 0.075, i * 0.06);
    });
  }
}

export const gameAudio = new GameAudio();
