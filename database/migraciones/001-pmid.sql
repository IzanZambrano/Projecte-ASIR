-- Migración 001: añade el identificador de PubMed (pmid) a papers.
-- Solo hace falta en bases de datos creadas antes de este cambio;
-- las nuevas ya lo traen desde schema.sql. Se puede ejecutar varias veces.
--
-- Uso (en srv-db):
--   docker compose exec -T alpha-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--       < ../../database/migraciones/001-pmid.sql

ALTER TABLE papers ADD COLUMN IF NOT EXISTS pmid VARCHAR(20);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'papers_pmid_key'
    ) THEN
        ALTER TABLE papers ADD CONSTRAINT papers_pmid_key UNIQUE (pmid);
    END IF;
END
$$;
