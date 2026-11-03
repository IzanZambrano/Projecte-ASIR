# 3. Red

> Las máquinas son **equipos físicos** conectados a la red del instituto
> (`192.168.0.0/16`, puerta de enlace y DNS `192.168.88.88`). Si cambian las
> IPs, hay que actualizar: `infra/comun/sistema-base.sh`,
> `infra/srv-db/postgresql/pg_hba.conf`, `infra/srv-web/.env`,
> `infra/srv-db/.env` y `infra/srv-backup/prometheus/prometheus.yml`.

## Direccionamiento

| Máquina | IP | SO | CPU / RAM / Disco (mínimo) |
|---------|----|----|----------------------------|
| srv-web | 192.168.116.30/16 | Ubuntu Server LTS | 1 / 2 GB / 20 GB |
| srv-db | 192.168.116.31/16 | Ubuntu Server LTS | 2 / 2 GB / 20 GB |
| srv-backup | 192.168.116.32/16 | Ubuntu Server LTS | 1 / 2 GB / 40 GB |
| PC de administración | 192.168.116.16 (DHCP) | Manjaro | — |

| Parámetro | Valor |
|-----------|-------|
| Red | `192.168.0.0/16` |
| Puerta de enlace | `192.168.88.88` |
| DNS | `192.168.88.88` (los DNS externos como 1.1.1.1 están bloqueados) |
| Dominio de búsqueda | `iesthosicodina.cat` |
| Red de administración (SSH) | `192.168.116.0/24` |

> **Atención:** el DHCP del instituto también reparte IPs `192.168.116.x`.
> Antes de fijar las IPs, comprobar con `ping` que están libres y, si es
> posible, pedir que se reserven para las MAC de los servidores.
>
> Si la IP del PC de administración deja de estar en `192.168.116.0/24`,
> ufw bloqueará su SSH. Solución desde la consola del servidor:
> `sudo ufw allow from <IP> to any port 22 proto tcp`.

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
