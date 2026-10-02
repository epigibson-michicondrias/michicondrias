"""URLs de retorno de Stripe Checkout (web y app móvil).

Stripe solo redirige a http(s). Para la app se apunta a /payments/return del propio backend, que abre el deep link
(`{APP_DEEP_LINK_SCHEME}://...`). Si no hay PUBLIC_API_URL configurada se conserva la URL web de siempre.
"""
import re
from urllib.parse import quote

from app.core.config import settings

KINDS = ("order", "donation", "subscription")
RESULTS = ("success", "cancel")
_SAFE_REF = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
_SAFE_SESSION = re.compile(r"^[A-Za-z0-9_{}-]{1,200}$")


def safe_ref(value: str | None) -> str | None:
    return value if value and _SAFE_REF.match(value) else None


def safe_session(value: str | None) -> str | None:
    return value if value and _SAFE_SESSION.match(value) else None


def web_url(kind: str, result: str, ref: str, session_id: str | None = None) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    sid = f"session_id={session_id}" if session_id else ""
    if kind == "order":
        if result == "success":
            return f"{base}/dashboard/tienda/pago-exitoso" + (f"?{sid}" if sid else "")
        return f"{base}/dashboard/tienda/pago-cancelado"
    if kind == "subscription":
        state = "success" if result == "success" else "cancelled"
        return f"{base}/dashboard/mascotas/{ref}?subscription={state}" + (f"&{sid}" if sid else "")
    state = "success" if result == "success" else "cancelled"
    return f"{base}/dashboard/donaciones?payment={state}&donation_id={ref}"


def deep_link(kind: str, result: str, ref: str) -> str:
    scheme = settings.APP_DEEP_LINK_SCHEME
    ref_q = quote(ref, safe="")
    if kind == "order":
        screen = "tienda/pago-exitoso" if result == "success" else "tienda/pago-cancelado"
        return f"{scheme}://{screen}?orderId={ref_q}"
    if kind == "subscription":
        state = "success" if result == "success" else "cancelled"
        return f"{scheme}://mascotas/{ref_q}?subscription={state}"
    return f"{scheme}://donaciones?result={result}&donationId={ref_q}"


def app_return_enabled() -> bool:
    return bool(settings.PUBLIC_API_URL and settings.APP_DEEP_LINK_SCHEME)


def checkout_urls(kind: str, ref: str, source: str | None) -> tuple[str, str]:
    """(success_url, cancel_url) para crear la sesión. `{CHECKOUT_SESSION_ID}` lo reemplaza Stripe."""
    session_tpl = "{CHECKOUT_SESSION_ID}"
    if source == "app" and app_return_enabled():
        base = settings.PUBLIC_API_URL.rstrip("/") + f"{settings.API_V1_STR}/payments/return"
        common = f"kind={kind}&ref={quote(ref, safe='')}"
        return (
            f"{base}?{common}&result=success&session_id={session_tpl}",
            f"{base}?{common}&result=cancel",
        )
    return web_url(kind, "success", ref, session_tpl), web_url(kind, "cancel", ref)
