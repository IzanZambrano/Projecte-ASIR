# 1. Introducción

## Contexto

Las deficiencias de sarcoglicanos son un grupo de distrofias musculares de
cinturas (LGMD) poco frecuentes. La investigación está dispersa en muchas
revistas y es difícil seguirla al día.

## Objetivos

1. Recopilar automáticamente publicaciones científicas sobre el tema (PubMed).
2. Almacenarlas en una base de datos consultable.
3. Ofrecer una API y una web para buscar y filtrar.
4. Desplegarlo en una infraestructura de **tres servidores** segura,
   monitorizada y con copias de seguridad probadas.

## Alcance

| Incluido | Fuera de alcance |
|----------|------------------|
| Ingesta periódica desde PubMed | Otras fuentes (posibles mejoras) |
| API REST de consulta | Gestión de usuarios con roles |
| Web de búsqueda | Alta disponibilidad / clúster |
| HTTPS, cortafuegos, fail2ban | Despliegue en la nube |
| Copias automáticas y restauración | |
| Monitorización y alertas | |

## Equipo y reparto

| Persona | Responsabilidades |
|---------|-------------------|
| _Nombre_ | _p. ej. srv-web, Nginx, frontend_ |
| _Nombre_ | _p. ej. srv-db, PostgreSQL, copias_ |
