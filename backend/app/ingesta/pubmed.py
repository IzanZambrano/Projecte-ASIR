"""Cliente mínimo de las E-utilities de PubMed (NCBI).

Documentación: https://www.ncbi.nlm.nih.gov/books/NBK25501/
Sin API key, NCBI permite 3 peticiones por segundo; con NCBI_API_KEY, 10.
"""

import os
from xml.etree import ElementTree

import httpx

EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

TERMINO_POR_DEFECTO = (
    '("sarcoglycanopathy" OR "sarcoglycan deficiency" '
    'OR "limb-girdle muscular dystrophy")'
)


def _params(**extra):
    params = {"db": "pubmed", "retmode": "json", **extra}
    api_key = os.getenv("NCBI_API_KEY")
    if api_key:
        params["api_key"] = api_key
    return params


def buscar_ids(termino: str = TERMINO_POR_DEFECTO, max_resultados: int = 50) -> list[str]:
    """Devuelve los PMID de los artículos más recientes que cumplen el término."""
    r = httpx.get(
        f"{EUTILS}/esearch.fcgi",
        params=_params(term=termino, retmax=max_resultados, sort="pub_date"),
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["esearchresult"]["idlist"]


def obtener_resumenes(pmids: list[str]) -> list[dict]:
    """Devuelve título, revista, fecha, autores y DOI de cada PMID."""
    if not pmids:
        return []
    r = httpx.get(
        f"{EUTILS}/esummary.fcgi",
        params=_params(id=",".join(pmids)),
        timeout=30,
    )
    r.raise_for_status()
    resultado = r.json()["result"]

    articulos = []
    for pmid in resultado["uids"]:
        doc = resultado[pmid]
        doi = next(
            (i["value"] for i in doc.get("articleids", []) if i["idtype"] == "doi"),
            None,
        )
        articulos.append(
            {
                "pmid": pmid,
                "title": doc.get("title"),
                "journal": doc.get("fulljournalname"),
                "publication_date": doc.get("sortpubdate", "")[:10] or None,
                "authors": ", ".join(a["name"] for a in doc.get("authors", [])),
                "doi": doi,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            }
        )
    return articulos


def _texto(nodo) -> str:
    """Texto de un nodo XML incluyendo etiquetas internas (<i>, <sup>...)."""
    return " ".join("".join(nodo.itertext()).split())


def obtener_abstracts(pmids: list[str], tanda: int = 200) -> dict[str, str]:
    """Descarga el resumen (abstract) de cada artículo con efetch (XML).

    Devuelve {pmid: abstract}. Si PubMed no tiene resumen para un artículo,
    su valor es "" (así se distingue de "todavía no consultado", que es NULL).
    Los resúmenes estructurados (BACKGROUND, METHODS...) se unen en párrafos.
    """
    resumenes: dict[str, str] = {}
    for i in range(0, len(pmids), tanda):
        grupo = pmids[i : i + tanda]
        r = httpx.post(
            f"{EUTILS}/efetch.fcgi",
            data={**_params(id=",".join(grupo)), "retmode": "xml", "rettype": "abstract"},
            timeout=60,
        )
        r.raise_for_status()
        raiz = ElementTree.fromstring(r.content)
        for articulo in raiz.iter("PubmedArticle"):
            pmid = articulo.findtext("MedlineCitation/PMID")
            if not pmid:
                continue
            parrafos = []
            for parte in articulo.findall("MedlineCitation/Article/Abstract/AbstractText"):
                texto = _texto(parte)
                if not texto:
                    continue
                etiqueta = parte.get("Label")
                parrafos.append(f"{etiqueta.capitalize()}: {texto}" if etiqueta else texto)
            resumenes[pmid] = "\n\n".join(parrafos)
    return resumenes


if __name__ == "__main__":
    for articulo in obtener_resumenes(buscar_ids(max_resultados=5)):
        print(articulo["publication_date"], "-", articulo["title"])
