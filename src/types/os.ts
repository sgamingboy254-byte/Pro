export type AppId =
  | 'phone'
  | 'music'
  | 'youtube'
  | 'notes'
  | 'files'
  | 'gallery'
  | 'whatsapp'
  | 'gemini'
  | 'camera'
  | 'clock'
  | 'calendar'
  | 'calculator'
  | 'snake'
  | 'colour_memory'
  | 'custom_app';

export interface AppDefinition {
  id: AppId;
  name: string;
  subtitle: string;
  iconName: string;
  category: 'media' | 'utility' | 'communication' | 'productivity' | 'system';
  isFixedSlot?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  pinned: boolean;
  pdfData?: {
    name: string;
    size: string;
    url?: string;
    pageCount?: number;
    extractedText?: string;
  };
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'doc' | 'audio' | 'image' | 'archive';
  date: string;
  folder: 'Documents' | 'Music' | 'Images' | 'Archives';
  contentPreview?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  url: string;
  date: string;
  location: string;
  isUserPhoto?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatContact {
  id: string;
  name: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'banquet' | 'diplomatic' | 'finance' | 'personal';
}

export interface FixedAppInfo {
  name: string;
  iconName: string;
  description: string;
  installedAt: string;
  isFixed: true;
  category?: string;
}

export interface AppExplanationPerson {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  roleExplanation: string;
  syncedServices: string[];
}

export interface AppSessionConfig {
  appId: AppId;
  durationMinutes: number; // 5 to 120 (max 2 hours)
  startedAt: number; // timestamp
  expiresAt: number; // timestamp
}

export interface UserDeviceProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isSynced: boolean;
}

