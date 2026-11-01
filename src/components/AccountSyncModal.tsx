import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  X,
  Camera,
  Crown,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { UserDeviceProfile } from '../types/os';
import { playClickSound, playRoyalBellChime } from '../utils/audio';
import { hapticSuccess, triggerHaptic } from '../utils/haptics';

const DEFAULT_PROFILE: UserDeviceProfile = {
  name: 'Prajakta Padave',
  email: 'prajaktapadave624@gmail.com',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  isSynced: true,
};

export default function AccountSyncModal({
  isOpen,
  onClose,
  onUpdateProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (profile: UserDeviceProfile) => void;
}) {
  const [profile, setProfile] = useState<UserDeviceProfile>(() => {
    const saved = localStorage.getItem('royal_device_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [specialCode, setSpecialCode] = useState<string>(() => {
    return localStorage.getItem('royal_data_saving_code') || '123456';
  });
  const [codeError, setCodeError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('royal_device_profile', JSON.stringify(profile));
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      setCodeError('First requirement: User name cannot be empty.');
      triggerHaptic(20);
      return;
    }

    if (specialCode.trim() !== '123456') {
      setCodeError('Special Code 123456 is required to authorize data saving.');
      triggerHaptic([40, 40]);
      return;
    }

    setCodeError(null);
    playClickSound(950, 0.03);
    playRoyalBellChime();
    hapticSuccess();

    localStorage.setItem('royal_device_user_name', profile.name.trim());
    localStorage.setItem('royal_data_saving_code', '123456');
    localStorage.setItem('royal_user_signed_in', 'true');

    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#121317] border-2 border-[#524434] rounded-3xl p-5 shadow-2xl space-y-4 text-[#eedecf]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2822] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#241e17] border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif-royal font-bold text-sm text-[#faf7f2]">
                Real Account & Identity Sync
              </h3>
              <p className="text-[9px] font-mono-tech text-[#c5a880]">
                DEVICE HARDWARE LINK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#1e2025] hover:bg-[#2b2f38] text-[#eedecf]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="p-3 rounded-xl bg-[#181a20] border border-emerald-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-serif-royal font-bold text-xs text-emerald-400 block">
              Active Phone Synchronization
            </span>
            <p className="text-[10px] text-[#9c8976] leading-tight">
              Real WhatsApp contacts, YouTube identity, and Google Gemini are tied to this profile.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-3">
          {/* Avatar Selector */}
          <div className="flex items-center gap-3 pb-1">
            <div className="relative w-14 h-14 rounded-full border-2 border-[#c5a880] overflow-hidden bg-black flex-shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-serif-royal text-[#c5a880] block">
                Profile Photo
              </span>
              <p className="text-[10px] text-[#8c735d]">
                Tap avatar to upload real photo from your phone.
              </p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-[#c5a880] font-bold block mb-1 flex items-center justify-between">
              <span>First: Real User Name</span>
              <span className="text-[8.5px] text-[#8c735d]">Identity Holder</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8c735d] absolute left-3 top-2.5" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => {
                  setProfile({ ...profile, name: e.target.value });
                  if (codeError) setCodeError(null);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#38332a] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-[#c5a880] font-bold block mb-1 flex items-center justify-between">
              <span>Second: Special Code (123456)</span>
              <span className="text-[8.5px] text-emerald-400 font-bold">Code: 123456</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#c5a880] absolute left-3 top-2.5" />
              <input
                type="text"
                value={specialCode}
                onChange={(e) => {
                  setSpecialCode(e.target.value);
                  if (codeError) setCodeError(null);
                }}
                placeholder="Enter 123456..."
                maxLength={10}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#38332a] text-xs text-white focus:outline-none focus:border-[#c5a880] font-mono-tech font-bold tracking-widest"
                required
              />
            </div>
          </div>

          {codeError && (
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[10px] font-serif-royal flex items-center gap-1.5 shadow-inner">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>{codeError}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono-tech text-[#8c735d] block mb-1">
              Google / Gemini / YouTube Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8c735d] absolute left-3 top-2.5" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#38332a] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-[#8c735d] block mb-1">
              Mobile Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8c735d] absolute left-3 top-2.5" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#38332a] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#c5a880] text-black font-serif-royal font-bold text-xs hover:bg-[#eedecf] transition-all flex items-center justify-center gap-1.5 shadow-lg mt-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-900" />
                <span>PROFILE SYNCHRONIZED</span>
              </>
            ) : (
              <span>SAVE REAL DEVICE PROFILE</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
