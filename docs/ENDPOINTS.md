# Endpoints externos consumidos por el frontend

Este documento describe el comportamiento actual del codigo refactorizado para consumo de endpoints externos.

## Flujo funcional vigente

1. Usuario ingresa credenciales en `/login`.
2. `LoginComponent` llama a `AuthService.login()`.
3. Si login es exitoso, `SessionService` guarda token y usuario en memoria (no en `localStorage`) y la UI navega a `/dashboard`.
4. `DashboardComponent` toma token/usuario desde `SessionService` y llama a `TasksService.getTasksByOwner()`.
5. En logout, `DashboardComponent` limpia sesion via `SessionService.clearSession()` y navega a `/login`.

## Endpoint 1: Login

### 1) Quien lo llama

- Llamador directo: `AuthService.login(credentials)`.
- Invocador de UI: `LoginComponent.login()`.

### 2) Que envia

Metodo y URL:

- `POST http://localhost:8080/auth/login`

Headers:

| Header | Valor | Obligatorio |
|---|---|---|
| Content-Type | application/json | Si |

Body JSON:

| Campo | Tipo | Fuente en UI | Obligatorio |
|---|---|---|---|
| username | string | Input usuario | Si |
| password | string | Input contrasena | Si |
| client | string | Config (`environment.authClient`) | Si |

Ejemplo real de request:

```http
POST /auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
   "username": "student",
   "password": "Workshop123!",
   "client": "angular-workshop"
}
```

### 3) Que espera recibir en exito

Estado esperado:

- Cualquier `2xx` (`response.ok === true`).

Body esperado:

| Campo | Tipo | Uso en frontend | Obligatorio |
|---|---|---|---|
| token | string | Se guarda en sesion en memoria (`SessionService.setSession`) | Si |
| user | object | Se guarda en sesion y se muestra en dashboard | Si |
| user.username | string | Owner para consulta de tareas | Si |
| user.displayName | string | Saludo en dashboard (`Hola, ...`) | No |

Ejemplo real de response exitosa:

```json
{
   "token": "token-123",
   "user": {
      "username": "student",
      "displayName": "Student"
   }
}
```

Si la respuesta es `2xx` pero falta `token` o `user`, se considera respuesta inesperada y se trata como error.

### 4) Reaccion ante errores posibles en UI

| Caso | Deteccion en codigo | Reaccion de UI |
|---|---|---|
| Credenciales invalidas / backend responde no-2xx con `message` | `AuthService` lanza `Error(data.message)` cuando `response.ok === false` | `LoginComponent` muestra: `No se pudo autenticar a <usuario>. <message>` en `.message` |
| Backend responde no-2xx sin `message` | `AuthService` usa fallback `No se pudo autenticar. Verifica tus credenciales.` | `LoginComponent` muestra ese fallback al usuario |
| Respuesta inesperada (2xx sin `token` o sin `user`) | `AuthService` lanza `El backend respondió sin token.` | `LoginComponent` muestra: `No se pudo autenticar a <usuario>. El backend respondió sin token.` |
| Error no tipado/no esperado | `LoginComponent.resolveErrorMessage()` devuelve `Error desconocido.` | `LoginComponent` muestra: `No se pudo autenticar a <usuario>. Error desconocido.` |
| Timeout | No hay timeout explicito configurado en `fetch` | Ver pregunta abierta |

Comportamiento adicional de UI en login:

- Mientras corre la solicitud: `busy = true`, boton deshabilitado y texto `Ingresando...`.
- Al terminar (exito o error): `busy = false`.

### 5) Notas de seguridad relevantes

- Ya no se usa `[innerHTML]` para mensajes; la UI renderiza `{{ message.text }}` como texto.
- El token no se persiste en `localStorage`; vive en memoria dentro de `SessionService`.
- `localStorage` se usa solo para preferencias no sensibles (`workshop_preferences`).

Pregunta abierta:

- El codigo no define timeout ni estrategia de reintento/cancelacion para `fetch` en login. Si se requiere un SLA de tiempo de espera, falta especificacion de producto.

## Endpoint 2: Tareas

### 1) Quien lo llama

