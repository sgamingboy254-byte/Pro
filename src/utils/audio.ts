// Polyphonic Web Audio synthesizer for tactile sounds & classical music playback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Tactile mechanical click for buttons and iPod click wheel
export function playClickSound(pitch = 800, duration = 0.02) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked until interaction
  }
}

// Play a musical tone or game sound
export function playTone(freq = 440, duration = 0.2, type: OscillatorType = 'sine', volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked until interaction
  }
}

// 2. Camera shutter sound
export function playCameraShutterSound() {
  try {
    const ctx = getAudioContext();
    // Click 1 (Mirror up)
    playClickSound(1200, 0.03);
    // Click 2 (Curtain close) after 60ms
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    }, 70);
  } catch (e) {}
}

// 3. Royal Chime / Bell for timer and notifications
export function playRoyalBellChime() {
  try {
    const ctx = getAudioContext();
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 chord chime
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch (e) {}
      }, idx * 120);
    });
  } catch (e) {}
}

// 3.0b Resonant Study Session Completion Alarm Bell
// Rings a 3-strike chime sequence with deep bronze resonance when study duration completes
export function playStudyBellAlarm() {
  try {
    const ctx = getAudioContext();
    const chords = [
      [523.25, 659.25, 783.99, 1046.5], // Strike 1 (C Major)
      [587.33, 739.99, 880.0, 1174.66], // Strike 2 (D Major)
      [523.25, 659.25, 783.99, 1318.51, 1567.98], // Strike 3 (Final Grand Resonance)
    ];

    chords.forEach((chord, strikeIdx) => {
      setTimeout(() => {
        chord.forEach((freq) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.8);
          } catch (e) {}
        });
      }, strikeIdx * 650);
    });
  } catch (e) {}
}

// 3.1 Vintage Rotary Ratchet Click with organic pitch variance
export function playRotaryRatchetSound(pitchOffset = 0) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    // Organic variance gives feel of genuine brass escapement
    const pitch = Math.max(180, 420 + pitchOffset + (Math.random() * 60 - 30));
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.018);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.018);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.018);
  } catch (e) {}
}

// 3.1b Varied gear detent step sound
export function playRotaryGearStep(step = 1) {
  const pitchOffsets = [-40, -10, 20, 50, 80, 110, 140, 170, 200, 240];
  const offset = pitchOffsets[step % pitchOffsets.length] || 0;
  playRotaryRatchetSound(offset);
}

// 3.1c Ultra-light micro tick for small small touches (icons, tabs, digits, sliders)
export function playMicroTick(isHigh = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHigh ? 1850 : 1350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.008);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.008);
  } catch (e) {}
}

// 3.1d Glass touch acoustic response
export function playGlassTap() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {}
}

// 3.1e Spring recoil unwinding sound when rotary wheel snaps home
export function playSpringRecoil() {
  try {
    const ctx = getAudioContext();
    // Metallic rattle sequence
    const ratchets = [580, 520, 460, 400, 340, 280, 210];
    ratchets.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq + Math.random() * 40, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.015);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.015);
        } catch (err) {}
      }, idx * 22);
    });
  } catch (e) {}
}

// 3.1f Golden Glow harmonic shimmer when a digit locks in
export function playGoldenShimmer() {
  try {
    const ctx = getAudioContext();
    const chord = [880, 1108.73, 1318.51, 1760]; // A major golden sheen
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.38);
        } catch (err) {}
      }, idx * 30);
    });
  } catch (e) {}
}

