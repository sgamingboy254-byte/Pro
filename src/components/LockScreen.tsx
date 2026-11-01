import React, { useState, useEffect } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Crown, ChevronUp, Lock, Bell, Sparkles, Zap, Smartphone } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { AppSessionConfig } from '../types/os';

export default function LockScreen({
  onUnlock,
  activeSession,
  onOpenInitializer,
}: {
  onUnlock: () => void;
  activeSession?: AppSessionConfig | null;
  onOpenInitializer?: () => void;
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDragEnd = (_e: any, info: PanInfo) => {
    // If dragged upward by more than 60px or flicked with negative velocity
    if (info.offset.y < -60 || info.velocity.y < -300) {
      playClickSound(1000, 0.04);
      onUnlock();
    }
  };

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const dateStr = time.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Analog hands
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      drag="y"
      dragConstraints={{ top: -400, bottom: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 z-40 bg-gradient-to-b from-[#090a0c] via-[#101115] to-[#07080a] text-[#eedecf] flex flex-col justify-between p-6 select-none cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Background subtle watermark crest */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Crown className="w-96 h-96 text-[#c5a880]" />
      </div>

      {/* Top Royal Header */}
      <div className="flex flex-col items-center space-y-1.5 pt-4">
        <div className="flex items-center gap-2 text-[#c5a880]">
          <Crown className="w-4 h-4 fill-current" />
          <span className="font-serif-royal font-bold text-xs tracking-widest uppercase">
            Aethelgard Monarchy
          </span>
        </div>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />
      </div>

      {/* Centerpiece: THE BIG ROYAL CLOCK */}
      <div className="flex flex-col items-center justify-center space-y-5 my-auto">
        {/* Luxury Grand Horology Dial */}
        <div className="w-56 h-56 rounded-full bg-gradient-to-b from-[#18191d] to-[#0c0d0f] border-4 border-[#3d362e] shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_2px_10px_rgba(197,168,128,0.25)] relative flex items-center justify-center">
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full flex justify-center p-2"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div
                className={`w-0.5 rounded-full ${
                  i % 3 === 0 ? 'h-3 bg-[#c5a880]' : 'h-1.5 bg-[#5e5345]'
                }`}
              />
            </div>
          ))}

          {/* Roman Numerals */}
          <div className="absolute top-3 font-serif-royal text-xs font-bold text-[#c5a880]">XII</div>
          <div className="absolute right-3 font-serif-royal text-xs font-bold text-[#c5a880]">III</div>
          <div className="absolute bottom-3 font-serif-royal text-xs font-bold text-[#c5a880]">VI</div>
          <div className="absolute left-3 font-serif-royal text-xs font-bold text-[#c5a880]">IX</div>

          {/* Crest inside clock */}
          <div className="text-center z-10 -translate-y-7">
            <span className="font-serif-royal text-[8px] tracking-widest text-[#c5a880] block font-bold">
              PERPETUAL
            </span>
            <span className="font-mono-tech text-[6px] text-[#8c735d]">
              MMXXVI
            </span>
          </div>

          {/* Clock Hands */}
          <div
            className="absolute w-1.5 h-14 bg-[#faf7f2] rounded-full origin-bottom -translate-y-7 shadow-md"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />
          <div
            className="absolute w-1 h-20 bg-[#c5a880] rounded-full origin-bottom -translate-y-10 shadow-md"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          <div
            className="absolute w-0.5 h-22 bg-red-400 origin-bottom -translate-y-11 shadow-sm"
            style={{ transform: `rotate(${secondDeg}deg)` }}
          />

          {/* Center cap */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#c5a880] border-2 border-black z-20" />
        </div>

        {/* Big Majestic Digital Display */}
        <div className="text-center space-y-1">
          <h1 className="font-editorial text-5xl font-bold tracking-widest text-white leading-none">
            {formattedHours}:{formattedMinutes}
            <span className="text-xl font-mono-tech text-[#c5a880] ml-1">
              :{formattedSeconds}
            </span>
          </h1>
          <p className="font-serif-royal text-xs text-[#c5a880] tracking-wider uppercase pt-1">
            {dateStr}
          </p>
        </div>

        {/* Royal Court Dispatch or Setup Gate Preview */}
        {!activeSession ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(900, 0.03);
              if (onOpenInitializer) onOpenInitializer();
              else onUnlock();
            }}
            className="w-full max-w-xs px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1f1912] via-[#161920] to-[#0e1713] border-2 border-[#c5a880]/60 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-between cursor-pointer hover:border-[#c5a880] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#262017] border border-[#c5a880] flex items-center justify-center text-[#c5a880] flex-shrink-0 shadow">
                <Zap className="w-4 h-4 fill-current text-[#c5a880]" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif-royal font-bold text-[10px] text-white">
                    Phone Interface Changer
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-400 font-mono-tech text-[7px] font-bold">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[10px] text-[#eedecf] truncate font-sans">
                  Set duration (max 2h) & grant phone access
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono-tech text-[#c5a880] font-bold">
              SETUP →
            </span>
          </div>
        ) : (
          <div className="w-full max-w-xs px-3.5 py-2.5 rounded-2xl bg-[#141518]/90 border border-[#2e2922] backdrop-blur-md shadow-lg flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#201d18] border border-[#c5a880] flex items-center justify-center text-[#c5a880] flex-shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-serif-royal font-bold text-[10px] text-[#faf7f2]">
                  Immersion Active
                </span>
                <span className="text-[9px] font-mono-tech text-emerald-400">
                  {activeSession.durationMinutes}m Session
                </span>
              </div>
              <p className="text-[11px] text-[#eedecf] truncate font-sans">
                Retro Phone OS synced with live hardware.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom SWIPE UP TO UNLOCK Button & Hint */}
      <div
        onClick={() => {
          playClickSound(1000, 0.04);
          onUnlock();
        }}
        className="flex flex-col items-center space-y-2 pb-2 cursor-pointer group"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="text-[#c5a880] group-hover:text-white"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.div>

        <div className="px-5 py-2 rounded-full bg-[#16171b] border border-[#3b352b] group-hover:border-[#c5a880] group-hover:bg-[#202228] transition-all shadow-md flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#c5a880]" />
          <span className="font-serif-royal font-bold text-[11px] tracking-widest text-[#eedecf] uppercase">
            {activeSession ? 'SWIPE UP TO UNLOCK' : 'SWIPE UP TO CONFIGURE & START'}
          </span>
        </div>

        <span className="text-[9px] font-mono-tech text-[#8c735d]">
          {activeSession ? 'Swipe upward or tap to access applications' : 'Requires duration selection & phone access authorization'}
        </span>
      </div>
    </motion.div>
  );
}