- Llamador directo: `TasksService.getTasksByOwner(owner, token)`.
- Invocador de UI: `DashboardComponent.ngOnInit()` (solo si hay token y usuario en sesion).

### 2) Que envia

Metodo y URL:

- `GET http://localhost:8000/api/tasks?owner=<username>`

Headers:

| Header | Valor | Obligatorio |
|---|---|---|
| Authorization | Bearer `<token>` | Si |

Query params:

| Parametro | Tipo | Fuente | Obligatorio |
|---|---|---|---|
| owner | string | `session.user.username` | Si |

Ejemplo real de request:

```http
GET /api/tasks?owner=student HTTP/1.1
Host: localhost:8000
Authorization: Bearer token-123
```

### 3) Que espera recibir en exito

Estado esperado:

- Cualquier `2xx` (`response.ok === true`).

Body esperado:

- Arreglo JSON de tareas.

Campos usados por el frontend por tarea:

| Campo | Tipo | Uso en frontend | Obligatorio para render |
|---|---|---|---|
| title | string | Titulo de tarjeta | Si |
| description | string | Descripcion de tarjeta | Si |
| status | string | Badge + traduccion de estado | Si |
| priority | string | Orden y etiqueta (`HIGH`, `MEDIUM`, `LOW`, otros) | Si |
| owner | string | Parte de `label` formateado | Si |

Ejemplo real de response exitosa:

```json
[
   {
      "title": "Revisar formulario",
      "description": "Validar campos obligatorios",
      "status": "TODO",
      "priority": "HIGH",
      "owner": "student"
   },
   {
      "title": "Actualizar estilos",
      "description": "Alinear tipografia",
      "status": "DONE",
      "priority": "LOW",
      "owner": "student"
   }
]
```

Post-proceso de UI:

- Se excluyen tareas con `status === "ARCHIVED"`.
- Se agrega `label` formateado (`PRIORITY · OWNER`).
- Se ordena por prioridad (`HIGH > MEDIUM > LOW > desconocida`).

### 4) Reaccion ante errores posibles en UI

| Caso | Deteccion en codigo | Reaccion de UI |
|---|---|---|
| Token ausente o usuario ausente en sesion | `DashboardComponent` valida `!token || !user?.username` | Redirige inmediatamente a `/login`, no llama endpoint |
| Token invalido / expirado (normalmente 401) | `TasksService` detecta `response.ok === false` y lanza `No se pudo cargar el dashboard.` | Dashboard muestra mensaje en `<p class="error">No se pudo cargar el dashboard.</p>` |
| Error HTTP general (4xx/5xx) | Igual ruta que arriba (`!response.ok`) | Mismo mensaje de error en dashboard |
| Error no tipado/no esperado | `DashboardComponent.resolveErrorMessage()` usa fallback | Dashboard muestra `No se pudo cargar el dashboard.` |
| Timeout | No hay timeout explicito configurado en `fetch` | Ver pregunta abierta |

Comportamiento adicional de UI en dashboard:

- Mientras carga: muestra skeleton (`loading = true`).
- Al resolver (exito o error): `loading = false` y dispara `detectChanges()`.

### 5) Notas de seguridad relevantes

- El endpoint de tareas recibe token por header Authorization, obtenido desde `SessionService` en memoria.
- El componente no lee ni escribe token directamente en `localStorage`.
- Si no hay sesion valida en memoria, no intenta consumir tareas y redirige a login.

Pregunta abierta:

- El codigo no distingue visualmente entre token invalido (401) y otros errores de backend/red; ambos se muestran con el mismo mensaje generico. Si se requiere UX diferenciada, falta especificacion.

## Documentos y fuentes consultadas

- `docs/ENDPOINTS.md` (version previa)
- `src/environments/environment.ts`
- `src/app/services/auth.service.ts`
- `src/app/services/tasks.service.ts`
- `src/app/services/session.service.ts`
- `src/app/login/login.component.ts`
- `src/app/login/login.component.html`
- `src/app/dashboard/dashboard.component.ts`
- `src/app/dashboard/dashboard.component.html`
- `src/app/services/auth.service.spec.ts`
- `src/app/services/tasks.service.spec.ts`
- `src/app/login/login.component.spec.ts`
- `src/app/dashboard/dashboard.component.spec.ts`
