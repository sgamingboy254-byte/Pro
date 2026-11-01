/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import {
  CLASSICAL_TRACKS,
  musicEngine,
  playClickSound,
} from '../../utils/audio';
import {
  deviceSyncStore,
  subscribeToDeviceSync,
  DeviceMusicTrack,
} from '../../utils/deviceSyncStore';

export default function MusicApp({ onBack }: { onBack: () => void }) {
  const [tracks, setTracks] = useState<DeviceMusicTrack[]>(() =>
    deviceSyncStore.getMusicTracks()
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState<'now_playing' | 'track_list'>('now_playing');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);

  const wheelRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDeviceSync(() => {
      setTracks(deviceSyncStore.getMusicTracks());
    });
  }, []);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    return () => {
      musicEngine.stop();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Audio playback handler
  const playCurrentTrack = (track: DeviceMusicTrack) => {
    setTimeElapsed(0);
    musicEngine.stop();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    if (track.url) {
      // Real MP3/audio file from mobile phone
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = track.url;
        audioPlayerRef.current.volume = isMuted ? 0 : volume / 100;
        audioPlayerRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      // Classical synth engine
      const synthTrack = CLASSICAL_TRACKS.find(t => t.title.includes(track.title.split(' ')[0])) || CLASSICAL_TRACKS[0];
      musicEngine.playTrack(synthTrack, (elapsed) => {
        setTimeElapsed(elapsed);
      });
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    playClickSound(900, 0.03);
    if (isPlaying) {
      if (currentTrack.url && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      } else {
        musicEngine.pause();
      }
      setIsPlaying(false);
    } else {
      if (currentTrack.url && audioPlayerRef.current && audioPlayerRef.current.src) {
        audioPlayerRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        playCurrentTrack(currentTrack);
      }
    }
  };

  const handleNextTrack = () => {
    playClickSound(1000, 0.03);
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    playCurrentTrack(tracks[nextIdx]);
  };

  const handlePrevTrack = () => {
    playClickSound(1000, 0.03);
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    playCurrentTrack(tracks[prevIdx]);
  };

  const handleMenuClick = () => {
    playClickSound(850, 0.03);
    setViewMode((prev) => (prev === 'now_playing' ? 'track_list' : 'now_playing'));
  };

  const handleCenterSelect = () => {
    playClickSound(750, 0.04);
    if (viewMode === 'track_list') {
      setCurrentTrackIndex(selectedMenuItem);
      setViewMode('now_playing');
      playCurrentTrack(tracks[selectedMenuItem]);
    } else {
      handleTogglePlay();
    }
  };

  const handleWheelMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    if (lastAngleRef.current !== null) {
      let delta = angle - lastAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      if (Math.abs(delta) > 18) {
        playClickSound(1100, 0.015);
        if (delta > 0) {
          if (viewMode === 'track_list') {
            setSelectedMenuItem((prev) => (prev + 1) % tracks.length);
          } else {
            setVolume((prev) => Math.min(100, prev + 5));
          }
        } else {
          if (viewMode === 'track_list') {
            setSelectedMenuItem((prev) => (prev - 1 + tracks.length) % tracks.length);
          } else {
            setVolume((prev) => Math.max(0, prev - 5));
          }
        }
        lastAngleRef.current = angle;
      }
    } else {
      lastAngleRef.current = angle;
    }
  };

  const handleWheelEnd = () => {
    lastAngleRef.current = null;
  };

  const handleAddDeviceAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    playClickSound(950, 0.03);
    deviceSyncStore.addCustomAudioFiles(files);
    setCurrentTrackIndex(0);
    playCurrentTrack(deviceSyncStore.getMusicTracks()[0]);
  };

  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-[#141518] via-[#0b0c0e] to-[#040506] p-3 text-[#eedecf] select-none overflow-hidden relative font-sans">
      
      {/* Hidden real audio element */}
      <audio
        ref={audioPlayerRef}
        onTimeUpdate={() => {
          if (audioPlayerRef.current) {
            setTimeElapsed(Math.floor(audioPlayerRef.current.currentTime));
          }
        }}
        onEnded={handleNextTrack}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleAddDeviceAudioFiles}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 px-1">
        <button
          onClick={onBack}
          className="p-1 rounded-full bg-[#1b1c20] hover:bg-[#282a32] text-[#eedecf] flex items-center gap-1 text-xs font-mono-tech transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="text-center">
          <span className="font-serif-royal text-[9px] tracking-widest text-[#c5a880] uppercase block">
            Aethelgard Classic
          </span>
          <h2 className="font-editorial text-xs font-bold text-white leading-tight">
            iRoyal Classic iPod
          </h2>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1 px-2 rounded-full bg-[#241e17] border border-[#524434] text-[9px] font-mono-tech text-[#c5a880] hover:border-[#c5a880] flex items-center gap-1"
          title="Import Phone Music"
        >
          <Plus className="w-3 h-3" />
          <span>+ MP3</span>
        </button>
      </div>

      {/* VINTAGE IPOD LCD SCREEN */}
      <div className="w-full bg-[#cbd5bc] border-4 border-[#1e2024] rounded-xl p-2.5 shadow-inner text-[#1b2413] flex flex-col justify-between h-44 font-mono-tech select-none">
        
        {/* LCD Status Header */}
        <div className="flex items-center justify-between border-b border-[#a3b194] pb-1 text-[9px] font-bold">
          <div className="flex items-center gap-1.5">
            {isPlaying ? (
              <span className="flex items-center gap-1 text-emerald-900">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>PLAY</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-700">
                <Pause className="w-2.5 h-2.5 fill-current" />
                <span>PAUSE</span>
              </span>
            )}
            <span className="text-[8px] bg-[#b8c5a9] px-1 rounded">
              {currentTrack?.source === 'device' ? 'PHONE' : 'ROYAL'}
            </span>
          </div>

          <span className="tracking-wider uppercase">
            {viewMode === 'now_playing' ? 'Now Playing' : 'Device Music'}
          </span>

          <div className="flex items-center gap-1 text-[8px]">
            <span>VOL {volume}%</span>
          </div>
        </div>

        {/* LCD Content Area */}
        {viewMode === 'now_playing' ? (
          <div className="flex-1 flex flex-col justify-center py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-[#a9b897] border border-[#8f9f7d] flex items-center justify-center flex-shrink-0 shadow-inner">
                <Disc className={`w-8 h-8 text-[#26331b] ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif-royal font-bold text-xs text-[#0f170b] truncate leading-tight">
                  {currentTrack?.title || 'No Track Selected'}
                </h3>
                <p className="text-[10px] text-[#2b3a1e] font-sans truncate">
                  {currentTrack?.artist || 'Unknown Artist'}
                </p>
                <div className="text-[8px] text-[#4d5c3f] mt-0.5">
                  Track {currentTrackIndex + 1} of {tracks.length}
                </div>
              </div>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="mt-2 space-y-0.5">
              <div className="w-full h-1.5 bg-[#a9b897] rounded-full overflow-hidden border border-[#8f9f7d]">
                <div
                  className="h-full bg-[#1e2b14] transition-all duration-300"
                  style={{ width: `${Math.min(100, (timeElapsed / 240) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-[#364426]">
                <span>
                  {Math.floor(timeElapsed / 60)}:
                  {(timeElapsed % 60).toString().padStart(2, '0')}
                </span>
                <span>{currentTrack?.duration || '03:45'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Track List View on iPod LCD */
          <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#b2c0a1]">
            {tracks.map((trk, idx) => (
              <div
                key={trk.id}
                onClick={() => {
                  setSelectedMenuItem(idx);
                  setCurrentTrackIndex(idx);
                  playCurrentTrack(trk);
                  setViewMode('now_playing');
                }}
                className={`py-1 px-1.5 text-[9px] flex items-center justify-between cursor-pointer rounded ${
                  selectedMenuItem === idx
                    ? 'bg-[#1b2413] text-[#cbd5bc] font-bold'
                    : 'text-[#1e2b14] hover:bg-[#b8c5a9]'
                }`}
              >
                <span className="truncate pr-2">
                  {idx + 1}. {trk.title}
                </span>
                <span className="text-[8px] flex-shrink-0">{trk.duration}</span>
              </div>
            ))}
          </div>
        )}

        {/* LCD Footer hint */}
        <div className="border-t border-[#a3b194] pt-0.5 text-[8px] flex justify-between text-[#40502e]">
          <span>Rotate wheel: Scroll/Vol</span>
          <span>Center: Select/Play</span>
        </div>
      </div>

      {/* CLASSIC RETRO IPOD CLICK WHEEL */}
      <div className="flex-1 flex items-center justify-center py-2">
        <div
          ref={wheelRef}
          onMouseMove={handleWheelMove}
          onTouchMove={handleWheelMove}
          onMouseUp={handleWheelEnd}
          onTouchEnd={handleWheelEnd}
          className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#24262b] via-[#1a1c20] to-[#121316] border-4 border-[#3a352c] shadow-[0_12px_32px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer select-none active:scale-[0.99] transition-transform"
        >
          {/* Top Button: MENU */}
          <button
            onClick={handleMenuClick}
            className="absolute top-2.5 font-mono-tech text-[10px] font-bold text-[#c5a880] hover:text-white transition-colors"
          >
            MENU
          </button>

          {/* Right Button: NEXT */}
          <button
            onClick={handleNextTrack}
            className="absolute right-3 text-[#c5a880] hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Bottom Button: PLAY/PAUSE */}
          <button
            onClick={handleTogglePlay}
            className="absolute bottom-2.5 text-[#c5a880] hover:text-white flex items-center gap-0.5 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <Pause className="w-3 h-3 fill-current" />
          </button>

          {/* Left Button: PREVIOUS */}
          <button
            onClick={handlePrevTrack}
            className="absolute left-3 text-[#c5a880] hover:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Center Button: SELECT */}
          <div
            onClick={handleCenterSelect}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-[#2e2f36] to-[#17181c] border-2 border-[#4b4337] shadow-inner active:scale-95 flex items-center justify-center text-[#c5a880] font-serif-royal font-bold text-[10px] cursor-pointer transition-transform"
          >
            SELECT
          </div>
        </div>
      </div>
    </div>
  );
}
