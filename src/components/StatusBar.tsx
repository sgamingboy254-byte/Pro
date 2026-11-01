import React, { useState, useEffect } from 'react';
import { Crown, Wifi, Battery, BatteryCharging, Volume2, VolumeX, Clock } from 'lucide-react';
import { useDeviceBattery } from '../utils/useDeviceBattery';
import { AppSessionConfig } from '../types/os';

export default function StatusBar({
  isMuted,
  onToggleMute,
  activeSession,
  onSessionExpire,
}: {
  isMuted: boolean;
  onToggleMute: () => void;
  activeSession?: AppSessionConfig | null;
  onSessionExpire?: () => void;
}) {
  const [timeStr, setTimeStr] = useState('');
  const [sessionRemainingStr, setSessionRemainingStr] = useState('');
  const battery = useDeviceBattery();

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

      if (activeSession) {
        const diffMs = activeSession.expiresAt - now.getTime();
        if (diffMs <= 0) {
          setSessionRemainingStr('00:00:00');
          if (onSessionExpire) onSessionExpire();
        } else {
          const totalSecs = Math.floor(diffMs / 1000);
          const hrs = Math.floor(totalSecs / 3600);
          const mins = Math.floor((totalSecs % 3600) / 60);
          const secs = totalSecs % 60;
          setSessionRemainingStr(
            `${hrs > 0 ? `${hrs}h ` : ''}${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`
          );
        }
      } else {
        setSessionRemainingStr('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSession, onSessionExpire]);

  return (
    <div className="h-8.5 w-full bg-[#0a0b0d] border-b border-[#24201b] px-4 flex items-center justify-between text-xs font-mono-tech text-[#eedecf] select-none z-30 shrink-0">
      {/* Exact Real Time */}
      <div className="font-bold tracking-wider text-white flex items-center gap-1.5">
        <span className="text-white font-mono-tech text-xs font-bold tracking-widest">{timeStr || '10:00:00'}</span>
      </div>

      {/* Royal Carrier OR Active Immersion Session Countdown */}
      {activeSession && sessionRemainingStr ? (
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#201c15] border border-[#c5a880]/70 text-[#c5a880] text-[10px] font-mono-tech font-bold animate-pulse">
          <Clock className="w-3 h-3" />
          <span>SESSION: {sessionRemainingStr}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[#c5a880]">
          <Crown className="w-4 h-4 fill-current text-[#c5a880]" />
          <span className="font-serif-royal text-xs tracking-widest font-bold">
            ROYAL TEL
          </span>
        </div>
      )}

      {/* Hardware Status: Exact Real Battery & Mute & Wifi (Enlarged) */}
      <div className="flex items-center gap-2.5 text-[#eedecf]">
        <button
          onClick={onToggleMute}
          className="hover:text-[#c5a880] transition-colors p-0.5"
          title={isMuted ? 'Unmute Tactile Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#c5a880]" />
          )}
        </button>
        <Wifi className="w-4 h-4 text-[#eedecf]" />
        <div className="flex items-center gap-1.5">
          {battery.charging && <BatteryCharging className="w-4 h-4 text-amber-400 animate-pulse" />}
          <span className="text-xs font-bold text-[#c5a880]">{battery.level}%</span>
          <div className="w-5 h-2.5 rounded-xs border-[1.5px] border-[#c5a880] p-0.5 flex items-center bg-black/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#c5a880] rounded-xs transition-all duration-300"
              style={{ width: `${battery.level}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
