# 4.0 Sistema base (las dos máquinas)

Seguir esta guía en **cada** máquina antes de su guía específica.
Las máquinas son equipos físicos con **Ubuntu Server LTS** (22.04 o 26.04) y
se administran por SSH desde un PC con Manjaro. Datos de red en
[03-red.md](../03-red.md).

| Máquina | Hostname | IP |
|---------|----------|----|
| Servidor 1 | `srv-app` | 192.168.248.33 (DHCP) |
| Servidor 2 | `srv-backup` | _pendiente_ (DHCP) |

## 0. Preparar el PC de administración (Manjaro)

```bash
sudo pacman -S --needed openssh git nmap openbsd-netcat
ssh-keygen -t ed25519        # solo si no hay clave (Enter a todo)
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
3. Red: dejar **DHCP** (se revisa en el paso 2).
4. Proxy vacío y mirror por defecto.
5. Disco: *Use an entire disk*, **desmarcar LVM** (así se usa todo el disco).
6. Perfil: nombre del servidor `srv-app` o `srv-backup` y un usuario propio
   (el script funciona con cualquier nombre de usuario).
7. Ubuntu Pro: *Skip*.
8. Marcar **Install OpenSSH server**.
9. *Featured snaps*: **no marcar nada** (sobre todo no `docker`; el script
   instala el Docker oficial y se niega a continuar si encuentra el snap).
10. Reiniciar y retirar el USB.

## 2. Red por DHCP con netplan

Ubuntu usa netplan. Ver el nombre de la tarjeta con `ip -br a` y el archivo
con `ls /etc/netplan/` (en 22.04 suele ser `00-installer-config.yaml`; en
26.04, `50-cloud-init.yaml`). Si hay varios, dejar solo uno:

```yaml
network:
  version: 2
  ethernets:
    eno1:
      dhcp4: true
      dhcp-identifier: mac    # el DHCP identifica el equipo por su MAC (necesario para la reserva)
```

```bash
sudo chmod 600 /etc/netplan/*.yaml
sudo netplan apply      # el aviso "ovsdb-server.service is not running" es normal
ip -br a                # IP asignada
ip link                 # MAC (link/ether), para pedir la reserva DHCP
ip route                # default via 192.168.88.88
curl -I https://google.com      # el ping a Internet puede estar bloqueado; curl es la prueba buena
```

No editar `/etc/resolv.conf`: lo gestiona systemd-resolved.

## 3. Hora

Si el reloj va mal, `apt update` falla con *«Release file ... is not valid yet»*.

```bash
timedatectl             # debe decir "System clock synchronized: yes"
sudo timedatectl set-ntp true
```

Si no se sincroniza, la red del instituto puede bloquear los servidores de hora
externos; usar el router:

- **Ubuntu 22.04** (systemd-timesyncd): poner `NTP=192.168.88.88` en
  `/etc/systemd/timesyncd.conf` y `sudo systemctl restart systemd-timesyncd`.
- **Ubuntu 26.04** (chrony):
  `echo "server 192.168.88.88 iburst" | sudo tee /etc/chrony/sources.d/instituto.sources`
  y `sudo systemctl restart chrony`.

## 4. Acceso por clave SSH

Desde el PC de administración:

```bash
ssh-copy-id USUARIO@IP_DEL_SERVIDOR
ssh USUARIO@IP_DEL_SERVIDOR      # debe entrar sin pedir contraseña
```

## 5. Clonar el repositorio y preparar el sistema

Hacerlo **conectado por SSH** desde el PC de administración. ufw solo
permitirá SSH desde la red `192.168.0.0/16`.

```bash
git clone https://github.com/IzanZambrano/Projecte-ASIR.git
cd Projecte-ASIR
sudo ./infra/comun/sistema-base.sh srv-app    # o srv-backup
```

El script configura nombre de máquina, zona horaria, actualizaciones
automáticas, SSH sin contraseña ni root, fail2ban, ufw con las reglas de esa
máquina y Docker. Se puede volver a ejecutar sin problema (p. ej. si cambia
una IP).

> En Ubuntu 26.04, si la instalación de Docker falla:
> `sudo apt install -y docker.io docker-compose-v2` y volver a lanzar el script.

## 6. Comprobar

```bash
exit && ssh USUARIO@IP_DEL_SERVIDOR   # volver a entrar (grupo docker)
docker run --rm hello-world
sudo ufw status verbose
sudo fail2ban-client status sshd
```

_Añadir capturas en `docs/img/`._
