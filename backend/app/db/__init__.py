"""Conexión a PostgreSQL (srv-db)."""

import psycopg
from psycopg.rows import dict_row

from app.config import settings


def conectar() -> psycopg.Connection:
    """Abre una conexión nueva. Las filas se devuelven como diccionarios.

    Uso:
        with conectar() as conn:
            conn.execute(...)
    Al salir del "with" se hace commit (o rollback si hubo error) y se cierra.
    """
    return psycopg.connect(
        host=settings.postgres_host,
        port=settings.postgres_port,
        dbname=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password,
        connect_timeout=5,
        row_factory=dict_row,
    )
