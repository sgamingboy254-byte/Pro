import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Clock as ClockIcon,
  Globe,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { playClickSound, playRoyalBellChime } from '../../utils/audio';

export default function ClockApp({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'chronometer' | 'world' | 'stopwatch' | 'timer'>('chronometer');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerLeft, setTimerLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => setSwTime((t) => t + 1), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((t) => {
          if (t <= 1) {
            playRoyalBellChime();
            setTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerLeft]);

  const worldCities = [
    { city: 'London', tz: 'Europe/London', label: 'Greenwich GMT' },
    { city: 'Zurich', tz: 'Europe/Zurich', label: 'Central European' },
    { city: 'New York', tz: 'America/New_York', label: 'Eastern Standard' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', label: 'Japan Standard' },
  ];

  const formatStopwatch = (hundredths: number) => {
    const ms = hundredths % 100;
    const totalSecs = Math.floor(hundredths / 100);
    const s = totalSecs % 60;
    const m = Math.floor(totalSecs / 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes();
  const hours = currentTime.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="h-full flex flex-col bg-[#0b0c0e] text-[#eedecf] select-none">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#292520] bg-[#121316]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal">Home</span>
        </button>
        <div className="text-center">
          <span className="font-serif-royal text-xs tracking-wider text-[#c5a880] font-bold">
            Haute Horlogerie
          </span>
          <span className="block text-[9px] font-mono-tech text-[#8c735d]">
            SWISS ROYAL CHRONOMETER
          </span>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex border-b border-[#24211c] bg-[#0f1013] text-xs font-serif-royal">
        {[
          { id: 'chronometer', label: 'Watch' },
          { id: 'world', label: 'World' },
          { id: 'stopwatch', label: 'Stopwatch' },
          { id: 'timer', label: 'Timer' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              playClickSound(800, 0.02);
              setActiveTab(t.id as any);
            }}
            className={`flex-1 py-2 text-[11px] tracking-wider uppercase transition-colors ${
              activeTab === t.id
                ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-bold'
                : 'text-[#8c735d] hover:text-[#eedecf]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {activeTab === 'chronometer' && (
          <div className="w-full flex flex-col items-center justify-center space-y-4">
            <div className="w-60 h-60 rounded-full bg-gradient-to-b from-[#18191c] to-[#0c0d0f] border-4 border-[#3d362e] shadow-[0_12px_30px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(197,168,128,0.2)] relative flex items-center justify-center">
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

              <div className="absolute top-4 font-serif-royal text-xs font-bold text-[#c5a880]">XII</div>
              <div className="absolute right-4 font-serif-royal text-xs font-bold text-[#c5a880]">III</div>
              <div className="absolute bottom-4 font-serif-royal text-xs font-bold text-[#c5a880]">VI</div>
              <div className="absolute left-4 font-serif-royal text-xs font-bold text-[#c5a880]">IX</div>

              <div className="text-center z-10 -translate-y-7">
                <span className="font-serif-royal text-[9px] tracking-widest text-[#eedecf] block">
                  AETHELGARD
                </span>
                <span className="font-mono-tech text-[7px] text-[#8c735d]">
                  GENEVE
                </span>
              </div>

              <div className="absolute right-10 z-10 px-1.5 py-0.5 bg-[#23201b] border border-[#4d4438] rounded text-[9px] font-mono-tech text-[#c5a880] font-bold">
                {currentTime.getDate()}
              </div>

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

              <div className="w-3.5 h-3.5 rounded-full bg-[#c5a880] border-2 border-black z-20" />
            </div>

            <div className="text-center">
              <h2 className="font-editorial text-2xl font-bold tracking-wider text-[#faf7f2]">
                {currentTime.toLocaleTimeString('en-GB')}
              </h2>
              <p className="text-xs text-[#8c735d] font-mono-tech mt-0.5">
                {currentTime.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'world' && (
          <div className="w-full space-y-2">
            {worldCities.map((c) => {
              const cityTime = new Date().toLocaleTimeString('en-GB', {
                timeZone: c.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              return (
                <div
                  key={c.city}
                  className="p-3 rounded-xl bg-[#131417] border border-[#26221c] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-editorial text-base font-bold text-[#faf7f2]">
                      {c.city}
                    </h4>
                    <span className="text-[10px] text-[#8c735d] font-mono-tech">
                      {c.label}
                    </span>
                  </div>
                  <span className="font-editorial text-xl font-bold text-[#c5a880]">
                    {cityTime}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'stopwatch' && (
          <div className="w-full flex flex-col items-center space-y-5">
            <div className="font-mono-tech text-4xl font-bold tracking-wider text-[#faf7f2] py-4">
              {formatStopwatch(swTime)}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  playClickSound(900, 0.02);
                  setSwRunning(!swRunning);
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-black shadow-lg ${
                  swRunning ? 'bg-amber-400' : 'bg-[#c5a880]'
                }`}
              >
                {swRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  if (swRunning) {
                    setLaps([swTime, ...laps]);
                  } else {
                    setSwTime(0);
                    setLaps([]);
                  }
                }}
                className="w-14 h-14 rounded-full bg-[#1c1e23] border border-[#3d362e] text-[#eedecf] flex items-center justify-center font-serif-royal text-xs font-bold"
              >
                {swRunning ? 'LAP' : <RotateCcw className="w-4 h-4" />}
              </button>
            </div>

            {laps.length > 0 && (
              <div className="w-full max-h-36 overflow-y-auto space-y-1 text-xs font-mono-tech border-t border-[#292520] pt-2">
                {laps.map((lap, idx) => (
                  <div key={idx} className="flex justify-between text-[#8c735d] px-2 py-0.5">
                    <span>Lap {laps.length - idx}</span>
                    <span className="text-[#faf7f2]">{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="w-full flex flex-col items-center space-y-5">
            <div className="font-mono-tech text-4xl font-bold tracking-wider text-[#faf7f2] py-4">
              {formatTimer(timerLeft)}
            </div>

            <div className="flex gap-2">
              {[
                { label: '1m', secs: 60 },
                { label: '5m', secs: 300 },
                { label: '15m', secs: 900 },
                { label: '25m', secs: 1500 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    playClickSound(800, 0.02);
                    setTimerSeconds(p.secs);
                    setTimerLeft(p.secs);
                    setTimerRunning(false);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-mono-tech bg-[#17181c] border border-[#3b342b] text-[#c5a880] hover:bg-[#282a32]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  playClickSound(900, 0.02);
                  setTimerRunning(!timerRunning);
                }}
                className="w-14 h-14 rounded-full bg-[#c5a880] text-black flex items-center justify-center shadow-lg font-bold"
              >
                {timerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  setTimerLeft(timerSeconds);
                  setTimerRunning(false);
                }}
                className="w-14 h-14 rounded-full bg-[#1c1e23] border border-[#3d362e] text-[#eedecf] flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
