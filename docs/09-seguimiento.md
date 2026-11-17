# 9. Seguimiento del proyecto

Las tareas se gestionan en GitHub: **Issues** (una por tarea), tablero en
**Projects** (Pendiente / En curso / Hecho) y **Milestones** por fase.

| Fase (milestone) | Fecha prevista | Fecha real |
|------------------|----------------|------------|
| Infraestructura | | |
| Aplicación | | |
| Seguridad | | |
| Documentación | | |

## Diario

Una entrada por sesión de trabajo. Lo más valioso para el tribunal son los
**problemas y cómo se resolvieron**.

### 2026-11-10 — Cambio de IP de srv-web

- **Hecho:** srv-web pasa a tener la IP 192.168.248.33 (dentro de la red
  `192.168.0.0/16`); srv-db y srv-backup no cambian. Actualizados
  `sistema-base.sh`, `pg_hba.conf`, `prometheus.yml` y la documentación.
- **Pendiente en los servidores:** en srv-db, permitir el puerto 5432 desde la
  nueva IP (`sudo ufw allow from 192.168.248.33 to any port 5432 proto tcp`) y
  recargar PostgreSQL para que lea el nuevo `pg_hba.conf`.
- **Issue:** #

### 2026-11-03 — Instalación de Ubuntu Server y red de los servidores físicos

- **Hecho:** paso de máquinas virtuales (Debian, VirtualBox) a tres equipos
  físicos con Ubuntu Server. IPs fijas 192.168.116.30/31/32 con netplan.
- **Problema:** con la IP fija los servidores llegaban a 192.168.116.1 pero no
  tenían Internet ni DNS. Además `netplan apply` mostraba el aviso
  `ovsdb-server.service is not running`.
- **Solución:** comparando con el PC de administración (`ip -br a`, `ip route`,
  `/etc/resolv.conf`) se vio que la red del instituto es `192.168.0.0/16`, con
  puerta de enlace y DNS `192.168.88.88`. Se cambió la máscara a /16 y la
  puerta de enlace y el DNS en netplan. El aviso de Open vSwitch es inofensivo
  (no se usa OVS).
- **Issue:** #

### 2026-11-17 — Web y base de datos unificadas en srv-app

- **Hecho:** srv-web y srv-db pasan a ser una sola máquina, **srv-app**
  (192.168.248.33), con Nginx, API, traductor y PostgreSQL en un único
  `compose.yaml`. srv-backup queda en otra máquina (Ubuntu Server 26.04).
- **Motivo:** menos equipos físicos que mantener y PostgreSQL deja de estar
  expuesto en la red (solo existe en la red interna de Docker).
- **Problema encontrado antes:** la base de datos de srv-db se había creado con
  el esquema antiguo y la ingesta fallaba (`column "pmid" does not exist`).
  Se resolvió con las migraciones 001 y 002; en srv-app la base de datos nueva
  ya se crea con el esquema completo.
- **Issue:** #

### AAAA-MM-DD — _Título_

- **Hecho:**
- **Problema:**
- **Solución:**
- **Issue:** #
