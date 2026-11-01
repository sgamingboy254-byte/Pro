/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Music,
  Play,
  FileText,
  Folder,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Clock,
  Calendar,
  Calculator,
  Plus,
  Lock,
  Search,
  Radio,
  BookOpen,
  Smartphone,
  TrendingUp,
  FolderSync,
  Zap,
  CheckCircle,
  Users,
  Check,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Wrench,
  Gamepad2,
  Gem,
  Trophy,
  Flame,
} from 'lucide-react';
import { AppId, FixedAppInfo } from '../types/os';
import { playClickSound, playRoyalBellChime, playMicroTick } from '../utils/audio';
import { hapticMicro, hapticButtonClick } from '../utils/haptics';
import { deviceSyncStore, subscribeToDeviceSync } from '../utils/deviceSyncStore';

type AppFilterCategory = 'all' | 'games' | 'communication' | 'tools';

export default function HomeScreen({
  onOpenApp,
  fixedApp,
  onOpenFixedAppInstaller,
  onLockPhone,
  onOpenAccountSync,
  onOpenLivePhoneScan,
  onStartSessionDuration,
}: {
  onOpenApp: (appId: AppId) => void;
  fixedApp: FixedAppInfo | null;
  onOpenFixedAppInstaller: () => void;
  onLockPhone: () => void;
  onOpenAccountSync?: () => void;
  onOpenLivePhoneScan?: () => void;
  onStartSessionDuration?: (minutes: number) => void;
}) {
  const [isPhoneScanAlive, setIsPhoneScanAlive] = useState(() =>
    deviceSyncStore.isPhoneScanAllowed()
  );
  const [isFilePermissionAlive, setIsFilePermissionAlive] = useState(() =>
    deviceSyncStore.isFilePermissionGranted()
  );
  const [musicCount, setMusicCount] = useState(() =>
    deviceSyncStore.getMusicTracks().length
  );
  const [contactsCount, setContactsCount] = useState(() =>
    deviceSyncStore.getContacts().length
  );

  // Filter Category for instant access to Games
  const [activeCategory, setActiveCategory] = useState<AppFilterCategory>('all');

  // Two-step duration selector for the Main App (Max 2 hours)
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('royal_device_user_name') || 'Prajakta Padave';
  });
  const [isDataSavingActive, setIsDataSavingActive] = useState<boolean>(() => {
    return (
      localStorage.getItem('royal_user_signed_in') === 'true' &&
      localStorage.getItem('royal_data_saving_code') === '123456'
    );
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDeviceSync(() => {
      setIsPhoneScanAlive(deviceSyncStore.isPhoneScanAllowed());
      setIsFilePermissionAlive(deviceSyncStore.isFilePermissionGranted());
      setMusicCount(deviceSyncStore.getMusicTracks().length);
      setContactsCount(deviceSyncStore.getContacts().length);
    });
  }, []);

  // Direct Butter-Smooth Child App Launch with micro haptic and sound
  const handleLaunch = (appId: AppId) => {
    hapticButtonClick();
    playMicroTick(true);
    playClickSound(900, 0.02);
    onOpenApp(appId);
  };

  // ONE-CLICK ALLOW FOR ALL FILES & FOLDERS
  const handleOneClickAllowAllFiles = () => {
    hapticButtonClick();
    playRoyalBellChime();
    deviceSyncStore.setFilePermissionGranted(true);
    setIsFilePermissionAlive(true);
    setToastMessage('✓ All Files Allowed! Music on iPod, Gallery Photos, & Storage Folders Unlocked.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCustomFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    hapticMicro();
    playMicroTick();
    playClickSound(950, 0.03);
    deviceSyncStore.batchImportAllFiles(files);
    setToastMessage(`✓ Imported ${files.length} items from phone into iPod, Gallery & Files.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Two-Step Main App Session Launcher
  const handleStartMainAppSession = () => {
    hapticButtonClick();
    playRoyalBellChime();
    setIsSessionActive(true);
    if (onStartSessionDuration) {
      onStartSessionDuration(selectedDuration);
    }
    setToastMessage(`✓ Retro Phone OS Immersion Active for ${selectedDuration} min.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getFixedAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'music':
        return <Music className="w-6 h-6 text-[#1db954]" />;
      case 'radio':
        return <Radio className="w-6 h-6 text-[#c5a880]" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'book':
        return <BookOpen className="w-6 h-6 text-[#eedecf]" />;
      default:
        return <Smartphone className="w-6 h-6 text-[#c5a880]" />;
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-3 bg-gradient-to-b from-[#0e0f12] via-[#090a0c] to-[#060708] text-[#eedecf] select-none overflow-hidden relative">
      {/* Hidden File Picker for Ingestion */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleCustomFileInput}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-3 right-3 z-50 p-2.5 rounded-xl bg-[#14261a] border-2 border-emerald-500/70 text-emerald-300 text-[10px] font-mono-tech shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 truncate">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white text-xs ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Glance Header: Sovereign Title & Account Sync */}
      <div className="flex items-center justify-between px-1 pt-0.5 shrink-0">
        <div>
          <span className="font-serif-royal text-[9px] tracking-widest text-[#c5a880] uppercase block">
            Aethelgard OS • Sovereign Edition
          </span>
          <h2 className="font-editorial text-base font-bold text-white leading-tight">
            Starting Menu
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playClickSound(800, 0.02);
              if (onOpenAccountSync) onOpenAccountSync();
            }}
            className="px-2 py-0.5 rounded-full bg-[#18191d] hover:bg-[#252830] border border-emerald-500/40 text-[9px] font-mono-tech text-emerald-400 flex items-center gap-1 transition-colors"
            title="Real Account Synchronization & Data Saving"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[100px]">{userName}</span>
            {isDataSavingActive && (
              <span className="text-[7.5px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                123456 ✓
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playClickSound(800, 0.03);
              onLockPhone();
            }}
            className="px-2 py-0.5 rounded-full bg-[#18191d] hover:bg-[#252830] border border-[#3b342b] text-[9px] font-mono-tech text-[#c5a880] flex items-center gap-1 transition-colors"
            title="Lock Screen"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* STARTING MENU SPECIAL CONTROLLERS */}
      <div className="my-1 space-y-1.5 shrink-0">
        <div className="grid grid-cols-2 gap-1.5">
          {/* SECTION 1: ALLOW LIVE PHONE SCAN */}
          <div
            onClick={() => {
              playClickSound(850, 0.02);
              if (onOpenLivePhoneScan) onOpenLivePhoneScan();
            }}
            className="p-1.5 rounded-xl bg-gradient-to-b from-[#161c18] to-[#0c120e] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="w-5 h-5 rounded-lg bg-[#1f2b22] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-3 h-3" />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[9px] font-serif-royal font-bold text-white group-hover:text-emerald-300 leading-tight">
              Allow Live Phone Scan
            </div>
            <div className="text-[7.5px] font-mono-tech text-[#8ca391] truncate">
              Real ID & Contacts ({contactsCount})
            </div>
          </div>

          {/* SECTION 2: ONE-CLICK PERMISSION FOR ALL FILES */}
          <div
            onClick={handleOneClickAllowAllFiles}
            className={`p-1.5 rounded-xl bg-gradient-to-b transition-all active:scale-[0.98] cursor-pointer shadow-md group ${
              isFilePermissionAlive
                ? 'from-[#142318] to-[#0c1710] border-2 border-emerald-500/70 hover:border-emerald-400'
                : 'from-[#1c1813] to-[#100e0a] border border-[#5a4833] hover:border-[#c5a880]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="w-5 h-5 rounded-lg bg-[#272119] border border-[#c5a880]/50 flex items-center justify-center text-[#c5a880]">
                {isFilePermissionAlive ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : (
                  <FolderSync className="w-3 h-3 text-[#c5a880]" />
                )}
              </div>
              <span
                className={`px-1 py-0.2 rounded text-[7px] font-mono-tech font-bold uppercase ${
                  isFilePermissionAlive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                }`}
              >
                {isFilePermissionAlive ? 'Allowed ✓' : '1-Click'}
              </span>
            </div>
            <div className="text-[9px] font-serif-royal font-bold text-white group-hover:text-[#c5a880] leading-tight flex items-center justify-between">
              <span>Permission for All Files</span>
            </div>
            <div className="text-[7.5px] font-mono-tech text-[#a6927d] truncate flex items-center justify-between">
              <span>Alive: {musicCount} Songs • Gallery</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="text-[7px] text-[#c5a880] hover:underline"
              >
                + Browse
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: TWO-STEP DURATION LAUNCHER FOR THIS MAIN APP (Max 2 Hours) */}
        <div className="p-1.5 rounded-xl bg-gradient-to-r from-[#1f1913] via-[#17131a] to-[#0f1712] border border-[#c5a880]/40 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#c5a880] fill-current" />
              <span className="text-[9px] font-serif-royal font-bold text-white">
                Study Time Duration (Max 2h)
              </span>
            </div>
            <span className="text-[7.5px] font-mono-tech text-[#c5a880]">
              Distractions Blocked • Rings on End
            </span>
          </div>

          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1 flex-1">
              {[5, 15, 30, 60, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    playClickSound(800, 0.02);
                    setSelectedDuration(mins);
                  }}
                  className={`flex-1 py-0.5 rounded text-[7.5px] font-mono-tech font-bold transition-all ${
                    selectedDuration === mins
                      ? 'bg-[#c5a880] text-black shadow'
                      : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830] border border-[#3b342b]'
                  }`}
                >
                  {mins === 5 ? '5m' : mins === 60 ? '1h' : mins === 120 ? '2h Max' : `${mins}m`}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartMainAppSession}
              className="px-2 py-0.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif-royal font-bold text-[8px] flex items-center gap-1 shadow active:scale-95 transition-all shrink-0"
            >
              <span>Start</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* PROMINENT ROYAL ARCADE & PARLOUR GAMES SHOWCASE BANNER (UNMISSABLE!) */}
        <div className="p-2 rounded-2xl bg-gradient-to-r from-[#112419] via-[#221233] to-[#241c14] border-2 border-[#c5a880] shadow-[0_4px_18px_rgba(197,168,128,0.3)] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-serif-royal font-bold text-[10px] text-white uppercase tracking-wider">
                Royal Arcade & Parlour Games
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-500/60 text-[7px] font-mono-tech text-emerald-300 font-bold">
                READY
              </span>
            </div>
            <span className="text-[8px] font-mono-tech text-[#c5a880]">Tap to Play</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* GAME 1: RETRO SERPENT (SNAKE) */}
            <div
              onClick={() => handleLaunch('snake')}
              className="p-1.5 rounded-xl bg-gradient-to-b from-[#132c1c] to-[#09170e] border-2 border-emerald-500/70 hover:border-emerald-300 shadow-md cursor-pointer transition-all active:scale-[0.97] group"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#1f3f2a] border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-serif-royal font-bold text-[10px] text-white group-hover:text-emerald-300 leading-tight">
                    Serpent Game
                  </div>
                  <div className="text-[7.5px] font-mono-tech text-emerald-400">
                    Classic Snake 🎮
                  </div>
                </div>
              </div>
              <div className="mt-1 pt-0.5 border-t border-emerald-500/30 flex items-center justify-between text-[7px] font-mono-tech">
                <span className="text-[#a6bcae]">CRT Phosphor</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                  PLAY ▶
                </span>
              </div>
            </div>

            {/* GAME 2: COLOUR MEMORY (3-5 JEWELS) */}
            <div
              onClick={() => handleLaunch('colour_memory')}
              className="p-1.5 rounded-xl bg-gradient-to-b from-[#35164d] to-[#160621] border-2 border-purple-500/70 hover:border-purple-300 shadow-md cursor-pointer transition-all active:scale-[0.97] group"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#4c1d6e] border border-purple-400/50 flex items-center justify-center text-purple-200 shadow shrink-0">
                  <Gem className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-serif-royal font-bold text-[10px] text-white group-hover:text-purple-300 leading-tight">
                    Colour Memory
                  </div>
                  <div className="text-[7.5px] font-mono-tech text-purple-300">
                    3-5 Singing Jewels 💎
                  </div>
                </div>
              </div>
              <div className="mt-1 pt-0.5 border-t border-purple-500/30 flex items-center justify-between text-[7px] font-mono-tech">
                <span className="text-[#c7a9df]">Explosion FX</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/40">
                  PLAY ▶
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER TABS FOR APPS */}
      <div className="flex items-center gap-1 my-1 shrink-0">
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setActiveCategory('all');
          }}
          className={`flex-1 py-1 rounded-lg text-[8.5px] font-mono-tech font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-[#c5a880] text-black shadow'
              : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830]'
          }`}
        >
          All Apps
        </button>
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setActiveCategory('games');
          }}
          className={`flex-1 py-1 rounded-lg text-[8.5px] font-mono-tech font-bold flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'games'
              ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white shadow'
              : 'bg-[#18191d] text-emerald-300 hover:bg-[#252830]'
          }`}
        >
          <Gamepad2 className="w-3 h-3 text-emerald-400" />
          <span>Games (2)</span>
        </button>
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setActiveCategory('communication');
          }}
          className={`flex-1 py-1 rounded-lg text-[8.5px] font-mono-tech font-bold transition-all ${
            activeCategory === 'communication'
              ? 'bg-[#c5a880] text-black shadow'
              : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830]'
          }`}
        >
          Phone & Sync
        </button>
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setActiveCategory('tools');
          }}
          className={`flex-1 py-1 rounded-lg text-[8.5px] font-mono-tech font-bold transition-all ${
            activeCategory === 'tools'
              ? 'bg-[#c5a880] text-black shadow'
              : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830]'
          }`}
        >
          Tools & Notes
        </button>
      </div>

      {/* Main Apps View: Filtered or Full Grid */}
      <div className="flex-1 py-1 overflow-y-auto">
        {activeCategory === 'games' ? (
          /* DEDICATED GAMES VIEW WITH BIG CARDS */
          <div className="space-y-2 py-1 animate-in fade-in duration-200">
            {/* Snake Game Big Card */}
            <div
              onClick={() => handleLaunch('snake')}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#112918] to-[#07150c] border-2 border-emerald-500 shadow-xl cursor-pointer hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#1b3d26] border border-emerald-400 flex items-center justify-center text-emerald-300 shadow">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-white group-hover:text-emerald-300">
                      Royal Serpent (Snake Game)
                    </h3>
                    <p className="text-[9px] font-mono-tech text-emerald-400">
                      Phosphor CRT Arcade • Tactile D-Pad Controls
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-serif-royal font-bold text-xs shadow-md">
                  PLAY NOW
                </button>
              </div>
            </div>

            {/* Colour Memory Game Big Card */}
            <div
              onClick={() => handleLaunch('colour_memory')}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#32134a] to-[#140521] border-2 border-purple-500 shadow-xl cursor-pointer hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#4d1f70] border border-purple-400 flex items-center justify-center text-purple-200 shadow">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-white group-hover:text-purple-300">
                      Colour Memory Game
                    </h3>
                    <p className="text-[9px] font-mono-tech text-purple-300">
                      3 to 5 Singing Jewels • Zen Mode (Stress-Free) • FX
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-serif-royal font-bold text-xs shadow-md">
                  PLAY NOW
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN APPS GRID: Games, Telephone, iPod Music, Notes, YouTube etc. */
          <div className="grid grid-cols-4 gap-y-3 gap-x-2">
            {/* 1. Retro Royal Serpent (Snake Game) - Placed prominent in top row! */}
            <div
              onClick={() => handleLaunch('snake')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#142e1c] to-[#07160d] border-2 border-[#2b5936] group-hover:border-emerald-400 shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105 relative">
                <Gamepad2 className="w-6 h-6 text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[7px] font-bold">
                  ★
                </span>
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-emerald-400 truncate w-full px-0.5 font-bold">
                Serpent
              </span>
            </div>

            {/* 2. Colour Memory Game (3 to 5 Colours) - Placed prominent in top row! */}
            <div
              onClick={() => handleLaunch('colour_memory')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#34174d] to-[#150722] border-2 border-[#692d91] group-hover:border-purple-400 shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105 relative">
                <Gem className="w-6 h-6 text-purple-300" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[7px] font-bold">
                  💎
                </span>
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-purple-300 truncate w-full px-0.5 font-bold">
                Colour Memory
              </span>
            </div>

            {/* 3. Vintage Rotary Telephone App */}
            <div
              onClick={() => handleLaunch('phone')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#242b26] to-[#0f1411] border border-[#3b5943] group-hover:border-emerald-400 shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Phone className="w-6 h-6 text-emerald-400 fill-current" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-emerald-400 truncate w-full px-0.5 font-bold">
                Telephone
              </span>
            </div>

            {/* 4. Music Player (iPod style) */}
            <div
              onClick={() => handleLaunch('music')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#2a2c32] to-[#121316] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Music className="w-6 h-6 text-[#c5a880]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Music (iPod)
              </span>
            </div>

            {/* 5. Samsung Notes (With PDF Import) */}
            <div
              onClick={() => handleLaunch('notes')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#f2e6d8] to-[#debfa0] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105 relative">
                <FileText className="w-6 h-6 text-[#29221b]" />
                <span className="absolute -top-1 -right-1 px-1 rounded bg-red-800 text-white text-[7px] font-mono-tech font-bold">
                  PDF
                </span>
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Samsung Notes
              </span>
            </div>

            {/* 6. YouTube (Custom Minimalist Royal) */}
            <div
              onClick={() => handleLaunch('youtube')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#221f1c] to-[#121110] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <div className="w-6.5 h-4.5 rounded-md bg-[#eedecf] flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-[#0b0c0e] text-[#0b0c0e] translate-x-0.5" />
                </div>
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                YouTube
              </span>
            </div>

            {/* 7. Files (Royal Crypt) */}
            <div
              onClick={() => handleLaunch('files')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#222327] to-[#111215] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Folder className="w-6 h-6 text-[#c5a880]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Files
              </span>
            </div>

            {/* 8. Gallery */}
            <div
              onClick={() => handleLaunch('gallery')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#232429] to-[#121316] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <ImageIcon className="w-6 h-6 text-[#eedecf]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Gallery
              </span>
            </div>

            {/* 9. Google Gemini */}
            <div
              onClick={() => handleLaunch('gemini')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#26242c] to-[#131218] border border-[#4e4359] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Sparkles className="w-6 h-6 text-[#c5a880]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Gemini
              </span>
            </div>

            {/* 10. Camera */}
            <div
              onClick={() => handleLaunch('camera')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#24252a] to-[#101114] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Camera className="w-6 h-6 text-[#eedecf]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Camera
              </span>
            </div>

            {/* 11. Clock */}
            <div
              onClick={() => handleLaunch('clock')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#232429] to-[#121316] border border-[#483e33] group-hover:border-[#c5a880] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all group-hover:scale-105">
                <Clock className="w-6 h-6 text-[#c5a880]" />
              </div>
              <span className="text-[9.5px] font-serif-royal text-center text-[#eedecf] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                Clock
              </span>
            </div>

            {/* 12. The 13th Hardware Slot: Add One App */}
            {fixedApp ? (
              <div
                onClick={() => handleLaunch('custom_app')}
                className="flex flex-col items-center gap-1 cursor-pointer group relative"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#2d251d] to-[#17130f] border-2 border-[#c5a880] shadow-[0_5px_15px_rgba(197,168,128,0.35)] flex items-center justify-center transition-all group-hover:scale-105 relative">
                  {getFixedAppIcon(fixedApp.iconName)}
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#c5a880] text-black flex items-center justify-center text-[8px] font-bold shadow">
                    <Lock className="w-2 h-2" />
                  </div>
                </div>
                <span className="text-[9.5px] font-serif-royal text-center text-[#c5a880] font-bold truncate w-full px-0.5">
                  {fixedApp.name}
                </span>
              </div>
            ) : (
              <div
                onClick={() => {
                  playClickSound(850, 0.02);
                  onOpenFixedAppInstaller();
                }}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div className="w-13 h-13 rounded-2xl bg-[#14161a] border-2 border-dashed border-[#524434] group-hover:border-[#c5a880] shadow-sm flex items-center justify-center transition-all group-hover:scale-105 text-[#8c735d] group-hover:text-[#c5a880]">
                  <Plus className="w-5.5 h-5.5" />
                </div>
                <span className="text-[9.5px] font-serif-royal text-center text-[#8c735d] group-hover:text-[#c5a880] truncate w-full px-0.5 font-semibold">
                  + Add App
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Quick Dock: Telephone, Notes (PDF), Games Arcade, Music, Gemini */}
      <div className="p-2 rounded-3xl bg-[#141518]/95 border-2 border-[#362e24] backdrop-blur-md shadow-2xl flex items-center justify-around shrink-0">
        <button
          onClick={() => handleLaunch('phone')}
          className="w-11 h-11 rounded-2xl bg-[#15241b] border-2 border-[#284733] flex items-center justify-center text-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-md"
          title="Telephone Dial"
        >
          <Phone className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={() => handleLaunch('notes')}
          className="w-11 h-11 rounded-2xl bg-[#25221b] border-2 border-[#483e33] flex items-center justify-center text-[#c5a880] hover:scale-105 active:scale-95 transition-all shadow-md relative"
          title="Samsung Notes & PDF Vault"
        >
          <FileText className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-900 text-white flex items-center justify-center text-[7px] font-mono-tech font-bold">
            P
          </span>
        </button>

        {/* Quick Games Arcade Toggle / Launch */}
        <button
          onClick={() => {
            playClickSound(850, 0.02);
            setActiveCategory(activeCategory === 'games' ? 'all' : 'games');
          }}
          className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md ${
            activeCategory === 'games'
              ? 'bg-gradient-to-r from-emerald-600 to-purple-600 border-white text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-[#1e1329] border-[#552778] text-purple-300'
          }`}
          title="Parlour Games (Snake & Colour Memory)"
        >
          <Gamepad2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleLaunch('music')}
          className="w-11 h-11 rounded-2xl bg-[#232429] border-2 border-[#483e33] flex items-center justify-center text-[#c5a880] hover:scale-105 active:scale-95 transition-all shadow-md"
          title="Music (iPod)"
        >
          <Music className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleLaunch('gemini')}
          className="w-11 h-11 rounded-2xl bg-[#221f28] border-2 border-[#4a3f55] flex items-center justify-center text-[#c5a880] hover:scale-105 active:scale-95 transition-all shadow-md"
          title="Gemini Sovereign"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
