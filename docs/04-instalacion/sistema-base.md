# 4.0 Sistema base (las tres máquinas)

Seguir esta guía en **cada** máquina antes de su guía específica.

## 1. Crear la máquina virtual

- Debian 12 (netinst), recursos según [03-red.md](../03-red.md).
- Adaptador de red: _indicar tipo (NAT + solo anfitrión, puente…)_.
- Durante la instalación: sin entorno gráfico, marcar solo «servidor SSH» y
  «utilidades estándar». Crear el usuario `admin`.

## 2. IP fija

Editar `/etc/network/interfaces` (ajustar el nombre de la interfaz y la IP):

```
auto enp0s8
iface enp0s8 inet static
    address 192.168.56.10/24
```

```bash
sudo systemctl restart networking
ip a
```

## 3. Acceso por clave SSH

Desde el equipo de administración:

```bash
ssh-copy-id admin@192.168.56.10
ssh admin@192.168.56.10      # debe entrar sin pedir contraseña
```

## 4. Clonar el repositorio y preparar el sistema

```bash
sudo apt install -y git
git clone https://github.com/IzanZambrano/Projecte-ASIR.git
cd Projecte-ASIR
sudo ./infra/comun/sistema-base.sh srv-web    # o srv-db / srv-backup
```

El script configura nombre de máquina, actualizaciones automáticas, SSH sin
contraseña ni root, fail2ban, ufw con las reglas de esa máquina y Docker.

## 5. Comprobar

```bash
exit && ssh admin@192.168.56.10   # volver a entrar (grupo docker)
docker run --rm hello-world
sudo ufw status verbose
sudo fail2ban-client status sshd
```

_Añadir capturas en `docs/img/`._
