# Alpha Research

Plataforma inteligente para la búsqueda, recopilación y organización de información científica sobre **deficiencias de sarcoglicanos** y **distrofias musculares de cinturas**.

Proyecto de segundo curso de **ASIR (Administración de Sistemas Informáticos en Red)** que integra administración de sistemas, redes, virtualización, bases de datos y automatización de tareas.

---

## Descripción

Alpha Research tiene como objetivo centralizar publicaciones y estudios científicos, automatizar la búsqueda periódica de nuevas investigaciones y facilitar el acceso a la información mediante filtros, resúmenes y herramientas de consulta.

El repositorio recoge el desarrollo de la aplicación, la configuración de la infraestructura, la documentación técnica y el seguimiento del proyecto.

> **Estado:** proyecto en fase inicial. La estructura y la infraestructura de las tres máquinas están definidas; la lógica de la API y la web están pendientes. Consulta el [Roadmap](#roadmap).

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
- [ ] Búsqueda automática periódica de nuevas publicaciones en PubMed.
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
| Frontend | HTML estático servido por Nginx |
| Automatización | Ingesta periódica desde PubMed |
| Proxy y HTTPS | Nginx |
| Monitorización | Uptime Kuma, Prometheus, Grafana |

---

## Arquitectura

La plataforma se despliega en **tres servidores**, cada uno con su propio Docker Compose:

| Máquina | Servicios |
|---------|-----------|
| **srv-web** | Nginx (HTTPS, web estática) y la API FastAPI |
| **srv-db** | PostgreSQL |
| **srv-backup** | Copias de seguridad, Uptime Kuma, Prometheus y Grafana |

Detalles en [docs/02-arquitectura.md](docs/02-arquitectura.md) y [docs/03-red.md](docs/03-red.md).

---

## Estructura del repositorio

```text
Projecte-ASIR/
├── backend/                  # API FastAPI
│   └── app/
│       ├── main.py
│       └── ingesta/          # Búsqueda automática en PubMed
├── frontend/                 # Web estática que sirve Nginx
├── database/
│   ├── schema.sql            # Tablas
│   ├── init/                 # Usuarios y permisos al arrancar
│   └── seed.sql              # Datos de prueba
├── infra/                    # Una carpeta por máquina
│   ├── comun/sistema-base.sh # SSH, ufw, fail2ban, Docker (igual en las 3)
│   ├── srv-web/              # compose.yaml, .env.example, nginx/
│   ├── srv-db/               # compose.yaml, .env.example, postgresql/
│   └── srv-backup/           # compose.yaml, .env.example, prometheus/, grafana/
├── scripts/                  # deploy.sh, backup.sh, restore.sh
├── docs/                     # Documentación del proyecto
└── .github/workflows/ci.yml  # Comprueba que todo se construye
```

El mismo repositorio se clona en las tres máquinas y cada una arranca solo su
carpeta de `infra/`. Cada máquina tiene su `.env.example`; el `.env` real con
las contraseñas solo existe en el servidor y **nunca se sube**.

---

## Instalación

Las guías de [docs/04-instalacion/](docs/04-instalacion/) permiten montar cada
máquina desde cero. Orden recomendado:

1. [Sistema base](docs/04-instalacion/sistema-base.md) — en las tres máquinas.
2. [srv-db](docs/04-instalacion/srv-db.md)
3. [srv-web](docs/04-instalacion/srv-web.md)
4. [srv-backup](docs/04-instalacion/srv-backup.md)

Resumen, en cada máquina:

```bash
git clone https://github.com/IzanZambrano/Projecte-ASIR.git
cd Projecte-ASIR
sudo ./infra/comun/sistema-base.sh srv-web     # o srv-db / srv-backup
cp infra/srv-web/.env.example infra/srv-web/.env && nano infra/srv-web/.env
./scripts/deploy.sh srv-web
```

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [01 Introducción](docs/01-introduccion.md) | Objetivos y alcance |
| [02 Arquitectura](docs/02-arquitectura.md) | Diagrama y por qué tres máquinas |
| [03 Red](docs/03-red.md) | IPs, puertos y tabla de comunicaciones |
| [04 Instalación](docs/04-instalacion/) | Montaje de cada máquina paso a paso |
| [05 Seguridad](docs/05-seguridad.md) | Medidas aplicadas en cada máquina |
| [06 Copias](docs/06-copias.md) | Plan de copias y prueba de restauración |
| [07 Monitorización](docs/07-monitorizacion.md) | Uptime Kuma, Prometheus y Grafana |
| [08 Pruebas](docs/08-pruebas.md) | Qué se ha probado y resultados |
| [09 Seguimiento](docs/09-seguimiento.md) | Diario, problemas y soluciones |

---

## Roadmap

Cada fase es un *milestone* en GitHub y cada tarea una *issue* del tablero del proyecto.

1. **Infraestructura** — tres máquinas con sistema base, Docker y red. *(en curso)*
2. **Aplicación** — API, ingesta desde PubMed y web de consulta.
3. **Seguridad** — HTTPS, cortafuegos, permisos de base de datos, pruebas.
4. **Documentación** — guías de instalación, copias, monitorización y memoria.

---

## Contribución

Este es un proyecto académico. Para proponer cambios:

1. Crea una rama con un nombre descriptivo (`feature/nueva-funcionalidad`, `fix/correccion`).
2. Realiza los cambios y añade pruebas cuando sea posible.
3. Abre una *pull request* describiendo la modificación.

---

## Licencia

Pendiente de definir.
