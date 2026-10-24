/**
 * Acciones de contacto y compartir del directorio (equivalente web de `Linking` y `shareContent`).
 */

export function openExternalUrl(url: string) {
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    /* sin navegador asociado */
  }
}

export async function shareContent(title: string, text: string) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      /* el usuario canceló o no se pudo */
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
  } catch {
    /* sin portapapeles */
  }
}
