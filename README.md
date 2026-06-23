(a) Sin API key -> Esperado: 401
Comando:
  curl.exe http://localhost:3000/health

Salida Real: {"error":"API key inválida o ausente"}
Explicación: El middleware de autenticación bloquea la petición inmediatamente al no detectar la cabecera requerida.

(b) Con clave válida -> Esperado: 200
Comando:

curl.exe -H "x-api-key: secreto-demo" http://localhost:3000/health
Salida Real:

{"status":"ok","ts":"2026-06-11T17:11:22.730Z"}
Explicación: La API Key es correcta, el middleware permite el paso y el endpoint responde con el estado del servidor.

(c) Ruta inexistente -> Esperado: 404
Comando:

curl.exe -H "x-api-key: secreto-demo" http://localhost:3000/noexiste
Salida Real:

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /noexiste</pre>
</body>
</html>

Explicación: La autenticación se valida correctamente, pero Express retorna su página de error HTML nativa con un estado 404 porque la ruta /noexiste no está declarada.


> middleware-pe21@1.0.0 test
> cross-env NODE_OPTIONS=--experimental-vm-modules jest

(node:15556) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
 PASS  src/middlewares/auth.test.ts
(node:15216) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
 PASS  src/middlewares/logger.test.ts

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.631 s
Ran all test suites.

## Documentación de Endpoints Complementarios

### Endpoint: Verificación de Estado (`/health`)
* **Método HTTP:** `GET`
* **Ruta:** `/health`
* **Autenticación:** Requerida a través de la cabecera `x-api-key`.

#### Especificación de Entrada (Request)
* **Cabeceras (Headers):**
  * `x-api-key: <string>` (Clave de autenticación consumida por el middleware).
* **Parámetros:** No requiere parámetros en ruta (*path*), consulta (*query*) ni cuerpo (*body*).

#### Especificación de Salida (Responses)
* **`200 OK` (Respuesta Exitosa):** Retorna un objeto JSON que confirma la operatividad del servidor junto con la marca de tiempo del sistema.
  * `status` (String): Estado de actividad del servicio (ej. `"OK"`).
  * `ts` (String, formato ISO 8601): Fecha y hora del servidor en entorno UTC.
* **`401 Unauthorized` (Error de Autenticación):** Emitido cuando la cabecera es omitida o el valor provisto no coincide con las credenciales registradas.
  * `error` (String): Mensaje de rechazo descriptivo.

---

## Plan de Pruebas de Integración (Postman)

El proceso de verificación del comportamiento del servidor frente a los contratos establecidos se realizó mediante solicitudes controladas en Postman, evaluando las respuestas tanto para casos de éxito como para excepciones de validación.

### 1. Pruebas en Endpoint `/v1/inscripciones`
* **Caso de Éxito (201 Created):** Envío del payload con formato estricto (atributos `estudianteId`, `materias` y `periodoid` en minúsculas). El backend procesa y devuelve la estructura confirmando el registro bajo el contrato v1.
* **Caso de Error de Validación (400 Bad Request):** Envío de un payload con propiedades alteradas sintácticamente (uso de CamelCase `periodoId` en lugar del campo esperado `periodoid`). El sistema rechaza la petición exponiendo los campos obligatorios ausentes en el cuerpo de la solicitud.

### 2. Pruebas en Endpoint `/v2/inscripciones`
* **Caso de Éxito (201 Created):** Transmisión de la solicitud incluyendo el identificador de estudiante, listado de asignaturas, identificador de periodo académico (siguiendo la nomenclatura CamelCase requerida en esta versión) y el atributo de negocio `metodo_pago` parametrizado dentro del catálogo permitido (`Efectivo`, `Transferencia`, `Debito`, `Credito`).
* **Caso de Error Estructural (400 Bad Request):** Envío de datos incompletos o con un argumento no soportado para el método de pago (ej. `"Bitcoin"`). El middleware interceptor captura la anomalía y deniega el almacenamiento, retornando un mensaje de error explícito de tipología *enum*.

