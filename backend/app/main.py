from fastapi import FastAPI

app = FastAPI(
    title="Alpha Research API",
    description="API para la búsqueda, recopilación y organización de publicaciones científicas",
    version="0.1.0",
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Alpha Research API", "docs": "/docs"}
