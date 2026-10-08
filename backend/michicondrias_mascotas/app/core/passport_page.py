"""F26 — Página pública y legible del pasaporte de una mascota (lo que abre el QR que comparte el dueño).

Recibe el mismo dict que devuelve `GET /pets/passport/view/{token}` en JSON y lo pinta como HTML autocontenido
(paleta Midnight & Gold de la app, sin recursos externos salvo la foto). Todo texto que viene de la base se escapa.
"""
from datetime import date, datetime, timezone
from html import escape
from typing import Any, Optional

SPECIES = {"perro": "Perro", "dog": "Perro", "gato": "Gato", "cat": "Gato"}
GENDERS = {"macho": "Macho", "male": "Macho", "hembra": "Hembra", "female": "Hembra"}
SIZES = {"pequeño": "Pequeño", "small": "Pequeño", "mediano": "Mediano", "medium": "Mediano",
         "grande": "Grande", "large": "Grande"}


def mask_policy_number(value: Optional[str]) -> Optional[str]:
    """Solo los últimos 4 caracteres: acredita la póliza sin exponer el número completo."""
    if not value:
        return None
    tail = str(value).strip()[-4:]
    return f"•••• {tail}"


def _parse(value: Any) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day)
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _day(value: Any) -> str:
    d = _parse(value)
    return d.strftime("%d/%m/%Y") if d else "—"


def _age(months: Any) -> Optional[str]:
    try:
        m = int(months)
    except (TypeError, ValueError):
        return None
    if m < 12:
        return f"{m} {'mes' if m == 1 else 'meses'}"
    years, rest = divmod(m, 12)
    text = f"{years} {'año' if years == 1 else 'años'}"
    return f"{text} y {rest} {'mes' if rest == 1 else 'meses'}" if rest else text


def _label(mapping: dict, value: Any) -> Optional[str]:
    if not value:
        return None
    return mapping.get(str(value).strip().lower(), str(value))


def _row(label: str, value: Optional[str]) -> str:
    if not value:
        return ""
    return f'<div class="row"><span>{escape(label)}</span><strong>{escape(value)}</strong></div>'


def _vaccine_item(v: dict, now: datetime) -> str:
    due = _parse(v.get("next_due_date"))
    if due:
        due_cmp = due if due.tzinfo else due.replace(tzinfo=timezone.utc)
        overdue = due_cmp < now
        status = (f'<span class="tag warn">Refuerzo vencido · {_day(due)}</span>' if overdue
                  else f'<span class="tag ok">Próximo refuerzo · {_day(due)}</span>')
    else:
        status = ""
    batch = f' · Lote {escape(str(v["batch_number"]))}' if v.get("batch_number") else ""
    return (f'<li><div class="vname">{escape(str(v.get("name") or "Vacuna"))}</div>'
            f'<div class="muted">Aplicada el {_day(v.get("date_administered"))}{batch}</div>{status}</li>')


def render_passport_page(data: dict) -> str:
    pet = data.get("pet") or {}
    vaccines = data.get("vaccines") or []
    insurance = data.get("insurance") or {}
    now = datetime.now(timezone.utc)

    name = escape(str(pet.get("name") or "Mascota"))
    species = _label(SPECIES, pet.get("species"))
    subtitle = " · ".join(escape(x) for x in [species, pet.get("breed")] if x)

    photo = pet.get("photo_url") or ""
    photo_html = (f'<img class="photo" src="{escape(photo)}" alt="Foto de {name}">'
                  if str(photo).startswith("https://") else '<div class="photo empty">🐾</div>')

    weight = pet.get("weight_kg")
    details = "".join([
        _row("Edad", _age(pet.get("age_months"))),
        _row("Sexo", _label(GENDERS, pet.get("gender"))),
        _row("Tamaño", _label(SIZES, pet.get("size"))),
        _row("Peso", f"{float(weight):g} kg" if weight else None),
        _row("Microchip", pet.get("microchip_number")),
    ])

    vaccines_html = (
        f'<ul class="list">{"".join(_vaccine_item(v, now) for v in vaccines)}</ul>' if vaccines
        else '<p class="muted">Sin vacunas registradas en Michicondrias.</p>'
    )

    if insurance:
        insurance_html = ('<div class="card"><h2>Seguro</h2>'
                          '<span class="tag ok">Póliza vigente</span>'
                          + _row("Póliza", insurance.get("policy_number"))
                          + _row("Vigencia", f'{_day(insurance.get("start_date"))} – {_day(insurance.get("end_date"))}')
                          + '</div>')
    else:
        insurance_html = ""

    description = (f'<p class="desc">{escape(str(pet["description"]))}</p>' if pet.get("description") else "")

    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Pasaporte de {name} · Michicondrias</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0b0e17;color:#f5f1e8;
