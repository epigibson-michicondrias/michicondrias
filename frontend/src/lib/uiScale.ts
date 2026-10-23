/**
 * Escala de la interfaz (espejo de `mobile/src/lib/uiScale.ts`). En la web se guarda en `localStorage`
 * y, como en la app, los tokens se calculan una vez al cargar: al cambiarla se recarga la página.
 */
export type UiScale = "compact" | "normal" | "large";

export const UI_SCALE_FACTORS: Record<UiScale, number> = {
  compact: 0.9,
  normal: 1,
  large: 1.12,
};

const STORAGE_KEY = "ui_scale";

const isUiScale = (v: unknown): v is UiScale => typeof v === "string" && v in UI_SCALE_FACTORS;

/** Escala guardada. En el servidor, sin `localStorage` o si falla la lectura: `normal`. */
export function readUiScale(): UiScale {
  try {
    const v = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    return isUiScale(v) ? v : "normal";
  } catch {
    return "normal";
  }
}

export function saveUiScale(scale: UiScale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, scale);
  } catch {
    // Sin almacenamiento disponible: la escala vuelve a `normal` en la siguiente carga.
  }
  window.location.reload();
}
