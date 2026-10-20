import { describe, expect, it } from 'vitest';
import { formatTaskLabel } from './legacy-format';

describe('formatTaskLabel', () => {
  it('formats priority and owner', () => {
    expect(formatTaskLabel({ priority: 'high', owner: 'student' })).toBe('HIGH · STUDENT');
  });

  it('returns safe defaults for missing task values', () => {
    expect(formatTaskLabel(null)).toBe('SIN-DATOS');
    expect(formatTaskLabel({ priority: '', owner: '' })).toBe('NORMAL · SIN-ASIGNAR');
  });
});
