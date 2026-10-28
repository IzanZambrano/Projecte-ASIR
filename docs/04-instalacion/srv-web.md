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
nc -zv 192.168.56.11 5432
```

Desde el navegador: `https://192.168.56.10` y `https://192.168.56.10/api/docs`.
