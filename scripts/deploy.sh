#!/bin/bash
# Actualiza el código y levanta los servicios de ESTA máquina.
# Uso:  ./scripts/deploy.sh            (usa el nombre de la máquina)
#       ./scripts/deploy.sh srv-web    (lo indica explícitamente)

set -euo pipefail

RAIZ=$(cd "$(dirname "$0")/.." && pwd)
ROL=${1:-$(hostname)}
DIR="$RAIZ/infra/$ROL"

[[ -f "$DIR/compose.yaml" ]] || { echo "No existe $DIR/compose.yaml" >&2; exit 1; }
[[ -f "$DIR/.env" ]] || { echo "Falta $DIR/.env (copia .env.example y rellénalo)" >&2; exit 1; }

echo "==> Actualizando repositorio"
git -C "$RAIZ" pull --ff-only

echo "==> Levantando servicios de $ROL"
cd "$DIR"
docker compose pull --ignore-buildable
docker compose up -d --build --remove-orphans
docker compose ps
