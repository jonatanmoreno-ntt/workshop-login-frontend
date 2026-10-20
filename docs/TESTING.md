# Testing del flujo login y tareas

Este documento traza las pruebas implementadas contra el contrato vigente en docs/ENDPOINTS.md.

## Matriz de pruebas

| flujo | caso | tipo | resultado esperado |
|---|---|---|---|
| Login | Credenciales validas y navegacion a dashboard | Camino feliz | LoginComponent llama AuthService, guarda preferencias y navega a /dashboard |
| Tareas | Sesion valida y carga de tareas | Camino feliz | DashboardComponent llama TasksService con owner+token y pinta tareas visibles |
| Login | Usuario vacio | Caso borde | No se llama al servicio y se muestra "Ingrese un usuario." |
| Login | Contrasena vacia | Caso borde | No se llama al servicio y se muestra "Ingrese una contraseña." |
| Login | Respuesta 2xx sin token | Caso borde | AuthService lanza "El backend respondió sin token." y la UI lo muestra |
| Login | Backend caido (error de red) | Error | Se muestra mensaje de error de autenticacion con detalle del fallo |
| Login | Timeout simulado | Error | Se muestra mensaje de error de autenticacion con detalle de timeout |
| Tareas | Token invalido (401) | Error | TasksService rechaza y Dashboard muestra "No se pudo cargar el dashboard." |
| Tareas | Backend caido (error de red) | Error | Dashboard muestra el mensaje de error proveniente del fallo de red |
| Tareas | Timeout simulado | Error | Dashboard muestra el mensaje de timeout recibido |

## Codigo de los tests

### src/app/login/login.component.spec.ts

```ts
it('llama servicio de auth y navega al dashboard', async () => {
  const component = new LoginComponent(router, authService, sessionService);
  component.username = 'student';
  component.password = 'Workshop123!';

  await component.login();

  expect(authService.login).toHaveBeenCalledWith({ username: 'student', password: 'Workshop123!' });
  expect(sessionService.savePreferences).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith(['/dashboard']);
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
```

### src/app/services/auth.service.spec.ts

```ts
it('lanza error cuando respuesta exitosa no trae token', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(createResponse({ user: { username: 'student' } }));

  const service = new AuthService(sessionService);

  await expect(service.login({ username: 'student', password: 'Workshop123!' })).rejects.toThrow(
    'El backend respondió sin token.'
  );
});
```

### src/app/dashboard/dashboard.component.spec.ts

```ts
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
```

### src/app/services/tasks.service.spec.ts

```ts
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
```

## Ejecucion real

### Ejecucion 1

- Comando: npm test -- --run
- Directorio: C:\Users\Usuario\Documents\T60146-jonatan-moreno-leyva\reqflow-workspace\workshop-login-frontend
- Codigo de salida: 0
- Resultado: 10 files passed, 0 failed; 36 tests passed, 0 failed.

### Ejecucion 2

- Comando: npm run test:coverage
- Directorio: C:\Users\Usuario\Documents\T60146-jonatan-moreno-leyva\reqflow-workspace\workshop-login-frontend
- Codigo de salida: 0
- Resultado: 10 files passed, 0 failed; 36 tests passed, 0 failed.
- Cobertura global: Lines 98.08% | Statements 98.08% | Functions 90.62% | Branches 93.5%
- Meta REGLAS.md (>=85% en codigo modificado): Cumplida.

## Fallos

- Ningun fallo en la ultima ejecucion.

## Pendientes

- Timeout real no esta implementado a nivel de producto (no hay AbortController ni politica de timeout en servicios). Las pruebas de timeout actuales simulan rechazo de red con mensaje de timeout para validar reaccion de UI.

## Pruebas propuestas

- Prueba de integracion de timeout real cuando exista una politica explicita de cancelacion/timeout en AuthService y TasksService.
- Prueba de UX diferenciada para 401 vs 5xx en dashboard, si producto decide mensajes distintos.

## Documentos consultados

- docs/ENDPOINTS.md
- REGLAS.md
- package.json
- src/app/login/login.component.spec.ts
- src/app/dashboard/dashboard.component.spec.ts
- src/app/services/auth.service.spec.ts
- src/app/services/tasks.service.spec.ts
