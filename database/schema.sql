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

CREATE INDEX IF NOT EXISTS idx_papers_publication_date ON papers (publication_date);
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers (title);
CREATE INDEX IF NOT EXISTS idx_paper_keywords_keyword ON paper_keywords (keyword);
