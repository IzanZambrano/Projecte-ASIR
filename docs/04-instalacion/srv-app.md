# 4.1 srv-app — Web, API, traductor y PostgreSQL

Requisito: [sistema base](sistema-base.md) aplicado con `srv-app`.
Recomendado: **4 GB de RAM** (el traductor usa ~2 GB).

Todo va en un solo `infra/srv-app/compose.yaml`:

| Contenedor | Qué es | Accesible desde fuera |
|------------|--------|-----------------------|
| `alpha-nginx` | HTTPS y web estática (`frontend/`) | Sí: 80 y 443 |
| `alpha-api` | API FastAPI e ingesta diaria de PubMed | No (solo a través de Nginx) |
| `alpha-traductor` | LibreTranslate (inglés → español y catalán) | No |
| `alpha-db` | PostgreSQL 15 | **No** (red interna de Docker) |
| `node-exporter` | Métricas para Prometheus | Solo desde srv-backup (ufw) |

## 1. Variables de entorno

```bash
cd ~/Projecte-ASIR/infra/srv-app
cp .env.example .env
openssl rand -base64 18      # contraseña del administrador → POSTGRES_PASSWORD
openssl rand -base64 18      # contraseña de la aplicación  → APP_DB_PASSWORD
nano .env
chmod 600 .env
```

`BACKUP_REMOTE` se completa cuando srv-backup tenga IP (apartado 6).

> La API **no** recibe la contraseña del administrador: en `compose.yaml` se le
> pasan solo `APP_DB_USER` y `APP_DB_PASSWORD`.

## 2. Certificado HTTPS

Certificado autofirmado (entorno de clase):

```bash
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -subj "/CN=alpha.local" \
  -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem
chmod 600 nginx/certs/privkey.pem
```

> Con un dominio público se puede usar Let's Encrypt (certbot) y copiar
> `fullchain.pem` y `privkey.pem` a `nginx/certs/`.

## 3. Arrancar

```bash
~/Projecte-ASIR/scripts/deploy.sh srv-app
```

La primera vez tarda varios minutos: construye la imagen de la API y descarga
PostgreSQL, Nginx y el traductor con sus modelos de idioma.

La primera vez que arranca, PostgreSQL ejecuta en orden:

1. `database/init/01-roles.sh` — crea el usuario `alpha_app`.
2. `database/schema.sql` — crea las tablas (ya incluye `pmid` y `paper_traducciones`).
3. `database/init/03-permisos.sh` — da a `alpha_app` acceso a las tablas.

> Estos scripts solo se ejecutan con el volumen vacío (`alpha_pg_data`). Para
> repetirlos: `docker compose down` y `docker volume rm alpha_pg_data`
> (**borra los datos**).

## 4. Comprobar

```bash
docker compose ps                           # alpha-db y alpha-api "healthy"
curl -k https://localhost/api/health        # {"status":"ok","database":"ok"}
curl -I http://localhost                    # 301 -> https
docker compose exec alpha-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
```

Desde el PC de administración:

- Navegador: `https://192.168.248.33` y `https://192.168.248.33/api/docs`.
- PostgreSQL no debe ser accesible: `nc -zv -w3 192.168.248.33 5432` → falla.

## 5. Primeras publicaciones y traducción

La API busca en PubMed cada día a las 06:00 (`INGESTA_HORA`). Para cargar
artículos ya:

```bash
docker exec alpha-api python -m app.ingesta.guardar 50
```

Los artículos se guardan en segundos; la traducción al español y al catalán
es lenta la primera vez (10–30 min sin GPU). Para no esperar con la terminal
ocupada, se puede traducir en segundo plano:

```bash
docker exec -d alpha-api python -m app.ingesta.traducir
docker stats --no-stream        # alpha-traductor con CPU alta = trabajando
```

PubMed solo da los artículos en inglés. La API traduce título y resumen al
final de cada búsqueda diaria y guarda el resultado en `paper_traducciones`;
la web muestra cada artículo en el idioma elegido con el aviso "traducción
automática" y un botón para ver el original. `TRADUCTOR_URL` vacío en el
`.env` desactiva la traducción.

## 6. Copias automáticas

Cuando srv-backup esté instalada (ver [srv-backup](srv-backup.md)):

```bash
nano ~/Projecte-ASIR/infra/srv-app/.env    # BACKUP_REMOTE=copias@IP_SRV_BACKUP:/srv/backups/alpha
sudo ssh-keygen -t ed25519 -N '' -f /root/.ssh/id_ed25519
sudo cat /root/.ssh/id_ed25519.pub
# Pegar la clave en srv-backup: /home/copias/.ssh/authorized_keys
sudo ssh copias@IP_SRV_BACKUP true         # aceptar la huella
sudo ~/Projecte-ASIR/scripts/backup.sh     # primera copia manual
```

Programarla (`sudo crontab -e`), cambiando `USUARIO` por el usuario del servidor:

```
30 3 * * * /home/USUARIO/Projecte-ASIR/scripts/backup.sh >> /var/log/alpha-backup.log 2>&1
```

## 7. Mantenimiento

Migraciones (solo en bases de datos creadas antes de un cambio de esquema;
las nuevas ya lo traen todo):

```bash
cd ~/Projecte-ASIR/infra/srv-app
for m in ../../database/migraciones/*.sql; do
  docker compose exec -T alpha-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$m"
done
```

Datos de prueba (opcional):

```bash
docker compose exec -T alpha-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ../../database/seed.sql
```

## Anexo: paso desde srv-web + srv-db

La primera versión tenía la web (srv-web, 192.168.248.33) y la base de datos
(srv-db, 192.168.248.9) en dos máquinas. Para pasar a srv-app en la máquina
de srv-web, **antes de hacer `git pull`** (el pull borra `infra/srv-web` y
`infra/srv-db`):

```bash
# En srv-web: parar los contenedores antiguos (conserva los volúmenes)
cd ~/Projecte-ASIR/infra/srv-web && docker compose down

# Opcional, en srv-db: llevarse los datos antes de apagarla
cd ~/Projecte-ASIR/infra/srv-db
docker compose exec -T alpha-db sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > ~/alpha_db.dump
docker compose down
```

Después, en la máquina de srv-web: `git pull`, `sistema-base.sh srv-app`,
`.env` (se pueden reutilizar las dos contraseñas de srv-db), copiar los
certificados de `infra/srv-web/nginx/certs/` a `infra/srv-app/nginx/certs/` y
`deploy.sh srv-app`. Los datos se restauran con `scripts/restore.sh` o se
vuelven a descargar de PubMed con la ingesta.

Los modelos del traductor ya descargados se pueden reaprovechar copiando el
volumen antiguo al nuevo (antes del primer `deploy.sh srv-app`):

```bash
docker volume create alpha_lt_modelos
docker run --rm -v srv-web_lt_modelos:/de -v alpha_lt_modelos:/a alpine cp -a /de/. /a/
```
