#!/bin/bash
# Prepara una máquina Debian/Ubuntu recién instalada: paquetes, SSH, ufw,
# fail2ban y Docker. Es igual en las tres máquinas salvo las reglas de ufw.
#
# Uso (como root):   ./sistema-base.sh srv-web|srv-db|srv-backup
#
# Antes de ejecutarlo, copia tu clave pública al servidor (ssh-copy-id):
# este script DESACTIVA el acceso SSH con contraseña.

set -euo pipefail

# --- Red del proyecto (debe coincidir con docs/03-red.md) ---------------------
SRV_WEB=192.168.56.10
SRV_DB=192.168.56.11
SRV_BACKUP=192.168.56.12
RED_ADMIN=192.168.56.0/24     # Desde donde se administra por SSH
USUARIO_ADMIN=${SUDO_USER:-admin}
# -----------------------------------------------------------------------------

ROL=${1:-}
case "$ROL" in
    srv-web|srv-db|srv-backup) ;;
    *) echo "Uso: $0 srv-web|srv-db|srv-backup" >&2; exit 1 ;;
esac
[[ $EUID -eq 0 ]] || { echo "Ejecutar como root" >&2; exit 1; }
# Evita quedarse fuera: el usuario admin debe existir y tener una clave SSH
if [[ ! -s "$(getent passwd "$USUARIO_ADMIN" | cut -d: -f6)/.ssh/authorized_keys" ]]; then
    echo "$USUARIO_ADMIN no tiene ~/.ssh/authorized_keys; ejecuta antes ssh-copy-id" >&2
    exit 1
fi

echo "==> Nombre de la máquina y zona horaria"
hostnamectl set-hostname "$ROL"
timedatectl set-timezone Europe/Madrid

echo "==> Paquetes base y actualizaciones automáticas de seguridad"
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
DEBIAN_FRONTEND=noninteractive apt-get -y install \
    ca-certificates curl git rsync ufw fail2ban unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> SSH: sin root y sin contraseñas"
cat > /etc/ssh/sshd_config.d/10-proyecto.conf <<CONF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers $USUARIO_ADMIN copias
CONF
sshd -t
systemctl reload ssh

echo "==> fail2ban para SSH"
cat > /etc/fail2ban/jail.d/sshd.local <<CONF
[sshd]
enabled  = true
backend  = systemd
maxretry = 5
findtime = 10m
bantime  = 1h
CONF
systemctl enable --now fail2ban
systemctl restart fail2ban

echo "==> Cortafuegos ufw ($ROL)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow from "$RED_ADMIN" to any port 22 proto tcp comment 'SSH administracion'
ufw allow from "$SRV_BACKUP" to any port 9100 proto tcp comment 'node-exporter'
case "$ROL" in
    srv-web)
        ufw allow 80/tcp  comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        ;;
    srv-db)
        ufw allow from "$SRV_WEB" to any port 5432 proto tcp comment 'PostgreSQL desde la API'
        ;;
    srv-backup)
        ufw allow from "$SRV_DB" to any port 22 proto tcp comment 'rsync de copias'
        # Prometheus (en un contenedor) leyendo el node-exporter de esta misma máquina
        ufw allow from 172.16.0.0/12 to any port 9100 proto tcp comment 'node-exporter local'
        ;;
esac
ufw --force enable

if [[ $ROL == srv-backup ]]; then
    echo "==> Usuario 'copias' que recibe los volcados de srv-db por rsync"
    id copias >/dev/null 2>&1 || useradd --create-home --shell /bin/bash copias
    install -d -o copias -g copias -m 700 /srv/backups/alpha /home/copias/.ssh
fi

echo "==> Docker (repositorio oficial)"
if ! command -v docker >/dev/null; then
    curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker "$USUARIO_ADMIN"
systemctl enable --now docker

echo
echo "Listo. Cierra la sesión y vuelve a entrar para usar docker sin sudo."
ufw status verbose
