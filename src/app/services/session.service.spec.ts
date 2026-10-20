import { beforeEach, describe, expect, it } from 'vitest';
import { SessionService } from './session.service';
import { installLocalStorageMock } from '../../test/local-storage.mock';

installLocalStorageMock();

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y recupera token y usuario en memoria', () => {
    const service = new SessionService();
    service.setSession('token-123', { username: 'student', displayName: 'Student' });

    expect(service.getToken()).toBe('token-123');
    expect(service.getUser()).toEqual({ username: 'student', displayName: 'Student' });

    service.clearSession();

    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('maneja preferencias con fallback seguro', () => {
    const service = new SessionService();
    localStorage.setItem('workshop_preferences', '{bad json');

    const prefs = service.getPreferences();

    expect(prefs).toEqual({ theme: 'light', showTips: true, compact: false });
  });

  it('mezcla preferencias guardadas con defaults', () => {
    const service = new SessionService();
    service.savePreferences({ theme: 'dark', showTips: false, compact: true });

    const prefs = service.getPreferences();

    expect(prefs).toEqual({ theme: 'dark', showTips: false, compact: true });
  });
});
