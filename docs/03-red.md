# 3. Red

> Las IPs de abajo son las que usa el repositorio por defecto (red *solo
> anfitrión* de VirtualBox). Si cambian, hay que actualizar:
> `infra/comun/sistema-base.sh`, `infra/srv-db/postgresql/pg_hba.conf`,
> `infra/srv-web/.env`, `infra/srv-db/.env` y `infra/srv-backup/prometheus/prometheus.yml`.

## Direccionamiento

| Máquina | IP | SO | CPU / RAM / Disco |
|---------|----|----|-------------------|
| srv-web | 192.168.56.10 | Debian 12 | 1 / 2 GB / 20 GB |
| srv-db | 192.168.56.11 | Debian 12 | 2 / 2 GB / 20 GB |
| srv-backup | 192.168.56.12 | Debian 12 | 1 / 2 GB / 40 GB |

Red de administración (SSH): `192.168.56.0/24`.

## Tabla de comunicaciones

Todo lo que no aparece aquí está bloqueado por ufw.

| Origen | Destino | Puerto | Servicio | Motivo |
|--------|---------|--------|----------|--------|
| Cualquiera | srv-web | 80/tcp | Nginx | Redirige a HTTPS |
| Cualquiera | srv-web | 443/tcp | Nginx | Web y API |
| srv-web | srv-db | 5432/tcp | PostgreSQL | La API lee y escribe datos |
| srv-db | srv-backup | 22/tcp | SSH (rsync) | Envío de copias |
| srv-backup | las 3 | 9100/tcp | node-exporter | Métricas para Prometheus |
| Red admin | las 3 | 22/tcp | SSH | Administración |
| Red admin | srv-backup | 3000, 3001, 9090/tcp | Grafana, Uptime Kuma, Prometheus | Paneles de monitorización |
| srv-web | Internet | 443/tcp | PubMed | Ingesta de publicaciones |
