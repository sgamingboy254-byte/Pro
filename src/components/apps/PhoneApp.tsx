/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Phone,
  PhoneOff,
  Delete,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Clock,
  Battery,
  Crown,
  BookOpen,
  Sparkles,
  Search,
  X,
  Radio,
  MessageCircle,
  Tv,
  ExternalLink,
} from 'lucide-react';
import {
  playClickSound,
  playRotaryRatchetSound,
  playFingerStopSound,
  playVintageTelephoneRing,
  playDialTone,
  playClockTikTikSound,
  playSlideSound,
  playDtmfTone,
  playMicroTick,
  playGlassTap,
  playRotaryGearStep,
  playSpringRecoil,
  playGoldenShimmer,
} from '../../utils/audio';
import {
  hapticRotaryTick,
  hapticFingerStop,
  hapticButtonClick,
  hapticTelephoneRing,
  hapticTikTik,
  hapticSlide,
  triggerHaptic,
  hapticForDigit,
  hapticMicro,
  hapticGlassTap,
  hapticDetent,
  hapticSpringRecoil,
  hapticDialGlowShock,
} from '../../utils/haptics';
import { useDeviceBattery } from '../../utils/useDeviceBattery';
import { deviceSyncStore } from '../../utils/deviceSyncStore';

interface RotaryHole {
  digit: string;
  angle: number; // in degrees clockwise from 12 o'clock
}

// 10 finger holes arranged in standard vintage telephone geometry
const ROTARY_HOLES: RotaryHole[] = [
  { digit: '1', angle: 45 },
  { digit: '2', angle: 72 },
  { digit: '3', angle: 99 },
  { digit: '4', angle: 126 },
  { digit: '5', angle: 153 },
  { digit: '6', angle: 180 },
  { digit: '7', angle: 207 },
  { digit: '8', angle: 234 },
  { digit: '9', angle: 261 },
  { digit: '0', angle: 288 },
];

const FINGER_STOP_ANGLE = 320; // Brass finger stop stop-bracket

export interface PhoneAppProps {
  onBack: () => void;
  onOpenYouTube?: (query?: string) => void;
  onOpenWhatsApp?: () => void;
}

