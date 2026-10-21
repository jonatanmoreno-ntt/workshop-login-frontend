import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskItem } from '../models/task.models';
import { TasksService } from './tasks.service';

function createResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

describe('TasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('consume GET /api/tasks con owner y bearer token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse([]));

    const service = new TasksService();
    await service.getTasksByOwner('student', 'token-123');

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tasks?owner=student', {
      headers: { Authorization: 'Bearer token-123' }
    });
  });

  it('filtra ARCHIVED y ordena por prioridad con label', () => {
    const service = new TasksService();
    const tasks: TaskItem[] = [
      { title: 'T1', description: 'a', status: 'TODO', priority: 'LOW', owner: 'student' },
      { title: 'T2', description: 'b', status: 'ARCHIVED', priority: 'HIGH', owner: 'student' },
      { title: 'T3', description: 'c', status: 'DONE', priority: 'HIGH', owner: 'student' }
    ];

    const visible = service.toVisibleTasks(tasks);

    expect(visible).toHaveLength(2);
    expect(visible[0].title).toBe('T3');
    expect(visible[1].title).toBe('T1');
    expect(visible[0].label).toBe('HIGH · STUDENT');
  });

  it('lanza error cuando falla la consulta de tareas', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({}, false, 500));

    const service = new TasksService();

    await expect(service.getTasksByOwner('student', 'token-123')).rejects.toThrow('No se pudo cargar el dashboard.');
  });

  it('lanza error cuando token es invalido (401)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createResponse({ detail: 'Unauthorized' }, false, 401));

    const service = new TasksService();

    await expect(service.getTasksByOwner('student', 'token-123')).rejects.toThrow('No se pudo cargar el dashboard.');
  });

  it('propaga error de timeout cuando tareas excede tiempo de espera', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('TimeoutError: request timed out'));

    const service = new TasksService();

    await expect(service.getTasksByOwner('student', 'token-123')).rejects.toThrow('TimeoutError: request timed out');
  });

  it('ordena prioridades desconocidas al final', () => {
    const service = new TasksService();
    const tasks: TaskItem[] = [
      { title: 'X', description: 'x', status: 'TODO', priority: 'UNKNOWN', owner: 'student' },
      { title: 'Y', description: 'y', status: 'TODO', priority: 'HIGH', owner: 'student' }
    ];

    const visible = service.toVisibleTasks(tasks);

    expect(visible[0].title).toBe('Y');
    expect(visible[1].title).toBe('X');
  });
});
