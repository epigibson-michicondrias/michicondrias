#!/usr/bin/env bash
# Prepara una VM de Oracle Cloud (Oracle Linux 9 o Ubuntu 24.04; ARM o x86). Ejecutar como root:
#   sudo bash deploy/oracle/setup-vm.sh api.michicondrias.com "ssh-ed25519 AAAA... deploy-key"
# Idempotente: se puede volver a correr.
set -euo pipefail
DOMAIN="${1:?uso: setup-vm.sh <dominio-api> \"<llave publica ssh de deploy>\"}"
PUBKEY="${2:?falta la llave pública SSH para el usuario michicondrias}"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
BASE=/opt/michicondrias

PYBIN=python3
if command -v dnf >/dev/null; then
  # Oracle Linux / RHEL 9: el python3 del sistema es 3.9 y el código necesita >= 3.10
  dnf install -y rsync curl tar gcc libpq-devel firewalld policycoreutils
  if dnf install -y python3.12 python3.12-pip python3.12-devel; then PYBIN=python3.12
  else dnf install -y python3.11 python3.11-pip python3.11-devel && PYBIN=python3.11; fi

  if ! command -v caddy >/dev/null; then
    case "$(uname -m)" in aarch64) CARCH=arm64 ;; *) CARCH=amd64 ;; esac
    curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=$CARCH" -o /usr/bin/caddy
    chmod 755 /usr/bin/caddy
  fi
  id caddy >/dev/null 2>&1 || useradd --system --home-dir /var/lib/caddy --create-home --shell /usr/sbin/nologin caddy
  install -d -o caddy -g caddy /etc/caddy
  cat > /etc/systemd/system/caddy.service <<'UNIT'
[Unit]
Description=Caddy
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
UNIT
  systemctl daemon-reload
else
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y python3 python3-venv python3-pip rsync curl gpg debian-keyring debian-archive-keyring \
    apt-transport-https iptables-persistent build-essential libpq-dev
  if ! command -v caddy >/dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y && apt-get install -y caddy
  fi
fi

id michicondrias >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash michicondrias
usermod -aG systemd-journal michicondrias   # para leer logs en deploy-remote.sh sin sudo
install -d -o michicondrias -g michicondrias "$BASE" "$BASE/services" "$BASE/venvs"
install -d -m 750 -o root -g michicondrias /etc/michicondrias
[ -f /etc/michicondrias/common.env ] || install -m 640 -o root -g michicondrias "$REPO/deploy/oracle/common.env.example" /etc/michicondrias/common.env

echo "$PYBIN" > "$BASE/python-bin"
install -m 644 "$REPO/deploy/services.conf" "$BASE/services.conf"
install -m 755 "$REPO/deploy/oracle/run-service.sh" "$BASE/run-service.sh"
install -m 755 "$REPO/deploy/oracle/deploy-remote.sh" "$BASE/deploy-remote.sh"
install -m 755 "$REPO/deploy/oracle/gen-caddyfile.sh" "$BASE/gen-caddyfile.sh"
install -m 644 "$REPO/deploy/oracle/michicondrias@.service" /etc/systemd/system/michicondrias@.service
systemctl daemon-reload

# llave SSH usada por GitHub Actions
install -d -m 700 -o michicondrias -g michicondrias /home/michicondrias/.ssh
grep -qF "$PUBKEY" /home/michicondrias/.ssh/authorized_keys 2>/dev/null || echo "$PUBKEY" >> /home/michicondrias/.ssh/authorized_keys
chown michicondrias:michicondrias /home/michicondrias/.ssh/authorized_keys; chmod 600 /home/michicondrias/.ssh/authorized_keys
command -v restorecon >/dev/null && restorecon -R /home/michicondrias/.ssh || true

# sudo mínimo: solo gestionar sus servicios
cat > /etc/sudoers.d/michicondrias <<'SUDO'
michicondrias ALL=(root) NOPASSWD: /usr/bin/systemctl enable michicondrias@*, /usr/bin/systemctl restart michicondrias@*, /usr/bin/systemctl status michicondrias@*
SUDO
chmod 440 /etc/sudoers.d/michicondrias

# Caddy como reemplazo de API Gateway
"$BASE/gen-caddyfile.sh" "$DOMAIN" "$BASE/services.conf" > /etc/caddy/Caddyfile
systemctl enable caddy && systemctl reload caddy || systemctl restart caddy

# Firewall del SO (además de la Security List de OCI): abrir 80/443
if command -v firewall-cmd >/dev/null; then
  systemctl enable --now firewalld
  firewall-cmd --permanent --add-service=http --add-service=https
  firewall-cmd --reload
else
  for port in 80 443; do
    iptables -C INPUT -p tcp --dport $port -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport $port -j ACCEPT
  done
  netfilter-persistent save
fi
command -v restorecon >/dev/null && restorecon -R "$BASE" /etc/caddy || true

echo "Listo. Siguiente: editar /etc/michicondrias/common.env y lanzar el workflow 'Deploy Backend to Oracle VM'."
