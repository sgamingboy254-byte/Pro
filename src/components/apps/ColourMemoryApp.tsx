/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Play,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Crown,
  HelpCircle,
  Gem,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { playClickSound, playRoyalBellChime, playTone } from '../../utils/audio';
import { triggerHaptic, hapticButtonClick, hapticMicro, hapticSuccess } from '../../utils/haptics';

interface Props {
  onBack: () => void;
}

interface JewelColor {
  id: string;
  name: string;
  title: string;
  bgNormal: string;
  bgActive: string;
  borderNormal: string;
  borderActive: string;
  glow: string;
  freq: number;
  hex: string;
}

const JEWELS: JewelColor[] = [
  {
    id: 'ruby',
    name: 'Ruby',
    title: 'Imperial Ruby',
    bgNormal: 'bg-[#400e12]',
    bgActive: 'bg-rose-500',
    borderNormal: 'border-[#7a1b24]',
    borderActive: 'border-rose-300',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.9)]',
    freq: 523.25, // C5
    hex: '#f43f5e',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    title: 'Royal Emerald',
    bgNormal: 'bg-[#0d3419]',
    bgActive: 'bg-emerald-500',
    borderNormal: 'border-[#1b6b33]',
    borderActive: 'border-emerald-300',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.9)]',
    freq: 659.25, // E5
    hex: '#10b981',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    title: 'Sovereign Sapphire',
    bgNormal: 'bg-[#0e2246]',
    bgActive: 'bg-sky-500',
    borderNormal: 'border-[#1b4388]',
    borderActive: 'border-sky-300',
    glow: 'shadow-[0_0_25px_rgba(56,189,248,0.9)]',
    freq: 783.99, // G5
    hex: '#38bdf8',
  },
  {
    id: 'topaz',
    name: 'Topaz',
    title: 'Antique Topaz',
    bgNormal: 'bg-[#3d2a0c]',
    bgActive: 'bg-amber-400',
    borderNormal: 'border-[#7d5619]',
    borderActive: 'border-amber-200',
    glow: 'shadow-[0_0_25px_rgba(251,191,36,0.95)]',
    freq: 880.0, // A5
    hex: '#fbbf24',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    title: 'Royal Amethyst',
    bgNormal: 'bg-[#2b1040]',
    bgActive: 'bg-purple-500',
    borderNormal: 'border-[#582185]',
    borderActive: 'border-purple-300',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.9)]',
    freq: 1046.5, // C6
    hex: '#c084fc',
  },
];

