import React, { useState } from 'react';
import {
  Clock,
  Play,
  X,
  ShieldCheck,
  Sparkles,
  Crown,
  ChevronRight,
  Battery,
  Wifi,
} from 'lucide-react';
import { AppId, AppSessionConfig } from '../types/os';
import { APP_EXPLANATION_PERSONS } from '../utils/explanationPersons';
import { playClickSound } from '../utils/audio';
import { useDeviceBattery } from '../utils/useDeviceBattery';

export default function AppLaunchGateModal({
  appId,
  appName,
  isOpen,
  onClose,
  onStartSession,
}: {
  appId: AppId | null;
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (session: AppSessionConfig) => void;
}) {
  // Duration in minutes: defaults to 45m, max is strictly 120m (2 hours)
  const [durationMinutes, setDurationMinutes] = useState(45);
  const battery = useDeviceBattery();

  if (!isOpen || !appId) return null;

  const person = APP_EXPLANATION_PERSONS[appId];

  const presets = [
    { label: '5 Min (Quick)', value: 5 },
    { label: '15 Min', value: 15 },
    { label: '30 Min', value: 30 },
    { label: '1 Hour', value: 60 },
    { label: '1.5 Hrs', value: 90 },
    { label: '2 Hours (Max)', value: 120 },
  ];

  const calculateExpiryTime = (mins: number) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + mins * 60 * 1000);
    return expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStart = () => {
    playClickSound(1050, 0.04);
    const now = Date.now();
    const session: AppSessionConfig = {
      appId,
      durationMinutes,
      startedAt: now,
      expiresAt: now + durationMinutes * 60 * 1000,
    };
    onStartSession(session);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#121317] border-2 border-[#4a3f32] rounded-3xl p-4 shadow-2xl flex flex-col justify-between max-h-[95%] overflow-y-auto space-y-3.5 text-[#eedecf]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#2b251e] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#221c15] border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-serif-royal font-bold text-xs text-[#faf7f2] tracking-wider uppercase block">
                {appName}
              </span>
              <span className="text-[9px] font-mono-tech text-[#c5a880]">
                IMMERSION PROTOCOL
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e2025] hover:bg-[#2b2e35] text-[#eedecf] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. THE EXPLANATION PERSON (Guide Emissary) */}
        {person && (
          <div className="p-3 rounded-2xl bg-[#17181d] border border-[#332b21] space-y-2.5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full border-2 border-[#c5a880] overflow-hidden flex-shrink-0 shadow-md">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-full h-full object-cover filter contrast-105"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono-tech text-[#c5a880] uppercase tracking-wider block">
                  App Explanation Curator
                </span>
                <h4 className="font-editorial text-base font-bold text-[#faf7f2] leading-tight truncate">
                  {person.name}
                </h4>
                <p className="text-[10px] text-[#8c735d] truncate font-medium">
                  {person.title}
                </p>
              </div>
            </div>

            {/* Persona Bio & Real Device Connectivity Explanation */}
            <p className="text-[11px] text-[#c9b7a4] font-sans leading-relaxed border-t border-[#26211a] pt-2">
              {person.roleExplanation}
            </p>

            {/* Real Hardware & Account Telemetry Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {person.syncedServices.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#241e17] border border-[#42372b] text-[9px] font-mono-tech text-[#c5a880] flex items-center gap-1"
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{srv}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: TIME DURATION SELECTION (Max to Max 2 Hours / 120 Minutes) */}
        <div className="p-3 rounded-2xl bg-[#17181d] border border-[#332b21] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#c5a880] font-serif-royal font-bold">
              <span className="w-4 h-4 rounded-full bg-[#c5a880] text-black text-[9px] flex items-center justify-center font-mono-tech">1</span>
              <span>Step 1: Set Immersion Duration</span>
            </div>
            <span className="text-[10px] font-mono-tech text-amber-400 font-bold">
              Max 2 Hours
            </span>
          </div>

          <p className="text-[10px] text-[#9c8976] leading-snug">
            Choose how long your phone interface temporarily transforms into the application (from 5 minutes up to 2 hours maximum).
          </p>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  playClickSound(800, 0.02);
                  setDurationMinutes(p.value);
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono-tech transition-all border ${
                  durationMinutes === p.value
                    ? 'bg-[#c5a880] text-black font-bold border-[#eedecf] shadow-sm'
                    : 'bg-[#202228] text-[#eedecf] border-[#363028] hover:bg-[#2c3038]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Precision Slider up to 120 Minutes */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-mono-tech">
              <span className="text-[#8c735d]">Focus Window:</span>
              <span className="text-[#faf7f2] font-bold">
                {durationMinutes} Minutes ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={durationMinutes}
              onChange={(e) => {
                playClickSound(850, 0.015);
                setDurationMinutes(parseInt(e.target.value, 10));
              }}
              className="w-full accent-[#c5a880] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono-tech text-[#736353]">
              <span>5 min</span>
              <span>Active until ~{calculateExpiryTime(durationMinutes)}</span>
              <span>120 min (2h max)</span>
            </div>
          </div>
        </div>

        {/* Real Device Sync Status Bar Preview */}
        <div className="px-3 py-1.5 rounded-xl bg-[#0c0d10] border border-[#26211a] flex items-center justify-between text-[10px] font-mono-tech text-[#8c735d]">
          <span className="flex items-center gap-1 text-[#c5a880]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            REAL TIME PHONE SYNC ACTIVE
          </span>
          <div className="flex items-center gap-2">
            <span>Battery: {battery.level}%</span>
            <span>Carrier: Royal Tel</span>
          </div>
        </div>

        {/* STEP 2: START BUTTON */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#c5a880] via-[#eedecf] to-[#c5a880] text-black font-serif-royal font-bold text-xs tracking-wider uppercase shadow-[0_4px_16px_rgba(197,168,128,0.4)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>STEP 2: START IMMERSION (TRANSFORM PHONE)</span>
        </button>
      </div>
    </div>
  );
}
