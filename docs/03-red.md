# 3. Red

> Las máquinas son **equipos físicos** conectados a la red del instituto
> (`192.168.0.0/16`, puerta de enlace y DNS `192.168.88.88`). Las IPs las da
> el DHCP del instituto. Si cambian, hay que actualizar:
> `infra/comun/sistema-base.sh` (`SRV_APP`, `SRV_BACKUP`),
> `infra/srv-app/.env` (`BACKUP_REMOTE`) y
> `infra/srv-backup/prometheus/prometheus.yml`, y volver a ejecutar
> `sistema-base.sh` en las dos máquinas.

## Direccionamiento

| Máquina | IP | SO | CPU / RAM / Disco (mínimo) |
|---------|----|----|----------------------------|
| srv-app | 192.168.248.33 (DHCP) | Ubuntu Server 22.04 LTS | 2 / **4 GB** / 40 GB |
| srv-backup | _pendiente_ (DHCP) | Ubuntu Server 26.04 LTS | 1 / 2 GB / 40 GB |
| PC de administración | 192.168.116.16 (DHCP) | Manjaro | — |

srv-app necesita unos 4 GB de RAM: el traductor usa ~2 GB, PostgreSQL ~0,5 GB
y la API y Nginx el resto.

| Parámetro | Valor |
|-----------|-------|
| Red | `192.168.0.0/16` |
| Puerta de enlace | `192.168.88.88` |
| DNS | `192.168.88.88` (los DNS externos como 1.1.1.1 están bloqueados) |
| Dominio de búsqueda | `iesthosicodina.cat` |
| Red de administración (SSH) | `192.168.0.0/16` |
| Red interna de Docker en srv-app | `172.30.0.0/24` (Nginx, API, traductor y PostgreSQL) |

> **Reservas DHCP:** hay que pedir al profesorado que reserve la IP de cada
> servidor para su MAC (`ip link`). Si una IP cambia, la monitorización y las
> copias dejan de funcionar hasta actualizar los archivos de arriba.
>
> Si se pierde el acceso SSH, desde la consola del servidor:
> `sudo ufw allow from <IP> to any port 22 proto tcp`.

## Tabla de comunicaciones

Todo lo que no aparece aquí está bloqueado por ufw (o, en el caso de
PostgreSQL, ni siquiera sale de la red interna de Docker).

| Origen | Destino | Puerto | Servicio | Motivo |
|--------|---------|--------|----------|--------|
| Cualquiera | srv-app | 80/tcp | Nginx | Redirige a HTTPS |
| Cualquiera | srv-app | 443/tcp | Nginx | Web y API |
| API (red interna) | PostgreSQL (red interna) | 5432/tcp | PostgreSQL | La API lee y escribe datos. **No se publica fuera de srv-app** |
| srv-app | srv-backup | 22/tcp | SSH (rsync) | Envío de copias |
| srv-backup | las 2 | 9100/tcp | node-exporter | Métricas para Prometheus |
| Red admin | las 2 | 22/tcp | SSH | Administración |
| Red admin | srv-backup | 3000, 3001, 9090/tcp | Grafana, Uptime Kuma, Prometheus | Paneles de monitorización |
| srv-app | Internet | 443/tcp | PubMed | Ingesta de publicaciones |
