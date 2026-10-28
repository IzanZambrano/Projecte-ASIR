# 4.1 srv-db — PostgreSQL

Requisito: [sistema base](sistema-base.md) aplicado con `srv-db`.
Se instala **antes** que srv-web, porque la API depende de ella.

## 1. Variables de entorno

```bash
cd ~/Projecte-ASIR/infra/srv-db
cp .env.example .env
nano .env          # cambiar POSTGRES_PASSWORD y APP_DB_PASSWORD
chmod 600 .env
```

## 2. Arrancar

```bash
~/Projecte-ASIR/scripts/deploy.sh srv-db
```

La primera vez, PostgreSQL ejecuta en orden:

1. `database/init/01-roles.sh` — crea el usuario `alpha_app`.
2. `database/schema.sql` — crea las tablas.
3. `database/init/03-permisos.sh` — da a `alpha_app` acceso a las tablas.

> Estos scripts solo se ejecutan con el volumen vacío. Para repetirlos:
> `docker compose down -v` (**borra los datos**).

## 3. Comprobar

```bash
docker compose ps                            # alpha-db en estado "healthy"
docker compose logs alpha-db | tail
docker compose exec alpha-db psql -U alpha_admin -d alpha_db -c '\dt'
```

Datos de prueba (opcional):

```bash
docker compose exec -T alpha-db psql -U alpha_admin -d alpha_db < ../../database/seed.sql
```

## 4. Copias automáticas

Cuando srv-backup esté instalada:

```bash
sudo ssh-keygen -t ed25519 -N '' -f /root/.ssh/id_ed25519
sudo cat /root/.ssh/id_ed25519.pub
# Pegar la clave en srv-backup: /home/copias/.ssh/authorized_keys
sudo ssh copias@192.168.56.12 true          # aceptar la huella
sudo ~/Projecte-ASIR/scripts/backup.sh      # primera copia manual
```

Programarla (`sudo crontab -e`):

```
30 3 * * * /home/admin/Projecte-ASIR/scripts/backup.sh >> /var/log/alpha-backup.log 2>&1
```
