#!/bin/bash
# Restaura una copia hecha con backup.sh. Se ejecuta en srv-db.
# Uso:  ./scripts/restore.sh /var/backups/alpha/alpha_db-AAAAMMDD-HHMMSS.dump
#
# ATENCIÓN: borra los datos actuales de la base de datos y los sustituye.

set -euo pipefail

FICHERO=${1:-}
[[ -f "$FICHERO" ]] || { echo "Uso: $0 fichero.dump" >&2; exit 1; }

RAIZ=$(cd "$(dirname "$0")/.." && pwd)
DIR_COMPOSE="$RAIZ/infra/srv-db"
# shellcheck disable=SC1091
source "$DIR_COMPOSE/.env"

if [[ -f "$FICHERO.sha256" ]]; then
    echo "==> Verificando integridad"
    sha256sum -c "$FICHERO.sha256"
fi

read -r -p "Se sobrescribirá $POSTGRES_DB. Escribe SI para continuar: " RESPUESTA
[[ "$RESPUESTA" == "SI" ]] || { echo "Cancelado."; exit 1; }

echo "==> Restaurando $FICHERO"
docker compose -f "$DIR_COMPOSE/compose.yaml" exec -T \
    -e PGPASSWORD="$POSTGRES_PASSWORD" alpha-db \
    pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
               --clean --if-exists --no-owner --exit-on-error < "$FICHERO"

echo "Restauración completada."
