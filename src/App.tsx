/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sun,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Tv,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Bell,
  BookOpen,
} from 'lucide-react';
import { AppId, AppSessionConfig, FixedAppInfo, UserDeviceProfile } from './types/os';
import PhoneFrame from './components/PhoneFrame';
import StatusBar from './components/StatusBar';
import LockScreen from './components/LockScreen';
import HomeScreen from './components/HomeScreen';
import AppLaunchGateModal from './components/AppLaunchGateModal';
import AccountSyncModal from './components/AccountSyncModal';
import LiveDeviceScannerModal from './components/LiveDeviceScannerModal';
import AllFilesPermissionModal from './components/AllFilesPermissionModal';
import PhoneInterfaceInitializerModal from './components/PhoneInterfaceInitializerModal';

// Distinct Operatable Applications (Retro Royal Luxury)
import PhoneApp from './components/apps/PhoneApp';
import MusicApp from './components/apps/MusicApp';
import YouTubeApp from './components/apps/YouTubeApp';
import NotesApp from './components/apps/NotesApp';
import FilesApp from './components/apps/FilesApp';
import GalleryApp from './components/apps/GalleryApp';
import GeminiApp from './components/apps/GeminiApp';
import CameraApp from './components/apps/CameraApp';
import ClockApp from './components/apps/ClockApp';
import CalendarApp from './components/apps/CalendarApp';
import CalculatorApp from './components/apps/CalculatorApp';
import FixedAppView from './components/apps/FixedAppView';
import CustomFixedAppModal from './components/apps/CustomFixedAppModal';
import SnakeGameApp from './components/apps/SnakeGameApp';
import ColourMemoryApp from './components/apps/ColourMemoryApp';

import { playClickSound, playRoyalBellChime, playStudyBellAlarm } from './utils/audio';
import { triggerHaptic, hapticSolarBlocked, hapticButtonClick } from './utils/haptics';
import { solarBackgroundShield, SolarRuleViolation } from './utils/backgroundShield';

const APP_DISPLAY_NAMES: Record<AppId, string> = {
  phone: 'Rotary Telephone Wire',
  music: 'iRoyal Classic Music',
  youtube: 'YouTube Royal Luxe',
  notes: 'Samsung Notes Royal',
  files: 'Royal Crypt Files',
  gallery: 'Royal Photo Gallery',
  whatsapp: 'WhatsApp (Canceled)',
  gemini: 'Google Gemini Sovereign',
  camera: 'Palace Rangefinder Camera',
  clock: 'Haute Horlogerie Clock',
  calendar: 'Perpetual Royal Calendar',
  calculator: 'Mechanical Arithmometer',
  snake: 'Royal Serpent (Snake Game)',
  colour_memory: 'Colour Memory (3 to 5 Jewels)',
  custom_app: 'Fixed Hardware App',
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SovereignErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sovereign OS Error Intercepted:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#0a0b0e] text-[#eedecf] space-y-4 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest font-bold">
              Safety Interception
            </span>
            <h3 className="font-editorial text-lg font-bold text-white">
              Sovereign Interface Recovered
            </h3>
            <p className="text-xs text-[#a6927d] max-w-xs leading-relaxed">
              A temporary display condition was automatically secured. Tap below to resume the Starting Menu.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39268] text-black font-serif-royal font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            Return to Starting Menu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


