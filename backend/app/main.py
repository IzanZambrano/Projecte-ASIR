import psycopg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.papers import router as papers_router
from app.db import conectar

app = FastAPI(
    title="Alpha Research API",
    description="API para la búsqueda, recopilación y organización de publicaciones científicas",
    version="0.2.0",
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


@app.get("/")
def root():
    return {"message": "Alpha Research API", "docs": "/docs"}
