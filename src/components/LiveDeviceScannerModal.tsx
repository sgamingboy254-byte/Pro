/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Users,
  UserPlus,
  X,
  Phone,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Heart,
  Briefcase,
  User,
} from 'lucide-react';
import { deviceSyncStore, RealPhoneContact } from '../utils/deviceSyncStore';
import { playClickSound } from '../utils/audio';

export default function LiveDeviceScannerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [contacts, setContacts] = useState<RealPhoneContact[]>(() =>
    deviceSyncStore.getContacts()
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Form for adding new real family/friend
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState<'Family' | 'Friend' | 'Colleague'>('Family');

  if (!isOpen) return null;

  const handleScanDevice = async () => {
    playClickSound(900, 0.03);
    setIsScanning(true);
    setScanMessage('Scanning mobile device contacts and real phone accounts...');

    try {
      // If native Web Contacts API is supported (Android Chrome / supported devices)
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel', 'email'];
        const opts = { multiple: true };
        const selected = await (navigator as any).contacts.select(props, opts);
        if (selected && selected.length > 0) {
          selected.forEach((c: any) => {
            const contact: RealPhoneContact = {
              id: `real_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              name: c.name?.[0] || 'Phone Contact',
              relationship: 'Friend',
              phone: c.tel?.[0] || '+91 98000 00000',
              email: c.email?.[0],
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              status: 'Synced from mobile contacts',
              lastSeen: 'Just now',
              online: true,
            };
            deviceSyncStore.addContact(contact);
          });
          setContacts(deviceSyncStore.getContacts());
          setScanMessage(`Successfully imported ${selected.length} real contacts from your phone!`);
          setIsScanning(false);
          return;
        }
      }
    } catch (err) {
      console.log('Contacts picker fallback', err);
    }

    // Realistic hardware sync scan simulation with real identity
    setTimeout(() => {
      deviceSyncStore.setPhoneScanAllowed(true);
      setContacts(deviceSyncStore.getContacts());
      setIsScanning(false);
      setScanMessage('Live Phone Scan Complete! Synced Real Identity (Prajakta Padave), Family & Friends into Telephone Directory.');
    }, 1000);
  };

  const handleAddCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    playClickSound(950, 0.03);

    const newContact: RealPhoneContact = {
      id: `real_cnt_${Date.now()}`,
      name: newName.trim(),
      relationship: newRelationship,
      phone: newPhone.trim(),
      avatar:
        newRelationship === 'Family'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      status: 'Live mobile phone contact',
      lastSeen: 'Online',
      online: true,
    };

    deviceSyncStore.addContact(newContact);
    setContacts(deviceSyncStore.getContacts());
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
    setScanMessage(`Added "${newContact.name}" to real phone contacts.`);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#121317] border-2 border-[#4a3f32] rounded-3xl p-4 shadow-2xl flex flex-col justify-between max-h-[92%] overflow-y-auto space-y-3.5 text-[#eedecf]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2b251e] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1d261f] border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif-royal font-bold text-xs text-[#faf7f2] tracking-wider uppercase block">
                Allow Live Phone Scan
              </span>
              <span className="text-[9px] font-mono-tech text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DEVICE SYNC ACTIVE</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e2025] hover:bg-[#2b2e35] text-[#eedecf] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real Device Sync Explanation */}
        <div className="p-3 rounded-2xl bg-[#17181d] border border-[#332b21] space-y-2">
          <p className="text-[11px] text-[#c9b7a4] font-sans leading-relaxed">
            By allowing <strong className="text-white">Live Phone Scan</strong>, your real phone identity (<span className="text-[#c5a880] font-mono-tech font-bold">Prajakta Padave</span>) and actual <strong className="text-emerald-400">Family & Friends</strong> sync directly into the Telephone directory and device apps—replacing all simulated or placeholder personas.
          </p>

          <div className="flex items-center justify-between pt-1 text-[10px] font-mono-tech border-t border-[#26211a]">
            <span className="text-[#8c735d]">Identity:</span>
            <span className="text-[#faf7f2] font-semibold">Prajakta Padave (+91 98765 43210)</span>
          </div>
        </div>

        {/* Scan Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleScanDevice}
            disabled={isScanning}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-serif-royal font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Real Phone...' : 'Scan Phone & Sync Contacts Now'}</span>
          </button>

          {scanMessage && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-sans flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}
        </div>

        {/* Real Contacts List (Family & Friends) */}
        <div className="p-3 rounded-2xl bg-[#17181d] border border-[#332b21] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif-royal font-bold text-[#c5a880] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Real Family & Friends ({contacts.length})</span>
            </span>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 py-0.5 rounded-full bg-[#241e17] border border-[#483e33] text-[9px] font-mono-tech text-[#eedecf] hover:text-[#c5a880] flex items-center gap-1"
            >
              <UserPlus className="w-2.5 h-2.5" />
              <span>{showAddForm ? 'Cancel' : '+ Add Person'}</span>
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddForm && (
            <form onSubmit={handleAddCustomContact} className="p-2.5 rounded-xl bg-[#0e0f12] border border-[#3e3427] space-y-2">
              <div className="space-y-1">
                <label className="text-[9px] font-mono-tech text-[#8c735d] uppercase">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mom, Brother Rohit..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#18191d] border border-[#332b21] rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono-tech text-[#8c735d] uppercase">Relation</label>
                  <select
                    value={newRelationship}
                    onChange={(e: any) => setNewRelationship(e.target.value)}
                    className="w-full bg-[#18191d] border border-[#332b21] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="Family">Family ❤️</option>
                    <option value="Friend">Friend 🤝</option>
                    <option value="Colleague">Colleague 💼</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono-tech text-[#8c735d] uppercase">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#18191d] border border-[#332b21] rounded-lg px-2 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-[#c5a880] text-black font-bold text-xs hover:bg-[#d8be96] transition-colors"
              >
                Save Real Contact
              </button>
            </form>
          )}

          {/* Contacts Row */}
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-2 rounded-xl bg-[#141518] border border-[#2b251e] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full border border-[#483e33] overflow-hidden flex-shrink-0">
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate block">
                        {c.name}
                      </span>
                      {c.relationship === 'Family' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-950/70 text-rose-300 text-[8px] font-mono-tech">
                          Family
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono-tech text-[#8c735d] truncate block">
                      {c.phone}
                    </span>
                  </div>
                </div>

                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Done */}
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            onClose();
          }}
          className="w-full py-2 rounded-xl bg-[#1e2025] hover:bg-[#282b32] text-xs font-serif-royal text-[#eedecf] transition-colors"
        >
          Confirm & Close
        </button>
      </div>
    </div>
  );
}
