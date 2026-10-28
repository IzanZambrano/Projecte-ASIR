#!/bin/bash
# Copia de seguridad de PostgreSQL. Se ejecuta en srv-db (cron diario, ver
# docs/06-copias.md): vuelca la base de datos, borra las copias antiguas y
# envía el resultado a srv-backup.

set -euo pipefail

RAIZ=$(cd "$(dirname "$0")/.." && pwd)
DIR_COMPOSE="$RAIZ/infra/srv-db"
# shellcheck disable=SC1091
source "$DIR_COMPOSE/.env"

FECHA=$(date +%Y%m%d-%H%M%S)
FICHERO="$BACKUP_DIR/alpha_db-$FECHA.dump"
mkdir -p "$BACKUP_DIR"

echo "==> Volcando $POSTGRES_DB en $FICHERO"
docker compose -f "$DIR_COMPOSE/compose.yaml" exec -T \
    -e PGPASSWORD="$POSTGRES_PASSWORD" alpha-db \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom > "$FICHERO"

# Comprobación mínima: el volcado se puede leer
docker compose -f "$DIR_COMPOSE/compose.yaml" exec -T alpha-db \
    pg_restore --list < "$FICHERO" > /dev/null
sha256sum "$FICHERO" > "$FICHERO.sha256"

echo "==> Borrando copias locales de más de $BACKUP_RETENTION_DAYS días"
find "$BACKUP_DIR" -name 'alpha_db-*' -mtime +"$BACKUP_RETENTION_DAYS" -delete

echo "==> Enviando a $BACKUP_REMOTE"
rsync -a "$BACKUP_DIR/" "$BACKUP_REMOTE/"

echo "Copia completada: $(du -h "$FICHERO" | cut -f1)"
