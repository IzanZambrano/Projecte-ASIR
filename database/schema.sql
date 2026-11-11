-- Esquema de la base de datos de Alpha Research
-- Inicialización PostgreSQL

CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    pmid VARCHAR(20) UNIQUE,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT,
    journal VARCHAR(200),
    publication_date DATE,
    doi VARCHAR(100) UNIQUE,
    url TEXT,
    source_id INTEGER REFERENCES sources(id),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paper_keywords (
    paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    PRIMARY KEY (paper_id, keyword)
);

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

CREATE INDEX IF NOT EXISTS idx_papers_publication_date ON papers (publication_date);
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers (title);
CREATE INDEX IF NOT EXISTS idx_paper_keywords_keyword ON paper_keywords (keyword);