padding:24px 16px 40px;line-height:1.45}}.wrap{{max-width:440px;margin:0 auto}}
.brand{{color:#e9c883;font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;text-align:center}}
.hero{{text-align:center;margin:16px 0 20px}}.photo{{width:112px;height:112px;border-radius:56px;object-fit:cover;
border:2px solid rgba(233,200,131,.5)}}.photo.empty{{display:inline-flex;align-items:center;justify-content:center;
font-size:44px;background:#131826}}h1{{margin:12px 0 2px;font-size:28px}}.sub{{color:#9aa3b5;font-size:15px}}
.card{{background:#131826;border:1px solid rgba(233,200,131,.14);border-radius:18px;padding:16px;margin-bottom:14px}}
h2{{margin:0 0 10px;font-size:15px;color:#e9c883}}.row{{display:flex;justify-content:space-between;gap:12px;
padding:8px 0;border-top:1px solid rgba(255,255,255,.05);font-size:14px}}.row:first-of-type{{border-top:0}}
.row span{{color:#9aa3b5}}.list{{list-style:none;margin:0;padding:0}}.list li{{padding:10px 0;
border-top:1px solid rgba(255,255,255,.05)}}.list li:first-child{{border-top:0;padding-top:0}}
.vname{{font-weight:700}}.muted{{color:#9aa3b5;font-size:13px}}.desc{{color:#9aa3b5;font-size:14px;margin:0 0 14px;
text-align:center}}.tag{{display:inline-block;margin-top:6px;font-size:12px;font-weight:700;padding:3px 10px;
border-radius:999px}}.ok{{background:rgba(62,207,154,.14);color:#3ecf9a}}.warn{{background:rgba(240,113,111,.14);
color:#f0716f}}.foot{{text-align:center;color:#9aa3b5;font-size:12px;margin-top:20px}}
</style></head><body><div class="wrap">
<div class="brand">Michicondrias · Pasaporte</div>
<div class="hero">{photo_html}<h1>{name}</h1><div class="sub">{subtitle}</div></div>
{description}
<div class="card"><h2>Datos</h2>{details or '<p class="muted">Sin datos adicionales.</p>'}</div>
<div class="card"><h2>Vacunas</h2>{vaccines_html}</div>
{insurance_html}
<p class="foot">Información compartida por su dueño. El enlace vence 24 horas después de generarse.</p>
</div></body></html>"""


def render_passport_error(message: str) -> str:
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Pasaporte no disponible · Michicondrias</title>
<style>body{{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0b0e17;color:#f5f1e8;min-height:100vh;
display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}}.c{{max-width:360px}}
h1{{font-size:22px}}p{{color:#9aa3b5;line-height:1.5}}.brand{{color:#e9c883;font-size:12px;font-weight:800;
letter-spacing:1.2px;text-transform:uppercase}}</style></head><body><div class="c">
<div class="brand">Michicondrias · Pasaporte</div><h1>Pasaporte no disponible</h1><p>{escape(message)}</p>
<p>Pídele a su dueño que genere un enlace nuevo desde la app.</p></div></body></html>"""
