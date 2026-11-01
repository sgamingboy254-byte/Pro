import React, { useState } from 'react';
import { Crown, Maximize2, Minimize2, Power, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { hapticMicro } from '../utils/haptics';

export default function PhoneFrame({
  children,
  onPowerClick,
  onVolumeUp,
  onVolumeDown,
  isMuted,
  onToggleMute,
}: {
  children: React.ReactNode;
  onPowerClick: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const handleToggleFullscreen = () => {
    hapticMicro();
    playClickSound(850, 0.02);
    setIsFullscreenMode(!isFullscreenMode);
  };

  return (
    <div className="min-h-screen w-full bg-[#060607] flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden font-sans relative">
      {/* Background ambient royal illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.07)_0%,transparent_75%)] pointer-events-none" />

      {/* Top Floating Master Bar: Only visible when in handheld frame mode */}
      {!isFullscreenMode && (
        <div className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 text-xs text-[#8c735d] z-20">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#c5a880]" />
            <span className="font-serif-royal font-bold text-[11px] tracking-widest text-[#eedecf] uppercase">
              Aethelgard Royal OS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticMicro();
                playClickSound(800, 0.02);
                onToggleMute();
              }}
              className="p-1 rounded bg-[#131417] hover:bg-[#202228] border border-[#2e2a24] text-[#eedecf] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#c5a880]" />}
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#131417] hover:bg-[#202228] border border-[#2e2a24] text-[10px] font-mono-tech text-[#eedecf] hover:text-[#c5a880] transition-colors shadow"
              title="Expand to Edge-to-Edge full immersion"
            >
              <Maximize2 className="w-3 h-3 text-[#c5a880]" />
              <span>Edge-to-Edge</span>
            </button>
          </div>
        </div>
      )}

      {/* THE PHONE CHASSIS CONTAINER */}
      <div className={`relative flex items-center justify-center my-auto ${isFullscreenMode ? 'w-full h-screen h-[100dvh]' : ''}`}>
        {/* Physical hardware side buttons (When not in full edge mode) */}
        {!isFullscreenMode && (
          <>
            {/* Left Volume Buttons */}
            <div className="absolute -left-3 top-28 flex flex-col gap-3 z-0">
              <button
                onClick={() => {
                  hapticMicro();
                  onVolumeUp();
                }}
                className="w-2.5 h-10 bg-gradient-to-r from-[#201d19] to-[#3a352c] rounded-l-md border-l border-y border-[#54483a] shadow-md active:translate-x-0.5 transition-transform"
                title="Volume Up"
              />
              <button
                onClick={() => {
                  hapticMicro();
                  onVolumeDown();
                }}
                className="w-2.5 h-10 bg-gradient-to-r from-[#201d19] to-[#3a352c] rounded-l-md border-l border-y border-[#54483a] shadow-md active:translate-x-0.5 transition-transform"
                title="Volume Down"
              />
            </div>

            {/* Right Power Button */}
            <div className="absolute -right-3 top-24 z-0">
              <button
                onClick={() => {
                  hapticMicro();
                  onPowerClick();
                }}
                className="w-2.5 h-12 bg-gradient-to-l from-[#201d19] to-[#3a352c] rounded-r-md border-r border-y border-[#54483a] shadow-md active:-translate-x-0.5 transition-transform"
                title="Power Lock Button"
              />
            </div>
          </>
        )}

        {/* Device Body (Handheld Chassis or Fullscreen Edge-to-Edge) */}
        <div
          className={`relative transition-all duration-300 ${
            isFullscreenMode
              ? 'w-full h-screen h-[100dvh] fixed inset-0 z-50 bg-[#050608] flex flex-col items-center justify-center p-2 sm:p-3 overflow-hidden'
              : 'w-[375px] sm:w-[390px] h-[760px] max-h-[92vh] rounded-[44px] p-3.5 bg-gradient-to-b from-[#1b1c20] via-[#0d0e11] to-[#16171b] border-4 border-[#3a342b] shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.15)] flex flex-col justify-between'
          }`}
        >
          {/* Subtle Outer Chamfer Rim (Handheld only) */}
          {!isFullscreenMode && (
            <div className="absolute inset-1 rounded-[38px] border border-[#2b2721] pointer-events-none" />
          )}

          {/* Top Speaker Grille & Camera Pinhole (Handheld only) */}
          {!isFullscreenMode && (
            <div className="w-full flex items-center justify-center gap-3 py-1.5 z-30">
              <div className="w-12 h-1 bg-[#23201a] rounded-full border border-[#3b342b] shadow-inner" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#121316] border border-[#2e2a22] shadow-inner" />
            </div>
          )}

          {/* The Phone Screen Glass - Always preserves royal curved rounded corners! */}
          <div
            className={`w-full flex-1 bg-black relative overflow-hidden flex flex-col min-h-0 ${
              isFullscreenMode
                ? 'max-w-[460px] h-[calc(100vh-20px)] rounded-[38px] sm:rounded-[42px] border-2 border-[#483d30] shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_25px_rgba(197,168,128,0.15)]'
                : 'rounded-[30px] border border-[#24211a]'
            }`}
          >
            {/* Screen glare sheen */}
            <div className="absolute inset-0 retro-screen-glare pointer-events-none z-20" />

            {/* Edge-to-Edge Floating Master Bar with Exit Pill (Tucked inside the top curve) */}
            {isFullscreenMode && (
              <div className="w-full flex items-center justify-between px-4 py-2 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-[#2d261e] shadow-md shrink-0">
                <div className="flex items-center gap-2 text-[#c5a880]">
                  <Crown className="w-4 h-4 fill-current" />
                  <span className="font-serif-royal font-bold text-[11px] tracking-widest text-[#eedecf] uppercase">
                    Aethelgard OS • Edge-to-Edge
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      hapticMicro();
                      playClickSound(800, 0.02);
                      onToggleMute();
                    }}
                    className="p-1.5 rounded-lg bg-[#16181e] hover:bg-[#23262f] border border-[#352f26] text-[#eedecf]"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#c5a880]" />}
                  </button>
                  <button
                    onClick={handleToggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1e26] hover:bg-[#2b2822] border border-[#c5a880]/70 text-[10px] font-mono-tech text-amber-200 transition-colors shadow"
                    title="Return to Handheld Chassis"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Handheld Frame</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inner App Content (Explicit flex-1 and min-h-0 guarantees child apps always render) */}
            <div className="w-full h-full flex-1 relative z-10 flex flex-col overflow-hidden min-h-0">
              {children}
            </div>

            {/* Bottom Royal Home Bar (Tucked inside the bottom curve) */}
            <div className="w-full flex items-center justify-center py-2 bg-[#090b0e]/95 backdrop-blur-md border-t border-[#24201a] z-30 shrink-0">
              <div
                onClick={() => {
                  hapticMicro();
                  playClickSound(750, 0.02);
                  onPowerClick();
                }}
                className="w-32 h-1.5 rounded-full bg-[#3d362e] hover:bg-[#c5a880] cursor-pointer transition-colors shadow-sm"
                title="Tap for Home / Lock"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
