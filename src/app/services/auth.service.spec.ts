import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

function createResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

describe('AuthService', () => {
  const sessionService = {
    setSession: vi.fn()
  } as unknown as SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('consume POST /auth/login con payload esperado', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({
      token: 'token-123',
      user: { username: 'student', displayName: 'Student' }
    }));

    const service = new AuthService(sessionService);
    await service.login({ username: 'student', password: 'Workshop123!' });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'student',
        password: 'Workshop123!',
        client: 'angular-workshop'
      })
    });
    expect(sessionService.setSession).toHaveBeenCalledWith('token-123', {
      username: 'student',
      displayName: 'Student'
    });
  });

  it('normaliza error cuando backend rechaza credenciales', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({ message: 'Credenciales invalidas' }, false, 401));

    const service = new AuthService(sessionService);

    await expect(service.login({ username: 'student', password: 'bad' })).rejects.toThrow('Credenciales invalidas');
  });

  it('usa mensaje generico cuando backend no entrega detalle', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({}, false, 401));

    const service = new AuthService(sessionService);

    await expect(service.login({ username: 'student', password: 'bad' })).rejects.toThrow(
      'No se pudo autenticar. Verifica tus credenciales.'
    );
  });

  it('lanza error cuando respuesta exitosa no trae token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({ user: { username: 'student' } }));

    const service = new AuthService(sessionService);

    await expect(service.login({ username: 'student', password: 'Workshop123!' })).rejects.toThrow(
      'El backend respondió sin token.'
    );
  });

  it('propaga error cuando backend de login no esta disponible', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const service = new AuthService(sessionService);

    await expect(service.login({ username: 'student', password: 'Workshop123!' })).rejects.toThrow('Failed to fetch');
  });

  it('propaga error de timeout cuando login excede tiempo de espera', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('TimeoutError: request timed out'));

    const service = new AuthService(sessionService);

    await expect(service.login({ username: 'student', password: 'Workshop123!' })).rejects.toThrow(
      'TimeoutError: request timed out'
    );
  });
});
