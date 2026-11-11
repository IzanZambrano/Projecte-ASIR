"""Guarda en la base de datos los artículos encontrados en PubMed.

Si un artículo ya existe (mismo pmid) se actualizan sus datos en vez de
duplicarlo. Uso, desde la carpeta backend:

    python -m app.ingesta.guardar        # 50 artículos más recientes
    python -m app.ingesta.guardar 20     # solo 20

Además del título y los datos básicos descarga el resumen (abstract) y, si
hay traductor configurado (TRADUCTOR_URL), traduce título y resumen al
español y al catalán (ver app/ingesta/traducir.py).
"""

import sys

import psycopg

from app.db import conectar
from app.ingesta.pubmed import buscar_ids, obtener_abstracts, obtener_resumenes
from app.ingesta.traducir import traducir_pendientes

SQL_FUENTE = """
INSERT INTO sources (name, url) VALUES ('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
RETURNING id
"""

# (xmax = 0) es verdadero si la fila se acaba de insertar y falso si se actualizó.
SQL_GUARDAR = """
INSERT INTO papers (pmid, title, abstract, authors, journal, publication_date, doi, url, source_id)
VALUES (%(pmid)s, %(title)s, %(abstract)s, %(authors)s, %(journal)s, %(publication_date)s,
        %(doi)s, %(url)s, %(source_id)s)
ON CONFLICT (pmid) DO UPDATE SET
    title            = EXCLUDED.title,
    -- si esta vez no llegó el resumen, se conserva el que ya había
    abstract         = COALESCE(EXCLUDED.abstract, papers.abstract),
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
        # None = no consultado; "" = PubMed no tiene resumen para este artículo
        "abstract": articulo.get("abstract"),
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


SQL_SIN_RESUMEN = "SELECT pmid FROM papers WHERE abstract IS NULL AND pmid IS NOT NULL LIMIT %(n)s"
SQL_PONER_RESUMEN = "UPDATE papers SET abstract = %(abstract)s, updated_at = CURRENT_TIMESTAMP WHERE pmid = %(pmid)s"


def completar_resumenes(maximo: int = 500) -> int:
    """Descarga el resumen de los artículos guardados antes de tenerlo."""
    with conectar() as conn:
        pmids = [f["pmid"] for f in conn.execute(SQL_SIN_RESUMEN, {"n": maximo})]
    if not pmids:
        return 0
    resumenes = obtener_abstracts(pmids)
    with conectar() as conn:
        for pmid in pmids:
            conn.execute(SQL_PONER_RESUMEN, {"pmid": pmid, "abstract": resumenes.get(pmid, "")})
    return len(pmids)


def ejecutar(max_resultados: int = 50) -> dict:
    """Busca en PubMed, guarda lo encontrado (con resumen) y lo traduce."""
    pmids = buscar_ids(max_resultados=max_resultados)
    articulos = obtener_resumenes(pmids)
    resumenes = obtener_abstracts(pmids)
    for articulo in articulos:
        articulo["abstract"] = resumenes.get(articulo["pmid"])

    resultado = guardar(articulos)
    resultado["resumenes_completados"] = completar_resumenes()

    # Si el traductor falla, los artículos ya están guardados: se traducirán
    # en la siguiente ejecución (o a mano con python -m app.ingesta.traducir)
    try:
        resultado["traducciones"] = traducir_pendientes()
    except Exception as e:
        resultado["traducciones"] = {"error": str(e)}
        print(f"Traducción: {e}", file=sys.stderr)
    return resultado


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    print(ejecutar(n))
