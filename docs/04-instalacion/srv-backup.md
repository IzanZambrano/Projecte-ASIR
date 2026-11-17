# 4.2 srv-backup — Copias y monitorización

Requisito: [sistema base](sistema-base.md) aplicado con `srv-backup`
(crea el usuario `copias` y la carpeta `/srv/backups/alpha`).
Disco recomendado: 40 GB o más (guarda las copias).

> Antes de aplicar el sistema base, la IP real de srv-backup tiene que estar en
> `SRV_BACKUP` (`infra/comun/sistema-base.sh`), en
> `infra/srv-backup/prometheus/prometheus.yml` y en `BACKUP_REMOTE` del `.env`
> de srv-app. Después, volver a ejecutar `sistema-base.sh srv-app` en srv-app
> para que deje pasar a Prometheus.

## 1. Monitorización

```bash
cd ~/Projecte-ASIR/infra/srv-backup
cp .env.example .env
openssl rand -base64 18      # contraseña de Grafana
nano .env                    # GRAFANA_ADMIN_PASSWORD
chmod 600 .env
~/Projecte-ASIR/scripts/deploy.sh srv-backup
docker compose ps            # uptime-kuma, prometheus, grafana y node-exporter
```

| Servicio | URL |
|----------|-----|
| Uptime Kuma | http://IP_SRV_BACKUP:3001 |
| Grafana | http://IP_SRV_BACKUP:3000 |
| Prometheus | http://IP_SRV_BACKUP:9090/targets |

## 2. Recibir copias de srv-app

Añadir la clave pública de root de srv-app (ver
[srv-app](srv-app.md#6-copias-automáticas)):

```bash
sudo nano /home/copias/.ssh/authorized_keys
sudo chown copias:copias /home/copias/.ssh/authorized_keys
sudo chmod 600 /home/copias/.ssh/authorized_keys
```

Después de la primera copia desde srv-app:

```bash
sudo ls -lh /srv/backups/alpha     # alpha_db-FECHA.dump y su .sha256
```

## 3. Configurar los paneles

- **Prometheus**: en `/targets` los dos `node` (`srv-app` y `srv-backup`)
  deben estar en `UP`.
- **Grafana**: el origen de datos Prometheus ya viene configurado.
  *Dashboards → New → Import* → ID `1860` (*Node Exporter Full*).
- **Uptime Kuma**: crear el usuario administrador y estos monitores:

  | Monitor | Tipo | Destino |
  |---------|------|---------|
  | Web | HTTP(s), «Ignore TLS/SSL error» | `https://192.168.248.33` |
  | API y base de datos | HTTP(s) – Keyword `"database":"ok"`, «Ignore TLS/SSL error» | `https://192.168.248.33/api/health` |

  `/api/health` solo responde `"database":"ok"` si la API llega a PostgreSQL,
  así que el segundo monitor vigila a la vez la API y la base de datos (el
  puerto 5432 no es accesible desde fuera de srv-app).
