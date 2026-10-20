# Registro de prompts enviados (sesion actual)

## Prompt 1

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

CONTEXTO
Aplicacion Angular de login y dashboard (login.component.ts, dashboard.component.ts,
utils/legacy-format.ts). Lee primero README.md (como correrla), RETO.md (tabla de
hallazgos esperados), REGLAS.md (reglas del laboratorio) y docs/ENDPOINTS.md si
existe (si no, genéralo a partir del codigo). NO EDITES CODIGO todavia.

OBJETIVO
Mapear componentes, dependencias y el flujo de autenticacion completo (login ->
guardar token -> consultar tareas -> cerrar sesion), y generar HALLAZGOS.md: una
matriz de seguimiento con cada hallazgo de RETO.md que exista realmente en el
codigo, con evidencia archivo + linea.

RESTRICCIONES
No modifiques ningun archivo de codigo. No des por cierto un hallazgo que no
puedas senalar en el codigo con archivo y linea. No inventes resultados de
herramientas: distingue hallazgos confirmados de hipotesis. Respeta el flujo
funcional de docs/ENDPOINTS.md.

CRITERIOS DE ACEPTACION
Cada hallazgo de RETO.md queda en HALLAZGOS.md como una fila con: id (H-01, H-02...), hallazgo,
tipo (Vulnerabilidad / Bug / Refactor / Sugerencia — el que mejor describa el
hallazgo), explicacion breve del riesgo (que puede salir mal y por que),
evidencia (archivo:linea), severidad (alta/media/baja) y estado inicial
"Pendiente". Los hallazgos quedan ordenados de mayor a menor severidad. Si un
hallazgo de RETO.md no aparece en el codigo, se marca como "No encontrado".

FORMATO DE RESPUESTA
El archivo HALLAZGOS.md, con esta tabla:
id | hallazgo | tipo | explicacion | evidencia (archivo:linea) | severidad | estado
Sin tocar codigo todavia. HALLAZGOS.md es el unico lugar donde se lleva el
seguimiento: 2-refactor.md lo va a ir actualizando hallazgo por hallazgo.

## Prompt 2

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

Analiza este código antes de modificarlo.

CONTEXTO
Consulta primero:
- docs/ENDPOINTS.md: flujo y contratos a preservar
- docs/GOOD_PRACTICES.md: convenciones a las que debe converger el codigo
- REGLAS.md: reglas del laboratorio
- HALLAZGOS.md: hallazgos confirmados con su estado

OBJETIVO
Tomar de HALLAZGOS.md estos hallazgos marcados "Pendiente":
[IDs confirmados y motivo de seleccion; ejemplo: H-02 por riesgo alto y H-04
por alcance acotado, solo si esos IDs existen en tu matriz] y generar PLAN.md con la propuesta de
correccion para cada uno.

RESTRICCIONES
No cambies los contratos HTTP de docs/ENDPOINTS.md. No agregues dependencias
nuevas sin justificar. No asumas convenciones que no esten en
docs/GOOD_PRACTICES.md. No modifiques codigo todavia.

CRITERIOS DE ACEPTACION
PLAN.md tiene un apartado por hallazgo, con: que hallazgo de HALLAZGOS.md es,
el problema, el cambio propuesto (separacion de responsabilidades, tipado
estricto, manejo consistente de errores, o una alternativa acotada al token en
localStorage/al uso de [innerHTML], segun corresponda), los archivos a tocar,
y la prueba de caracterizacion a escribir antes de tocarlos. El contrato de
docs/ENDPOINTS.md se mantiene intacto. El cambio propuesto tambien respeta
las reglas de Clean Code de REGLAS.md (una responsabilidad por componente,
sin duplicacion, sin anidamiento profundo, sin valores magicos).

FORMATO DE RESPUESTA
Un archivo PLAN.md con esa estructura. No modifiques codigo todavia.

## Prompt 3

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

Ya leiste PLAN.md. Úsalo como guia.

CONTEXTO
PLAN.md tiene aprobacion humana registrada. Si falta, detente antes de editar codigo. docs/GOOD_PRACTICES.md sigue siendo la referencia de
como debe quedar el codigo.

OBJETIVO
Implementar unicamente lo que dice PLAN.md, hallazgo por hallazgo: la prueba de
caracterizacion primero, despues el cambio.

RESTRICCIONES
No apruebes cambios que muevan secretos al frontend. No agregues cambios fuera
de PLAN.md.

CRITERIOS DE ACEPTACION
El flujo funcional de docs/ENDPOINTS.md sigue funcionando igual (login, ver
tareas, cerrar sesion). Cobertura del codigo modificado en 85% o superior
(REGLAS.md). El codigo resultante respeta las reglas de Clean Code de
REGLAS.md, no solo el hallazgo puntual. Cada hallazgo resuelto queda marcado
"Resuelto" en HALLAZGOS.md, con una nota corta de como se resolvio.

FORMATO DE RESPUESTA
Por cada hallazgo: el diff conceptual, la caracterizacion antes y despues, y la prueba de correccion con resultados reales, y HALLAZGOS.md actualizado. Al finalizar, explica cualquier
desviacion del plan y los riesgos residuales si quedan.

## Prompt 4

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

CONTEXTO
Aplicacion Angular ya refactorizada. docs/ENDPOINTS.md tiene el flujo legacy
(defectos incluidos); hay que actualizarlo a como quedo el codigo hoy. Consulta
el codigo y los documentos del repositorio que consideres necesarios para
verificar cada campo. NO EDITES CODIGO, esto es solo documentacion.

