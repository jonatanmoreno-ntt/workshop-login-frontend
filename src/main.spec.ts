import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const bootstrapApplication = vi.fn(() => ({
  catch: vi.fn()
}));

vi.mock('@angular/platform-browser', () => ({
  bootstrapApplication
}));

describe('main bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('inicializa AppComponent con providers del router', async () => {
    await import('./main');

    expect(bootstrapApplication).toHaveBeenCalledTimes(1);
    expect(bootstrapApplication).toHaveBeenCalledWith(expect.anything(), {
      providers: expect.any(Array)
    });
  });
});
