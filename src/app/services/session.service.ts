import { Injectable } from '@angular/core';
import { SESSION_STORAGE_KEYS } from '../config/session-keys';
import { UserPreferences, UserSession } from '../models/auth.models';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  showTips: true,
  compact: false
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  private token: string | null = null;
  private user: UserSession | null = null;

  getPreferences(): UserPreferences {
    const rawValue = localStorage.getItem(SESSION_STORAGE_KEYS.preferences);
    if (!rawValue) {
      return { ...DEFAULT_PREFERENCES };
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<UserPreferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed
      };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  savePreferences(preferences: UserPreferences): void {
    localStorage.setItem(SESSION_STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }

  setSession(token: string, user: UserSession): void {
    this.token = token;
    this.user = user;
  }

  clearSession(): void {
    this.token = null;
    this.user = null;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): UserSession | null {
    return this.user;
  }
}
