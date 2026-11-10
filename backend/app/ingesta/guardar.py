"""Guarda en la base de datos los artículos encontrados en PubMed.

Si un artículo ya existe (mismo pmid) se actualizan sus datos en vez de
duplicarlo. Uso, desde la carpeta backend:

    python -m app.ingesta.guardar        # 50 artículos más recientes
    python -m app.ingesta.guardar 20     # solo 20
"""

import sys

import psycopg

from app.db import conectar
from app.ingesta.pubmed import buscar_ids, obtener_resumenes

SQL_FUENTE = """
INSERT INTO sources (name, url) VALUES ('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
RETURNING id
"""

# (xmax = 0) es verdadero si la fila se acaba de insertar y falso si se actualizó.
SQL_GUARDAR = """
INSERT INTO papers (pmid, title, authors, journal, publication_date, doi, url, source_id)
VALUES (%(pmid)s, %(title)s, %(authors)s, %(journal)s, %(publication_date)s,
        %(doi)s, %(url)s, %(source_id)s)
ON CONFLICT (pmid) DO UPDATE SET
    title            = EXCLUDED.title,
    authors          = EXCLUDED.authors,
    journal          = EXCLUDED.journal,
    publication_date = EXCLUDED.publication_date,
    doi              = EXCLUDED.doi,
    url              = EXCLUDED.url,
    updated_at       = CURRENT_TIMESTAMP
RETURNING (xmax = 0) AS nuevo
"""


def _limpiar(articulo: dict, source_id: int) -> dict:
    """Adapta un artículo de PubMed a las columnas de la tabla papers."""
    fecha = articulo.get("publication_date")
    return {
        "pmid": articulo["pmid"],
        "title": articulo.get("title") or "(sin título)",
        "authors": articulo.get("authors") or None,
        "journal": (articulo.get("journal") or "")[:200] or None,
        # PubMed da "2024/01/15"; PostgreSQL prefiere "2024-01-15"
        "publication_date": fecha.replace("/", "-") if fecha else None,
        "doi": (articulo.get("doi") or "")[:100] or None,
        "url": articulo.get("url"),
        "source_id": source_id,
    }


def guardar(articulos: list[dict]) -> dict:
    """Inserta o actualiza los artículos. Devuelve cuántos de cada tipo."""
    resultado = {"nuevos": 0, "actualizados": 0, "errores": 0}

    with conectar() as conn:
        source_id = conn.execute(SQL_FUENTE).fetchone()["id"]

        for articulo in articulos:
            try:
                # Cada artículo en su propio savepoint: si uno falla
                # (p. ej. DOI repetido), los demás se guardan igualmente.
                with conn.transaction():
                    fila = conn.execute(SQL_GUARDAR, _limpiar(articulo, source_id)).fetchone()
            except psycopg.Error as e:
                resultado["errores"] += 1
                print(f"PMID {articulo.get('pmid')}: {e}", file=sys.stderr)
                continue

            if fila["nuevo"]:
                resultado["nuevos"] += 1
            else:
                resultado["actualizados"] += 1

    return resultado


def ejecutar(max_resultados: int = 50) -> dict:
    """Busca en PubMed y guarda lo encontrado."""
    return guardar(obtener_resumenes(buscar_ids(max_resultados=max_resultados)))


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    print(ejecutar(n))
