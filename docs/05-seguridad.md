# 5. Seguridad

## Medidas comunes (las tres máquinas)

Aplicadas por `infra/comun/sistema-base.sh`.

| Medida | Cómo | Cómo comprobarlo |
|--------|------|------------------|
| SSH solo con clave, sin root | `/etc/ssh/sshd_config.d/10-proyecto.conf` | `ssh -o PubkeyAuthentication=no admin@IP` → rechazado |
| Bloqueo de fuerza bruta | fail2ban, 5 intentos → 1 h | `sudo fail2ban-client status sshd` |
| Cortafuegos | ufw, deny por defecto + [tabla de red](03-red.md) | `sudo ufw status verbose` |
| Parches de seguridad | unattended-upgrades | `cat /var/log/unattended-upgrades/*.log` |
| Secretos fuera de Git | `.env` en `.gitignore`, permisos 600 | `git status` no lo muestra |

## srv-web

- HTTPS obligatorio (HTTP → 301), solo TLS 1.2/1.3.
- Cabeceras HSTS, `X-Frame-Options`, `X-Content-Type-Options`; versión de Nginx oculta.
- La API no publica puertos: solo se llega a ella a través de Nginx.
- La API usa `alpha_app`, que **no** puede crear ni borrar tablas.

## srv-db

- `pg_hba.conf`: solo `alpha_app` desde la IP de srv-web; todo lo demás `reject`.
- Contraseñas con `scram-sha-256`.
- Registro de conexiones y consultas lentas.
- Principio de mínimo privilegio: administrador (`alpha_admin`) y aplicación (`alpha_app`) separados.

## srv-backup

- Las copias llegan con un usuario sin privilegios (`copias`) y solo por clave SSH.
- Grafana sin registro público de usuarios.

## Docker y ufw

Docker añade sus propias reglas de iptables para los puertos publicados con
`ports:` y **se salta ufw**. Por eso:

- PostgreSQL y node-exporter usan `network_mode: host`, de modo que ufw sí los filtra.
- En srv-web los puertos publicados (80/443) son públicos de todas formas.
- En srv-backup, Grafana, Uptime Kuma y Prometheus quedan accesibles desde
  toda la red local. _Mejora pendiente: reglas en la cadena `DOCKER-USER`._

## Pruebas de seguridad realizadas

_Ver [08-pruebas.md](08-pruebas.md): escaneo con nmap desde fuera, intento de
conexión a PostgreSQL desde una IP no autorizada, baneo de fail2ban…_
