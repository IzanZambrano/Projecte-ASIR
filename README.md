# Alpha Research

Alpha Research es un proyecto de segundo curso de ASIR (Administración de Sistemas Informáticos en Red) orientado al desarrollo de una plataforma inteligente para facilitar la búsqueda, recopilación y organización de información científica relacionada con las deficiencias de sarcoglicanos y las distrofias musculares de cinturas.

## Objetivos

El proyecto tiene como objetivo:

- Centralizar publicaciones y estudios científicos.
- Automatizar la búsqueda periódica de nuevas investigaciones.
- Facilitar el acceso a la información mediante filtros, resúmenes y herramientas de consulta.

## Tecnologías

La solución contempla el uso de tecnologías como:

- Linux
- Docker
- Python
- FastAPI
- PostgreSQL

En ella se aplican conocimientos de administración de sistemas, redes, virtualización, bases de datos y automatización de tareas.

## Contenido del repositorio

Este repositorio recoge el desarrollo, la configuración de la infraestructura, la documentación técnica y el seguimiento del proyecto.


Estás trabajando en el repositorio "Alpha Research", un proyecto de segundo curso de ASIR escrito en español. Es una plataforma para buscar, recopilar y organizar publicaciones científicas sobre deficiencias de sarcoglicanos y distrofias musculares de cinturas, con Linux, Docker, Python, FastAPI y PostgreSQL.

Estructura actual en la raíz:
- backend/app/ (código Python con FastAPI)
- database/
- infra/ (compose.yaml)
- frontend/
- .env.example, .gitignore, .gitkeep
- README.md

Objetivo: mejorar la estructura del proyecto y la calidad del README.md.

Reglas estrictas:
1. No añadas información nueva a ningún archivo. Solo puedes mover, renombrar, reordenar o reformatear lo que ya existe.
2. No inventes secciones con contenido que no esté en el proyecto. Por ejemplo, si el README no explica cómo instalar nada, no escribas una sección de instalación con comandos. Esa sección no se crea.
3. No modifiques la lógica del código Python. Si mover un archivo obliga a cambiar imports, rutas o referencias (por ejemplo, en compose.yaml), actualiza solo esas referencias y lístalas.
4. No borres nada. Si algo parece sobrante o duplicado (por ejemplo, lo que quede en database/ tras mover compose.yaml a infra/), dímelo y no lo toques.
5. No abras ni modifiques .env. Solo puedes leer .env.example.
6. Conserva todas las frases y datos del README. Puedes reordenarlas, convertirlas en secciones o mejorar la redacción, pero sin cambiar su significado ni perder información.
7. No muevas nada dentro de backend/app sin proponérmelo antes en la fase 1.

Fase 1 (no modifiques nada todavía):
- Lista los archivos del repo con `git ls-files` y revisa el contenido de cada carpeta.
- Muéstrame la estructura actual y la propuesta, con cada movimiento (ruta antigua → ruta nueva).
- Indica qué imports, rutas o referencias se romperían con cada movimiento.
- Propón la estructura del README: las secciones y qué contenido existente va en cada una.
- Dime qué no tienes claro.
- Espera mi confirmación antes de editar.

Fase 2 (solo tras mi confirmación):
- Aplica los cambios aprobados.
- Al final, dame una tabla con cada movimiento y un resumen de los cambios en el README.
- Dime qué habría que comprobar para verificar que no se ha roto nada.
