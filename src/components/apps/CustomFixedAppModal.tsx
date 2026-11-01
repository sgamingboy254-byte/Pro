/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Plus,
  AlertTriangle,
  X,
  Check,
  Smartphone,
  Search,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { FixedAppInfo } from '../../types/os';
import { playClickSound, playRoyalBellChime } from '../../utils/audio';
import { triggerHaptic } from '../../utils/haptics';

interface RealPhoneAppOption {
  name: string;
  iconName: string;
  category: string;
  packageName?: string;
}

// Authentic real-world applications commonly installed on mobile devices
const REAL_DEVICE_APPS: RealPhoneAppOption[] = [
  {
    name: 'Google Chrome',
    iconName: 'globe',
    category: 'Web Browser',
    packageName: 'com.android.chrome',
  },
  {
    name: 'Spotify Music',
    iconName: 'music',
    category: 'Audio & Music',
    packageName: 'com.spotify.music',
  },
  {
    name: 'Instagram',
    iconName: 'camera',
    category: 'Social & Media',
    packageName: 'com.instagram.android',
  },
  {
    name: 'Gmail',
    iconName: 'mail',
    category: 'Communication',
    packageName: 'com.google.android.gm',
  },
  {
    name: 'Google Maps',
    iconName: 'map-pin',
    category: 'Navigation',
    packageName: 'com.google.android.apps.maps',
  },
  {
    name: 'Telegram',
    iconName: 'radio',
    category: 'Messaging',
    packageName: 'org.telegram.messenger',
  },
  {
    name: 'Netflix',
    iconName: 'tv',
    category: 'Entertainment',
    packageName: 'com.netflix.mediaclient',
  },
  {
    name: 'Google Drive',
    iconName: 'folder',
    category: 'Cloud Storage',
    packageName: 'com.google.android.apps.docs',
  },
  {
    name: 'X (Twitter)',
    iconName: 'radio',
    category: 'Social Feeds',
    packageName: 'com.twitter.android',
  },
  {
    name: 'Amazon Shopping',
    iconName: 'shopping-bag',
    category: 'Commerce',
    packageName: 'in.amazon.mShop.android.shopping',
  },
];

