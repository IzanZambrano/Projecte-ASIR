# 4.3 srv-backup — Copias y monitorización

Requisito: [sistema base](sistema-base.md) aplicado con `srv-backup`
(crea el usuario `copias` y `/srv/backups/alpha`).

## 1. Recibir copias de srv-db

Añadir la clave pública de root de srv-db (ver [srv-db](srv-db.md#4-copias-automáticas)):

```bash
sudo nano /home/copias/.ssh/authorized_keys
sudo chown copias:copias /home/copias/.ssh/authorized_keys
sudo chmod 600 /home/copias/.ssh/authorized_keys
```

## 2. Monitorización

```bash
cd ~/Projecte-ASIR/infra/srv-backup
cp .env.example .env
nano .env          # GRAFANA_ADMIN_PASSWORD
chmod 600 .env
~/Projecte-ASIR/scripts/deploy.sh srv-backup
```

| Servicio | URL |
|----------|-----|
| Uptime Kuma | http://192.168.56.12:3001 |
| Grafana | http://192.168.56.12:3000 |
| Prometheus | http://192.168.56.12:9090/targets |

## 3. Configurar

- **Prometheus**: en `/targets` los tres `node` deben estar en `UP`.
- **Grafana**: el origen de datos Prometheus ya viene configurado.
  Importar el panel *Node Exporter Full* (ID `1860`).
- **Uptime Kuma**: crear el usuario administrador y estos monitores:

  | Monitor | Tipo | Destino |
  |---------|------|---------|
  | Web | HTTP(s) (ignorar TLS) | `https://192.168.56.10` |
  | API | HTTP(s) – palabra clave `ok` | `https://192.168.56.10/api/health` |
  | Base de datos | Puerto TCP | `192.168.56.11:5432` |

  > Para el monitor de la base de datos hay que permitir srv-backup en ufw
  > de srv-db: `sudo ufw allow from 192.168.56.12 to any port 5432 proto tcp`
  > (pg_hba.conf seguirá rechazando el inicio de sesión).
