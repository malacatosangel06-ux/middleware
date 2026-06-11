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