import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('app routes', () => {
  it('define rutas de login y dashboard', () => {
    const paths = routes.map((route) => route.path);
    expect(paths).toContain('login');
    expect(paths).toContain('dashboard');
    expect(paths).toContain('');
    expect(paths).toContain('**');
  });
});
