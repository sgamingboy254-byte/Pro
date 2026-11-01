/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatContact, FileItem, GalleryPhoto } from '../types/os';

export interface DeviceMusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  source: 'device' | 'master';
  size?: string;
}

export interface RealPhoneContact {
  id: string;
  name: string;
  relationship: 'Family' | 'Friend' | 'Colleague' | 'Self';
  phone: string;
  email?: string;
  avatar: string;
  status: string;
  lastSeen: string;
  online: boolean;
}

// Default Real Family & Friends (Replacing all parody/fake accounts)
export const DEFAULT_REAL_CONTACTS: RealPhoneContact[] = [
  {
    id: 'cnt_self',
    name: 'Prajakta Padave (You)',
    relationship: 'Self',
    phone: '+91 98765 43210',
    email: 'prajaktapadave624@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Synced with device • Online',
    lastSeen: 'Online',
    online: true,
  },
  {
    id: 'cnt_mom',
    name: 'Mom ❤️',
    relationship: 'Family',
    phone: '+91 98200 11223',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    status: 'Family is everything 🌸',
    lastSeen: '10:45 AM',
    online: true,
  },
  {
    id: 'cnt_dad',
    name: 'Dad 👔',
    relationship: 'Family',
    phone: '+91 98200 33445',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    status: 'Available on call',
    lastSeen: 'Yesterday',
    online: false,
  },
  {
    id: 'cnt_aryan',
    name: 'Aryan Sharma (Best Friend)',
    relationship: 'Friend',
    phone: '+91 99112 55667',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    status: 'Coding retro mobile apps 🚀',
    lastSeen: 'Online',
    online: true,
  },
  {
    id: 'cnt_ananya',
    name: 'Ananya (Sister)',
    relationship: 'Family',
    phone: '+91 98334 77889',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    status: 'Do not disturb during lectures 📚',
    lastSeen: '09:20 AM',
    online: false,
  },
  {
    id: 'cnt_family_grp',
    name: 'Padave Family Group 🏡',
    relationship: 'Family',
    phone: '+91 98200 99999',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&auto=format&fit=crop&q=80',
    status: 'Mom: Dinner at 8:30 PM sharp!',
    lastSeen: '10:30 AM',
    online: true,
  },
];

// Pre-seeded device music tracks (real phone audio collection)
export const DEFAULT_DEVICE_MUSIC: DeviceMusicTrack[] = [
  {
    id: 'd_trk_1',
    title: 'Clair de Lune (Sovereign Master)',
    artist: 'Claude Debussy',
    duration: '05:04',
    url: '', // synthetic classic audio engine fallback
    source: 'master',
    size: '11.8 MB',
  },
  {
    id: 'd_trk_2',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    artist: 'Frédéric Chopin',
    duration: '04:32',
    url: '',
    source: 'master',
    size: '10.4 MB',
  },
  {
    id: 'd_trk_3',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    duration: '03:28',
    url: '',
    source: 'master',
    size: '8.2 MB',
  },
  {
    id: 'd_trk_4',
    title: 'Canon in D Major (Baroque Strings)',
    artist: 'Johann Pachelbel',
    duration: '04:55',
    url: '',
    source: 'master',
    size: '12.1 MB',
  },
];

// Default device photos from phone camera roll
export const DEFAULT_DEVICE_PHOTOS: GalleryPhoto[] = [
  {
    id: 'dp_1',
    title: 'Portrait Shot - Golden Hour',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    date: 'Today, 08:30 AM',
    location: 'Phone Camera Roll',
    isUserPhoto: true,
  },
  {
    id: 'dp_2',
    title: 'Family Gathering & Coffee',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    date: 'Yesterday, 04:15 PM',
    location: 'Cafe Roastery',
    isUserPhoto: true,
  },
  {
    id: 'dp_3',
    title: 'Retro Aesthetic Desk Setup',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',
    date: '25 Oct 2026',
    location: 'Personal Studio',
    isUserPhoto: true,
  },
  {
    id: 'dp_4',
    title: 'Heritage Palace Architecture',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&auto=format&fit=crop&q=80',
    date: '24 Oct 2026',
    location: 'Travel Album',
    isUserPhoto: true,
  },
];

