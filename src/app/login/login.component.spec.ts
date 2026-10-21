import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { installLocalStorageMock } from '../../test/local-storage.mock';

installLocalStorageMock();

describe('LoginComponent', () => {
  const navigate = vi.fn(async () => true);
  const router = { navigate } as any;
  const authService = {
    login: vi.fn(async () => ({ username: 'student', displayName: 'Student' }))
  } as unknown as AuthService;
  const sessionService = {
    getPreferences: vi.fn(() => ({ theme: 'light', showTips: true, compact: false })),
    savePreferences: vi.fn()
  } as unknown as SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra validacion cuando usuario esta vacio', async () => {
    const component = new LoginComponent(router, authService, sessionService);
    component.username = '';
    component.password = 'Workshop123!';

    await component.login();

    expect(component.message?.text).toContain('Ingrese un usuario');
  });

  it('muestra validacion cuando contrasena esta vacia', async () => {
    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = '';

    await component.login();

    expect(component.message?.text).toContain('Ingrese una contraseña');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('llama servicio de auth y navega al dashboard', async () => {
    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = 'Workshop123!';

    await component.login();

    expect(authService.login).toHaveBeenCalledWith({ username: 'student', password: 'Workshop123!' });
    expect(sessionService.savePreferences).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('muestra mensaje como texto plano cuando falla login', async () => {
    (authService.login as any).mockRejectedValueOnce(new Error('<img src=x onerror=alert(1) />'));

    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = 'bad';

    await component.login();

    expect(component.message?.text).toContain('<img src=x onerror=alert(1) />');
    expect(component.message?.text).not.toContain('<strong>');
  });

  it('usa mensaje de fallback cuando error no es instancia de Error', async () => {
    (authService.login as any).mockRejectedValueOnce({});

    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = 'bad';

    await component.login();

    expect(component.message?.text).toContain('Error desconocido.');
  });

  it('muestra error cuando backend de login esta caido', async () => {
    (authService.login as any).mockRejectedValueOnce(new Error('Failed to fetch'));

    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = 'Workshop123!';

    await component.login();

    expect(component.message?.text).toContain('No se pudo autenticar a student. Failed to fetch');
  });

  it('muestra error de timeout cuando login excede tiempo de espera', async () => {
    (authService.login as any).mockRejectedValueOnce(new Error('TimeoutError: request timed out'));

    const component = new LoginComponent(router, authService, sessionService);
    component.username = 'student';
    component.password = 'Workshop123!';

    await component.login();

    expect(component.message?.text).toContain('TimeoutError: request timed out');
  });
});
