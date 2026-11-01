/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Clock,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Zap,
  Radio,
  FileText,
  Cast,
  ArrowRight,
  HardDrive,
  RefreshCw,
  User,
  UserCheck,
  Sparkles,
  Lock,
  KeyRound,
} from 'lucide-react';
import { playClickSound, playPhoneSyncSound, playRoyalBellChime } from '../utils/audio';
import { triggerHaptic, hapticSuccess, hapticButtonClick, hapticMicro } from '../utils/haptics';
import { useDeviceBattery } from '../utils/useDeviceBattery';
import { deviceSyncStore } from '../utils/deviceSyncStore';

interface Props {
  isOpen: boolean;
  onComplete: (durationMinutes: number) => void;
  onClose?: () => void;
}

export default function PhoneInterfaceInitializerModal({
  isOpen,
  onComplete,
  onClose,
}: Props) {
  // Step 1: Login Process for Data Saving (Only two things: 1. Name, 2. Special Code 123456)
  const [userName, setUserName] = useState<string>(() => {
    const saved = localStorage.getItem('royal_device_user_name');
    if (saved) return saved;
    const profile = localStorage.getItem('royal_device_profile');
    if (profile) {
      try {
        return JSON.parse(profile).name || 'Prajakta Padave';
      } catch (e) {}
    }
    return 'Prajakta Padave';
  });
  const [specialCode, setSpecialCode] = useState<string>(() => {
    return localStorage.getItem('royal_data_saving_code') || '123456';
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => {
    const hasSignedIn = localStorage.getItem('royal_user_signed_in') === 'true';
    const code = localStorage.getItem('royal_data_saving_code');
    return hasSignedIn && code === '123456';
  });

  // Step 2: Duration selection (Mandatory, max to max 2 hours)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(45);

  // Step 3: Phone Access Permission (Mandatory)
  const [isPhoneAccessGranted, setIsPhoneAccessGranted] = useState<boolean>(true);

  // "Thinking with phone" phase
  const [isThinkingWithPhone, setIsThinkingWithPhone] = useState<boolean>(false);
  const [syncStepText, setSyncStepText] = useState<string>('Initializing link...');

  const battery = useDeviceBattery();

  if (!isOpen) return null;

  const durationPresets = [
    { label: '5 Min', value: 5 },
    { label: '15 Min', value: 15 },
    { label: '30 Min', value: 30 },
    { label: '45 Min', value: 45 },
    { label: '1 Hour', value: 60 },
    { label: '2 Hours (Max)', value: 120 },
  ];

  const handleSignIn = () => {
    const trimmedName = userName.trim();
    const trimmedCode = specialCode.trim();

    if (!trimmedName) {
      setAuthError('First requirement: Please fill in your name.');
      triggerHaptic(20);
      return;
    }

    if (trimmedCode !== '123456') {
      setAuthError('Second requirement failed: Special code must be 123456 to authorize data saving.');
      triggerHaptic([40, 40]);
      return;
    }

    setAuthError(null);
    hapticButtonClick();
    playRoyalBellChime();
    localStorage.setItem('royal_device_user_name', trimmedName);
    localStorage.setItem('royal_data_saving_code', '123456');
    localStorage.setItem('royal_user_signed_in', 'true');

    // Update real device profile in storage
    const currentProfile = localStorage.getItem('royal_device_profile');
    let profObj: any = {
      name: trimmedName,
      email: 'prajaktapadave624@gmail.com',
      phone: '+91 98765 43210',
      isSynced: true,
      authCode: '123456',
    };
    if (currentProfile) {
      try {
        profObj = { ...JSON.parse(currentProfile), name: trimmedName, authCode: '123456' };
      } catch (e) {}
    }
    localStorage.setItem('royal_device_profile', JSON.stringify(profObj));

    setIsSignedIn(true);
    triggerHaptic([30, 20, 30]);
  };

  const handleSelectDuration = (val: number) => {
    playClickSound(850, 0.02);
    hapticMicro();
    setSelectedDuration(val);
  };

  const handleToggleAccess = () => {
    playClickSound(900, 0.02);
    hapticMicro();
    const newVal = !isPhoneAccessGranted;
    setIsPhoneAccessGranted(newVal);
    if (newVal) {
      deviceSyncStore.setPhoneScanAllowed(true);
      deviceSyncStore.setFilePermissionGranted(true);
    }
  };

  const handleStart = () => {
    if (!isSignedIn || !selectedDuration || !isPhoneAccessGranted) return;

    playPhoneSyncSound();
    triggerHaptic([30, 20, 40]);
    setIsThinkingWithPhone(true);

    setSyncStepText(`Linking ${userName}'s phone: saving all imported audio, photos, & storage vaults...`);

    setTimeout(() => {
      setSyncStepText('Saving imported files (.crypt14) into encrypted hardware memory...');
      triggerHaptic(15);
    }, 700);

    setTimeout(() => {
      setSyncStepText('Syncing telephone carrier wire & real-time battery telemetry...');
      triggerHaptic(20);
    }, 1400);

    setTimeout(() => {
      playRoyalBellChime();
      hapticSuccess();
      setIsThinkingWithPhone(false);
      onComplete(selectedDuration);
    }, 2100);
  };

  const isReadyToStart = isSignedIn && selectedDuration !== null && isPhoneAccessGranted;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#111317] border-2 border-[#4a3f32] rounded-3xl p-4.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between max-h-[96%] overflow-y-auto space-y-3.5 text-[#eedecf]">
        
        {/* ================= THINKING WITH PHONE SYNC STATE ================= */}
        {isThinkingWithPhone ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative w-22 h-22 rounded-full border-4 border-emerald-500/40 flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-emerald-400/30 animate-ping pointer-events-none" />
            </div>

            <div className="space-y-1">
              <h3 className="font-editorial text-xl font-bold text-white">
                Thinking & Syncing with Phone...
              </h3>
              <p className="text-xs font-mono-tech text-emerald-300 min-h-[32px] px-2 leading-relaxed">
                {syncStepText}
              </p>
            </div>

            <div className="w-full bg-[#1b1f26] rounded-full h-2 overflow-hidden border border-[#2b3340]">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#c5a880] w-full animate-pulse" />
            </div>

            <span className="text-xs font-mono-tech text-[#8ca391]">
              Signed in: {userName} • Battery: {battery.level}%
            </span>
          </div>
        ) : (
          <>
            {/* Top Header with Enlarged Crown Symbol */}
            <div className="flex items-center justify-between border-b border-[#2b251e] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#241e17] border-2 border-[#c5a880] flex items-center justify-center text-[#c5a880] shadow-md">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="font-serif-royal font-bold text-sm text-white uppercase tracking-wider block">
                    Phone Interface Changer
                  </span>
                  <span className="text-[10px] font-mono-tech text-[#c5a880] font-bold">
                    INITIAL SETUP & SIGN IN
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: ROYALE LOGIN PROCESS FOR DATA SAVING (Only Two Things: 1. Name, 2. Special Code 123456) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#181a20] to-[#111317] border-2 border-[#4d3d2c] space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2d251d] pb-2">
                <div className="flex items-center gap-2 text-xs font-serif-royal font-bold text-white">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#c5a880]" />
                  <span>1. Royale Login for Data Saving</span>
                </div>
                <span
                  className={`text-[9px] font-mono-tech px-2 py-0.5 rounded font-bold uppercase transition-all ${
                    isSignedIn
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/60 animate-pulse'
                  }`}
                >
                  {isSignedIn ? 'Data Saving Active ✓' : '2 Things Required'}
                </span>
              </div>

              <div className="rounded-xl bg-[#0d0f14] border border-[#2a2218] p-2 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 text-[#c5a880] font-serif-royal font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Only two things needed to authorize persistent data saving:</span>
                </div>
                <div className="flex items-center justify-between text-[9.5px] font-mono-tech text-[#a6927d] pl-1">
                  <span>1. Put your name</span>
                  <span>•</span>
                  <span>2. Put special code <strong>123456</strong></span>
                </div>
              </div>

              {/* Input 1: User's Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-[#c5a880] font-bold block flex items-center justify-between">
                  <span>First: Put Your Name</span>
                  <span className="text-[8.5px] text-[#8c735d]">Identity Holder</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#c5a880] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setIsSignedIn(false);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter your name..."
                    className="w-full bg-[#0a0b0e] border border-[#3e3428] focus:border-[#c5a880] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors font-serif-royal font-bold"
                  />
                </div>
              </div>

              {/* Input 2: Special Code 123456 */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-[#c5a880] font-bold block flex items-center justify-between">
                  <span>Second: Put Special Code (123456)</span>
                  <span className="text-[8.5px] text-emerald-400 font-bold">Code: 123456</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#c5a880] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={specialCode}
                    onChange={(e) => {
                      setSpecialCode(e.target.value);
                      setIsSignedIn(false);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter 123456..."
                    maxLength={10}
                    className="w-full bg-[#0a0b0e] border border-[#3e3428] focus:border-[#c5a880] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono-tech font-bold tracking-widest"
                  />
                </div>
              </div>

              {/* Auth error feedback */}
              {authError && (
                <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[10px] font-serif-royal flex items-center gap-1.5 shadow-inner">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Action Button: Sign In & Authorize Data Saving */}
              <button
                type="button"
                onClick={handleSignIn}
                className={`w-full py-2.5 rounded-xl text-xs font-serif-royal font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSignedIn
                    ? 'bg-gradient-to-r from-[#122e1e] to-[#18422b] border-2 border-emerald-500 text-emerald-200'
                    : 'bg-gradient-to-r from-[#c5a880] via-[#d6bb93] to-[#ad8f65] text-black hover:brightness-110 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isSignedIn ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>DATA SAVING AUTHORIZED (123456)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-black" />
                    <span>SIGN IN & AUTHORIZE DATA SAVING</span>
                  </>
                )}
              </button>

              {isSignedIn && (
                <div className="p-2 rounded-xl bg-[#0c1c13] border border-emerald-500/40 text-[10px] font-mono-tech text-emerald-300 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Sovereign Identity Vault Verified</span>
                  </div>
                  <p className="text-[9px] text-[#8ca391] leading-relaxed">
                    Name: <strong className="text-white">{userName}</strong> • Passkey: <strong className="text-white">123456</strong>. All iPod songs, photos, notes & game scores will save automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: STUDY TIME DURATION SELECTOR (MANDATORY, MAX 2 HOURS) */}
            <div className="p-3.5 rounded-2xl bg-[#16181d] border border-[#362e24] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-serif-royal font-bold text-white">
                  <Clock className="w-4.5 h-4.5 text-[#c5a880]" />
                  <span>2. Study Time Duration (Max 2h)</span>
                </div>
                {selectedDuration ? (
                  <span className="text-[10px] font-mono-tech px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold">
                    {selectedDuration} Min Study Lock
                  </span>
                ) : (
                  <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-400 animate-pulse font-bold">
                    REQUIRED
                  </span>
                )}
              </div>

              <div className="p-2 rounded-xl bg-[#0f1115] border border-amber-500/30 text-[10px] text-[#eedecf] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span>📚</span>
                  <span>Study Focus Shield Active During Session:</span>
                </div>
                <p className="text-[10px] text-[#a6927d] leading-relaxed">
                  During this duration, distraction apps are blocked in background & foreground: <strong className="text-rose-400">YouTube, Instagram, Snapchat, Pinterest, & all games (Free Fire Max, Roblox, Free Fire India, Minecraft, CoC, COD)</strong>.
                </p>
                <p className="text-[9px] text-emerald-400 font-mono-tech">
                  🔔 When time completes, the bell will ring and the app will turn off in background.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {durationPresets.map((preset) => {
                  const isSelected = selectedDuration === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSelectDuration(preset.value)}
                      className={`py-2 px-1 rounded-xl text-xs font-mono-tech font-bold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#e6c99c] to-[#c5a880] text-black shadow-lg scale-[1.02] border-2 border-white'
                          : 'bg-[#1e2027] text-[#eedecf] hover:bg-[#282b33] border border-[#3b362c]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] font-mono-tech text-[#c5a880]">
                  <span>Custom Study Duration:</span>
                  <span className="font-bold text-white">{selectedDuration || 0} / 120 Min (Max 2h)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={selectedDuration || 15}
                  onChange={(e) => handleSelectDuration(Number(e.target.value))}
                  className="w-full accent-[#c5a880] cursor-pointer"
                />
              </div>
            </div>

            {/* Step 3: PHONE ACCESS PERMISSION (MANDATORY) */}
            <div className="p-3.5 rounded-2xl bg-[#16181d] border border-[#362e24] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-serif-royal font-bold text-white">
                  <Smartphone className="w-4.5 h-4.5 text-emerald-400" />
                  <span>3. Phone & Storage Access</span>
                </div>
                <span
                  className={`text-[9px] font-mono-tech px-2 py-0.5 rounded font-bold uppercase ${
                    isPhoneAccessGranted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/50 animate-pulse'
                  }`}
                >
                  {isPhoneAccessGranted ? 'Granted ✓' : 'Required'}
                </span>
              </div>

              <p className="text-[11px] text-[#a6927d] leading-relaxed">
                Connects real-time phone clock, battery percentage, and transfers all files and hidden folders into iPod and Gallery.
              </p>

              <button
                type="button"
                onClick={handleToggleAccess}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all ${
                  isPhoneAccessGranted
                    ? 'bg-[#15291d] border-emerald-500 text-emerald-300'
                    : 'bg-[#20222a] border-[#443a2e] text-[#eedecf] hover:border-[#c5a880]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-5 h-5 ${isPhoneAccessGranted ? 'text-emerald-400' : 'text-[#c5a880]'}`} />
                  <span className="font-serif-royal font-bold text-xs text-white">
                    {isPhoneAccessGranted ? 'Full Phone Access Granted' : 'Allow Phone Access'}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    isPhoneAccessGranted
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-neutral-500'
                  }`}
                >
                  {isPhoneAccessGranted && <CheckCircle className="w-4 h-4" />}
                </div>
              </button>
            </div>

            {/* Step 4: START BUTTON (Enabled only when Sign-In, Duration, and Phone Access are set) */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={!isReadyToStart}
                className={`w-full py-3.5 rounded-2xl font-serif-royal font-bold text-sm flex items-center justify-center gap-2 shadow-2xl transition-all ${
                  isReadyToStart
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-[#c5a880] hover:opacity-95 text-white cursor-pointer active:scale-[0.98] shadow-[0_8px_25px_rgba(16,185,129,0.4)]'
                    : 'bg-[#1a1c22] text-neutral-500 border border-[#2e313b] cursor-not-allowed opacity-60'
                }`}
              >
                <span>
                  {!isSignedIn
                    ? '1. Fill Name & Click Sign In Above'
                    : !selectedDuration
                    ? '2. Select Time Duration (Max 2h)'
                    : !isPhoneAccessGranted
                    ? '3. Grant Phone Access to Continue'
                    : 'START PHONE INTERFACE CHANGER'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#8c735d] px-1">
                <span>Real-Time Battery: {battery.level}%</span>
                <span>Max Immersion: 120 Minutes</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