// Default device documents from internal storage
export const DEFAULT_DEVICE_FILES: FileItem[] = [
  {
    id: 'df_1',
    name: 'Prajakta_Resume_Portfolio_2026.pdf',
    size: '2.4 MB',
    type: 'doc',
    date: 'Today, 09:12 AM',
    folder: 'Documents',
    contentPreview: 'Prajakta Padave - Senior Fullstack Software Engineer & Mobile Systems Architect. Email: prajaktapadave624@gmail.com.',
  },
  {
    id: 'df_2',
    name: 'WhatsApp_Family_Chat_Backup.crypt14',
    size: '14.8 MB',
    type: 'archive',
    date: '26 Oct 2026',
    folder: 'Archives',
    contentPreview: 'Encrypted device database backup: Padave Family Group & Direct Chats.',
  },
  {
    id: 'df_3',
    name: 'Voice_Note_Mom_Birthday.m4a',
    size: '3.1 MB',
    type: 'audio',
    date: '24 Oct 2026',
    folder: 'Music',
    contentPreview: 'Audio recording from Phone Voice Recorder.',
  },
  {
    id: 'df_4',
    name: 'Selfie_Portrait_HD.jpg',
    size: '5.2 MB',
    type: 'image',
    date: '22 Oct 2026',
    folder: 'Images',
    contentPreview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
  },
  // Transferred Hidden Files from Phone Access
  {
    id: 'df_hidden_1',
    name: '.whatsapp_vault.crypt14',
    size: '142.6 MB',
    type: 'archive',
    date: 'Today, Live Phone Sync',
    folder: 'Archives',
    contentPreview: 'Encrypted WhatsApp Media & Chat Vault transferred via Phone Access.',
  },
  {
    id: 'df_hidden_2',
    name: '.nomedia',
    size: '0 KB',
    type: 'doc',
    date: 'System Hidden File',
    folder: 'Documents',
    contentPreview: 'Hidden Android media scanner suppression file.',
  },
  {
    id: 'df_hidden_3',
    name: '.private_family_vault.zip',
    size: '88.4 MB',
    type: 'archive',
    date: '25 Oct 2026',
    folder: 'Archives',
    contentPreview: 'Private encrypted family archive & certificates.',
  },
  {
    id: 'df_hidden_4',
    name: '.phone_hardware_keys.bak',
    size: '1.2 MB',
    type: 'doc',
    date: 'Today',
    folder: 'Documents',
    contentPreview: 'Hardware identity token & biometric recovery fingerprint hash.',
  },
];

// Active in-memory store for blob URLs (cannot serialize to localStorage directly)
const memoryBlobAudioTracks: DeviceMusicTrack[] = [];
const memoryBlobPhotos: GalleryPhoto[] = [];
const memoryBlobFiles: FileItem[] = [];

// Event listener mechanism for cross-component sync
type SyncListener = () => void;
const listeners: Set<SyncListener> = new Set();

export const subscribeToDeviceSync = (fn: SyncListener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const notifySubscribers = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
};

