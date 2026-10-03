import { StorageService } from '../services/storage';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;

  constructor() {
    this.isMuted = !StorageService.isSoundEnabled();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.bgmGain && this.ctx) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    StorageService.setSoundEnabled(!this.isMuted);

    if (this.bgmGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, now);
    }

    if (!this.isMuted && !this.isBgmPlaying) {
      this.startCircusMusic();
    }

    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ==========================================
  // CIRCUS BACKGROUND MUSIC (Web Audio Polka / Calliope)
  // ==========================================
  public startCircusMusic() {
    this.initCtx();
    if (!this.ctx) return;
    if (this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Circus Polka tempo: 152 BPM, 16th-note step = 60 / (152 * 4) = ~0.0987s
    const stepDurationMs = 100;

    // 64-step Circus Loop (4 bars in 4/4 or 8 bars in 2/4)
    // Melody notes in Hz (0 = rest)
    const N = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99,
      G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
      C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99,
      G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
    };

    // Circus Melodic Sequence: Cheerful, bouncy carnival carousel theme
    const leadNotes: number[] = [
      // Bar 1: Intro playful run
      N.G4, N.Gs4, N.A4, N.B4, N.C5, 0, N.E5, 0,
      N.G5, 0, N.E5, 0, N.C5, 0, N.G4, 0,
      // Bar 2: Bouncy circus response
      N.F4, N.Fs4, N.G4, N.A4, N.B4, 0, N.D5, 0,
      N.F5, 0, N.D5, 0, N.B4, 0, N.G4, 0,
      // Bar 3: Ascending circus arpeggios
      N.C5, 0, N.E5, 0, N.G5, 0, N.C6, 0,
      N.B5, 0, N.A5, 0, N.G5, 0, N.F5, 0,
      // Bar 4: Classic carnival flourish turnaround
      N.E5, 0, N.C5, 0, N.D5, 0, N.B4, 0,
      N.C5, 0, N.G4, 0, N.C5, 0, 0, 0,
    ];

    // Oom-Pah Bass Pattern (Root on beat 1, Offbeat Chords on beat 2)
    const bassNotes: number[] = [
      // Bar 1 (C Major)
      N.C3, 0, 0, 0, 0, 0, 0, 0, N.G3, 0, 0, 0, 0, 0, 0, 0,
      // Bar 2 (G7)
      N.G3, 0, 0, 0, 0, 0, 0, 0, N.D3, 0, 0, 0, 0, 0, 0, 0,
      // Bar 3 (C Major to F)
      N.C3, 0, 0, 0, 0, 0, 0, 0, N.F3, 0, 0, 0, 0, 0, 0, 0,
      // Bar 4 (G7 to C resolution)
      N.G3, 0, 0, 0, 0, 0, 0, 0, N.C3, 0, 0, 0, N.C3, 0, 0, 0,
    ];

    // Accompaniment chords on 16th steps (off-beats: steps 4, 12, 20, 28, etc.)
    const chordSteps: { [step: number]: number[] } = {
      4: [N.E4, N.G4, N.C5],
      12: [N.E4, N.G4, N.C5],
      20: [N.D4, N.F4, N.B4],
      28: [N.D4, N.F4, N.B4],
      36: [N.E4, N.G4, N.C5],
      44: [N.F4, N.A4, N.C5],
      52: [N.D4, N.F4, N.B4],
      60: [N.E4, N.G4, N.C5],
    };

    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
    }

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) {
        this.bgmStep = (this.bgmStep + 1) % 64;
        return;
      }

      const now = this.ctx.currentTime;
      const step = this.bgmStep;

      // 1. Play Lead Calliope note
      const leadFreq = leadNotes[step];
      if (leadFreq > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Cheerful calliope / toy circus synth sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(leadFreq, now);

        noteGain.gain.setValueAtTime(0.24, now);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.13);
      }

      // 2. Play Bass Oom-Pah note
      const bassFreq = bassNotes[step];
      if (bassFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(bassFreq, now);

        bGain.gain.setValueAtTime(0.22, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);

        bOsc.start(now);
        bOsc.stop(now + 0.19);
      }

      // 3. Play Circus Off-Beat Chords (Pah!)
      if (chordSteps[step]) {
        chordSteps[step].forEach((freq) => {
          const cOsc = this.ctx!.createOscillator();
          const cGain = this.ctx!.createGain();

          cOsc.type = 'triangle';
          cOsc.frequency.setValueAtTime(freq, now);

          cGain.gain.setValueAtTime(0.12, now);
          cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

          cOsc.connect(cGain);
          cGain.connect(this.bgmGain!);

          cOsc.start(now);
          cOsc.stop(now + 0.10);
        });
      }

      this.bgmStep = (this.bgmStep + 1) % 64;
    }, stepDurationMs);
  }

  public stopCircusMusic() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public pauseCircusMusic() {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public resumeCircusMusic() {
    if (this.isMuted) return;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    }
    if (!this.isBgmPlaying) {
      this.startCircusMusic();
    }
  }

  // Play Cannon Shoot SFX
  public playShoot(powerUpType?: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (powerUpType === 'explosive') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    } else if (powerUpType === 'triple') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Bounce SFX
  public playBounce() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Balloon Hit SFX (non-lethal hit on reinforced balloon)
  public playBalloonHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Balloon Pop / Explosion SFX
  public playBalloonPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Noise buffer for pop sound
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);

    // Complementary pop tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Prize Box Caught
  public playPowerUpCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.18, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.12);
    });
  }

  // Cannon Hit / Damage
  public playCannonHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Level Win
  public playWin() {
    this.stopCircusMusic();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 440, t: 0 },
      { f: 554.37, t: 0.12 },
      { f: 659.25, t: 0.24 },
      { f: 880, t: 0.38 },
    ];

    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.2, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + 0.25);
    });
  }

  // Game Over
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [400, 350, 300, 220];

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(0.22, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.2);
    });
  }

  // Button Click
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundManager = new AudioManager();
