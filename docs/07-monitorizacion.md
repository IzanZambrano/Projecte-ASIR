# 7. Monitorización

| Herramienta | Qué vigila | Pregunta que responde |
|-------------|------------|-----------------------|
| Uptime Kuma | Web, API, puerto de PostgreSQL | ¿Está funcionando el servicio ahora? |
| Prometheus + node-exporter | CPU, RAM, disco, red de las 3 máquinas | ¿Cómo evolucionan los recursos? |
| Grafana | Paneles sobre Prometheus | Visualización de lo anterior |

## Alertas

| Alerta | Condición | Aviso por |
|--------|-----------|-----------|
| Web caída | Uptime Kuma: 3 fallos seguidos | _Telegram / correo_ |
| API caída | `/api/health` sin `ok` | |
| Disco lleno | Uso > 85 % | |
| Copia no realizada | _Completar_ | |

## Capturas

_Añadir en `docs/img/` capturas de los paneles de Grafana y Uptime Kuma._
