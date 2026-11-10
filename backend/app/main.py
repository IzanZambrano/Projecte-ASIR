import logging
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.papers import router as papers_router
from app.config import settings
from app.db import conectar
from app.ingesta import programador

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    programador.arrancar()   # al arrancar la API
    yield
    programador.parar()      # al pararla


app = FastAPI(
    title="Alpha Research API",
    description="API para la búsqueda, recopilación y organización de publicaciones científicas",
    version="0.3.0",
    lifespan=ciclo_de_vida,
    root_path=settings.api_root_path,
)

app.include_router(papers_router)


@app.get("/health")
def health_check():
    """Comprueba que la API responde y que llega a la base de datos."""
    try:
        with conectar() as conn:
            conn.execute("SELECT 1")
    except psycopg.Error:
        return JSONResponse(
            status_code=503, content={"status": "error", "database": "error"}
        )
    return {"status": "ok", "database": "ok"}


@app.get("/ingesta/estado", tags=["ingesta"])
def estado_ingesta():
    """Hora programada, próxima ejecución y resultado de la última búsqueda diaria."""
    return programador.estado()


@app.get("/")
def root():
    return {"message": "Alpha Research API", "docs": "/docs"}
