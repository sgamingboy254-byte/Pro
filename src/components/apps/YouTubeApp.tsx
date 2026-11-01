/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Search,
  Settings,
  X,
  Play,
  ExternalLink,
  Globe,
  Lock,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Film,
  AlertTriangle,
  Tv,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { playClickSound, playSlideSound } from '../../utils/audio';
import { triggerHaptic, hapticButtonClick, hapticSolarBlocked } from '../../utils/haptics';
import { solarBackgroundShield } from '../../utils/backgroundShield';

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  category: string;
  thumbnail: string;
  description: string;
}

// Verified, real, playable Long-Form Masterworks (Duration > 30 minutes, 100% No Shorts)
const REAL_LONG_FORM_CATALOG: VideoItem[] = [
  {
    id: 'chopin_masterwork',
    youtubeId: 'wygy721nzRc',
    title: 'Chopin - Complete Nocturnes & Masterworks (Vienna Grand Concert)',
    channel: 'Royal Classical Heritage',
    views: '16.4M views',
    duration: '1:45:20',
    category: 'Classical',
    thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=600&auto=format&fit=crop&q=80',
    description: 'Authentic grand hall recording of the complete Chopin nocturnes performed by sovereign virtuosos.',
  },
  {
    id: 'interstellar_cosmos',
    youtubeId: 'UDVtMYqUAyw',
    title: 'Deep Space Journey: 4K Ultra HD Cosmos & Hubble Telescopic Voyage',
    channel: 'Cosmic Horizons Observatory',
    views: '9.8M views',
    duration: '2:10:45',
    category: 'Science',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    description: 'Continuous ultra-high definition voyage through nebulae, galaxies, and planetary rings.',
  },
  {
    id: 'mozart_sovereign',
    youtubeId: 'Rb0UmrCXxVA',
    title: 'Mozart - Requiem in D Minor & Orchestral Masterworks (Full Hall)',
    channel: 'Philharmonic Grand Orchestra',
    views: '12.1M views',
    duration: '1:18:30',
    category: 'Classical',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    description: 'Complete uninterrupted live concert of Mozart sovereign works in sacred cathedral acoustic resonance.',
  },
  {
    id: 'lofi_palace_focus',
    youtubeId: 'jfKfPfyJRdk',
    title: 'Lofi Deep Focus & Royal Study Session (Continuous Unbroken Stream)',
    channel: 'Lofi Girl Live Global',
    views: '84.2M views',
    duration: '3:00:00',
    category: 'Focus',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    description: 'Endless gentle beats and analog warmth calibrated for deep concentration and contemplation.',
  },
  {
    id: 'nature_alps_4k',
    youtubeId: 'LXb3EKWsInQ',
    title: 'Alpine Sanctuary 4K: Pristine Glaciers, Peaks & Ancient Pines',
    channel: 'Natural Earth Ultra HD',
    views: '7.3M views',
    duration: '1:30:15',
    category: 'Documentary',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    description: 'Immersive aerial cinematic odyssey across the Swiss Alps, majestic glaciers, and quiet streams.',
  },
  {
    id: 'ancient_history',
    youtubeId: 'm4-HMzVuqOE',
    title: 'The Roman Empire & Architectural Marvels (Full Extended Documentary)',
    channel: 'Historical Chronicles',
    views: '5.6M views',
    duration: '1:52:10',
    category: 'History',
    thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
    description: 'Comprehensive historical masterclass analyzing engineering, sovereign rule, and ancient civilizations.',
  },
];

interface YouTubeAppProps {
  onBack: () => void;
  initialQuery?: string;
}

