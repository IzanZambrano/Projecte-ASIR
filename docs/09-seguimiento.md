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

### AAAA-MM-DD — _Título_

- **Hecho:**
- **Problema:**
- **Solución:**
- **Issue:** #
