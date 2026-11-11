# 4.2 srv-web — Nginx y API

Requisitos: [sistema base](sistema-base.md) con `srv-web` y
[srv-db](srv-db.md) funcionando.

## 1. Variables de entorno

```bash
cd ~/Projecte-ASIR/infra/srv-web
cp .env.example .env
nano .env          # POSTGRES_PASSWORD = APP_DB_PASSWORD de srv-db
chmod 600 .env
```

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
~/Projecte-ASIR/scripts/deploy.sh srv-web
```

## 4. Comprobar

```bash
docker compose ps
curl -k https://localhost/api/health        # {"status":"ok"}
curl -I http://localhost                    # 301 -> https
```

Desde srv-web, comprobar que llega a la base de datos:

```bash
nc -zv 192.168.116.31 5432
```

Desde el navegador: `https://192.168.248.33` y `https://192.168.248.33/api/docs`.

## 5. Traductor (publicaciones en español y catalán)

PubMed solo da los artículos en inglés. El servicio `traductor`
(LibreTranslate, en el mismo `compose.yaml`) traduce el título y el resumen
al español y al catalán; la API lo usa al final de cada búsqueda diaria y
guarda el resultado en la tabla `paper_traducciones`. La web muestra cada
artículo en el idioma elegido, con el aviso "traducción automática" y un
botón para ver el original.

- En el `.env`: `TRADUCTOR_URL=http://traductor:5000` (vacío = no traducir).
- La primera vez descarga los modelos de idioma (unos minutos). Necesita
  unos 2 GB de RAM libres.
- Para traducir ya lo que hay en la base de datos sin esperar a las 06:00:

```bash
docker exec alpha-api python -m app.ingesta.guardar 50    # descarga resúmenes y traduce
docker exec alpha-api python -m app.ingesta.traducir      # solo traducir lo pendiente
```

En una base de datos creada antes de este cambio hay que aplicar antes la
migración en srv-db:

```bash
cd ~/Projecte-ASIR/infra/srv-db
docker compose exec -T alpha-db psql -U alpha_admin -d alpha_db \
    < ../../database/migraciones/002-traducciones.sql
```

