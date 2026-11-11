"""Traduce el título y el resumen de las publicaciones con LibreTranslate.

LibreTranslate es un traductor de código abierto que corre en nuestro propio
servidor (servicio "traductor" de infra/srv-web/compose.yaml): los textos no
salen a ningún servicio externo. Cada artículo se traduce una sola vez y el
resultado se guarda en la tabla paper_traducciones; si el título o el resumen
originales cambian, un trigger de la base de datos borra la traducción vieja
y se vuelve a traducir en la siguiente ejecución.

Se llama automáticamente al final de la búsqueda diaria (app/ingesta/guardar.py).
También se puede lanzar a mano, desde la carpeta backend:

    python -m app.ingesta.traducir        # todo lo pendiente
    python -m app.ingesta.traducir 20     # como máximo 20 artículos por idioma
"""

import sys

import httpx

from app.config import settings
from app.db import conectar

IDIOMA_ORIGEN = "en"

SQL_PENDIENTES = """
SELECT p.id, p.title, p.abstract
FROM papers p
WHERE NOT EXISTS (
    SELECT 1 FROM paper_traducciones t WHERE t.paper_id = p.id AND t.idioma = %(idioma)s
)
ORDER BY p.publication_date DESC NULLS LAST, p.id DESC
LIMIT %(limite)s
"""

SQL_GUARDAR = """
INSERT INTO paper_traducciones (paper_id, idioma, title, abstract)
VALUES (%(paper_id)s, %(idioma)s, %(title)s, %(abstract)s)
ON CONFLICT (paper_id, idioma) DO UPDATE SET
    title = EXCLUDED.title, abstract = EXCLUDED.abstract, created_at = CURRENT_TIMESTAMP
"""


def activo() -> bool:
    return bool(settings.traductor_url)


def idiomas_destino() -> list[str]:
    return [i.strip() for i in settings.traductor_idiomas.split(",") if i.strip()]


def _post(ruta: str, datos: dict, timeout: float) -> dict | list:
    if settings.traductor_api_key:
        datos = {**datos, "api_key": settings.traductor_api_key}
    r = httpx.post(f"{settings.traductor_url.rstrip('/')}{ruta}", json=datos, timeout=timeout)
    r.raise_for_status()
    return r.json()


def idiomas_disponibles() -> set[str]:
    """Idiomas a los que el traductor sabe pasar desde el inglés."""
    r = httpx.get(f"{settings.traductor_url.rstrip('/')}/languages", timeout=15)
    r.raise_for_status()
    for idioma in r.json():
        if idioma["code"] == IDIOMA_ORIGEN:
            return set(idioma.get("targets", []))
    return set()


def traducir_textos(textos: list[str], destino: str) -> list[str]:
    """Traduce varios textos del inglés a `destino` en una sola petición."""
    respuesta = _post(
        "/translate",
        {"q": textos, "source": IDIOMA_ORIGEN, "target": destino, "format": "text"},
        timeout=300,  # un resumen largo puede tardar en un servidor sin GPU
    )
    traducidos = respuesta["translatedText"]
    return traducidos if isinstance(traducidos, list) else [traducidos]


def traducir_pendientes(limite: int = 200) -> dict:
    """Traduce los artículos que aún no tienen traducción. Devuelve un resumen."""
    if not activo():
        return {"activo": False}

    disponibles = idiomas_disponibles()
    resultado: dict = {}
    for idioma in idiomas_destino():
        if idioma not in disponibles:
            resultado[idioma] = "idioma no disponible en el traductor"
            continue

        with conectar() as conn:
            pendientes = conn.execute(SQL_PENDIENTES, {"idioma": idioma, "limite": limite}).fetchall()

        hechos = errores = 0
        for paper in pendientes:
            textos = [paper["title"]] + ([paper["abstract"]] if paper["abstract"] else [])
            try:
                traducidos = traducir_textos(textos, idioma)
            except (httpx.HTTPError, KeyError) as e:
                errores += 1
                print(f"Traducción {idioma} del artículo {paper['id']}: {e}", file=sys.stderr)
                continue
            with conectar() as conn:
                conn.execute(SQL_GUARDAR, {
                    "paper_id": paper["id"],
                    "idioma": idioma,
                    "title": traducidos[0],
                    "abstract": traducidos[1] if len(traducidos) > 1 else None,
                })
            hechos += 1
        resultado[idioma] = {"traducidos": hechos, "errores": errores}
    return resultado


if __name__ == "__main__":
    if not activo():
        sys.exit("TRADUCTOR_URL no está configurado en el .env")
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    print(traducir_pendientes(n))
