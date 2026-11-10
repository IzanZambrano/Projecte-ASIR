"""Ejecuta la búsqueda en PubMed automáticamente cada día.

Se arranca y se para junto con la API (ver app/main.py). La hora se configura
en el .env con INGESTA_HORA e INGESTA_MINUTO (por defecto, 06:00, después de
la copia de seguridad de las 03:30).

Importante: la API se ejecuta con un solo proceso de uvicorn (Dockerfile).
Si algún día se arranca con varios (--workers), cada uno lanzaría su propia
búsqueda diaria.
"""

import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config import settings
from app.ingesta.guardar import ejecutar

log = logging.getLogger("alpha.ingesta")

ID_TAREA = "ingesta_pubmed"

_programador: BackgroundScheduler | None = None

# Resultado de la última ejecución, para consultarlo en /ingesta/estado
ultima_ejecucion: dict | None = None


def tarea_ingesta() -> None:
    """Busca en PubMed, guarda los artículos y anota el resultado."""
    global ultima_ejecucion
    inicio = datetime.now().astimezone()
    log.info("Ingesta diaria: empieza")
    try:
        resultado = ejecutar(settings.ingesta_max_resultados)
        estado = "ok"
        log.info("Ingesta diaria: %s", resultado)
    except Exception as e:  # PubMed caído, sin red, BD caída...
        resultado = {"error": str(e)}
        estado = "error"
        log.exception("Ingesta diaria: ha fallado")
    ultima_ejecucion = {
        "inicio": inicio.isoformat(timespec="seconds"),
        "fin": datetime.now().astimezone().isoformat(timespec="seconds"),
        "estado": estado,
        "resultado": resultado,
    }


def arrancar() -> None:
    """Programa la tarea diaria. No hace nada si INGESTA_ACTIVA=false."""
    global _programador
    if not settings.ingesta_activa:
        log.info("Ingesta diaria desactivada (INGESTA_ACTIVA=false)")
        return

    _programador = BackgroundScheduler(timezone=settings.ingesta_zona_horaria)
    _programador.add_job(
        tarea_ingesta,
        CronTrigger(
            hour=settings.ingesta_hora,
            minute=settings.ingesta_minuto,
            timezone=settings.ingesta_zona_horaria,
        ),
        id=ID_TAREA,
        max_instances=1,          # nunca dos búsquedas a la vez
        coalesce=True,            # si se acumulan varias pendientes, solo una
        misfire_grace_time=3600,  # si la API estaba parada, se recupera en 1 h
    )
    _programador.start()
    log.info("Ingesta diaria programada; próxima: %s", proxima_ejecucion())


def parar() -> None:
    if _programador is not None and _programador.running:
        _programador.shutdown(wait=False)


def proxima_ejecucion() -> str | None:
    if _programador is None:
        return None
    tarea = _programador.get_job(ID_TAREA)
    if tarea is None or tarea.next_run_time is None:
        return None
    return tarea.next_run_time.isoformat(timespec="seconds")


def estado() -> dict:
    return {
        "activa": _programador is not None and _programador.running,
        "hora": f"{settings.ingesta_hora:02d}:{settings.ingesta_minuto:02d}",
        "zona_horaria": settings.ingesta_zona_horaria,
        "max_resultados": settings.ingesta_max_resultados,
        "proxima_ejecucion": proxima_ejecucion(),
        "ultima_ejecucion": ultima_ejecucion,
    }