OBJETIVO
Actualizar docs/ENDPOINTS.md para que un desarrollador que nunca vio esta
aplicacion entienda, sin leer el codigo fuente, que envia y que espera recibir
de cada endpoint externo que consume.

RESTRICCIONES
No inventes campos o comportamientos que no existan en el codigo. Si algo no
esta claro leyendo el codigo, márcalo como pregunta abierta. No documentes cada
endpoint con una sola linea: sigue la estructura de abajo completa.

CRITERIOS DE ACEPTACION
Por cada endpoint consumido (login, tareas), docs/ENDPOINTS.md incluye TODO lo
siguiente (nada es opcional):
1. Quien lo llama (que componente o servicio).
2. Que envia: headers, body o query params, con tabla y ejemplo real.
3. Que espera recibir en exito: codigo de estado, tabla de campos, ejemplo real.
4. Como reacciona ante cada error posible (token invalido, timeout, respuesta
inesperada): que hace la UI en cada caso, no solo "puede fallar".
5. Notas de seguridad relevantes (por ejemplo, que ya no se usa `[innerHTML]`
sin sanitizar, o donde vive ahora el manejo de sesion).
Cada campo y cada ejemplo tienen que poder verificarse contra el codigo real.

FORMATO DE RESPUESTA
El archivo docs/ENDPOINTS.md actualizado, siguiendo exactamente esa estructura
de 5 puntos por endpoint. Al final, que documentos consultaste.

## Prompt 5

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

CONTEXTO
Aplicacion Angular ya refactorizada. docs/ENDPOINTS.md ya refleja el contrato
real y detallado. Consulta ese archivo, REGLAS.md (meta de cobertura) y
cualquier otro documento que consideres necesario.

OBJETIVO
Generar docs/TESTING.md y completar las pruebas que falten para el flujo de
login y consulta de tareas, cubriendo tres categorias: camino feliz, casos
borde y errores.

RESTRICCIONES
No inventes flujos que no esten en docs/ENDPOINTS.md. No adaptes un test para
que pase con un bug existente: si encuentras un bug, repórtalo aparte, no lo
escondas dentro del test.

CRITERIOS DE ACEPTACION
Hay al menos: un test de camino feliz (login valido, tareas cargan), un test de
caso borde (usuario o contrasena vacios, respuesta sin token), y un test por
cada error documentado en docs/ENDPOINTS.md (backend caido, token invalido,
timeout). Cobertura del codigo modificado en 85% o superior.

FORMATO DE RESPUESTA
El archivo docs/TESTING.md con una tabla (flujo | caso | tipo | resultado
esperado) y despues el codigo de los tests, con comandos, directorio, codigo de salida y resultados realmente ejecutados;
separa fallos, pendientes y pruebas propuestas. Al final, que documentos consultaste.

## Prompt 6

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

CONTEXTO
HALLAZGOS.md tiene el backlog de items pendientes de este repositorio (pueden
ser hallazgos de seguridad, bugs, deuda técnica o sugerencias de review). Antes
de proponer cualquier cambio, consulta docs/ENDPOINTS.md (contrato a preservar)
y docs/GOOD_PRACTICES.md (convenciones a las que debe converger el código).

OBJETIVO
Generar PLAN.md con la propuesta de corrección para [indica aquí los items:
por ejemplo "los items 2 y 4 de HALLAZGOS.md", o "los 3 de mayor severidad"].
Un apartado por item, cada uno con su propio alcance.

RESTRICCIONES
No modifiques código todavía. No combines el alcance de dos items en un mismo
apartado, aunque los resuelvas en la misma tanda. No cambies un contrato de
docs/ENDPOINTS.md salvo que el item lo pida explícitamente.

CRITERIOS DE ACEPTACIÓN
Por cada item incluido, PLAN.md dice: qué item de HALLAZGOS.md es, el cambio
propuesto, los archivos que se van a tocar, y qué prueba hay que escribir antes
de tocarlos.

FORMATO DE RESPUESTA
Un archivo PLAN.md con un apartado por item (## Item: <hallazgo>). No
modifiques código todavía.

## Prompt 7

AMBITO
Trabaja unicamente en la carpeta workshop-login-frontend/ de reqflow-workspace.
Todas las rutas de este prompt son relativas a esa carpeta.
Esta carpeta es un repositorio Git independiente; ejecuta Git y guarda los
artefactos dentro de ella. Coordina dependencias externas sin ampliar AMBITO. No leas ni
modifiques los otros componentes del workspace.

CONTEXTO
PLAN.md ya fue revisado y aprobado. Úsalo como guía única.

OBJETIVO
Implementar cada item de PLAN.md, uno a la vez y en el orden en que aparecen,
con su prueba antes y después. Después de cada uno, actualizar su fila en
HALLAZGOS.md antes de pasar al siguiente.

RESTRICCIONES
No implementes items que no estén en PLAN.md. No reduces quality gates. No
avances al siguiente item si el anterior no quedó con su prueba en verde.

CRITERIOS DE ACEPTACIÓN
Cada item de PLAN.md queda con su propio diff y su propia prueba. Cada fila
correspondiente en HALLAZGOS.md pasa a estado "Resuelto", con una nota corta
(1-2 líneas) de cómo se resolvió y qué test y diff local lo respaldan. Los contratos
existentes de docs/ENDPOINTS.md siguen funcionando, salvo que algún item pidiera
cambiarlos a propósito.

FORMATO DE RESPUESTA
Por cada item: el diff, la caracterizacion antes y despues del cambio y la prueba de correccion
con sus resultados reales, y la fila de HALLAZGOS.md actualizada con la nota de resolución.

## Prompt 8

En el archivo actual, necesito que registres todos los prompts que te he enviado