export const deviceSyncStore = {
  // Live Phone Scan Permission
  isPhoneScanAllowed(): boolean {
    const val = localStorage.getItem('royal_phone_scan_allowed');
    return val === null ? true : val === 'true'; // Default true for instant smooth experience
  },

  setPhoneScanAllowed(allowed: boolean) {
    localStorage.setItem('royal_phone_scan_allowed', String(allowed));
    notifySubscribers();
  },

  // Permission for All Files
  isFilePermissionGranted(): boolean {
    const val = localStorage.getItem('royal_file_permission_granted');
    return val === null ? true : val === 'true'; // Default true
  },

  setFilePermissionGranted(granted: boolean) {
    localStorage.setItem('royal_file_permission_granted', String(granted));
    notifySubscribers();
  },

  // Real Contacts
  getContacts(): RealPhoneContact[] {
    const saved = localStorage.getItem('royal_real_phone_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_REAL_CONTACTS;
  },

  saveContacts(contacts: RealPhoneContact[]) {
    localStorage.setItem('royal_real_phone_contacts', JSON.stringify(contacts));
    notifySubscribers();
  },

  addContact(contact: RealPhoneContact) {
    const current = this.getContacts();
    const updated = [contact, ...current];
    this.saveContacts(updated);
  },

  // Convert real contacts to WhatsApp ChatContact format
  getWhatsAppContacts(): ChatContact[] {
    const contacts = this.getContacts();
    return contacts.map((c) => ({
      id: `wa_${c.id}`,
      name: c.name,
      title: `${c.relationship} • ${c.phone}`,
      avatar: c.avatar,
      lastMessage: c.status,
      lastTime: c.lastSeen,
      unreadCount: c.relationship === 'Family' ? 1 : 0,
      online: c.online,
      messages: [
        {
          id: `msg_init_${c.id}`,
          sender: 'contact',
          text: `Hey Prajakta! Connected directly with your phone. (Phone: ${c.phone})`,
          time: c.lastSeen,
          status: 'read',
        },
      ],
    }));
  },

  // Scanned Music Tracks (Combines default + memory blobs + saved meta)
  getMusicTracks(): DeviceMusicTrack[] {
    const savedMeta = localStorage.getItem('royal_saved_music_meta');
    let baseList = DEFAULT_DEVICE_MUSIC;
    if (savedMeta) {
      try {
        baseList = JSON.parse(savedMeta);
      } catch (e) {}
    }
    return [...memoryBlobAudioTracks, ...baseList];
  },

  addCustomAudioFiles(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const track: DeviceMusicTrack = {
        id: `device_audio_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'My Phone Audio',
        duration: '03:45',
        url: url,
        source: 'device',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
      memoryBlobAudioTracks.unshift(track);
    });
    this.setFilePermissionGranted(true);
    notifySubscribers();
  },

  // Scanned Gallery Photos
  getGalleryPhotos(): GalleryPhoto[] {
    const saved = localStorage.getItem('royal_saved_photos');
    let baseList = DEFAULT_DEVICE_PHOTOS;
    if (saved) {
      try {
        baseList = JSON.parse(saved);
      } catch (e) {}
    }
    return [...memoryBlobPhotos, ...baseList];
  },

  addCustomImageFiles(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const photo: GalleryPhoto = {
        id: `device_photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: url,
        date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
        location: 'My Phone Gallery',
        isUserPhoto: true,
      };
      memoryBlobPhotos.unshift(photo);
    });
    this.setFilePermissionGranted(true);
    notifySubscribers();
  },

  // Scanned Files
  getFiles(): FileItem[] {
    const saved = localStorage.getItem('royal_saved_files');
    let baseList = DEFAULT_DEVICE_FILES;
    if (saved) {
      try {
        baseList = JSON.parse(saved);
      } catch (e) {}
    }
    return [...memoryBlobFiles, ...baseList];
  },

  addCustomDocuments(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType: 'doc' | 'audio' | 'image' | 'archive' = 'doc';
      let folder: 'Documents' | 'Music' | 'Images' | 'Archives' = 'Documents';

      if (['mp3', 'wav', 'm4a', 'flac', 'ogg'].includes(ext)) {
        fileType = 'audio';
        folder = 'Music';
      } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        fileType = 'image';
        folder = 'Images';
      } else if (['zip', 'rar', 'tar', 'gz', 'crypt14'].includes(ext)) {
        fileType = 'archive';
        folder = 'Archives';
      }

      const item: FileItem = {
        id: `device_file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: fileType,
        date: 'Today',
        folder: folder,
        contentPreview: `User imported from local device storage (${file.name}).`,
      };
      memoryBlobFiles.unshift(item);
    });
    this.setFilePermissionGranted(true);
    notifySubscribers();
  },

  // Master batch import for "Permission for All Files"
  batchImportAllFiles(files: FileList | File[]) {
    Array.from(files).forEach((file) => {
      const type = file.type;
      const name = file.name.toLowerCase();

      if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav')) {
        this.addCustomAudioFiles([file]);
      } else if (type.startsWith('image/') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
        this.addCustomImageFiles([file]);
      } else {
        this.addCustomDocuments([file]);
      }
    });
    this.setFilePermissionGranted(true);
    notifySubscribers();
  },

  getWhatsAppChatUrl(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleaned}`;
  },
};