// 3.1g Authentic Dual-Tone Multi-Frequency (DTMF) matrix generator
// Standard telephone matrix: Row tones (697, 770, 852, 941 Hz) + Column tones (1209, 1336, 1477 Hz)
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export function playDtmfTone(digit: string, duration = 0.12) {
  const freqs = DTMF_FREQUENCIES[digit];
  if (!freqs) {
    playClickSound(800, duration);
    return;
  }

  try {
    const ctx = getAudioContext();
    const oscLow = ctx.createOscillator();
    const oscHigh = ctx.createOscillator();
    const gainLow = ctx.createGain();
    const gainHigh = ctx.createGain();

    oscLow.type = 'sine';
    oscLow.frequency.setValueAtTime(freqs[0], ctx.currentTime);

    oscHigh.type = 'sine';
    oscHigh.frequency.setValueAtTime(freqs[1], ctx.currentTime);

    gainLow.gain.setValueAtTime(0.07, ctx.currentTime);
    gainLow.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    gainHigh.gain.setValueAtTime(0.07, ctx.currentTime);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscLow.connect(gainLow);
    oscHigh.connect(gainHigh);

    gainLow.connect(ctx.destination);
    gainHigh.connect(ctx.destination);

    oscLow.start();
    oscHigh.start();
    oscLow.stop(ctx.currentTime + duration);
    oscHigh.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// 3.2 Mechanical Telephone Finger Stop Clack
export function playFingerStopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

// 3.3 Vintage Telephone Dual-Bell Ring
export function playVintageTelephoneRing() {
  try {
    const ctx = getAudioContext();
    const bellFreqs = [1200, 1500]; // Twin brass gongs
    bellFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    });
  } catch (e) {}
}

// 3.4 Vintage Telephone Dial Tone (US standard 350Hz + 440Hz)
export function playDialTone(duration = 0.6) {
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.setValueAtTime(350, ctx.currentTime);
    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// 3.5 Clock Tik-Tik mechanical escapement sound
export function playClockTikTikSound(isTock = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    // Tik is slightly higher pitch (1420Hz), Tock is lower (1080Hz)
    const baseFreq = isTock ? 1080 : 1420;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.015);
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.015);
  } catch (e) {}
}

// 3.6 Butter-Smooth Sliding Swoosh Sound
export function playSlideSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

// 3.7 Phone Telemetry Thinking & Sync Chime
export function playPhoneSyncSound() {
  try {
    const ctx = getAudioContext();
    const freqs = [330, 495, 660, 880, 1100];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
      }, idx * 60);
    });
  } catch (e) {}
}

// 4. Classical Music Synthesizer for iPod Player
export interface MusicalTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  notes: Array<{ freq: number; dur: number }>;
}

// Frequencies for classical notes
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 277.18, E4: 329.63, F4: 349.23, G4: 392.0, Ab4: 415.3, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, Ab5: 830.61, A5: 880.0, Bb5: 932.33, B5: 987.77,
  C6: 1046.5,
  REST: 0,
};

