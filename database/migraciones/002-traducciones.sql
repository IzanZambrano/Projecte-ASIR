-- Migración 002: tabla de traducciones (español y catalán) de las publicaciones.
-- Solo hace falta en bases de datos creadas antes de este cambio;
-- las nuevas ya la traen desde schema.sql. Se puede ejecutar varias veces.
--
-- Uso (en srv-db, como administrador: así alpha_app recibe permisos automáticamente):
--   docker compose exec -T alpha-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--       < ../../database/migraciones/002-traducciones.sql

-- Traducciones automáticas (LibreTranslate) del título y el resumen
CREATE TABLE IF NOT EXISTS paper_traducciones (
    paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
    idioma VARCHAR(5) NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (paper_id, idioma)
);

-- Si cambia el título o el resumen original, la traducción deja de valer:
-- se borra y la siguiente ejecución de la ingesta la vuelve a crear.
CREATE OR REPLACE FUNCTION borrar_traducciones_obsoletas() RETURNS trigger AS $$
BEGIN
    DELETE FROM paper_traducciones WHERE paper_id = NEW.id;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS papers_traducciones_obsoletas ON papers;
CREATE TRIGGER papers_traducciones_obsoletas
    AFTER UPDATE OF title, abstract ON papers
    FOR EACH ROW
    WHEN (OLD.title IS DISTINCT FROM NEW.title OR OLD.abstract IS DISTINCT FROM NEW.abstract)
    EXECUTE FUNCTION borrar_traducciones_obsoletas();
