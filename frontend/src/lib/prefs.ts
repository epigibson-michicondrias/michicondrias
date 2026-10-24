/** Preferencias pequeñas y síncronas (espejo de `mobile/src/lib/prefs.ts`). En la web: `localStorage`. */
export function readPref(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function savePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: la preferencia dura hasta recargar.
  }
}
