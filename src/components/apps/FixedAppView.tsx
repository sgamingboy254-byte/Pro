/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Lock,
  Radio,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Globe,
  Search,
  ExternalLink,
  ArrowRight,
  Share2,
  Heart,
  MessageCircle,
  Tv,
  MapPin,
  Compass,
  Smartphone,
  CheckCircle,
  Crown,
} from 'lucide-react';
import { FixedAppInfo } from '../../types/os';
import { playClickSound, playRoyalBellChime, playMicroTick } from '../../utils/audio';
import { triggerHaptic, hapticButtonClick, hapticMicro } from '../../utils/haptics';

export default function FixedAppView({
  app,
  onBack,
}: {
  app: FixedAppInfo;
  onBack: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'logs'>('main');
  const [chromeSearchQuery, setChromeSearchQuery] = useState('');
  const [browserUrl, setBrowserUrl] = useState('https://google.com/search?q=aethelgard');
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const appNameLower = app.name.toLowerCase();

  const handleChromeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chromeSearchQuery.trim()) return;
    hapticMicro();
    playClickSound(900, 0.02);
    setBrowserUrl(`https://google.com/search?q=${encodeURIComponent(chromeSearchQuery)}`);
  };

  const toggleLike = (idx: number) => {
    hapticMicro();
    playMicroTick();
    setLikedPosts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0c0e] text-[#eedecf] select-none font-sans overflow-hidden">
      {/* Antique Master Top Header (Unchanging Royal Interior Chassis) */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b-2 border-[#362e24] bg-[#121316] shadow-md shrink-0">
        <button
          onClick={() => {
            hapticButtonClick();
            playClickSound(800, 0.02);
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-[#c5a880] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal font-bold text-[11px] uppercase tracking-wider">Starting Menu</span>
        </button>

        <div className="text-center">
          <span className="font-serif-royal text-xs tracking-wider text-white font-bold block truncate max-w-[170px]">
            {app.name}
          </span>
          <span className="text-[8px] font-mono-tech text-[#c5a880] flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            EXTRA HARDWARE APP SLOT
          </span>
        </div>

        <div className="w-10 flex justify-end">
          <Crown className="w-3.5 h-3.5 text-[#c5a880]" />
        </div>
      </div>

      {/* Main Content Area - Renders the chosen app inside the antique casing */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Hardware Binding Status Card */}
        <div className="p-2.5 rounded-xl bg-[#15171e] border border-[#3b3226] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#241e17] border border-[#c5a880] flex items-center justify-center text-[#c5a880] flex-shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-serif-royal text-[11px] font-bold text-white leading-tight">
                Dedicated Extra Slot
              </h4>
              <p className="text-[9px] font-mono-tech text-[#a6927d] truncate">
                {app.category || 'Phone Application'} • Bound securely
              </p>
            </div>
          </div>
          <span className="text-[8px] font-mono-tech px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/50 uppercase font-bold">
            Active ✓
          </span>
        </div>

        {/* 1. GOOGLE CHROME BROWSER EXPERIENCE */}
        {appNameLower.includes('chrome') || appNameLower.includes('browser') ? (
          <div className="rounded-2xl bg-[#14161c] border-2 border-[#382f23] overflow-hidden shadow-lg flex flex-col">
            {/* Chrome Address Bar */}
            <form onSubmit={handleChromeSearch} className="p-2 bg-[#1b1e26] border-b border-[#2d251d] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#c5a880] shrink-0" />
              <input
                type="text"
                value={chromeSearchQuery}
                onChange={(e) => setChromeSearchQuery(e.target.value)}
                placeholder="Search Google or enter web address..."
                className="flex-1 bg-[#101217] border border-[#352f26] rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a880]"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-[#c5a880] text-black font-bold text-[10px] shadow"
              >
                Go
              </button>
            </form>

            {/* Browser Content */}
            <div className="p-3 space-y-2.5 text-xs">
              <div className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Encrypted Connection: {browserUrl}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1014] border border-[#2b251e] space-y-2">
                <h5 className="font-serif-royal font-bold text-[#eedecf] text-sm">
                  Google Sovereign Web Index
                </h5>
                <p className="text-[11px] text-[#a6927d] leading-relaxed">
                  Web browsing operational through phone link. Long videos and certified websites open with full privacy isolation.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Google Search', 'Wikipedia Royal', 'DuckDuckGo', 'Archive.org'].map((site) => (
                    <button
                      key={site}
                      onClick={() => {
                        hapticMicro();
                        setChromeSearchQuery(site);
                        setBrowserUrl(`https://${site.toLowerCase().replace(/\s+/g, '')}.com`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#191b22] border border-[#3a3227] text-[10px] text-[#c5a880] hover:bg-[#252833]"
                    >
                      {site}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : appNameLower.includes('spotify') ? (
          /* 2. SPOTIFY MUSIC EXPERIENCE */
          <div className="p-4 rounded-2xl bg-[#14161c] border-2 border-[#382f23] space-y-4 text-center shadow-lg">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#1db954]/20 to-[#c5a880]/20 border border-[#3d362e] mx-auto flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#1db954]/50 animate-spin flex items-center justify-center">
                <Radio className="w-8 h-8 text-[#1db954]" />
              </div>
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-white">
                Spotify Lossless Audio
              </h3>
              <p className="text-xs text-[#c5a880] font-mono-tech mt-0.5">
                Chamber Acoustic • 24-bit 96kHz Master
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={() => {
                  playClickSound(900, 0.02);
                  hapticMicro();
                  setIsPlaying(!isPlaying);
                }}
                className="px-5 py-2 rounded-xl bg-[#1db954] text-black font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE STREAM' : 'PLAY LOSSLESS'}</span>
              </button>
            </div>
          </div>
        ) : appNameLower.includes('instagram') ? (
          /* 3. INSTAGRAM FEED EXPERIENCE */
          <div className="space-y-3">
            {[1, 2].map((postIdx) => (
              <div key={postIdx} className="rounded-2xl bg-[#14161c] border-2 border-[#382f23] overflow-hidden shadow-md">
                <div className="p-2.5 flex items-center justify-between border-b border-[#2b241c]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-[#14161c] flex items-center justify-center text-[10px] font-bold text-white">
                        PP
                      </div>
                    </div>
                    <span className="text-xs font-serif-royal font-bold text-white">
                      {postIdx === 1 ? 'prajakta_royal' : 'palace_chronicles'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono-tech text-[#a6927d]">Just now</span>
                </div>

                <div className="aspect-[4/3] bg-gradient-to-br from-[#231b14] to-[#0e1014] flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-4">
                    <Crown className="w-10 h-10 text-[#c5a880] mx-auto mb-2 opacity-80" />
                    <span className="font-serif-royal text-sm text-white font-bold block">
                      Aethelgard Royal Palace
                    </span>
                    <span className="text-[10px] font-mono-tech text-[#c5a880]">
                      Golden Hour • Sovereign Collection
                    </span>
                  </div>
                </div>

                <div className="p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleLike(postIdx)} className="flex items-center gap-1 text-xs">
                      <Heart
                        className={`w-4 h-4 ${
                          likedPosts[postIdx] ? 'fill-rose-500 text-rose-500' : 'text-[#eedecf]'
                        }`}
                      />
                      <span className="text-[10px] font-mono-tech">{likedPosts[postIdx] ? '241' : '240'}</span>
                    </button>
                    <MessageCircle className="w-4 h-4 text-[#eedecf]" />
                    <Share2 className="w-4 h-4 text-[#eedecf]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 4. AUTHENTIC EXTRA PHONE APP RUNTIME VIEWPORT */
          <div className="p-4 rounded-2xl bg-[#14151a] border-2 border-[#382f23] space-y-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#272118] to-[#12110e] border border-[#c5a880] flex items-center justify-center text-[#c5a880] shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-royal text-sm font-bold text-white">
                  {app.name}
                </h3>
                <p className="text-[10px] font-mono-tech text-[#c5a880]">
                  Category: {app.category || 'Device Application'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#a6927d] leading-relaxed">
              {app.description ||
                'This application is running securely inside the vintage Aethelgard luxury OS viewport, maintaining your chosen custom settings and royal antique aesthetics.'}
            </p>

            <div className="p-3 bg-[#0a0b0e] rounded-xl border border-[#2b251d] text-xs font-mono-tech text-[#8c735d] space-y-1">
              <div className="flex justify-between">
                <span>RUNTIME STATE:</span>
                <span className="text-emerald-400 font-bold">SYNCHRONIZED</span>
              </div>
              <div className="flex justify-between">
                <span>CHASSIS INTEGRITY:</span>
                <span className="text-[#c5a880] font-bold">UNALTERED ROYAL CASING</span>
              </div>
              <div className="flex justify-between">
                <span>SECURITY ENCLAVE:</span>
                <span className="text-sky-400 font-bold">ENCRYPTED HARDWARE SLOT</span>
              </div>
            </div>

            <button
              onClick={() => {
                hapticMicro();
                playRoyalBellChime();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#ad8f65] text-black font-serif-royal font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>App Operational (Interface Protected)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
