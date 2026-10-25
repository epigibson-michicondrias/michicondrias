/**
 * Imprime solo un elemento de la página (p. ej. una receta) en una ventana propia, para que el diálogo de impresión /
 * «Guardar como PDF» no arrastre la barra lateral ni la navegación. Copia las reglas CSS ya cargadas y las clases del
 * `<html>`/`<body>` (fuente y variables del tema) y fuerza el tema claro, que es el de papel.
 * Devuelve false si el navegador bloqueó la ventana emergente.
 */
export function printElement(el: HTMLElement, title: string): boolean {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return false;

  const css = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
      } catch {
        return ""; // hoja de otro origen (p. ej. fuentes externas): se omite
      }
    })
    .join("\n");

  const html = document.documentElement;
  const htmlClass = html.className;
  const bodyClass = document.body.className;
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  win.document.write(`<!doctype html><html lang="es" class="${esc(htmlClass)}" data-theme="light"><head><meta charset="utf-8"><base href="${window.location.origin}/">
<title>${esc(title)}</title><style>${css}</style>
<style>body{margin:0;padding:24px;background:white}@page{margin:12mm}</style></head>
<body class="${esc(bodyClass)}">${el.outerHTML}</body></html>`);
  win.document.close();

  let printed = false;
  const go = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
  };
  win.onload = go;
  setTimeout(go, 800); // por si el evento load ya pasó
  return true;
}
