/**
 * Reporte clínico imprimible (web): abre una ventana con el resumen y la línea de tiempo filtrada y lanza el
 * diálogo de impresión, donde se elige «Guardar como PDF». Documento independiente en blanco y negro para papel.
 */
import type { HistorySummary } from "@/types/mascotas";
import type { TimelineEvent } from "@/hooks/carnet/clinicalTimeline";
import { KIND_LABEL } from "@/hooks/carnet/clinicalTimeline";
import { formatDate } from "@/utils/formatters";

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function printHistoryReport(petName: string, meta: string, summary: HistorySummary | undefined, events: TimelineEvent[]): boolean {
  const win = window.open("", "_blank", "noopener=no,width=900,height=1000");
  if (!win) return false;

  const rows = events
    .map(
      (e) => `<tr>
        <td class="d">${esc(formatDate(e.date))}</td>
        <td class="k">${esc(KIND_LABEL[e.kind].replace(/s$/, ""))}</td>
        <td><strong>${esc(e.title)}</strong>${e.subtitle ? `<div class="m">${esc(e.subtitle)}</div>` : ""}${e.details
          .map((d) => `<div class="m">${esc(d)}</div>`)
          .join("")}${e.flag ? `<div class="w">Atención</div>` : ""}</td>
      </tr>`,
    )
    .join("");

  const summaryHtml = summary
    ? `<section><h2>Resumen</h2><p>${esc(summary.summary)}</p>${
        summary.highlights.length ? `<ul>${summary.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""
      }<p class="m">${esc(summary.analysis_source)}</p></section>`
    : "";

  win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Historial clínico de ${esc(petName)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: black; margin: 32px; font-size: 13px; line-height: 1.45; }
  h1 { font-size: 22px; margin: 0; } h2 { font-size: 15px; margin: 24px 0 8px; }
  .meta, .m { color: dimgray; } .w { color: black; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; } td { padding: 8px 6px; border-top: 1px solid lightgray; vertical-align: top; }
  .d { white-space: nowrap; width: 90px; } .k { width: 90px; color: dimgray; }
  footer { margin-top: 24px; color: dimgray; font-size: 11px; }
</style></head><body>
<h1>Historial clínico de ${esc(petName)}</h1>
<p class="meta">${esc(meta)} · Generado el ${esc(formatDate(new Date().toISOString()))} en Michicondrias</p>
${summaryHtml}
<h2>Línea de tiempo (${events.length})</h2>
<table>${rows || `<tr><td>Sin registros.</td></tr>`}</table>
<footer>${esc(summary?.disclaimer ?? "Información del carnet de la mascota. No sustituye la valoración de un veterinario.")}</footer>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
