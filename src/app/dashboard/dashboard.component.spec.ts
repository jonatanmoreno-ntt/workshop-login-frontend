import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { SessionService } from '../services/session.service';
import { TasksService } from '../services/tasks.service';
import { installLocalStorageMock } from '../../test/local-storage.mock';

installLocalStorageMock();

describe('DashboardComponent', () => {
  const navigate = vi.fn(async () => true);
  const router = { navigate } as any;
  const cdr = { detectChanges: vi.fn() } as any;
  const zone = { run: (fn: () => void) => fn() } as any;
  const sessionService = {
    getToken: vi.fn(() => 'token-123'),
    getUser: vi.fn(() => ({ username: 'student', displayName: 'Student' })),
    clearSession: vi.fn()
  } as unknown as SessionService;
  const tasksService = {
    getTasksByOwner: vi.fn(async () => []),
    toVisibleTasks: vi.fn(() => [])
  } as unknown as TasksService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('consulta tareas con token y owner mediante servicio', async () => {
    const tasks = [
      { title: 'A', description: 'A', status: 'ARCHIVED', priority: 'HIGH', owner: 'student' },
      { title: 'B', description: 'B', status: 'TODO', priority: 'LOW', owner: 'student' }
    ];
    (tasksService.getTasksByOwner as any).mockResolvedValueOnce(tasks);
    (tasksService.toVisibleTasks as any).mockReturnValueOnce([tasks[1]]);

    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);
    await component.ngOnInit();

    expect(tasksService.getTasksByOwner).toHaveBeenCalledWith('student', 'token-123');
    expect(tasksService.toVisibleTasks).toHaveBeenCalledWith(tasks);
    expect(component.visibleTasks).toHaveLength(1);
    expect(component.visibleTasks[0].title).toBe('B');
  });

  it('redirige a login cuando no hay sesion activa', async () => {
    (sessionService.getToken as any).mockReturnValueOnce(null);
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.ngOnInit();

    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(tasksService.getTasksByOwner).not.toHaveBeenCalled();
  });

  it('hace logout y limpia sesion en SessionService', async () => {
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.logout();

    expect(sessionService.clearSession).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('traduce estados conocidos y conserva estado desconocido', () => {
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    expect(component.statusLabel('TODO')).toBe('Por hacer');
    expect(component.statusLabel('custom')).toBe('custom');
  });

  it('muestra mensaje fallback cuando falla carga con error desconocido', async () => {
    (tasksService.getTasksByOwner as any).mockRejectedValueOnce({});
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.ngOnInit();

    expect(component.error).toBe('No se pudo cargar el dashboard.');
  });

  it('muestra error cuando token es invalido y el servicio rechaza la consulta', async () => {
    (tasksService.getTasksByOwner as any).mockRejectedValueOnce(new Error('No se pudo cargar el dashboard.'));
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.ngOnInit();

    expect(component.error).toBe('No se pudo cargar el dashboard.');
  });

  it('muestra error cuando backend de tareas esta caido', async () => {
    (tasksService.getTasksByOwner as any).mockRejectedValueOnce(new Error('Failed to fetch'));
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.ngOnInit();

    expect(component.error).toBe('Failed to fetch');
  });

  it('muestra error de timeout cuando tareas excede tiempo de espera', async () => {
    (tasksService.getTasksByOwner as any).mockRejectedValueOnce(new Error('TimeoutError: request timed out'));
    const component = new DashboardComponent(router, cdr, zone, sessionService, tasksService);

    await component.ngOnInit();

    expect(component.error).toBe('TimeoutError: request timed out');
  });
});