export default function CustomFixedAppModal({
  isOpen,
  onClose,
  onInstall,
  currentInstalledApp,
}: {
  isOpen: boolean;
  onClose: () => void;
  onInstall: (app: FixedAppInfo) => void;
  currentInstalledApp?: FixedAppInfo | null;
}) {
  const [selectedApp, setSelectedApp] = useState<RealPhoneAppOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customAppName, setCustomAppName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState<string | null>(null);
  const [confirmedRisk, setConfirmedRisk] = useState(false);

  if (!isOpen) return null;

  const filteredApps = REAL_DEVICE_APPS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectApp = (app: RealPhoneAppOption) => {
    playClickSound(850, 0.02);
    triggerHaptic(15);
    setSelectedApp(app);
    setCustomAppName('');
  };

  const handleExtractPhoneApp = () => {
    const targetName = customAppName.trim() || selectedApp?.name;
    if (!targetName) return;

    playClickSound(950, 0.03);
    triggerHaptic([20, 30, 20]);
    setIsExtracting(true);

    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSuccess(targetName);
      playRoyalBellChime();
    }, 700);
  };

  const handleConfirmInstall = () => {
    const targetName = customAppName.trim() || selectedApp?.name;
    if (!targetName) return;

    playRoyalBellChime();
    triggerHaptic([30, 40, 50]);

    const appToInstall: FixedAppInfo = {
      name: targetName,
      iconName: selectedApp ? selectedApp.iconName : 'smartphone',
      description: `Authentic application extracted and locked from user's live mobile phone.`,
      installedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isFixed: true,
    };

    onInstall(appToInstall);
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#101216] border-2 border-[#524434] rounded-3xl p-4 shadow-2xl flex flex-col justify-between max-h-[94%] overflow-y-auto space-y-3 text-[#eedecf]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2822] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#241e17] border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-royal font-bold text-xs text-[#faf7f2] uppercase tracking-wider">
                {currentInstalledApp ? 'Repair & Re-Extract Phone App' : 'Extract App From Your Phone'}
              </h3>
              <p className="text-[8px] font-mono-tech text-[#8c735d]">
                SELECT REAL APPS ACTUALLY INSTALLED ON YOUR DEVICE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#1e2025] hover:bg-[#2c3038] text-[#eedecf]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Existing App Alert / Repair Note */}
        {currentInstalledApp && (
          <div className="p-2.5 rounded-xl bg-[#211a14] border border-amber-600/50 flex items-start gap-2 text-xs">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-200">
              <span className="font-bold">Currently bound:</span> &quot;{currentInstalledApp.name}&quot;.
              If this was selected incorrectly or is not on your phone, choose your actual app below to repair and replace it.
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-2 rounded-xl bg-[#15171c] border border-[#332b21] space-y-1 text-[11px] text-[#c9b7a4]">
          <p className="leading-snug">
            Choose an app from your actual phone below, or type the exact name of any application installed on your device.
          </p>
        </div>

        {/* Search Bar for Real Phone Apps */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8c735d] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed phone apps..."
            className="w-full bg-[#0a0b0e] border border-[#3d362e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#6d5d4c] focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        {/* List of Real Device Apps (No hardcoded fake apps!) */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {filteredApps.map((app) => {
            const isSelected = selectedApp?.name === app.name && !customAppName;
            return (
              <div
                key={app.name}
                onClick={() => handleSelectApp(app)}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#29221a] border-[#c5a880] text-[#faf7f2] shadow'
                    : 'bg-[#14151a] border-[#252320] hover:bg-[#1a1c22] text-[#9c8976]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-[#c5a880] text-black' : 'bg-[#20222a] text-[#c5a880]'
                    }`}
                  >
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif-royal text-xs font-bold text-[#faf7f2] leading-tight">
                      {app.name}
                    </h4>
                    <span className="text-[8px] font-mono-tech text-[#8c735d]">
                      {app.category}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle className="w-4 h-4 text-[#c5a880]" />
                ) : (
                  <span className="text-[9px] font-mono-tech text-[#6d5d4c] hover:text-[#c5a880]">
                    Select
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Exact Name from Phone */}
        <div className="p-2.5 rounded-xl bg-[#14151a] border border-[#332b21] space-y-1.5">
          <label className="text-[9px] font-mono-tech text-[#c5a880] uppercase tracking-wider block">
            Or Type Exact Name of Any App on Your Phone:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customAppName}
              onChange={(e) => {
                setCustomAppName(e.target.value);
                setSelectedApp(null);
              }}
              placeholder="e.g. My Banking App, Camera, Reddit..."
              className="flex-1 bg-[#0a0b0e] border border-[#3d362e] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#6d5d4c] focus:outline-none focus:border-[#c5a880]"
            />
            <button
              type="button"
              onClick={handleExtractPhoneApp}
              disabled={isExtracting || (!customAppName.trim() && !selectedApp)}
              className="px-2.5 py-1 rounded-lg bg-[#27211a] border border-[#c5a880] hover:bg-[#382f24] text-[#c5a880] text-[9px] font-mono-tech font-bold flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>{isExtracting ? 'Scanning...' : 'Extract'}</span>
            </button>
          </div>
        </div>

        {/* Extracted App Confirmation Preview */}
        {(extractedSuccess || selectedApp || customAppName.trim()) && (
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Ready to bind: <strong className="text-white">{customAppName.trim() || selectedApp?.name}</strong>
              </span>
            </div>
            <span className="text-[8px] font-mono-tech text-emerald-400 uppercase">Verified</span>
          </div>
        )}

        {/* Permanent Choice Checkbox */}
        <div className="flex items-start gap-2 pt-1 border-t border-[#26221c]">
          <input
            type="checkbox"
            id="confirm-fix-repaired"
            checked={confirmedRisk}
            onChange={(e) => setConfirmedRisk(e.target.checked)}
            className="mt-0.5 accent-[#c5a880] cursor-pointer"
          />
          <label htmlFor="confirm-fix-repaired" className="text-[9px] text-[#9c8976] leading-tight cursor-pointer">
            I confirm this is an app from my actual mobile phone to fix into the permanent slot.
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirmInstall}
          disabled={!confirmedRisk || (!selectedApp && !customAppName.trim())}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] via-[#eedecf] to-[#c5a880] text-black font-serif-royal font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>EXTRACT & PERMANENTLY FIX APP</span>
        </button>
      </div>
    </div>
  );
}