export const CLASSICAL_TRACKS: MusicalTrack[] = [
  {
    id: 'track_1',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    artist: 'Frédéric Chopin',
    album: 'Royal Piano Archives Vol. I',
    duration: 184,
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=80',
    notes: [
      { freq: N.Bb4, dur: 0.5 }, { freq: N.G4, dur: 0.5 }, { freq: N.Bb4, dur: 0.5 }, { freq: N.Eb5, dur: 1.0 },
      { freq: N.D5, dur: 0.5 }, { freq: N.C5, dur: 0.5 }, { freq: N.Bb4, dur: 1.0 },
      { freq: N.G4, dur: 0.5 }, { freq: N.Ab4, dur: 0.5 }, { freq: N.Bb4, dur: 0.5 }, { freq: N.C5, dur: 1.0 },
      { freq: N.Bb4, dur: 0.5 }, { freq: N.Ab4, dur: 0.5 }, { freq: N.G4, dur: 1.2 },
      { freq: N.F4, dur: 0.5 }, { freq: N.G4, dur: 0.5 }, { freq: N.Ab4, dur: 0.5 }, { freq: N.Bb4, dur: 1.0 },
      { freq: N.Eb4, dur: 1.5 },
    ],
  },
  {
    id: 'track_2',
    title: 'Moonlight Sonata (Adagio sostenuto)',
    artist: 'Ludwig van Beethoven',
    album: 'Imperial Masterworks',
    duration: 312,
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80',
    notes: [
      { freq: N.G4, dur: 0.4 }, { freq: N.C4, dur: 0.4 }, { freq: N.E4, dur: 0.4 },
      { freq: N.G4, dur: 0.4 }, { freq: N.C4, dur: 0.4 }, { freq: N.E4, dur: 0.4 },
      { freq: N.G4, dur: 0.4 }, { freq: N.C4, dur: 0.4 }, { freq: N.E4, dur: 0.4 },
      { freq: N.A4, dur: 0.8 }, { freq: N.F4, dur: 0.4 }, { freq: N.C4, dur: 0.4 },
      { freq: N.G4, dur: 0.8 }, { freq: N.E4, dur: 0.4 }, { freq: N.C4, dur: 0.4 },
      { freq: N.F4, dur: 0.8 }, { freq: N.D4, dur: 0.4 }, { freq: N.B3, dur: 0.4 },
      { freq: N.E4, dur: 1.5 },
    ],
  },
  {
    id: 'track_3',
    title: 'Clair de Lune (Suite Bergamasque)',
    artist: 'Claude Debussy',
    album: 'Skinny Ivory Nocturnes',
    duration: 295,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    notes: [
      { freq: N.F5, dur: 0.8 }, { freq: N.Eb5, dur: 0.6 }, { freq: N.Db5, dur: 1.0 },
      { freq: N.C5, dur: 0.6 }, { freq: N.Bb4, dur: 0.8 }, { freq: N.Ab4, dur: 1.2 },
      { freq: N.F4, dur: 0.6 }, { freq: N.Ab4, dur: 0.6 }, { freq: N.C5, dur: 1.0 },
      { freq: N.Eb5, dur: 1.5 },
    ],
  },
  {
    id: 'track_4',
    title: 'Air on the G String (Orchestral Suite No. 3)',
    artist: 'Johann Sebastian Bach',
    album: 'Baroque Chamber Sovereignty',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    notes: [
      { freq: N.B4, dur: 1.5 }, { freq: N.A4, dur: 0.5 }, { freq: N.G4, dur: 0.5 }, { freq: N.F4, dur: 0.5 },
      { freq: N.E4, dur: 1.0 }, { freq: N.D4, dur: 0.5 }, { freq: N.C4, dur: 0.5 },
      { freq: N.B3, dur: 1.5 }, { freq: N.D4, dur: 0.8 }, { freq: N.G4, dur: 1.8 },
    ],
  },
];

class MusicSynthesizerEngine {
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private timerId: number | null = null;
  private currentTrack: MusicalTrack | null = null;
  private noteIndex = 0;
  private isPlaying = false;
  private onTickCallback: ((timeElapsed: number) => void) | null = null;
  private timeElapsed = 0;

  playTrack(track: MusicalTrack, onTick?: (timeElapsed: number) => void) {
    this.stop();
    this.currentTrack = track;
    this.noteIndex = 0;
    this.timeElapsed = 0;
    this.isPlaying = true;
    this.onTickCallback = onTick || null;
    this.scheduleNextNote();
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.currentTrack) return;

    const track = this.currentTrack;
    const note = track.notes[this.noteIndex % track.notes.length];

    if (note.freq > 0) {
      try {
        const ctx = getAudioContext();
        // Warm Rhodes / Classical Bell tone
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(note.freq * 2, ctx.currentTime);

        const dur = note.dur * 0.9;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + dur);
        osc2.stop(ctx.currentTime + dur);

        this.activeOscillators.push(osc, osc2);
      } catch (e) {}
    }

    this.timeElapsed += note.dur;
    if (this.onTickCallback) {
      this.onTickCallback(Math.floor(this.timeElapsed));
    }

    this.noteIndex = (this.noteIndex + 1) % track.notes.length;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextNote();
    }, note.dur * 1000);
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  resume() {
    if (!this.isPlaying && this.currentTrack) {
      this.isPlaying = true;
      this.scheduleNextNote();
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
    this.activeGains = [];
    this.noteIndex = 0;
    this.timeElapsed = 0;
  }

  getPlayingStatus() {
    return this.isPlaying;
  }
}

export const musicEngine = new MusicSynthesizerEngine();