type GamePhase = 'IDLE' | 'SHOWING' | 'USER_TURN' | 'SUCCESS' | 'GAME_OVER';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'diamond' | 'circle' | 'spark' | 'star';
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  drag: number;
  decay: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function ColourMemoryApp({ onBack }: Props) {
  // Sequence Length setting: 3, 4, 5 colours or Progressive
  const [sequenceLengthChoice, setSequenceLengthChoice] = useState<number>(3); // 3, 4, 5
  const [isProgressive, setIsProgressive] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [lastIlluminatedStep, setLastIlluminatedStep] = useState<number | null>(null);
  const [activeJewelId, setActiveJewelId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastBonus, setLastBonus] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('royal_colour_memory_best') || '0', 10);
  });
  const [statusMessage, setStatusMessage] = useState<string>(
    'Select 3 to 5 colours & tap START'
  );

  const userName = localStorage.getItem('royal_device_user_name') || 'Prajakta Padave';
  const isDataSavingActive =
    localStorage.getItem('royal_user_signed_in') === 'true' &&
    localStorage.getItem('royal_data_saving_code') === '123456';

  // Particle Explosion Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const [isShowingExplosionBanner, setIsShowingExplosionBanner] = useState(false);

  const playJewelTone = (jewel: JewelColor) => {
    playTone(jewel.freq, 0.28, 'sine');
  };

  // Play imperial celebratory fanfare sweep
  const playRoyalVictoryFanfare = () => {
    playTone(523.25, 0.2, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.2, 'sine'), 100); // E5
    setTimeout(() => playTone(783.99, 0.25, 'sine'), 220); // G5
    setTimeout(() => {
      playTone(1046.5, 0.45, 'triangle'); // C6
      playRoyalBellChime();
    }, 360);
  };

  // TRIGGER PARTICLE EFFECT EXPLOSION
  const triggerParticleExplosion = (centerX?: number, centerY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = centerX ?? width / 2;
    const originY = centerY ?? height / 2;

    const colors = [
      '#f43f5e', // Ruby
      '#10b981', // Emerald
      '#38bdf8', // Sapphire
      '#fbbf24', // Topaz
      '#c084fc', // Amethyst
      '#fef08a', // Radiant Gold
      '#ffffff', // Diamond White
    ];

    const shapes: ('diamond' | 'circle' | 'spark' | 'star')[] = ['diamond', 'circle', 'spark', 'star'];

    // Spawn 130 explosive jewel particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 9.5;
      newParticles.push({
        x: originX + (Math.random() - 0.5) * 16,
        y: originY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2.5, // initial upward lift
        size: 3 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.28,
        gravity: 0.14 + Math.random() * 0.06,
        drag: 0.985,
        decay: 0.012 + Math.random() * 0.014,
      });
    }

    particlesRef.current = newParticles;

    // Add dual expanding shockwave rings
    shockwavesRef.current = [
      { x: originX, y: originY, radius: 10, maxRadius: Math.max(width, height) * 0.6, alpha: 0.8 },
      { x: originX, y: originY, radius: 5, maxRadius: Math.max(width, height) * 0.45, alpha: 0.6 },
    ];

    setIsShowingExplosionBanner(true);
    setTimeout(() => setIsShowingExplosionBanner(false), 2200);

    // Run animation loop
    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Render & update shockwaves
      shockwavesRef.current.forEach((sw) => {
        if (sw.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(250, 204, 21, ${sw.alpha})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();

          sw.radius += 5.5;
          sw.alpha -= 0.024;
        }
      });

      // Render & update particles
      let activeCount = 0;
      particlesRef.current.forEach((p) => {
        if (p.alpha > 0) {
          activeCount++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.rotation += p.rotationSpeed;
          p.alpha -= p.decay;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;

          if (p.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'star') {
            // Draw 4-point sparkle star
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.2);
            ctx.lineTo(p.size * 0.3, -p.size * 0.3);
            ctx.lineTo(p.size * 1.2, 0);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
            ctx.lineTo(0, p.size * 1.2);
            ctx.lineTo(-p.size * 0.3, p.size * 0.3);
            ctx.lineTo(-p.size * 1.2, 0);
            ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
            ctx.closePath();
            ctx.fill();
          } else {
            // Spark line
            ctx.fillRect(-p.size * 0.3, -p.size, p.size * 0.6, p.size * 2);
          }

          ctx.restore();
        }
      });

      if (activeCount > 0 || shockwavesRef.current.some((s) => s.alpha > 0)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Sync canvas size on mount / resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Generate a new random sequence of specified length
  const generateNewSequence = (len: number) => {
    const seq: string[] = [];
    for (let i = 0; i < len; i++) {
      const randIdx = Math.floor(Math.random() * JEWELS.length);
      seq.push(JEWELS[randIdx].id);
    }
    return seq;
  };

  // Playback the sequence to the user
  const playSequence = (seqToPlay: string[]) => {
    setGamePhase('SHOWING');
    setUserStep(0);
    setLastIlluminatedStep(null);
    setStatusMessage(`Observing Royal Sequence (${seqToPlay.length} Colours)...`);

    seqToPlay.forEach((jewelId, index) => {
      const delay = (index + 1) * 750;
      setTimeout(() => {
        const found = JEWELS.find((j) => j.id === jewelId);
        if (found) {
          setActiveJewelId(jewelId);
          playJewelTone(found);
          triggerHaptic(25);

          setTimeout(() => {
            setActiveJewelId(null);
          }, 450);
        }

        // When sequence playback finishes
        if (index === seqToPlay.length - 1) {
          setTimeout(() => {
            setGamePhase('USER_TURN');
            setStatusMessage(`Your Turn: Tap the exact ${seqToPlay.length} colours in sequence!`);
            triggerHaptic([30, 20]);
          }, 550);
        }
      }, delay);
    });
  };

  // Start new round
  const handleStartRound = () => {
    hapticButtonClick();
    playClickSound(850, 0.02);

    const length = isProgressive ? 3 + streak : sequenceLengthChoice;
    const newSeq = generateNewSequence(length);
    setSequence(newSeq);
    playSequence(newSeq);
  };

  // Replay existing sequence
  const handleReplaySequence = () => {
    if (sequence.length === 0 || gamePhase === 'SHOWING') return;
    hapticMicro();
    playClickSound(900, 0.02);
    playSequence(sequence);
  };

  // User taps a jewel
  const handleJewelClick = (jewel: JewelColor, event?: React.MouseEvent) => {
    if (gamePhase !== 'USER_TURN') return;

    // Highlight tapped jewel
    setActiveJewelId(jewel.id);
    playJewelTone(jewel);
    triggerHaptic(20);
    setTimeout(() => setActiveJewelId(null), 250);

    const expectedId = sequence[userStep];

    if (jewel.id === expectedId) {
      // Correct jewel tapped! Smoothly illuminate this jewel in the progress bar!
      const currentIdx = userStep;
      const nextStep = userStep + 1;
      setLastIlluminatedStep(currentIdx);
      setUserStep(nextStep);

      // Check if finished sequence
      if (nextStep === sequence.length) {
        // ENTIRE SEQUENCE COMPLETED SUCCESSFULLY!
        setGamePhase('SUCCESS');
        playRoyalVictoryFanfare();
        triggerHaptic([60, 40, 60, 40, 120]);

        // Trigger the celebratory particle explosion!
        const canvas = canvasRef.current;
        let originX = canvas ? canvas.width / 2 : undefined;
        let originY = canvas ? canvas.height / 2 : undefined;

        if (event && canvas) {
          const rect = canvas.getBoundingClientRect();
          originX = event.clientX - rect.left;
          originY = event.clientY - rect.top;
        }

        triggerParticleExplosion(originX, originY);

        const earned = sequence.length * 30 + streak * 15;
        const newScore = score + earned;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        setLastBonus(earned);

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('royal_colour_memory_best', newScore.toString());
        }

        setStatusMessage(`👑 ROYAL VICTORY! Entire Sequence Verified! (+${earned} pts)`);

        setTimeout(() => {
          // If progressive, automatically queue next with +1 length
          if (isProgressive) {
            const nextSeq = generateNewSequence(3 + newStreak);
            setSequence(nextSeq);
            playSequence(nextSeq);
          }
        }, 2100);
      } else {
        setStatusMessage(`Correct! Step ${nextStep} of ${sequence.length}...`);
      }
    } else {
      // Wrong jewel tapped!
      if (isZenMode) {
        // ZEN MODE: Practice without time pressure or game-over states!
        playTone(440, 0.22, 'sine');
        triggerHaptic(25);
        const expected = JEWELS.find((j) => j.id === expectedId)?.name || 'Different Jewel';
        setStatusMessage(`🌸 Zen Practice: That was ${jewel.name}. Tap ${expected} to continue! (No penalty)`);
        return;
      }

      setGamePhase('GAME_OVER');
      playTone(180, 0.35, 'sawtooth');
      triggerHaptic([80, 50, 100]);
      setStreak(0);
      const expected = JEWELS.find((j) => j.id === expectedId)?.name || 'Different Jewel';
      setStatusMessage(`Sequence broken! Expected ${expected}. Tap TRY AGAIN.`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0c10] text-[#eedecf] select-none overflow-hidden font-sans relative">
      {/* Particle Explosion Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-40 w-full h-full"
      />

      {/* Celebratory Victory Floating Banner */}
      {isShowingExplosionBanner && (
        <div className="absolute top-16 left-4 right-4 z-50 pointer-events-none flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-300">
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-amber-500 text-black font-serif-royal font-bold text-center shadow-[0_0_30px_rgba(255,215,0,0.85)] border-2 border-white scale-105 transform animate-bounce">
            <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-black fill-current animate-spin" />
              <span>Royal Sequence Complete!</span>
              <Sparkles className="w-4 h-4 text-black fill-current animate-spin" />
            </div>
            <div className="text-[10px] font-mono-tech mt-0.5 font-black text-rose-950">
              +{lastBonus} ROYAL JEWEL POINTS • STREAK: {streak}
            </div>
          </div>
        </div>
      )}

      {/* Top Antique Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121419] border-b-2 border-[#362e24] shadow-md shrink-0 z-30">
        <button
          onClick={() => {
            hapticButtonClick();
            playClickSound(800, 0.02);
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-[#c5a880] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif-royal font-bold text-[11px] tracking-wider uppercase">Menu</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Gem className="w-4 h-4 text-[#c5a880]" />
          <span className="font-serif-royal font-bold text-xs tracking-wider text-white uppercase">
            Colour Memory
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zen Mode Toggle Button */}
          <button
            onClick={() => {
              hapticButtonClick();
              playClickSound(850, 0.02);
              const nextMode = !isZenMode;
              setIsZenMode(nextMode);
              if (nextMode) {
                if (gamePhase === 'GAME_OVER') {
                  setGamePhase('USER_TURN');
                }
                setStatusMessage('🧘 Zen Mode: Practice freely without time pressure or game over!');
              } else {
                setStatusMessage('👑 Arcade Challenge: Memorize & match sequence without errors!');
              }
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-mono-tech font-bold flex items-center gap-1 transition-all border ${
              isZenMode
                ? 'bg-[#0f2c1d] border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#181a20] border-[#3d3326] text-[#c5a880] hover:border-[#c5a880]'
            }`}
            title="Toggle Zen Practice Mode (No Game Over)"
          >
            <span>{isZenMode ? '🧘 Zen Mode' : '👑 Arcade'}</span>
          </button>

          <button
            onClick={handleReplaySequence}
            disabled={sequence.length === 0 || gamePhase === 'SHOWING'}
            className="p-1 rounded-lg bg-[#1a1c23] border border-[#483d30] text-[#c5a880] hover:bg-[#262832] disabled:opacity-40 disabled:cursor-not-allowed"
            title="Replay Sequence"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-between p-3 overflow-y-auto min-h-0 space-y-2 z-10">
        {/* Zen Mode Banner or Score & Streak Header */}
        {isZenMode ? (
          <div className="w-full max-w-[340px] flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0c2417] via-[#102b1c] to-[#0c2417] border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <div>
                <span className="text-[9px] font-mono-tech text-emerald-300 uppercase tracking-widest font-bold block">
                  Zen Practice Mode
                </span>
                <span className="text-[11px] font-serif-royal font-bold text-white">
                  Zero Stress • No Game Over
                </span>
              </div>
            </div>

            <button
              onClick={handleReplaySequence}
              disabled={sequence.length === 0 || gamePhase === 'SHOWING'}
              className="px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/60 text-[10px] font-mono-tech font-bold flex items-center gap-1 shadow disabled:opacity-40"
              title="Hear sequence again"
            >
              <Eye className="w-3 h-3 text-emerald-300" />
              <span>Listen Again</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-[340px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#14161c] border border-[#2d251d] shadow-sm">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#c5a880]" />
              <div>
                <span className="text-[8px] font-mono-tech text-[#8c735d] uppercase block">High Score</span>
                <span className="text-xs font-mono-tech font-bold text-white">{highScore}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[8px] font-mono-tech text-[#8c735d] uppercase block">Current Score</span>
              <span className="text-sm font-mono-tech font-bold text-[#c5a880]">{score}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div>
                <span className="text-[8px] font-mono-tech text-[#8c735d] uppercase block text-right">Streak</span>
                <span className="text-xs font-mono-tech font-bold text-emerald-400 block text-right">
                  {streak}x
                </span>
              </div>
              <Flame className="w-4 h-4 text-amber-500 fill-current" />
            </div>
          </div>
        )}

        {/* Royale Data Saving & Vault Status Pill */}
        <div className="w-full max-w-[340px] px-3 py-1 rounded-xl bg-gradient-to-r from-[#12141a] via-[#181a24] to-[#12141a] border border-[#382e22] flex items-center justify-between text-[9px] font-mono-tech shadow-sm">
          <div className="flex items-center gap-1.5 text-[#a6927d]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Data Vault: <strong className="text-white">{userName}</strong>
            </span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[8.5px]">
            <span>Code 123456 Saved</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        </div>

        {/* Sequence Length Selection Bar: 3, 4, 5 Colours or Endless */}
        <div className="w-full max-w-[340px] flex items-center justify-between px-2.5 py-1 rounded-xl bg-[#13151b] border border-[#2a231b]">
          <span className="text-[10px] font-serif-royal text-[#a6927d] uppercase font-bold">
            Sequence Length:
          </span>
          <div className="flex items-center gap-1">
            {[3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  hapticMicro();
                  playClickSound(850, 0.02);
                  setSequenceLengthChoice(num);
                  setIsProgressive(false);
                }}
                disabled={gamePhase === 'SHOWING'}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech font-bold transition-all ${
                  sequenceLengthChoice === num && !isProgressive
                    ? 'bg-gradient-to-r from-[#c5a880] to-[#ad8f65] text-black shadow-md'
                    : 'bg-[#1a1c22] text-[#eedecf] border border-[#3b3226] hover:bg-[#252833]'
                }`}
              >
                {num} Colors
              </button>
            ))}
            <button
              onClick={() => {
                hapticMicro();
                playClickSound(850, 0.02);
                setIsProgressive(true);
              }}
              disabled={gamePhase === 'SHOWING'}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono-tech font-bold transition-all ${
                isProgressive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md'
                  : 'bg-[#1a1c22] text-[#eedecf] border border-[#3b3226] hover:bg-[#252833]'
              }`}
            >
              Endless
            </button>
          </div>
        </div>

        {/* Animated Royale Jewel Progress Bar & Guidance Card */}
        <div className="w-full max-w-[340px] p-3 rounded-2xl bg-gradient-to-b from-[#181a22] to-[#0f1116] border-2 border-[#4a3d2e] text-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Subtle antique gold filigree background highlight */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#c5a880]/10 blur-xl pointer-events-none rounded-full" />

          {/* Status Message */}
          <div className="text-xs font-serif-royal font-bold text-white tracking-wide relative z-10 flex items-center justify-center gap-1.5">
            {gamePhase === 'SUCCESS' && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />}
            <span>{statusMessage}</span>
          </div>

          {/* Royale Jewel Segmented Progress Bar */}
          {sequence.length > 0 && (
            <div className="mt-2.5 space-y-1.5 relative z-10">
              {/* Jewel Step Counter Banner */}
              <div className="flex items-center justify-between text-[9px] font-mono-tech px-1">
                <span className="text-[#a6927d] uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#c5a880]" />
                  <span>
                    {gamePhase === 'SHOWING'
                      ? 'Memorize Sequence'
                      : gamePhase === 'SUCCESS'
                      ? 'Sequence Mastered!'
                      : `Jewel Step ${Math.min(userStep + 1, sequence.length)} of ${sequence.length}`}
                  </span>
                </span>
                <span className="font-bold text-[#c5a880] tracking-widest">
                  {userStep}/{sequence.length} RESONATING
                </span>
              </div>

              {/* Individual Faceted Jewel Progress Sockets with Smooth Glow Animation */}
              <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-[#0b0c10] border border-[#382e22] shadow-inner">
                {sequence.map((jewelId, idx) => {
                  const targetJewel = JEWELS.find((j) => j.id === jewelId);
                  const isFilled = idx < userStep;
                  const isCurrentTarget = idx === userStep && gamePhase === 'USER_TURN';
                  const isShowingActive = gamePhase === 'SHOWING' && activeJewelId === jewelId;
                  const isRecentlyTapped = lastIlluminatedStep === idx;

                  // Dynamic Jewel Glow and Background Colors
                  const jewelHex = targetJewel?.hex || '#c5a880';

                  return (
                    <div
                      key={idx}
                      className="relative flex-1 group"
                      title={`${targetJewel?.name || 'Jewel'} (Step ${idx + 1})`}
                    >
                      <div
                        className={`h-7 rounded-lg flex items-center justify-center transition-all duration-500 ease-out border relative overflow-hidden ${
                          isFilled
                            ? 'border-white/80 scale-100'
                            : isCurrentTarget
                            ? 'border-amber-400/90 animate-pulse bg-amber-500/20'
                            : isShowingActive
                            ? 'border-white scale-105'
                            : 'border-[#2d2419] bg-[#12141a]'
                        }`}
                        style={{
                          backgroundColor: isFilled
                            ? jewelHex
                            : isShowingActive
                            ? jewelHex
                            : undefined,
                          boxShadow: isFilled
                            ? `0 0 16px ${jewelHex}, 0 0 28px ${jewelHex}80, inset 0 1px 3px rgba(255,255,255,0.85)`
                            : isShowingActive
                            ? `0 0 20px ${jewelHex}, 0 0 35px ${jewelHex}90`
                            : isCurrentTarget
                            ? '0 0 12px rgba(251,191,36,0.7), inset 0 0 6px rgba(251,191,36,0.3)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.8)',
                          transform: isRecentlyTapped ? 'scale(1.08)' : undefined,
                        }}
                      >
                        {/* Shimmer light bar across illuminated gem */}
                        {isFilled && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        )}

                        {/* Center Facet Symbol */}
                        {isFilled ? (
                          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] animate-pulse">
                            ✦
                          </span>
                        ) : isCurrentTarget ? (
                          <span className="text-[10px] font-mono-tech font-bold text-amber-300 animate-bounce">
                            ▼
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono-tech font-bold text-[#4a3f33]">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Jewel name label under facet */}
                      <span
                        className={`text-[7px] font-mono-tech block text-center mt-0.5 uppercase tracking-tighter truncate ${
                          isFilled ? 'text-white font-bold' : 'text-[#6a5a48]'
                        }`}
                      >
                        {targetJewel?.name.slice(0, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Continuous Golden Laser Progress Line */}
              <div className="w-full h-1 bg-[#101217] rounded-full overflow-hidden border border-[#2b2217] relative">
                <div
                  className="h-full bg-gradient-to-r from-[#8c735d] via-[#c5a880] to-[#ffd89b] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(197,168,128,0.9)]"
                  style={{
                    width: `${sequence.length > 0 ? (userStep / sequence.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Antique Jeweled Pentagram Layout */}
        <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center p-2">
          {/* Central Royal Medallion with Start Action */}
          <div className="z-10 flex flex-col items-center justify-center">
            {gamePhase === 'IDLE' || gamePhase === 'GAME_OVER' || gamePhase === 'SUCCESS' ? (
              <button
                onClick={handleStartRound}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c5a880] via-[#917551] to-[#403423] border-2 border-white/60 text-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(197,168,128,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-serif-royal font-bold text-[11px]"
              >
                <Play className="w-5 h-5 fill-current mb-0.5" />
                <span>{gamePhase === 'IDLE' ? 'START' : 'NEXT'}</span>
              </button>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#12141a] border-2 border-[#382f23] text-[#c5a880] flex flex-col items-center justify-center shadow-inner">
                <Crown className="w-5 h-5 animate-pulse" />
                <span className="text-[9px] font-mono-tech mt-0.5 uppercase tracking-wider text-[#a6927d]">
                  {gamePhase === 'SHOWING' ? 'WATCH' : 'REPEAT'}
                </span>
              </div>
            )}
          </div>

          {/* 5 Antique Jewels Positions */}
          {/* 1. Ruby - Top */}
          <button
            onClick={(e) => handleJewelClick(JEWELS[0], e)}
            disabled={gamePhase === 'SHOWING'}
            className={`absolute top-1 w-16 h-16 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center ${
              activeJewelId === JEWELS[0].id
                ? `${JEWELS[0].bgActive} ${JEWELS[0].borderActive} ${JEWELS[0].glow} scale-110 z-20`
                : `${JEWELS[0].bgNormal} ${JEWELS[0].borderNormal} hover:brightness-125 z-0`
            }`}
            title={JEWELS[0].title}
          >
            <div className="w-6 h-6 rounded-md bg-rose-900/60 border border-rose-400/40 rotate-45 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-rose-300 rounded-sm" />
            </div>
            <span className="text-[8px] font-serif-royal font-bold uppercase mt-1 text-rose-200">Ruby</span>
          </button>

          {/* 2. Emerald - Top Right */}
          <button
            onClick={(e) => handleJewelClick(JEWELS[1], e)}
            disabled={gamePhase === 'SHOWING'}
            className={`absolute right-1 top-14 w-16 h-16 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center ${
              activeJewelId === JEWELS[1].id
                ? `${JEWELS[1].bgActive} ${JEWELS[1].borderActive} ${JEWELS[1].glow} scale-110 z-20`
                : `${JEWELS[1].bgNormal} ${JEWELS[1].borderNormal} hover:brightness-125 z-0`
            }`}
            title={JEWELS[1].title}
          >
            <div className="w-6 h-6 rounded-md bg-emerald-900/60 border border-emerald-400/40 rotate-45 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-emerald-300 rounded-sm" />
            </div>
            <span className="text-[8px] font-serif-royal font-bold uppercase mt-1 text-emerald-200">Emerald</span>
          </button>

          {/* 3. Sapphire - Bottom Right */}
          <button
            onClick={(e) => handleJewelClick(JEWELS[2], e)}
            disabled={gamePhase === 'SHOWING'}
            className={`absolute right-6 bottom-1 w-16 h-16 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center ${
              activeJewelId === JEWELS[2].id
                ? `${JEWELS[2].bgActive} ${JEWELS[2].borderActive} ${JEWELS[2].glow} scale-110 z-20`
                : `${JEWELS[2].bgNormal} ${JEWELS[2].borderNormal} hover:brightness-125 z-0`
            }`}
            title={JEWELS[2].title}
          >
            <div className="w-6 h-6 rounded-md bg-sky-900/60 border border-sky-400/40 rotate-45 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-sky-300 rounded-sm" />
            </div>
            <span className="text-[8px] font-serif-royal font-bold uppercase mt-1 text-sky-200">Sapphire</span>
          </button>

          {/* 4. Topaz - Bottom Left */}
          <button
            onClick={(e) => handleJewelClick(JEWELS[3], e)}
            disabled={gamePhase === 'SHOWING'}
            className={`absolute left-6 bottom-1 w-16 h-16 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center ${
              activeJewelId === JEWELS[3].id
                ? `${JEWELS[3].bgActive} ${JEWELS[3].borderActive} ${JEWELS[3].glow} scale-110 z-20`
                : `${JEWELS[3].bgNormal} ${JEWELS[3].borderNormal} hover:brightness-125 z-0`
            }`}
            title={JEWELS[3].title}
          >
            <div className="w-6 h-6 rounded-md bg-amber-900/60 border border-amber-400/40 rotate-45 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-amber-200 rounded-sm" />
            </div>
            <span className="text-[8px] font-serif-royal font-bold uppercase mt-1 text-amber-200">Topaz</span>
          </button>

          {/* 5. Amethyst - Top Left */}
          <button
            onClick={(e) => handleJewelClick(JEWELS[4], e)}
            disabled={gamePhase === 'SHOWING'}
            className={`absolute left-1 top-14 w-16 h-16 rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center ${
              activeJewelId === JEWELS[4].id
                ? `${JEWELS[4].bgActive} ${JEWELS[4].borderActive} ${JEWELS[4].glow} scale-110 z-20`
                : `${JEWELS[4].bgNormal} ${JEWELS[4].borderNormal} hover:brightness-125 z-0`
            }`}
            title={JEWELS[4].title}
          >
            <div className="w-6 h-6 rounded-md bg-purple-900/60 border border-purple-400/40 rotate-45 flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-2.5 bg-purple-300 rounded-sm" />
            </div>
            <span className="text-[8px] font-serif-royal font-bold uppercase mt-1 text-purple-200">Amethyst</span>
          </button>
        </div>

        {/* Quick Instructions Footer */}
        <div className="w-full max-w-[340px] px-3 py-1.5 rounded-xl bg-[#101217] border border-[#262017] flex items-center justify-between text-[10px] text-[#8c735d]">
          <span>Tap Start → Memorize singing jewel sequence → Repeat pattern</span>
        </div>
      </div>
    </div>
  );
}