export default function PhoneApp({ onBack, onOpenYouTube, onOpenWhatsApp }: PhoneAppProps) {
  const [dialedNumber, setDialedNumber] = useState('');
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isRotatingBack, setIsRotatingBack] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  // Visual feedback: Subtle shake, golden halo glow, and shockwave pulse when number is dialed
  const [dialFeedback, setDialFeedback] = useState<{
    digit: string;
    key: number;
  } | null>(null);
  const [dialMode, setDialMode] = useState<'rotary' | 'keypad'>('rotary');

  // Real-time battery & time telemetry
  const battery = useDeviceBattery();
  const [timeStr, setTimeStr] = useState('');

  const wheelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPointerAngleRef = useRef(0);
  const currentRotationRef = useRef(0);
  const lastTickDegRef = useRef(0);

  // Trigger dynamic shake, golden glow shockwave, DTMF tone, and tactile vibration
  const triggerDialFeedback = (digit: string) => {
    setDialFeedback({ digit, key: Date.now() });
    playDtmfTone(digit);
    playGoldenShimmer();
    hapticDialGlowShock();

    setTimeout(() => {
      setDialFeedback((prev) => (prev && Date.now() - prev.key >= 420 ? null : prev));
    }, 450);
  };

  // Direct keypad number entry with full tactile and DTMF audio feedback
  const handleKeypadPress = (digit: string) => {
    hapticMicro();
    playMicroTick(true);
    triggerDialFeedback(digit);
    setDialedNumber((prev) => (prev.length < 15 ? prev + digit : prev));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call timer interval
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Handle dial tone when opening
  useEffect(() => {
    playDialTone(0.35);
    triggerHaptic(20);
  }, []);

  // High-precision butter-smooth automatic rotation with mechanical tick-tik sound & haptics
  const dialDigitWithAnimation = (digit: string, holeAngle: number) => {
    if (isRotatingBack || callState !== 'idle') return;

    let targetRotation = FINGER_STOP_ANGLE - holeAngle;
    if (targetRotation < 0) targetRotation += 360;

    setIsRotatingBack(false);
    hapticMicro();
    playMicroTick(false);
    playClockTikTikSound(false);

    const startTime = performance.now();
    const duration = 260 + (targetRotation / 360) * 200;
    let lastTickAngle = 0;
    let stepCount = 0;

    const animateForward = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic-out easing
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRot = targetRotation * ease;

      setWheelRotation(currentRot);

      if (Math.abs(currentRot - lastTickAngle) > 18) {
        stepCount++;
        playRotaryGearStep(stepCount);
        playClockTikTikSound(currentRot % 36 > 18);
        hapticRotaryTick();
        hapticMicro();
        lastTickAngle = currentRot;
      }

      if (progress < 1) {
        requestAnimationFrame(animateForward);
      } else {
        // Hit brass finger stop with mechanical clack, distinctive digit haptic pulse, and golden glow
        playFingerStopSound();
        hapticFingerStop();
        hapticForDigit(digit);
        triggerDialFeedback(digit);
        setDialedNumber((prev) => (prev.length < 15 ? prev + digit : prev));

        // Spring recoil return with physical unwinding rattle
        setTimeout(() => {
          setIsRotatingBack(true);
          playSpringRecoil();
          hapticSpringRecoil();

          const returnStart = performance.now();
          const returnDur = 320 + (targetRotation / 360) * 160;

          const animateReturn = (rNow: number) => {
            const rElapsed = rNow - returnStart;
            const rProgress = Math.min(1, rElapsed / returnDur);
            // Elastic harmonic return
            const rEase = Math.cos((rProgress * Math.PI) / 2);
            const rRot = targetRotation * rEase;

            setWheelRotation(rRot);

            if (Math.abs(rRot - lastTickAngle) > 20) {
              playRotaryRatchetSound(20);
              hapticTikTik();
              lastTickAngle = rRot;
            }

            if (rProgress < 1) {
              requestAnimationFrame(animateReturn);
            } else {
              setWheelRotation(0);
              setIsRotatingBack(false);
              hapticMicro();
            }
          };
          requestAnimationFrame(animateReturn);
        }, 50);
      }
    };

    requestAnimationFrame(animateForward);
  };

  const handleStartCall = (targetNum?: string) => {
    const numToCall = targetNum || dialedNumber;
    if (!numToCall) return;

    playClickSound(950, 0.03);
    triggerHaptic([30, 20, 30]);
    setCallState('calling');
    setCallDuration(0);

    playVintageTelephoneRing();
    hapticTelephoneRing();
    const ringInterval = setInterval(() => {
      playVintageTelephoneRing();
      hapticTelephoneRing();
    }, 2400);

    setTimeout(() => {
      clearInterval(ringInterval);
      setCallState('connected');
      triggerHaptic([40, 20, 40]);
    }, 2800);
  };

  const handleEndCall = () => {
    playFingerStopSound();
    triggerHaptic(30);
    setCallState('idle');
    setCallDuration(0);
  };

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getContactName = (num: string) => {
    const devContacts = deviceSyncStore.getContacts();
    const cleanNum = num.replace(/\D/g, '');
    const matched = devContacts.find((c) => {
      const cClean = c.phone.replace(/\D/g, '');
      return cleanNum.endsWith(cClean) || cClean.endsWith(cleanNum);
    });
    if (matched) return matched.name;
    if (num === '101') return 'Palace Sovereign Chamber';
    if (num === '112') return 'Emergency Services';
    return 'Real Telephone Wire';
  };

  const contactsList = deviceSyncStore.getContacts().filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone.includes(contactSearch)
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#050608] text-[#eedecf] select-none overflow-hidden relative font-sans">
      
      {/* ================= TOP NOTIFICATION / STATUS GAP ================= */}
      {/* Full screen coverage leaving only the time & all symbols notification gap */}
      <div className="w-full bg-[#0a0c0f] border-b border-[#2b241c] px-3.5 py-2 flex items-center justify-between text-xs font-mono-tech z-30 shadow-md">
        <button
          onClick={() => {
            playClickSound(750, 0.02);
            triggerHaptic(15);
            onBack();
          }}
          className="flex items-center gap-1 text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal text-xs">Home</span>
        </button>

        {/* Real-time Clock with mechanical tick indicator */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#c5a880] animate-pulse" />
          <span className="font-bold text-white tracking-widest">{timeStr || '10:00:00'}</span>
        </div>

        {/* Real-time Exact Battery */}
        <div className="flex items-center gap-1.5 text-[#c5a880]">
          <span className="font-bold">{battery.level}%</span>
          <div className="w-4 h-2.5 rounded-xs border border-[#c5a880] p-0.5 flex items-center bg-black/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#c5a880] rounded-xs transition-all duration-300"
              style={{ width: `${battery.level}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= ACTIVE CALL OVERLAY ================= */}
      {callState !== 'idle' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="flex-1 flex flex-col justify-between items-center p-6 bg-gradient-to-b from-[#14161b] via-[#0b0c0f] to-[#040507] z-20"
        >
          <div className="text-center space-y-3 pt-4">
            <span className="text-[10px] font-serif-royal tracking-widest text-[#c5a880] uppercase">
              {callState === 'calling' ? 'CONNECTING IMPERIAL WIRE...' : 'SECURE LINE CONNECTED'}
            </span>

            {/* Vintage Handset Earpiece Emblem */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-b from-[#252830] to-[#101216] border-4 border-[#c5a880] mx-auto flex items-center justify-center shadow-[0_12px_35px_rgba(0,0,0,0.85)] relative">
              <Phone className={`w-12 h-12 ${callState === 'calling' ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <div className="absolute inset-2 rounded-full border border-[#c5a880]/30 pointer-events-none" />
            </div>

            <h2 className="font-editorial text-2xl font-bold text-white">
              {getContactName(dialedNumber)}
            </h2>
            <p className="font-mono-tech text-base text-[#c5a880] tracking-widest">
              {dialedNumber}
            </p>

            <div className="text-xs font-mono-tech text-[#a6927d] pt-1">
              {callState === 'calling' ? 'Ringing Sovereign Switchboard...' : formatCallTime(callDuration)}
            </div>
          </div>

          {/* Call Controls */}
          <div className="w-full max-w-xs space-y-6 pb-6">
            <div className="flex items-center justify-around">
              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  triggerHaptic(15);
                  setIsCallMuted(!isCallMuted);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  isCallMuted
                    ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                    : 'bg-[#181a1f] border-[#38332b] text-[#eedecf] hover:bg-[#252830]'
                }`}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  triggerHaptic(15);
                  setIsSpeakerOn(!isSpeakerOn);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  isSpeakerOn
                    ? 'bg-[#c5a880]/20 border-[#c5a880] text-[#c5a880]'
                    : 'bg-[#181a1f] border-[#38332b] text-[#eedecf] hover:bg-[#252830]'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Hangup Button */}
            <div className="flex justify-center">
              <button
                onClick={handleEndCall}
                className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(225,29,72,0.6)] active:scale-95 transition-transform"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ================= VINTAGE TELEPHONE MAIN DIALER ================= */
        <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden relative">
          
          {/* Dialed Number Display (Sharp, Inlaid Royal Gold Plate with Glow & Telemetry) */}
          <div className="w-full bg-gradient-to-b from-[#16181d] to-[#0c0e11] rounded-2xl border-2 border-[#4a3f32] p-3 shadow-xl relative flex flex-col justify-between min-h-[96px]">
            <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#a6927d]">
              <span className="flex items-center gap-1.5 text-[#c5a880] font-bold">
                <Crown className="w-3.5 h-3.5 fill-current" />
                SOVEREIGN TELEPHONE APPARATUS
              </span>

              <div className="flex items-center gap-2">
                {/* Dial Mode Selector: Imperial Rotary vs Royal Brass Keypad */}
                <div className="flex rounded-full bg-[#181b22] border border-[#3b3429] p-0.5">
                  <button
                    onPointerDown={() => {
                      hapticMicro();
                      playMicroTick();
                    }}
                    onClick={() => {
                      playClickSound(820, 0.02);
                      hapticMicro();
                      setDialMode('rotary');
                    }}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-serif-royal transition-all ${
                      dialMode === 'rotary'
                        ? 'bg-gradient-to-r from-[#c5a880] to-[#aa885a] text-black font-bold shadow'
                        : 'text-[#a6927d] hover:text-white'
                    }`}
                  >
                    Rotary
                  </button>
                  <button
                    onPointerDown={() => {
                      hapticMicro();
                      playMicroTick();
                    }}
                    onClick={() => {
                      playClickSound(820, 0.02);
                      hapticMicro();
                      setDialMode('keypad');
                    }}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-serif-royal transition-all ${
                      dialMode === 'keypad'
                        ? 'bg-gradient-to-r from-[#c5a880] to-[#aa885a] text-black font-bold shadow'
                        : 'text-[#a6927d] hover:text-white'
                    }`}
                  >
                    Keypad
                  </button>
                </div>

                <button
                  onPointerDown={() => {
                    hapticMicro();
                    playMicroTick();
                  }}
                  onClick={() => {
                    playSlideSound();
                    hapticSlide();
                    setShowContacts(!showContacts);
                  }}
                  className="px-2 py-0.5 rounded-full bg-[#24211b] hover:bg-[#38332a] border border-[#c5a880]/40 text-[#eedecf] hover:text-[#c5a880] flex items-center gap-1 font-serif-royal transition-colors shadow"
                >
                  <BookOpen className="w-3 h-3 text-[#c5a880]" />
                  <span>Directory</span>
                </button>
              </div>
            </div>

            {/* Main Dialed Digits - Razor Sharp Contrast with Glow Reflection */}
            <div className="flex items-center justify-between mt-1.5">
              <div className="font-mono-tech text-3xl font-bold tracking-widest text-amber-100 min-h-[36px] truncate flex-1 flex items-center gap-2">
                {dialedNumber ? (
                  <span className="drop-shadow-[0_0_12px_rgba(245,197,94,0.6)]">
                    {dialedNumber}
                  </span>
                ) : (
                  <span className="text-[#6d5d4c] text-sm font-editorial italic tracking-normal">
                    {dialMode === 'rotary'
                      ? 'Rotate brass wheel to dial digits...'
                      : 'Press brass keys with DTMF matrix...'}
                  </span>
                )}
                {dialFeedback && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse font-mono-tech font-bold">
                    +{dialFeedback.digit}
                  </span>
                )}
              </div>

              {dialedNumber && (
                <button
                  onPointerDown={() => {
                    hapticMicro();
                    playMicroTick();
                  }}
                  onClick={() => {
                    playClickSound(700, 0.02);
                    triggerHaptic(15);
                    setDialedNumber((prev) => prev.slice(0, -1));
                  }}
                  className="p-1.5 rounded-lg bg-[#27231c] hover:bg-[#3d362a] text-[#c5a880] transition-colors shadow"
                  title="Backspace"
                >
                  <Delete className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Directory Sliding Drawer */}
          <AnimatePresence>
            {showContacts && (
              <motion.div
                initial={{ opacity: 0, y: -15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -15, height: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-[#121418] border-2 border-[#4a3f32] rounded-2xl p-2.5 max-h-48 overflow-hidden flex flex-col space-y-2 shadow-2xl z-20"
              >
                <div className="flex items-center justify-between border-b border-[#29241e] pb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono-tech font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real Phone Directory & Family Contacts</span>
                  </div>
                  <button
                    onPointerDown={() => {
                      hapticMicro();
                      playMicroTick();
                    }}
                    onClick={() => {
                      playSlideSound();
                      hapticSlide();
                      setShowContacts(false);
                    }}
                    className="p-1 rounded-full text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    value={contactSearch}
                    onPointerDown={() => {
                      hapticMicro();
                      playMicroTick();
                    }}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search Mom, Dad, Friends..."
                    className="w-full bg-[#1b1e24] border border-[#353027] rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="overflow-y-auto space-y-1 divide-y divide-[#1e2128] pr-1">
                  {contactsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded-xl bg-[#12141a] hover:bg-[#181b24] border border-[#262420] hover:border-[#483e33] flex flex-col gap-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onPointerDown={() => {
                            hapticMicro();
                            playMicroTick();
                          }}
                          onClick={() => {
                            playClickSound(850, 0.02);
                            playClockTikTikSound(true);
                            triggerHaptic(20);
                            setDialedNumber(c.phone);
                            setShowContacts(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#c5a880]"
                          />
                          <div>
                            <span className="text-[#faf7f2] font-serif-royal font-bold text-xs block leading-tight">
                              {c.name}
                            </span>
                            <span className="text-[9px] font-mono-tech text-[#8ca391]">
                              {c.relationship} • {c.phone}
                            </span>
                          </div>
                        </div>

                        {/* Direct Rotary Call Button */}
                        <button
                          onPointerDown={() => {
                            hapticMicro();
                            playMicroTick();
                          }}
                          onClick={() => {
                            playClickSound(850, 0.02);
                            playClockTikTikSound(true);
                            triggerHaptic(20);
                            setDialedNumber(c.phone);
                            setShowContacts(false);
                          }}
                          className="px-2 py-1 rounded-lg bg-[#1a2e22] hover:bg-[#23402e] border border-[#2f553d] text-emerald-400 text-[10px] font-mono-tech flex items-center gap-1 shadow-sm"
                          title="Dial on wire telephone"
                        >
                          <Phone className="w-3 h-3 fill-current" />
                          <span>Dial</span>
                        </button>
                      </div>

                      {/* Action Bar: Imperial Wire Dial + YouTube in Chrome */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#1e212b]">
                        <button
                          onPointerDown={() => {
                            hapticMicro();
                            playMicroTick();
                          }}
                          onClick={() => {
                            playClickSound(850, 0.02);
                            playClockTikTikSound(true);
                            triggerHaptic(20);
                            setDialedNumber(c.phone);
                            setShowContacts(false);
                            handleStartCall(c.phone);
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-[#0e2418] hover:bg-[#143623] border border-[#1d4d30] text-emerald-300 font-mono-tech text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                          title="Connect call over Imperial Wire"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Imperial Wire Call</span>
                        </button>

                        <button
                          onPointerDown={() => {
                            hapticMicro();
                            playMicroTick();
                          }}
                          onClick={() => {
                            playClickSound(850, 0.02);
                            triggerHaptic(20);
                            setShowContacts(false);
                            if (onOpenYouTube) {
                              onOpenYouTube(c.name);
                            } else {
                              window.open(
                                `https://www.youtube.com/results?search_query=${encodeURIComponent(c.name)}+music+concert+documentary&sp=EgIYAw%253D%253D`,
                                '_blank'
                              );
                            }
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-[#241716] hover:bg-[#38201f] border border-[#522927] text-red-300 font-mono-tech text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                          title="Open YouTube in Google Chrome (Long-form only)"
                        >
                          <Tv className="w-3 h-3 text-red-400" />
                          <span>Chrome YouTube</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= DYNAMIC DIALER APPARATUS AREA (SHAKE & GLOW FEEDBACK) ================= */}
          <div className="w-full flex-1 flex flex-col items-center justify-center py-1 relative my-auto">
            
            {/* Animated Golden Shockwave Pulse that expands outward on dialed digit */}
            <AnimatePresence>
              {dialFeedback && (
                <motion.div
                  key={`shockwave_${dialFeedback.key}`}
                  initial={{ scale: 0.65, opacity: 0.95 }}
                  animate={{ scale: 1.45, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.52, ease: 'easeOut' }}
                  className="absolute w-[280px] h-[280px] rounded-full border-2 border-amber-300 pointer-events-none z-30 shadow-[0_0_50px_rgba(245,197,94,0.8)]"
                />
              )}
            </AnimatePresence>

            {/* Recoil Mechanical Shake & Glowing Halo Wrapper */}
            <motion.div
              animate={
                dialFeedback
                  ? {
                      x: [0, -4, 4, -3, 3, -1.5, 0],
                      y: [0, 2.5, -2, 1.5, -1, 0],
                      scale: [1, 1.018, 0.995, 1],
                    }
                  : { x: 0, y: 0, scale: 1 }
              }
              transition={{ duration: 0.36, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              {/* Radial Golden Halo Aura Glow when number is dialed */}
              <div
                className={`absolute -inset-5 rounded-full pointer-events-none transition-all duration-300 ${
                  dialFeedback
                    ? 'opacity-100 shadow-[0_0_75px_rgba(245,197,94,0.75),0_0_120px_rgba(197,168,128,0.5),inset_0_0_35px_rgba(255,230,160,0.5)] border-2 border-amber-400/80 scale-102'
                    : 'opacity-0 scale-95'
                }`}
              />

              {dialMode === 'rotary' ? (
                /* ================= CRYSTAL-CLEAR AESTHETIC ROTARY DIAL WHEEL ================= */
                <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-b from-[#242730] via-[#121418] to-[#090b0e] border-4 border-[#524434] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_2px_12px_rgba(197,168,128,0.3)] relative flex items-center justify-center">
                  
                  {/* Outer Decorative Minute Marks */}
                  <div className="absolute inset-1 rounded-full border border-[#c5a880]/30 pointer-events-none" />

                  {/* Stationary Crisp Number Dial (Razor-Sharp numbers with high contrast ivory background) */}
                  <div className="absolute inset-5 rounded-full bg-[#0d0f13] border-2 border-[#383126] flex items-center justify-center">
                    {ROTARY_HOLES.map((hole) => {
                      const rad = (hole.angle - 90) * (Math.PI / 180);
                      const radius = 98; // distance from center
                      const x = radius * Math.cos(rad);
                      const y = radius * Math.sin(rad);

                      return (
                        <div
                          key={`bg_num_${hole.digit}`}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          className="absolute w-10 h-10 rounded-full bg-gradient-to-b from-[#faf6ee] to-[#ede4d3] border-2 border-[#3a3024] flex items-center justify-center shadow-md"
                        >
                          <span className="font-editorial text-lg font-black text-[#141210]">
                            {hole.digit}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ROTATING TRANSPARENT ACRYLIC / GLASS WHEEL (NO BLUR, RAZOR-SHARP) */}
                  <div
                    ref={wheelRef}
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: isRotatingBack ? 'none' : 'transform 0.04s ease-out',
                    }}
                    className="absolute inset-5 rounded-full border-2 border-[#c5a880]/50 bg-transparent flex items-center justify-center cursor-pointer select-none"
                  >
                    {/* Finger Holes: High-definition chrome/gold ring rims */}
                    {ROTARY_HOLES.map((hole) => {
                      const rad = (hole.angle - 90) * (Math.PI / 180);
                      const radius = 98;
                      const x = radius * Math.cos(rad);
                      const y = radius * Math.sin(rad);

                      return (
                        <div
                          key={`hole_${hole.digit}`}
                          style={{
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          onPointerDown={() => {
                            hapticMicro();
                            playMicroTick(false);
                          }}
                          onClick={() => dialDigitWithAnimation(hole.digit, hole.angle)}
                          className="absolute w-11 h-11 rounded-full border-[3px] border-[#c5a880] bg-transparent hover:bg-[#c5a880]/25 active:bg-[#c5a880]/40 flex items-center justify-center shadow-[0_0_8px_rgba(197,168,128,0.4),inset_0_1px_4px_rgba(255,255,255,0.4)] transition-all group"
                          title={`Dial ${hole.digit}`}
                        >
                          <div className="w-8 h-8 rounded-full border border-white/50 pointer-events-none" />
                        </div>
                      );
                    })}

                    {/* Center Brass Medallion with Sovereign Emblem & Dynamic Dialed Flash */}
                    <div
                      className={`w-22 h-22 rounded-full border-[3px] shadow-[0_6px_20px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-center z-10 pointer-events-none transition-all duration-300 ${
                        dialFeedback
                          ? 'bg-gradient-to-b from-[#876a3b] via-[#4d3a1f] to-[#241a0d] border-amber-300 shadow-[0_0_35px_rgba(245,197,94,0.95)] scale-105'
                          : 'bg-gradient-to-b from-[#473b2b] via-[#2c2419] to-[#14110b] border-[#c5a880]'
                      }`}
                    >
                      {dialFeedback ? (
                        <div className="flex flex-col items-center">
                          <span className="font-editorial text-3xl font-black text-amber-200 drop-shadow-[0_0_12px_rgba(255,225,120,0.95)] animate-pulse">
                            {dialFeedback.digit}
                          </span>
                          <span className="font-mono-tech text-[7px] text-amber-300 font-bold tracking-widest uppercase">
                            DIALED
                          </span>
                        </div>
                      ) : (
                        <>
                          <Crown className="w-6 h-6 text-[#c5a880] fill-current" />
                          <span className="font-serif-royal text-[8px] text-[#faf6ee] tracking-widest font-bold uppercase mt-0.5">
                            Aethelgard
                          </span>
                          <span className="font-mono-tech text-[6px] text-[#c5a880]">
                            EST. 1898
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fixed Brass Finger Stop Hook at Bottom Right (FINGER_STOP_ANGLE = 320°) */}
                  <div
                    style={{
                      transform: `rotate(${FINGER_STOP_ANGLE - 90}deg) translate(99px)`,
                    }}
                    className="absolute w-4 h-12 bg-gradient-to-r from-[#edd3b4] via-[#c5a880] to-[#8c6d43] rounded-sm border-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.95)] z-20 pointer-events-none flex items-start justify-center pt-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#352817] border border-white/40" />
                  </div>
                </div>
              ) : (
                /* ================= ROYAL BRASS PUSH-BUTTON KEYPAD MATRIX ================= */
                <div className="w-[280px] p-4 rounded-3xl bg-gradient-to-b from-[#242730] via-[#121418] to-[#090b0e] border-4 border-[#524434] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_2px_12px_rgba(197,168,128,0.3)]">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: '1', letters: '—', roman: 'I' },
                      { key: '2', letters: 'ABC', roman: 'II' },
                      { key: '3', letters: 'DEF', roman: 'III' },
                      { key: '4', letters: 'GHI', roman: 'IV' },
                      { key: '5', letters: 'JKL', roman: 'V' },
                      { key: '6', letters: 'MNO', roman: 'VI' },
                      { key: '7', letters: 'PQRS', roman: 'VII' },
                      { key: '8', letters: 'TUV', roman: 'VIII' },
                      { key: '9', letters: 'WXYZ', roman: 'IX' },
                      { key: '*', letters: 'PRI', roman: '✱' },
                      { key: '0', letters: '+', roman: 'O' },
                      { key: '#', letters: 'SEC', roman: '⌗' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onPointerDown={() => {
                          hapticMicro();
                          playMicroTick(true);
                        }}
                        onClick={() => handleKeypadPress(item.key)}
                        className="h-14 rounded-2xl bg-gradient-to-b from-[#3a3328] via-[#241f17] to-[#120f0b] border-2 border-[#66543e] hover:border-amber-300 active:scale-92 active:bg-amber-900/40 shadow-[0_4px_10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center transition-all group cursor-pointer"
                      >
                        <div className="flex items-baseline gap-1">
                          <span className="font-editorial text-xl font-bold text-amber-100 group-hover:text-amber-300 leading-tight">
                            {item.key}
                          </span>
                          <span className="text-[8px] font-serif-royal text-[#a6927d]">
                            {item.roman}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono-tech text-[#c5a880] tracking-widest uppercase">
                          {item.letters}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-center gap-3 py-1.5">
            {dialedNumber && (
              <button
                onPointerDown={() => {
                  hapticMicro();
                  playMicroTick();
                }}
                onClick={() => {
                  playClickSound(750, 0.02);
                  hapticMicro();
                  setDialedNumber('');
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#1a1c22] border border-[#42392c] text-[10px] font-serif-royal text-[#a6927d] hover:text-white transition-colors"
              >
                CLEAR
              </button>
            )}

            {/* Big Green Vintage Handset Call Button */}
            <button
              onPointerDown={() => {
                if (dialedNumber) {
                  hapticMicro();
                  playMicroTick();
                }
              }}
              onClick={() => handleStartCall()}
              disabled={!dialedNumber}
              className={`w-15 h-15 rounded-full flex items-center justify-center shadow-[0_8px_28px_rgba(16,185,129,0.5)] active:scale-95 transition-transform ${
                dialedNumber
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-black cursor-pointer'
                  : 'bg-[#1e2027] text-neutral-600 border border-[#31333d] cursor-not-allowed opacity-50'
              }`}
              title="Place Call on Imperial Rotary Wire"
            >
              <Phone className="w-6 h-6 fill-current" />
            </button>

            {/* Direct Mobile Carrier Dial */}
            {dialedNumber && (
              <a
                href={`tel:${dialedNumber}`}
                onPointerDown={() => {
                  hapticMicro();
                  playMicroTick();
                }}
                onClick={() => {
                  playClickSound(900, 0.02);
                  triggerHaptic(20);
                }}
                className="px-3 py-1.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-400/50 text-white text-[10px] font-mono-tech font-bold flex items-center gap-1 transition-colors shadow"
                title="Dial through real device SIM"
              >
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>Real SIM</span>
              </a>
            )}
          </div>

          <div className="text-center text-[9px] text-[#a6927d] font-mono-tech pb-1">
            {dialMode === 'rotary'
              ? 'Tap or drag any number to rotate the wheel to the brass finger stop'
              : 'Punch brass push-keys with authentic Dual-Tone Multi-Frequency (DTMF)'}
          </div>
        </div>
      )}
    </div>
  );
}
