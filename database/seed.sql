-- Datos de prueba. NO se cargan automáticamente.
-- Uso (en srv-db):
--   docker compose exec -T alpha-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < ../../database/seed.sql

INSERT INTO sources (name, url) VALUES
    ('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/')
ON CONFLICT (name) DO NOTHING;

INSERT INTO papers (title, authors, journal, publication_date, doi, url, source_id)
SELECT 'Artículo de ejemplo sobre sarcoglicanopatías',
       'Autor A, Autor B',
       'Revista de prueba',
       DATE '2024-01-15',
       '10.0000/ejemplo.0001',
       'https://example.org/articulo-1',
       id
FROM sources WHERE name = 'PubMed'
ON CONFLICT (doi) DO NOTHING;

INSERT INTO paper_keywords (paper_id, keyword)
SELECT id, k
FROM papers, unnest(ARRAY['LGMD', 'sarcoglicano']) AS k
WHERE doi = '10.0000/ejemplo.0001'
ON CONFLICT DO NOTHING;