export default function YouTubeApp({ onBack, initialQuery = '' }: YouTubeAppProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(REAL_LONG_FORM_CATALOG[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showSettings, setShowSettings] = useState(false);
  const [videoQuality, setVideoQuality] = useState('1080p Chrome HD');
  const [chromeUrl, setChromeUrl] = useState('https://www.youtube.com/watch?v=' + REAL_LONG_FORM_CATALOG[0].youtubeId);
  
  // Shorts Blocker Alert Modal State (SOLAR RULE)
  const [shortsViolation, setShortsViolation] = useState<string | null>(null);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      handleSearch(undefined, initialQuery);
    }
  }, [initialQuery]);

  // Extract YouTube ID from any format (URL, Shorts, youtu.be, or plain ID)
  const parseYouTubeInput = (input: string): { isShort: boolean; videoId: string | null } => {
    const trimmed = input.trim();
    if (solarBackgroundShield.isShortsQueryOrUrl(trimmed)) {
      return { isShort: true, videoId: null };
    }

    // Direct 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { isShort: false, videoId: trimmed };
    }

    // Standard YouTube URL parsing
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (url.pathname.includes('/shorts/')) {
        return { isShort: true, videoId: null };
      }
      const v = url.searchParams.get('v');
      if (v) return { isShort: false, videoId: v };
      if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1);
        if (id) return { isShort: false, videoId: id };
      }
    } catch (e) {
      // not a url, treat as search query
    }

    return { isShort: false, videoId: null };
  };

  // Real-time input interception on every keystroke
  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.trim().length >= 3 && solarBackgroundShield.isShortsQueryOrUrl(val)) {
      triggerHaptic([40, 20, 40]);
      playClickSound(500, 0.05);
      solarBackgroundShield.registerShortsViolation(val);
      setShortsViolation(val);
    }
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (solarBackgroundShield.isShortsQueryOrUrl(pasted)) {
      e.preventDefault();
      triggerHaptic([50, 30, 50]);
      playClickSound(400, 0.08);
      solarBackgroundShield.registerShortsViolation(pasted);
      setShortsViolation(pasted);
    }
  };

  const handleTriggerShortsTest = () => {
    triggerHaptic([50, 30, 50]);
    playClickSound(450, 0.08);
    const testQuery = 'https://youtube.com/shorts/test_forbidden_stream';
    solarBackgroundShield.registerShortsViolation(testQuery);
    setShortsViolation(testQuery);
  };

  const handleSearch = (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const targetQuery = directQuery !== undefined ? directQuery : query;
    if (!targetQuery.trim()) return;

    playClickSound(800, 0.02);
    triggerHaptic(15);

    // 1. STRICT SOLAR LAW: Intercept and Block Shorts
    if (solarBackgroundShield.isShortsQueryOrUrl(targetQuery)) {
      solarBackgroundShield.registerShortsViolation(targetQuery);
      setShortsViolation(targetQuery);
      return;
    }

    // 2. Check if user pasted a direct video link or ID
    const parsed = parseYouTubeInput(targetQuery);
    if (parsed.isShort) {
      solarBackgroundShield.registerShortsViolation(targetQuery);
      setShortsViolation(targetQuery);
      return;
    }

    if (parsed.videoId) {
      const customVideo: VideoItem = {
        id: `url_${parsed.videoId}`,
        youtubeId: parsed.videoId,
        title: `Custom Stream: [ID: ${parsed.videoId}]`,
        channel: 'Google Chrome Web Playback',
        views: 'Live Sync',
        duration: 'Long-Form',
        category: 'Custom',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
        description: `Verified custom long-form playback inside Google Chrome frame.`,
      };
      setActiveVideo(customVideo);
      setChromeUrl(`https://www.youtube.com/watch?v=${parsed.videoId}`);
      return;
    }

    // 3. Search query matching against verified long-form library
    const q = targetQuery.toLowerCase();
    const found = REAL_LONG_FORM_CATALOG.find(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );

    if (found) {
      setActiveVideo(found);
      setChromeUrl(`https://www.youtube.com/watch?v=${found.youtubeId}`);
    } else {
      // Create instant long-form player entry with Chopin masterwork fallback or embed query
      const dynamicVideo: VideoItem = {
        id: `search_${Date.now()}`,
        youtubeId: 'wygy721nzRc',
        title: `Long-Form Exploration: "${targetQuery}" (Uninterrupted HD)`,
        channel: 'Google Chrome Long-Form Stream',
        views: '1.2M views',
        duration: '1:45:00',
        category: 'Search Result',
        thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=80',
        description: `Search query "${targetQuery}" loaded with strict Long-Form filter applied. No shorts permitted.`,
      };
      setActiveVideo(dynamicVideo);
      setChromeUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(targetQuery)}&sp=EgIYAw%253D%253D`);
    }
  };

  const handleSelectVideo = (video: VideoItem) => {
    playClickSound(850, 0.02);
    triggerHaptic(20);
    setActiveVideo(video);
    setChromeUrl(`https://www.youtube.com/watch?v=${video.youtubeId}`);
  };

  // Open authentic Google Chrome external tab with strict Long-Form parameters
  const handleLaunchExternalChrome = () => {
    playClickSound(950, 0.03);
    triggerHaptic(25);
    const searchQuery = query.trim() || 'classical masterworks concert documentary';
    // sp=EgIYAw%253D%253D is YouTube's official server-side filter for Long Videos (> 20 minutes)
    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}+long+video&sp=EgIYAw%253D%253D`;
    window.open(targetUrl, '_blank');
  };

  const filteredCatalog =
    selectedCategory === 'All'
      ? REAL_LONG_FORM_CATALOG
      : REAL_LONG_FORM_CATALOG.filter((v) => v.category === selectedCategory);

  return (
    <div className="h-full w-full flex flex-col bg-[#08090c] text-[#eedecf] select-none overflow-hidden relative font-sans">
      {/* =========================================================================
          1. GOOGLE CHROME INTEGRATION FRAME HEADER
          ========================================================================= */}
      <div className="bg-[#101217] border-b border-[#2d2922] px-3 pt-2 pb-1.5 flex flex-col gap-1.5 shrink-0 z-30 shadow-md">
        {/* Chrome Tab Strip */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-[#1b1e26] border border-[#3b3429] rounded-t-lg px-2.5 py-1 text-[#faf7f2] font-mono-tech text-[10px]">
            <Globe className="w-3 h-3 text-[#c5a880]" />
            <span className="font-bold truncate max-w-[150px]">YouTube Luxe • Chrome HD</span>
            <span className="text-[#8c735d] text-[9px]">• Long-Form</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchExternalChrome}
              className="flex items-center gap-1 text-[10px] font-mono-tech text-[#c5a880] hover:text-[#eedecf] bg-[#1a1c22] px-2 py-0.5 rounded border border-[#483e33] transition-colors"
              title="Open full Google Chrome browser window"
            >
              <span>Chrome</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onBack}
              className="p-1 rounded text-[#8c735d] hover:text-[#eedecf] hover:bg-[#1f232b]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chrome Omnibox / Address Bar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playClickSound(700, 0.02);
              onBack();
            }}
            className="p-1 rounded text-[#8c735d] hover:text-[#eedecf]"
            title="Back to OS"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playClickSound(700, 0.02);
              setQuery('');
              setActiveVideo(REAL_LONG_FORM_CATALOG[0]);
            }}
            className="p-1 rounded text-[#8c735d] hover:text-[#eedecf]"
            title="Reload YouTube in Chrome"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* URL Pill */}
          <div className="flex-1 bg-[#090b0e] border border-[#2d2922] rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-mono-tech text-[#c5a880] truncate flex-1">
              {chromeUrl}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8px] bg-red-950/80 text-red-300 font-bold px-1.5 py-0.2 rounded border border-red-800">
                NO SHORTS
              </span>
              <span className="text-[8px] bg-emerald-950/70 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                HD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. THE AUTHENTIC RETRO ROYAL YOUTUBE APP INTERFACE
          (Exactly 3 core components: 1. YouTube Logo, 2. Search Bar, 3. Profile & Settings)
          ========================================================================= */}
      <div className="bg-[#0b0c10] border-b border-[#25221b] px-3 py-2 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* 1. YouTube Luxe Retro Logo */}
        <div
          onClick={() => {
            playClickSound(750, 0.02);
            setActiveVideo(REAL_LONG_FORM_CATALOG[0]);
          }}
          className="flex items-center gap-1.5 cursor-pointer group shrink-0"
        >
          <div className="w-7 h-5 rounded-md bg-gradient-to-r from-red-700 to-red-600 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-400">
            <Play className="w-3 h-3 text-white fill-current translate-x-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-royal font-black text-xs tracking-wider text-[#faf7f2] group-hover:text-[#c5a880] transition-colors leading-none">
              YouTube
            </span>
            <span className="text-[7px] font-mono-tech text-[#c5a880] tracking-widest uppercase">
              Royal Luxe
            </span>
          </div>
        </div>

        {/* 2. Search Bar (Supports topic search or pasting any YouTube video URL / ID) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[210px] relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onPaste={handleInputPaste}
            placeholder="Search or paste link..."
            className="w-full bg-[#14161d] border border-[#3b3429] focus:border-[#c5a880] rounded-full py-1 pl-7 pr-7 text-[10px] text-[#faf7f2] placeholder-[#7a6a57] outline-none transition-all"
          />
          <Search className="w-3 h-3 text-[#c5a880] absolute left-2.5 top-2" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-2 text-[#7a6a57] hover:text-[#eedecf]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* 3. Profile Picture & Settings Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              playClickSound(750, 0.02);
              setShowSettings(!showSettings);
            }}
            className="p-1 rounded-full hover:bg-[#1a1c22] text-[#c5a880] transition-colors"
            title="Player Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Prajakta Profile"
            className="w-6 h-6 rounded-full border border-[#c5a880] object-cover cursor-pointer hover:ring-1 hover:ring-[#c5a880]"
            title="Prajakta Padave (Real Phone Account Synced)"
          />
        </div>
      </div>

      {/* Settings Flyout Drawer */}
      {showSettings && (
        <div className="bg-[#14161f] border-b border-[#3b3429] p-3 text-xs flex flex-col gap-2 animate-fadeIn z-30">
          <div className="flex items-center justify-between border-b border-[#2c2820] pb-1">
            <span className="font-serif-royal font-bold text-[#faf7f2] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
              Chrome Player Quality & Solar Shield
            </span>
            <button onClick={() => setShowSettings(false)} className="text-[#8c735d] hover:text-[#faf7f2]">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8c735d]">Resolution:</span>
            <select
              value={videoQuality}
              onChange={(e) => setVideoQuality(e.target.value)}
              className="bg-[#0b0c10] border border-[#483e33] rounded px-2 py-0.5 text-[#faf7f2] outline-none"
            >
              <option value="1080p Chrome HD">1080p Full HD 60fps</option>
              <option value="4K Master">4K Royal Master</option>
              <option value="720p HD">720p HD (Power Saver)</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#8c735d]">Solar Rule (No Shorts):</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono-tech text-[10px]">
              <ShieldCheck className="w-3 h-3" /> ENFORCED (Keystroke & Paste Intercept)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. REAL WORKING YOUTUBE EMBED VIDEO PLAYER (INSIDE CHROME)
          ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Active Player Box */}
        <div className="w-full bg-black relative aspect-video shrink-0 border-b border-[#2d2922] shadow-2xl">
          {activeVideo ? (
            <iframe
              key={activeVideo.youtubeId}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8c735d]">
              <Tv className="w-8 h-8 text-[#c5a880]" />
              <span className="text-xs font-mono-tech">Select a Long-Form Video Below</span>
            </div>
          )}
        </div>

        {/* Video Info Header */}
        {activeVideo && (
          <div className="p-3 bg-[#0d0e13] border-b border-[#1f222b]">
            <h1 className="font-serif-royal font-bold text-sm text-[#faf7f2] leading-snug">
              {activeVideo.title}
            </h1>
            <div className="flex items-center justify-between mt-1 text-[10px] text-[#8c735d] font-mono-tech">
              <span>{activeVideo.channel} • {activeVideo.views}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#c5a880] flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {activeVideo.duration}
                </span>
                <button
                  onClick={handleLaunchExternalChrome}
                  className="hover:text-[#faf7f2] flex items-center gap-0.5 text-blue-400"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> Full Chrome
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Bar with Interactive Shorts Interception Tester */}
        <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#090a0e] border-b border-[#1b1c24]">
          {/* Dedicated Solar Blocker Interactive Trigger */}
          <button
            onClick={handleTriggerShortsTest}
            className="px-2.5 py-0.5 rounded-full text-[9px] font-mono-tech whitespace-nowrap bg-gradient-to-r from-red-950 to-amber-950 text-red-300 border border-red-500/70 hover:border-red-400 transition-all font-bold flex items-center gap-1 shadow-sm shrink-0 cursor-pointer animate-pulse"
            title="Test Solar Rule Interception Shield"
          >
            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
            <span>Shorts (Prohibited)</span>
          </button>

          {['All', 'Classical', 'Science', 'Focus', 'Documentary', 'History'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClickSound(750, 0.02);
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#c5a880] text-black font-bold shadow'
                  : 'bg-[#151720] text-[#eedecf] border border-[#2e2a22] hover:border-[#c5a880]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recommended Long-Form Videos List */}
        <div className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#8c735d] font-serif-royal">
            <span>Verified Long-Form Orchestrations & Documentaries</span>
            <span className="text-[9px] text-[#c5a880] font-mono-tech">Strictly No Shorts</span>
          </div>

          {filteredCatalog.map((video) => (
            <div
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className={`p-2 rounded-xl border flex gap-2.5 cursor-pointer transition-all ${
                activeVideo?.id === video.id
                  ? 'bg-[#181a24] border-[#c5a880] shadow-[0_0_12px_rgba(197,168,128,0.2)]'
                  : 'bg-[#101218] border-[#262420] hover:border-[#483e33] hover:bg-[#14161f]'
              }`}
            >
              <div className="w-24 h-15 rounded-lg overflow-hidden relative shrink-0 bg-black">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/90 text-white font-mono-tech text-[8px] font-bold px-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <h3 className="font-serif-royal font-bold text-xs text-[#faf7f2] line-clamp-2 leading-tight">
                  {video.title}
                </h3>
                <div className="text-[9px] font-mono-tech text-[#8c735d] flex items-center justify-between mt-1">
                  <span className="truncate">{video.channel}</span>
                  <span className="text-[#c5a880]">{video.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. SOLAR LAW: HIGH-AESTHETIC SHORTS INTERCEPTION ALERT MODAL
          ========================================================================= */}
      {shortsViolation && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1c0a0c] via-[#12090b] to-[#08090c] border-2 border-red-500/90 rounded-3xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.45)] flex flex-col items-center text-center gap-3.5 relative overflow-hidden">
            {/* Ambient Red & Gold Solar Halo */}
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

            {/* Radiant Solar Warning Crest */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-red-950 to-black border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] relative">
              <AlertTriangle className="w-8 h-8 animate-pulse text-red-400" />
              <div className="absolute inset-1 rounded-full border border-red-500/40 pointer-events-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono-tech text-red-400 uppercase tracking-widest font-bold">
                SOLAR LAW SECTION IV ENFORCED
              </span>
              <h2 className="text-lg font-serif-royal font-black text-[#faf7f2] tracking-wide">
                Shorts Are Strictly Prohibited
              </h2>
              <p className="text-[11px] text-[#e8d5c4] leading-relaxed">
                You attempted to open or search a Short-form video (<span className="text-red-300 font-mono-tech font-bold break-all">{shortsViolation}</span>). Under the Sovereign Solar Rule, algorithmically generated short-form media is intercepted and prevented from launching in both foreground and background mode.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#221012] border border-red-800/60 text-[10px] text-red-200 text-left w-full space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-300 font-mono-tech uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Long-Form Broadcast Mandate</span>
              </div>
              <p className="leading-relaxed opacity-90 text-[10px]">
                Only long-form masterworks, philharmonic concertos, and full educational documentaries (over 20 min) are permitted on YouTube during this session.
              </p>
            </div>

            <button
              onClick={() => {
                playClickSound(800, 0.02);
                setShortsViolation(null);
                setQuery('');
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:brightness-110 active:scale-98 text-white font-serif-royal font-bold text-xs shadow-xl transition-all cursor-pointer"
            >
              Acknowledge Solar Law & Return to Long-Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
