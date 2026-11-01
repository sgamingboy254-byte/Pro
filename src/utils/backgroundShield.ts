/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppId, AppSessionConfig } from '../types/os';
import { triggerHaptic, hapticSolarBlocked } from './haptics';
import { playClickSound, playStudyBellAlarm } from './audio';

export interface SolarRuleViolation {
  attemptedApp?: AppId | string;
  attemptedAppName?: string;
  attemptedUrl?: string;
  reason: 'study_mode_distraction_blocked' | 'app_not_allowed_in_background' | 'shorts_prohibited';
  timestamp: number;
}

const STORAGE_KEY_BG_RUNNING = 'royal_solar_background_running';
const STORAGE_KEY_SOLAR_SESSION = 'royal_solar_session_config';

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error(e);
    }
  });
}

// Prohibited distraction apps and games during Study Time Duration
export const PROHIBITED_STUDY_APPS = [
  'youtube',
  'instagram',
  'snapchat',
  'pinterest',
  'printers',
  'freefire',
  'free fire max',
  'roblox',
  'free fire india',
  'freefireindia',
  'minecraft',
  'coc',
  'clash of clans',
  'cod',
  'call of duty',
  'snake',
  'colour_memory',
];

class SolarBackgroundShieldManager {
  private isBackgroundRunning = false;
  private currentViolation: SolarRuleViolation | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_BG_RUNNING);
      this.isBackgroundRunning = stored === 'true';
    }
  }

  public subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  public getIsBackgroundRunning(): boolean {
    return this.isBackgroundRunning;
  }

  public setBackgroundRunning(running: boolean) {
    this.isBackgroundRunning = running;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BG_RUNNING, running ? 'true' : 'false');
    }
    notifyListeners();
  }

  public getSavedSession(): AppSessionConfig | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY_SOLAR_SESSION);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data);
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        return parsed;
      }
      this.clearSession();
      return null;
    } catch (e) {
      return null;
    }
  }

  public saveSession(session: AppSessionConfig) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SOLAR_SESSION, JSON.stringify(session));
    }
  }

  public clearSession(triggerRing = false) {
    if (triggerRing) {
      playStudyBellAlarm();
      triggerHaptic([120, 60, 120, 60, 200]);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SOLAR_SESSION);
      localStorage.setItem(STORAGE_KEY_BG_RUNNING, 'false');
    }
    this.isBackgroundRunning = false;
    notifyListeners();
  }

  public isStudyModeActive(): boolean {
    const session = this.getSavedSession();
    return Boolean(session && Date.now() < session.expiresAt);
  }

  /**
   * Check if an app is one of the prohibited distraction apps during study time
   * (YouTube, Instagram, Snapchat, Pinterest, Free Fire Max, Roblox, Free Fire India, Minecraft, CoC, COD, and all games)
   */
  public isDistractionApp(appId: AppId | string, appName?: string): boolean {
    const idLower = String(appId).toLowerCase().trim();
    const nameLower = (appName || '').toLowerCase().trim();

    // Check specific apps
    if (
      idLower === 'youtube' ||
      idLower === 'snake' ||
      idLower === 'colour_memory'
    ) {
      return true;
    }

    // Check name or keyword match
    const checkString = `${idLower} ${nameLower}`;
    const blockedKeywords = [
      'youtube',
      'instagram',
      'snapchat',
      'pinterest',
      'printer',
      'free fire',
      'freefire',
      'roblox',
      'minecraft',
      'coc',
      'clash of clans',
      'cod',
      'call of duty',
      'snake',
      'colour memory',
      'game',
      'arcade',
    ];

    return blockedKeywords.some((keyword) => checkString.includes(keyword));
  }

  /**
   * Intercept attempts to open prohibited apps during Study Time Duration or Background Mode
   */
  public checkCanOpenApp(appId: AppId, appName?: string): { allowed: boolean; violation?: SolarRuleViolation } {
    const isStudyActive = this.isStudyModeActive();

    // If Study Time Duration is running, prohibit YouTube, Instagram, Snapchat, Pinterest, and all games!
    if (isStudyActive && this.isDistractionApp(appId, appName)) {
      const violation: SolarRuleViolation = {
        attemptedApp: appId,
        attemptedAppName: appName,
        reason: 'study_mode_distraction_blocked',
        timestamp: Date.now(),
      };
      this.currentViolation = violation;
      hapticSolarBlocked();
      notifyListeners();
      return { allowed: false, violation };
    }

    // If background mode is active
    if (this.isBackgroundRunning) {
      if (this.isDistractionApp(appId, appName)) {
        const violation: SolarRuleViolation = {
          attemptedApp: appId,
          attemptedAppName: appName,
          reason: 'study_mode_distraction_blocked',
          timestamp: Date.now(),
        };
        this.currentViolation = violation;
        hapticSolarBlocked();
        notifyListeners();
        return { allowed: false, violation };
      }
    }

    return { allowed: true };
  }

  /**
   * Solar Rules: Shorts are strictly prohibited on YouTube!
   */
  public isShortsQueryOrUrl(input: string): boolean {
    if (!input) return false;
    const lower = input.toLowerCase().trim();
    const shortsPattern = /(\/shorts\/|youtube\.com\/shorts|youtu\.be\/shorts|#shorts?|\bshorts?\b|\breels?\b|\btiktok\b)/i;
    return shortsPattern.test(lower);
  }

  public registerShortsViolation(attemptedUrlOrQuery: string) {
    const violation: SolarRuleViolation = {
      attemptedUrl: attemptedUrlOrQuery,
      reason: 'shorts_prohibited',
      timestamp: Date.now(),
    };
    this.currentViolation = violation;
    hapticSolarBlocked();
    notifyListeners();
  }

  public getCurrentViolation(): SolarRuleViolation | null {
    return this.currentViolation;
  }

  public clearViolation() {
    this.currentViolation = null;
    notifyListeners();
  }
}

export const solarBackgroundShield = new SolarBackgroundShieldManager();