export default function App() {
  // Lock state: starts locked with the grand royal clock
  const [isLocked, setIsLocked] = useState(true);
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [youtubeInitialQuery, setYoutubeInitialQuery] = useState('');
  const [showMainAppGate, setShowMainAppGate] = useState(false);
  const [activeSession, setActiveSession] = useState<AppSessionConfig | null>(() => {
    return solarBackgroundShield.getSavedSession();
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showFixedAppInstaller, setShowFixedAppInstaller] = useState(false);
  const [showAccountSync, setShowAccountSync] = useState(false);
  const [showLivePhoneScan, setShowLivePhoneScan] = useState(false);
  const [showAllFilesPermission, setShowAllFilesPermission] = useState(false);
  const [showInitializerModal, setShowInitializerModal] = useState(false);

  // Solar Background Shield State
  const [isBackgroundRunning, setIsBackgroundRunning] = useState<boolean>(() =>
    solarBackgroundShield.getIsBackgroundRunning()
  );
  const [blockedViolation, setBlockedViolation] = useState<SolarRuleViolation | null>(null);
  const [showStudyCompletedModal, setShowStudyCompletedModal] = useState<boolean>(false);

  // User's Real Device Profile (Synced with real phone)
  const [userProfile, setUserProfile] = useState<UserDeviceProfile>(() => {
    const saved = localStorage.getItem('royal_device_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 'Prajakta Padave',
      email: 'prajaktapadave624@gmail.com',
      phone: '+91 98765 43210',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isSynced: true,
    };
  });

  // 13th App Slot (Stored in localStorage, once fixed cannot be removed!)
  const [fixedApp, setFixedApp] = useState<FixedAppInfo | null>(() => {
    const saved = localStorage.getItem('royal_fixed_app_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Subscribe to background shield changes
  useEffect(() => {
    const unsub = solarBackgroundShield.subscribe(() => {
      setIsBackgroundRunning(solarBackgroundShield.getIsBackgroundRunning());
      setBlockedViolation(solarBackgroundShield.getCurrentViolation());
    });
    return unsub;
  }, []);

  const handleUnlock = () => {
    // Before starting the main app of phone interface changer, must select duration and phone access
    if (!activeSession) {
      setShowInitializerModal(true);
    } else {
      setIsLocked(false);
    }
  };

  const handleInitializerComplete = (durationMinutes: number) => {
    const now = Date.now();
    const session: AppSessionConfig = {
      appId: 'phone',
      durationMinutes: durationMinutes,
      startedAt: now,
      expiresAt: now + durationMinutes * 60 * 1000,
    };
    setActiveSession(session);
    solarBackgroundShield.saveSession(session);
    setShowInitializerModal(false);
    setIsLocked(false);
  };

  const handleLock = () => {
    playClickSound(700, 0.03);
    setActiveApp(null);
    setShowMainAppGate(false);
    setIsLocked(true);
  };

  const handlePowerClick = () => {
    if (activeApp) {
      // Return to homescreen
      playClickSound(800, 0.02);
      setActiveApp(null);
    } else {
      // Toggle lock
      if (isLocked) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    }
  };

  // Butter-Smooth 1-Click App Launch with Study Rule Enforcement
  const handleRequestOpenApp = (id: AppId) => {
    playClickSound(900, 0.02);

    // During Study Time Duration, check if app or game is blocked
    const appName = (id === 'custom_app' && fixedApp) ? fixedApp.name : (APP_DISPLAY_NAMES[id] || id);
    const check = solarBackgroundShield.checkCanOpenApp(id, appName);
    if (!check.allowed) {
      setBlockedViolation(check.violation || null);
      return;
    }

    setActiveApp(id);
  };

  // Toggle or Cut App to Background (Runs in background for active session duration)
  const handleCutAppToBackground = () => {
    playClickSound(950, 0.03);
    triggerHaptic([20, 40, 20]);
    solarBackgroundShield.setBackgroundRunning(true);
    setActiveApp(null);
  };

  const handleResumeForeground = () => {
    playClickSound(850, 0.02);
    triggerHaptic(25);
    solarBackgroundShield.setBackgroundRunning(false);
    setBlockedViolation(null);
  };

  // When study time completes: RINGS and turns off in background!
  const handleSessionExpire = () => {
    playStudyBellAlarm();
    triggerHaptic([150, 60, 150, 60, 300]);
    setActiveApp(null);
    setActiveSession(null);
    solarBackgroundShield.clearSession(true);
    setShowStudyCompletedModal(true);
  };

  const handleInstallFixedApp = (app: FixedAppInfo) => {
    setFixedApp(app);
    localStorage.setItem('royal_fixed_app_data', JSON.stringify(app));
    setShowFixedAppInstaller(false);
  };

  const handleBackToHome = () => {
    playClickSound(750, 0.02);
    setActiveApp(null);
  };

  // Calculate remaining time for banner
  const [remainingTimeStr, setRemainingTimeStr] = useState('');
  useEffect(() => {
    if (!activeSession) {
      setRemainingTimeStr('');
      return;
    }
    const updateCountdown = () => {
      const diff = activeSession.expiresAt - Date.now();
      if (diff <= 0) {
        handleSessionExpire();
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemainingTimeStr(`${m}m ${s < 10 ? '0' : ''}${s}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  return (
    <PhoneFrame
      onPowerClick={handlePowerClick}
      onVolumeUp={() => playClickSound(1000, 0.02)}
      onVolumeDown={() => playClickSound(800, 0.02)}
      isMuted={isMuted}
      onToggleMute={() => setIsMuted(!isMuted)}
    >
      {/* Universal Classic Royal Status Bar */}
      {activeApp !== 'phone' && (
        <StatusBar
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          activeSession={activeSession}
          onSessionExpire={handleSessionExpire}
        />
      )}

      {/* Main Display Container with Butter Smooth Transitions */}
      <div className="flex-1 relative overflow-hidden bg-black flex flex-col">
        {/* =========================================================================
            STUDY TIME DURATION RUNNING BANNER (Shows when session runs in background)
            ========================================================================= */}
        {isBackgroundRunning && activeSession && (
          <div className="bg-gradient-to-r from-[#201408] via-[#151722] to-[#0d1f18] border-b border-[#c5a880]/40 px-3 py-1.5 flex items-center justify-between z-40 shadow-xl shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono-tech text-amber-300 font-bold tracking-wider uppercase truncate">
                  📚 Study Time Lock Active ({remainingTimeStr})
                </span>
                <span className="text-[8px] font-serif-royal text-[#c5a880] truncate">
                  Distractions Blocked: YouTube, Social & Games • Rings on Finish
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  playClickSound(850, 0.02);
                  setActiveApp('notes');
                }}
                className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[9px] font-mono-tech font-bold hover:scale-105 transition-transform"
                title="Open Study Notes"
              >
                Notes (PDF)
              </button>
              <button
                onClick={handleResumeForeground}
                className="px-2 py-0.5 rounded bg-[#c5a880] text-black text-[9px] font-serif-royal font-bold hover:bg-[#eedecf] transition-colors"
                title="Resume full phone interface"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* LOCK SCREEN: Grand Royal Clock with Swipe-Up Unlock */}
            {isLocked ? (
              <LockScreen
                key="lockscreen"
                onUnlock={handleUnlock}
                activeSession={activeSession}
                onOpenInitializer={() => setShowInitializerModal(true)}
              />
            ) : activeApp ? (
              /* ACTIVE APPLICATION CONTAINER: Direct Smooth Display */
              <motion.div
                key={`app_${activeApp}`}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                className="absolute inset-0 z-20 overflow-hidden flex flex-col"
              >
                <SovereignErrorBoundary onReset={handleBackToHome}>
                  {activeApp === 'phone' && (
                    <PhoneApp
                      onBack={handleBackToHome}
                      onOpenYouTube={(q) => {
                        setYoutubeInitialQuery(q || '');
                        setActiveApp('youtube');
                      }}
                    />
                  )}
                  {activeApp === 'music' && <MusicApp onBack={handleBackToHome} />}
                  {activeApp === 'youtube' && (
                    <YouTubeApp onBack={handleBackToHome} initialQuery={youtubeInitialQuery} />
                  )}
                  {activeApp === 'notes' && <NotesApp onBack={handleBackToHome} />}
                  {activeApp === 'files' && <FilesApp onBack={handleBackToHome} />}
                  {activeApp === 'gallery' && <GalleryApp onBack={handleBackToHome} />}
                  {activeApp === 'gemini' && <GeminiApp onBack={handleBackToHome} />}
                  {activeApp === 'camera' && (
                    <CameraApp
                      onBack={handleBackToHome}
                      onOpenGallery={() => setActiveApp('gallery')}
                    />
                  )}
                  {activeApp === 'clock' && <ClockApp onBack={handleBackToHome} />}
                  {activeApp === 'calendar' && <CalendarApp onBack={handleBackToHome} />}
                  {activeApp === 'calculator' && <CalculatorApp onBack={handleBackToHome} />}
                  {activeApp === 'snake' && <SnakeGameApp onBack={handleBackToHome} />}
                  {activeApp === 'colour_memory' && <ColourMemoryApp onBack={handleBackToHome} />}
                  {activeApp === 'custom_app' && (
                    fixedApp ? (
                      <FixedAppView app={fixedApp} onBack={handleBackToHome} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#0e0f13] text-[#eedecf] space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>
                        <h3 className="font-editorial text-lg font-bold text-white">Extract Phone App</h3>
                        <p className="text-xs text-[#a6927d] max-w-xs leading-relaxed">
                          Select any real application from your phone to allocate into this 13th hardware slot.
                        </p>
                        <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                          <button
                            onClick={() => {
                              setShowFixedAppInstaller(true);
                              setActiveApp(null);
                            }}
                            className="w-full py-2 rounded-xl bg-[#c5a880] text-black font-serif-royal font-bold text-xs shadow hover:bg-[#eedecf] transition-colors"
                          >
                            Open App Extractor
                          </button>
                          <button
                            onClick={handleBackToHome}
                            className="text-xs text-[#a6927d] hover:text-white py-1"
                          >
                            Return to Starting Menu
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  {activeApp === 'whatsapp' && (
                    <div className="h-full flex flex-col items-center justify-center p-6 bg-[#0e0f13] text-[#eedecf] space-y-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="font-editorial text-lg font-bold text-white">Telephone Directory Synced</h3>
                      <p className="text-xs text-[#a6927d] max-w-xs leading-relaxed">
                        Your real phone contacts (Family & Friends) are accessible directly via the Telephone Apparatus.
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                        <button
                          onClick={() => setActiveApp('phone')}
                          className="w-full py-2 rounded-xl bg-[#c5a880] text-black font-serif-royal font-bold text-xs shadow hover:bg-[#eedecf] transition-colors"
                        >
                          Open Sovereign Telephone
                        </button>
                        <button
                          onClick={handleBackToHome}
                          className="text-xs text-[#a6927d] hover:text-white py-1"
                        >
                          Return to Starting Menu
                        </button>
                      </div>
                    </div>
                  )}
                </SovereignErrorBoundary>
              </motion.div>
            ) : (
              /* HOMESCREEN: 12 Luxury Apps + 1 Custom Fixed Hardware App Slot */
              <motion.div
                key="homescreen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute inset-0 z-10 flex flex-col"
              >
                <HomeScreen
                  onOpenApp={handleRequestOpenApp}
                  fixedApp={fixedApp}
                  onOpenFixedAppInstaller={() => setShowFixedAppInstaller(true)}
                  onLockPhone={handleLock}
                  onOpenAccountSync={() => setShowAccountSync(true)}
                  onOpenLivePhoneScan={() => setShowLivePhoneScan(true)}
                  onStartSessionDuration={() => setShowInitializerModal(true)}
                />

                {/* Optional Quick Cut to Background Button on Homescreen */}
                {activeSession && !isBackgroundRunning && (
                  <div className="p-2 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center z-20">
                    <button
                      onClick={handleCutAppToBackground}
                      className="px-3 py-1 rounded-full bg-[#1b1c24] border border-[#c5a880]/50 hover:border-[#c5a880] text-[#c5a880] text-[10px] font-mono-tech flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Cut App to Background (Solar Run)</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =========================================================================
            STUDY TIME DURATION ANTI-DISTRACTION SHIELD MODAL
            ========================================================================= */}
        {blockedViolation && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#161310] border-2 border-amber-500/80 rounded-2xl p-4.5 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-3">
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-950 to-red-950 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-md">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest font-bold">
                  📚 Study Time Duration Active
                </span>
                <h2 className="text-base font-serif-royal font-black text-[#faf7f2]">
                  {blockedViolation.attemptedAppName || (blockedViolation.attemptedApp ? (APP_DISPLAY_NAMES[blockedViolation.attemptedApp as AppId] || blockedViolation.attemptedApp) : 'Distraction App')} is Blocked
                </h2>
                <p className="text-[11px] text-[#d6c4b2] leading-relaxed">
                  During your study time duration, distraction apps and games are prohibited in background and foreground:
                </p>
                <div className="p-2.5 rounded-xl bg-[#0c0d11] border border-amber-500/30 text-[9px] font-mono-tech text-rose-300 space-y-1 text-left">
                  <div>🚫 <strong>Prohibited Social/Video:</strong> YouTube, Instagram, Snapchat, Pinterest</div>
                  <div>🚫 <strong>All Games Blocked:</strong> Free Fire Max, Roblox, Free Fire India, Minecraft, CoC, COD, Royal Serpent, Colour Memory</div>
                  <div className="text-emerald-400 pt-1 font-bold">
                    🔔 Time Remaining: {remainingTimeStr || 'Study in progress'} (Bell will ring when complete)
                  </div>
                </div>
              </div>

              <div className="w-full space-y-1.5 pt-1">
                <button
                  onClick={() => {
                    playClickSound(850, 0.02);
                    setBlockedViolation(null);
                    setActiveApp('notes');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900 border border-amber-500/60 text-white font-mono-tech text-[10px] font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Samsung Notes (Read PDFs & Study)</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound(800, 0.02);
                    setBlockedViolation(null);
                  }}
                  className="w-full py-2 rounded-xl bg-[#221c15] hover:bg-[#32291e] text-[#eedecf] border border-[#443828] font-serif-royal font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Return to Study Desktop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STUDY TIME COMPLETED CELEBRATORY BELL RING MODAL
            ========================================================================= */}
        {showStudyCompletedModal && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#121419] border-2 border-[#c5a880] rounded-3xl p-5 shadow-[0_0_40px_rgba(197,168,128,0.5)] flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black shadow-lg animate-bounce">
                <Bell className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono-tech text-emerald-400 font-bold uppercase tracking-widest">
                  🔔 Study Bell Has Rung!
                </span>
                <h2 className="text-lg font-editorial font-bold text-white">
                  Study Time Duration Completed
                </h2>
                <p className="text-xs text-[#a6927d] leading-relaxed">
                  Your designated study period has concluded. The background lock has automatically turned off, and all device apps and games are now unlocked.
                </p>
              </div>

              <div className="w-full pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    playClickSound(850, 0.02);
                    setShowStudyCompletedModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39268] text-black font-serif-royal font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Dismiss & Unlock All Apps
                </button>
                <button
                  onClick={() => {
                    playClickSound(850, 0.02);
                    setShowStudyCompletedModal(false);
                    setShowInitializerModal(true);
                  }}
                  className="w-full py-2 rounded-xl bg-[#1d1f27] border border-[#443829] text-[#eedecf] hover:text-white font-mono-tech text-[10px]"
                >
                  Start New Study Duration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 0. MANDATORY PHONE INTERFACE CHANGER INITIALIZER (DURATION MAX 2H + PHONE ACCESS) */}
        <PhoneInterfaceInitializerModal
          isOpen={showInitializerModal}
          onComplete={handleInitializerComplete}
          onClose={() => setShowInitializerModal(false)}
        />

        {/* 1. TWO-STEP DURATION LAUNCHER FOR THE MAIN APP (MAX 2 HOURS) */}
        <AppLaunchGateModal
          appId="phone"
          appName="Aethelgard Royal Retro Phone OS"
          isOpen={showMainAppGate}
          onClose={() => setShowMainAppGate(false)}
          onStartSession={(session: AppSessionConfig) => {
            setActiveSession(session);
            solarBackgroundShield.saveSession(session);
            setShowMainAppGate(false);
          }}
        />

        {/* 2. REAL DEVICE & ACCOUNT SYNCHRONIZATION MODAL */}
        <AccountSyncModal
          isOpen={showAccountSync}
          onClose={() => setShowAccountSync(false)}
          onUpdateProfile={(prof: UserDeviceProfile) => setUserProfile(prof)}
        />

        {/* 3. 13th App Fixed Installation Modal */}
        <CustomFixedAppModal
          isOpen={showFixedAppInstaller}
          onClose={() => setShowFixedAppInstaller(false)}
          onInstall={handleInstallFixedApp}
          currentInstalledApp={fixedApp}
        />

        {/* 4. LIVE PHONE SCAN MODAL (REAL IDENTITY & FAMILY/FRIENDS) */}
        <LiveDeviceScannerModal
          isOpen={showLivePhoneScan}
          onClose={() => setShowLivePhoneScan(false)}
        />

        {/* 5. ALL FILES PERMISSION MODAL */}
        <AllFilesPermissionModal
          isOpen={showAllFilesPermission}
          onClose={() => setShowAllFilesPermission(false)}
        />
      </div>
    </PhoneFrame>
  );
}
