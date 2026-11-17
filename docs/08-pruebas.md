# 8. Pruebas

| # | Prueba | Cómo | Resultado esperado | Resultado obtenido | Fecha |
|---|--------|------|--------------------|--------------------|-------|
| 1 | La web responde por HTTPS | `curl -k https://192.168.248.33` | 200 | | |
| 2 | HTTP redirige a HTTPS | `curl -I http://192.168.248.33` | 301 | | |
| 3 | La API conecta con la BD | `curl -k https://192.168.248.33/api/health` | `ok` | | |
| 4 | PostgreSQL no accesible desde fuera | `nc -zv 192.168.116.31 5432` desde el PC de administración | Rechazado | | |
| 5 | `alpha_app` no puede crear tablas | `CREATE TABLE x(i int);` | Permiso denegado | | |
| 6 | SSH con contraseña rechazado | `ssh -o PubkeyAuthentication=no ...` | Rechazado | | |
| 7 | fail2ban banea | 6 intentos fallidos | IP baneada | | |
| 8 | Escaneo de puertos | `nmap -p- 192.168.248.33 192.168.116.31-32` | Solo los de la tabla de red | | |
| 9 | Copia y restauración | Ver [06-copias.md](06-copias.md) | Datos recuperados | | |
| 10 | Alerta por caída | Parar la API | Aviso en < 3 min | | |
| 11 | Ingesta de PubMed | `python -m app.ingesta.pubmed` | Lista de artículos | | |
| 12 | Ingesta sin duplicados | `python -m app.ingesta.guardar 20` dos veces | 2ª vez: `actualizados: 20` | | |
| 13 | Búsqueda diaria automática | Poner `INGESTA_HORA`/`INGESTA_MINUTO` 2 min más tarde y reiniciar la API | `/ingesta/estado` muestra la ejecución con `estado: ok` | | |
| 14 | Buscador web | Abrir `https://<srv-web>/`, buscar `sarcoglycan`, filtrar por autor y abrir una ficha | Lista de resultados y ficha con enlaces a PubMed y DOI | | |
| 15 | Documentación de la API | Abrir `https://<srv-web>/api/docs` | Swagger carga y permite probar `/papers` | | |
