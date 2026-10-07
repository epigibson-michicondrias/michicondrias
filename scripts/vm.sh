#!/usr/bin/env bash
# vm.sh — operaciones de producción en la VM de Oracle, desde la máquina de desarrollo.
#
# Requiere el alias SSH `michicondrias-oracle` en ~/.ssh/config (la llave privada vive solo en ~/.ssh, nunca en el repo).
# Todos los comandos corren en la VM como el usuario del servicio, con las variables de /etc/michicondrias/*.env.
#
# Uso:
#   scripts/vm.sh status                  estado de los 17 servicios (systemd + respuesta HTTP local)
#   scripts/vm.sh current <svc>           revisión de alembic aplicada en producción (solo lectura)
#   scripts/vm.sh migrate <svc>           alembic upgrade head del servicio (¡producción!)
#   scripts/vm.sh logs <svc> [líneas]     últimas líneas del log (default 50)
#   scripts/vm.sh restart <svc>           reinicia el servicio y espera a que responda
#   scripts/vm.sh shell                   abre una sesión SSH interactiva
#
# <svc> es el nombre de deploy/services.conf (core, adopciones, carnet, mascotas, …).
set -euo pipefail

HOST="${MICHI_VM_HOST:-michicondrias-oracle}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
CONF="$REPO/deploy/services.conf"
SSH=(ssh -o ConnectTimeout=15 -o BatchMode=yes "$HOST")

die() { echo "Error: $*" >&2; exit 1; }

# Valida el servicio contra services.conf (evita rutas arbitrarias en comandos remotos)
svc_port() {
    local svc="${1:-}"
    [ -n "$svc" ] || die "falta el servicio. Opciones: $(awk '!/^#/ && NF {printf "%s ", $1}' "$CONF")"
    local port
    port="$(awk -v s="$svc" '!/^#/ && $1==s {print $2}' "$CONF")"
    [ -n "$port" ] || die "servicio desconocido '$svc'. Opciones: $(awk '!/^#/ && NF {printf "%s ", $1}' "$CONF")"
    echo "$port"
}

# Ejecuta un comando en la VM como el usuario michicondrias, con el entorno del servicio cargado.
# El comando no debe llevar comillas simples (va dentro de bash -c '…').
as_service() {
    local svc="$1"; shift
    "${SSH[@]}" "sudo -u michicondrias bash -c 'set -a; . /etc/michicondrias/common.env; [ -f /etc/michicondrias/$svc.env ] && . /etc/michicondrias/$svc.env; set +a; cd /opt/michicondrias/services/michicondrias_$svc && $*'" \
        2> >(grep -v "post-quantum\|store now, decrypt later\|pq.html" >&2)
}

cmd="${1:-}"; shift || true
case "$cmd" in
    status)
        "${SSH[@]}" 'while read -r svc port; do
                [ -z "$svc" ] || [ "${svc#\#}" != "$svc" ] && continue
                state="$(systemctl is-active "michicondrias@$svc" 2>/dev/null || true)"
                http="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$port/" 2>/dev/null || echo 000)"
                printf "%-17s %-8s http %s\n" "$svc" "$state" "$http"
            done < /opt/michicondrias/services.conf' 2> >(grep -v "post-quantum\|store now, decrypt later\|pq.html" >&2)
        ;;
    current)
        svc="${1:-}"; svc_port "$svc" >/dev/null
        as_service "$svc" "/opt/michicondrias/venvs/$svc/bin/alembic current 2>&1 | tail -1"
        ;;
    migrate)
        svc="${1:-}"; svc_port "$svc" >/dev/null
        echo "→ alembic upgrade head de '$svc' en PRODUCCIÓN"
        # Sin comillas simples dentro del comando: va anidado en bash -c '…' por SSH
        as_service "$svc" "/opt/michicondrias/venvs/$svc/bin/alembic upgrade head 2>&1 | tail -3; echo; echo Revision actual:; /opt/michicondrias/venvs/$svc/bin/alembic current 2>&1 | tail -1"
        ;;
    logs)
        svc="${1:-}"; svc_port "$svc" >/dev/null
        lines="${2:-50}"; [[ "$lines" =~ ^[0-9]+$ ]] || die "líneas debe ser un número"
        "${SSH[@]}" "sudo journalctl -u michicondrias@$svc --no-pager -n $lines" 2> >(grep -v "post-quantum\|store now, decrypt later\|pq.html" >&2)
        ;;
    restart)
        svc="${1:-}"; port="$(svc_port "$svc")"
        "${SSH[@]}" "sudo systemctl restart michicondrias@$svc && for i in \$(seq 1 20); do curl -fsS -o /dev/null http://127.0.0.1:$port/ && { echo 'OK $svc'; exit 0; }; sleep 2; done; echo 'FAIL $svc'; sudo journalctl -u michicondrias@$svc --no-pager -n 15; exit 1" \
            2> >(grep -v "post-quantum\|store now, decrypt later\|pq.html" >&2)
        ;;
    shell)
        exec ssh "$HOST"
        ;;
    *)
        sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
        [ -z "$cmd" ] || exit 1
        ;;
esac
