"""Certificado conmemorativo de una mascota en PDF (generado al momento con reportlab)."""
import io
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

CREMATION_LABELS = {
    "individual": "Cremación individual",
    "collective": "Cremación colectiva",
    "no_cremation": "Sin cremación",
}


def build_certificate_pdf(
    *, death_id: str, pet_name: str, species: str | None, date_of_death: date,
    cremation_type: str | None, urn_model: str | None,
) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    c.setStrokeColor(colors.HexColor("#6d28d9"))
    c.setLineWidth(3)
    c.rect(1.5 * cm, 1.5 * cm, width - 3 * cm, height - 3 * cm)
    c.setLineWidth(0.8)
    c.rect(1.9 * cm, 1.9 * cm, width - 3.8 * cm, height - 3.8 * cm)

    c.setFillColor(colors.HexColor("#4c1d95"))
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 5 * cm, "Certificado Conmemorativo")
    c.setFont("Helvetica", 13)
    c.setFillColor(colors.HexColor("#444444"))
    c.drawCentredString(width / 2, height - 6.2 * cm, "Michicondrias recuerda con cariño a")

    c.setFont("Helvetica-Bold", 34)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 9 * cm, pet_name)
    if species:
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#444444"))
        c.drawCentredString(width / 2, height - 10.2 * cm, species)

    rows = [("Fecha de partida", date_of_death.strftime("%d/%m/%Y"))]
    if cremation_type:
        rows.append(("Servicio", CREMATION_LABELS.get(cremation_type, cremation_type)))
    if urn_model:
        rows.append(("Urna", urn_model))
    y = height - 13 * cm
    for label, value in rows:
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.HexColor("#4c1d95"))
        c.drawRightString(width / 2 - 0.3 * cm, y, label + ":")
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.black)
        c.drawString(width / 2 + 0.3 * cm, y, value)
        y -= 0.9 * cm

    c.setFont("Helvetica-Oblique", 11)
    c.setFillColor(colors.HexColor("#666666"))
    c.drawCentredString(width / 2, 5.2 * cm, "Gracias por los años de compañía y cariño.")
    c.setFont("Helvetica", 8)
    c.drawCentredString(width / 2, 3.2 * cm, f"Folio {death_id}")
    c.showPage()
    c.save()
    return buf.getvalue()
