# Alpha Research

Plataforma inteligente para la búsqueda, recopilación y organización de información científica sobre **deficiencias de sarcoglicanos** y **distrofias musculares de cinturas**.

Proyecto de segundo curso de **ASIR (Administración de Sistemas Informáticos en Red)** que integra administración de sistemas, redes, virtualización, bases de datos y automatización de tareas.

---

## Descripción

Alpha Research tiene como objetivo centralizar publicaciones y estudios científicos, automatizar la búsqueda periódica de nuevas investigaciones y facilitar el acceso a la información mediante filtros, resúmenes y herramientas de consulta.

El repositorio recoge el desarrollo de la aplicación, la configuración de la infraestructura, la documentación técnica y el seguimiento del proyecto.

> **Estado:** proyecto en fase inicial. La estructura del repositorio está definida, pero la lógica de la API, el esquema de base de datos y la orquestación con Docker están pendientes de implementación. Consulta el [Roadmap](#roadmap).

---

## Objetivos

- Centralizar publicaciones y estudios científicos relevantes.
- Automatizar la búsqueda periódica de nuevas investigaciones.
- Permitir filtrar y consultar la información de forma sencilla.
- Generar resúmenes que faciliten la lectura de los documentos.
- Ofrecer una API y una interfaz web para acceder a los datos.

---

## Funcionalidades previstas

- [ ] Registro y consulta de publicaciones científicas.
- [ ] Búsqueda por palabras clave, autor, fecha y fuente.
- [ ] Búsqueda automática periódica de nuevas publicaciones (worker).
- [ ] Resúmenes automáticos de los estudios.
- [ ] API REST para consulta de datos.
- [ ] Interfaz web de consulta y filtrado.

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Sistema operativo | Linux |
| Contenedores | Docker y Docker Compose |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL |
| Frontend | Por definir |
| Automatización | Worker de búsqueda periódica |

---

## Estructura del repositorio

```text
Projecte-ASIR/
├── backend/                  # API FastAPI
│   └── app/
│       ├── main.py           # Punto de entrada de la API
│       ├── api/              # Rutas y endpoints
│       ├── services/         # Lógica de negocio
│       └── db/               # Acceso a datos y modelos
├── database/
│   └── schema.sql            # Esquema de la base de datos
├── frontend/                 # Interfaz web
├── infra/
│   └── compose.yaml          # Orquestación de servicios con Docker
├── worker/                   # Búsqueda automática de publicaciones
├── scripts/                  # Scripts de utilidad y automatización
├── tests/                    # Pruebas del proyecto
├── docs/                     # Documentación técnica
├── .env.example              # Plantilla de variables de entorno
└── README.md
```

> Algunas carpetas se irán creando a medida que avance el desarrollo.

---

## Requisitos previos

- Linux (o entorno compatible)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)
- Python 3.11 o superior (para ejecutar el backend fuera de Docker)
- PostgreSQL 15 o superior (si no se usa Docker)

---

## Instalación y puesta en marcha

> La infraestructura todavía está en desarrollo, por lo que estos pasos describen el flujo previsto y pueden no funcionar hasta completar la implementación.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Projecte-ASIR
```

### 2. Configurar las variables de entorno

Copia la plantilla y ajusta los valores:

```bash
cp .env.example .env
```

Edita `.env` y cambia, como mínimo, la contraseña de PostgreSQL. **Nunca subas el archivo `.env` al repositorio.**

### 3. Levantar los servicios con Docker

```bash
docker compose -f infra/compose.yaml up -d
```

### 4. Comprobar el estado

```bash
docker compose -f infra/compose.yaml ps
```

La API quedará disponible en `http://localhost:8000` (según `API_PORT`).

---

## Variables de entorno

Se definen en el archivo `.env` (basado en `.env.example`):

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `POSTGRES_DB` | Nombre de la base de datos | `alpha_db` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `alpha_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | *(cambiar obligatoriamente)* |
| `POSTGRES_HOST` | Host del servicio de base de datos | `alpha-db` |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |
| `API_PORT` | Puerto de la API | `8000` |

---

## Base de datos

El esquema se define en `database/schema.sql` y se cargará en el contenedor de PostgreSQL al inicializar la base de datos. Actualmente contiene únicamente la cabecera del esquema; las tablas se añadirán en las siguientes iteraciones.

---

## Roadmap

1. **Estructura inicial** — organización de carpetas y ficheros base. *(en curso)*
2. **Infraestructura** — `compose.yaml` con PostgreSQL y API funcionales.
3. **Base de datos** — diseño e implementación del esquema en `schema.sql`.
4. **Backend** — API REST con FastAPI y endpoint de estado `/health`.
5. **Worker** — búsqueda automática periódica de publicaciones.
6. **Frontend** — interfaz de consulta y filtrado.
7. **Documentación y pruebas** — tests, documentación técnica y despliegue.

---

## Contribución

Este es un proyecto académico. Para proponer cambios:

1. Crea una rama con un nombre descriptivo (`feature/nueva-funcionalidad`, `fix/correccion`).
2. Realiza los cambios y añade pruebas cuando sea posible.
3. Abre una *pull request* describiendo la modificación.

---

## Licencia

Pendiente de definir.
