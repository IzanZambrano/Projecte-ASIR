"""Buscador de publicaciones: /papers y /papers/{id}."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.db import conectar

router = APIRouter(prefix="/papers", tags=["papers"])

COLUMNAS = """
    p.id, p.pmid, p.title, p.authors, p.journal, p.publication_date,
    p.doi, p.url, s.name AS source
"""


@router.get("")
def buscar_papers(
    q: str | None = Query(None, description="Texto a buscar en el título o el resumen"),
    autor: str | None = Query(None, description="Parte del nombre de un autor"),
    desde: date | None = Query(None, description="Publicados desde (AAAA-MM-DD)"),
    hasta: date | None = Query(None, description="Publicados hasta (AAAA-MM-DD)"),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
):
    """Lista las publicaciones, de la más reciente a la más antigua."""
    condiciones = []
    params: dict = {}

    if q:
        condiciones.append("(p.title ILIKE %(q)s OR p.abstract ILIKE %(q)s)")
        params["q"] = f"%{q}%"
    if autor:
        condiciones.append("p.authors ILIKE %(autor)s")
        params["autor"] = f"%{autor}%"
    if desde:
        condiciones.append("p.publication_date >= %(desde)s")
        params["desde"] = desde
    if hasta:
        condiciones.append("p.publication_date <= %(hasta)s")
        params["hasta"] = hasta

    where = ("WHERE " + " AND ".join(condiciones)) if condiciones else ""
    params["limite"] = por_pagina
    params["offset"] = (pagina - 1) * por_pagina

    with conectar() as conn:
        total = conn.execute(
            f"SELECT count(*) AS n FROM papers p {where}", params
        ).fetchone()["n"]
        resultados = conn.execute(
            f"""
            SELECT {COLUMNAS}
            FROM papers p LEFT JOIN sources s ON s.id = p.source_id
            {where}
            ORDER BY p.publication_date DESC NULLS LAST, p.id DESC
            LIMIT %(limite)s OFFSET %(offset)s
            """,
            params,
        ).fetchall()

    return {
        "total": total,
        "pagina": pagina,
        "por_pagina": por_pagina,
        "resultados": resultados,
    }


@router.get("/{paper_id}")
def ver_paper(paper_id: int):
    """Devuelve una publicación con su resumen y sus palabras clave."""
    with conectar() as conn:
        paper = conn.execute(
            f"""
            SELECT {COLUMNAS}, p.abstract, p.summary, p.created_at, p.updated_at
            FROM papers p LEFT JOIN sources s ON s.id = p.source_id
            WHERE p.id = %(id)s
            """,
            {"id": paper_id},
        ).fetchone()
        if paper is None:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        paper["keywords"] = [
            fila["keyword"]
            for fila in conn.execute(
                "SELECT keyword FROM paper_keywords WHERE paper_id = %(id)s ORDER BY keyword",
                {"id": paper_id},
            )
        ]
    return paper
