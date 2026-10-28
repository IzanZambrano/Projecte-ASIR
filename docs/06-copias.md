# 6. Copias de seguridad

## Plan

| Qué | Cómo | Cuándo | Dónde | Retención |
|-----|------|--------|-------|-----------|
| Base de datos | `pg_dump` formato custom (`scripts/backup.sh`) | Diario 03:30 | srv-db `/var/backups/alpha` + srv-backup `/srv/backups/alpha` | 14 días en srv-db |
| Configuración | Repositorio Git | Cada cambio | GitHub | Historial completo |
| Secretos (`.env`) | _Completar: gestor de contraseñas, copia cifrada…_ | | | |

Regla 3-2-1: _explicar cómo se cumple o qué falta (p. ej. copia fuera del centro)._

## Cómo funciona `backup.sh`

1. Vuelca la base de datos con `pg_dump --format=custom`.
2. Comprueba que el volcado se puede leer (`pg_restore --list`).
3. Guarda su suma SHA-256.
4. Borra copias locales con más de `BACKUP_RETENTION_DAYS` días.
5. Las envía a srv-backup con `rsync` por SSH.

## Prueba de restauración

Una copia no está probada hasta que se restaura. Procedimiento:

```bash
# En srv-db
ls /var/backups/alpha
sudo ./scripts/restore.sh /var/backups/alpha/alpha_db-AAAAMMDD-HHMMSS.dump
docker compose -f infra/srv-db/compose.yaml exec alpha-db \
  psql -U alpha_admin -d alpha_db -c 'SELECT count(*) FROM papers;'
```

### Simulacro de pérdida total de srv-db

| Paso | Resultado | Tiempo |
|------|-----------|--------|
| Borrar el volumen (`docker compose down -v`) | | |
| Recrear srv-db (`deploy.sh srv-db`) | | |
| Traer la última copia desde srv-backup | | |
| `restore.sh` | | |
| Comprobar la web | | |
| **Tiempo total de recuperación (RTO)** | | |
| **Datos perdidos (RPO)** | Hasta 24 h | |
