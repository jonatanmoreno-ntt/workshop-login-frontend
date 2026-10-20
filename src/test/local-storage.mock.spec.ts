import { describe, expect, it } from 'vitest';
import { installLocalStorageMock } from './local-storage.mock';

describe('installLocalStorageMock', () => {
  it('instala localStorage si no existe y mantiene comportamiento idempotente', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      writable: true,
      configurable: true
    });

    installLocalStorageMock();
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');

    installLocalStorageMock();
    expect(localStorage.getItem('k')).toBe('v');

    if (descriptor) {
      Object.defineProperty(globalThis, 'localStorage', descriptor);
    }
  });
});
