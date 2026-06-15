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