---

## Análisis de Versionado de la API (Casos Aplicados a `/health`)

### 1. Cambio Compatible con Versiones Anteriores (Backwards-Compatible)
* **Modificación:** Adición del campo complementario `version` (tipo string) en la estructura de salida exitosa del endpoint `/health`.
* **Justificación técnica:** Los sistemas clientes desarrollados para consumir la respuesta original continuarán parseando los atributos `status` y `ts` sin interrupciones. La introducción de una propiedad nueva no altera las posiciones ni los tipos de los datos preexistentes, permitiendo que la evolución del contrato coexista con implementaciones antiguas.

### 2. Cambio Incompatible (Breaking Change)
* **Modificación:** Sustitución del tipo de dato del atributo `status` en la respuesta de `/health`, migrando de una cadena de caracteres fija (`"ok"`) a una bandera de tipo booleano (`true`).
* **Justificación técnica:** Este cambio rompe la compatibilidad hacia atrás debido a que los clientes tienen implementadas lógica de comparación estricta de cadenas o esquemas de deserialización rígidos. Al mutar el tipo primitivo a nivel de transporte, los flujos de control del cliente fallarán al procesar el tipo booleano, provocando excepciones en cascada en las aplicaciones consumidoras.





## Versionado

### Cambio compatible 


Antes:

```json
{
  "status": "ok",
  "ts": "2026-06-11T17:11:22.730Z"
}
```

Después:

```json
{
  "status": "ok",
  "ts": "2026-06-11T17:11:22.730Z",
  "version": "1.0.0"
}
```

Justificación:
Los clientes existentes seguirán funcionando porque los campos originales permanecen sin cambios y el nuevo campo es opcional.

### Cambio incompatible

Cambiar el tipo del campo status.

Antes:

```json
{
  "status": "ok"
}
```

Después:

```json
{
  "status": true
}
```

Justificación:
Los clientes esperan una cadena de texto. Al recibir un valor booleano podrían fallar validaciones y procesos de deserialización.

README.md — sección Pruebas (Markdown):
## Pruebas de los endpoints

Servidor corriendo en `http://localhost:3000`. Autenticacion: header `x-api-key: secreto-demo`.

### Escenario 1 — POST /v1/inscripciones con campos válidos (esperado: 201)

![v1 201 Created](docs/screenshots/01-v1-201.png)

### Escenario 2 — POST /v2/inscripciones con payment_method válido (esperado: 201)

![v2 201 Created](docs/screenshots/02-v2-201.png)

### Escenario 3 — POST /v2/inscripciones sin payment_method (esperado: 400)

![v2 400 campo faltante](docs/screenshots/03-v2-400-faltante.png)

### Escenario 4 — POST /v2/inscripciones con payment_method inválido (esperado: 400)

![v2 400 valor inválido](docs/screenshots/04-v2-400-inválido.png)

## Reflexión sobre el Consumo del Contrato OpenAPI

Si otro equipo comenzara a consumir nuestra API mañana, el principal cambio técnico que realizaría en el contrato OpenAPI sería robustecer las especificaciones de seguridad mediante la declaración global de componentes `securitySchemes`. Actualmente, la validación de la API Key ocurre mediante lógica aislada en el middleware (`x-api-key`); documentar este comportamiento de manera nativa en OpenAPI permitiría a los consumidores generar clientes automáticos (SDKs) que incluyan los encabezados de autenticación por defecto. Asimismo, endurecería las validaciones del esquema definiendo formatos estrictos (como `format: uuid` para el `estudianteId`) e incorporaría una sección exhaustiva de respuestas globales para códigos de error comunes (como `401 Unauthorized` y `422 Unprocessable Entity`) con estructuras normalizadas, minimizando así la fricción de integración y asegurando un acuerdo de nivel de servicio (SLA) claro para los desarrolladores externos.
