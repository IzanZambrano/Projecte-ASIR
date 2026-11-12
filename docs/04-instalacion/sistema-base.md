# 4.0 Sistema base (las tres máquinas)

Seguir esta guía en **cada** máquina antes de su guía específica.
Las máquinas son equipos físicos con **Ubuntu Server LTS** (24.04 o 26.04) y
se administran desde un PC con Manjaro. Datos de red en [03-red.md](../03-red.md).

| Máquina | Hostname | IP |
|---------|----------|----|
| Servidor 1 | `srv-web` | 192.168.248.33/16 |
| Servidor 2 | `srv-db` | 192.168.248.9/16 |
| Servidor 3 | `srv-backup` | 192.168.116.32/16 |

## 0. Preparar el PC de administración (Manjaro)

```bash
sudo pacman -S --needed openssh git nmap openbsd-netcat
ping -c2 192.168.248.33      # 192.168.248.33, 192.168.248.9 y .32 NO deben responder (libres)
ssh-keygen -t ed25519        # solo si no hay clave
```

Grabar la ISO *Ubuntu Server live (amd64)* en un USB:

```bash
lsblk                        # identificar el USB, p. ej. /dev/sdb
sudo dd if=ubuntu-*-live-server-amd64.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

## 1. Instalar Ubuntu Server

Arrancar desde el USB y, en el instalador:

1. Idioma y teclado: Español.
2. Tipo de instalación: **Ubuntu Server** (no *minimized*).
3. Red: tarjeta → *Edit IPv4* → *Manual*:

   | Campo | Valor |
   |-------|-------|
   | Subnet | `192.168.0.0/16` |
   | Address | `192.168.248.33` (srv-web) / `192.168.248.9` (srv-db) / `192.168.116.32` (srv-backup) |
   | Gateway | `192.168.88.88` |
   | Name servers | `192.168.88.88` |
   | Search domains | `iesthosicodina.cat` |

4. Proxy vacío y mirror por defecto.
5. Disco: *Use an entire disk*, **desmarcar LVM** (así se usa todo el disco).
6. Perfil: nombre del servidor `srv-web` / `srv-db` / `srv-backup` y usuario
   `admin`. Si el instalador no permite `admin`, usar otro nombre y cambiar
   `/home/admin/` por el nuevo en el cron de [srv-db](srv-db.md).
7. Ubuntu Pro: *Skip*.
8. Marcar **Install OpenSSH server**.
9. *Featured snaps*: **no marcar nada** (sobre todo no `docker`; el script
   instala el Docker oficial y se niega a continuar si encuentra el snap).
10. Reiniciar y retirar el USB.

## 2. IP fija con netplan (si no se configuró en el instalador)

Ubuntu usa netplan, no `/etc/network/interfaces`. Ver el nombre de la
tarjeta con `ip a` y editar `sudo nano /etc/netplan/50-cloud-init.yaml`
(ejemplo de srv-web; en srv-db `.31` y en srv-backup `.32`):

```yaml
network:
  version: 2
  ethernets:
    eno1:
      dhcp4: false
      addresses: [192.168.248.33/16]
      routes:
        - to: default
          via: 192.168.88.88
      nameservers:
        search: [iesthosicodina.cat]
        addresses: [192.168.88.88]
```

```bash
echo "network: {config: disabled}" | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
sudo chmod 600 /etc/netplan/*.yaml
sudo netplan apply      # el aviso "ovsdb-server.service is not running" es normal
```

No editar `/etc/resolv.conf`: lo gestiona systemd-resolved.

Comprobar:

```bash
ip route                        # default via 192.168.88.88
resolvectl query google.com
curl -I https://google.com      # el ping a Internet puede estar bloqueado; curl es la prueba buena
```

## 3. Acceso por clave SSH

Desde el PC de administración:

```bash
ssh-copy-id admin@192.168.248.33
ssh admin@192.168.248.33      # debe entrar sin pedir contraseña
```

## 4. Clonar el repositorio y preparar el sistema

Hacerlo **conectado por SSH** (en Ubuntu el servicio SSH arranca con la
primera conexión). Comprobar antes que el PC de administración sigue en
`192.168.116.x` (`ip -br a`), porque ufw solo permitirá SSH desde esa red.

```bash
git clone https://github.com/IzanZambrano/Projecte-ASIR.git
cd Projecte-ASIR
sudo ./infra/comun/sistema-base.sh srv-web    # o srv-db / srv-backup
```

El script configura nombre de máquina, actualizaciones automáticas, SSH sin
contraseña ni root, fail2ban, ufw con las reglas de esa máquina y Docker.

## 5. Comprobar

```bash
exit && ssh admin@192.168.248.33   # volver a entrar (grupo docker)
docker run --rm hello-world
sudo ufw status verbose
sudo fail2ban-client status sshd
```

_Añadir capturas en `docs/img/`._
