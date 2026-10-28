# 8. Pruebas

| # | Prueba | Cómo | Resultado esperado | Resultado obtenido | Fecha |
|---|--------|------|--------------------|--------------------|-------|
| 1 | La web responde por HTTPS | `curl -k https://192.168.56.10` | 200 | | |
| 2 | HTTP redirige a HTTPS | `curl -I http://192.168.56.10` | 301 | | |
| 3 | La API conecta con la BD | `curl -k https://192.168.56.10/api/health` | `ok` | | |
| 4 | PostgreSQL no accesible desde fuera | `nc -zv 192.168.56.11 5432` desde el anfitrión | Rechazado | | |
| 5 | `alpha_app` no puede crear tablas | `CREATE TABLE x(i int);` | Permiso denegado | | |
| 6 | SSH con contraseña rechazado | `ssh -o PubkeyAuthentication=no ...` | Rechazado | | |
| 7 | fail2ban banea | 6 intentos fallidos | IP baneada | | |
| 8 | Escaneo de puertos | `nmap -p- 192.168.56.10-12` | Solo los de la tabla de red | | |
| 9 | Copia y restauración | Ver [06-copias.md](06-copias.md) | Datos recuperados | | |
| 10 | Alerta por caída | Parar la API | Aviso en < 3 min | | |
| 11 | Ingesta de PubMed | `python -m app.ingesta.pubmed` | Lista de artículos | | |
