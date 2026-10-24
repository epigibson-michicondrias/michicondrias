"use client";

/**
 * Tema claro/oscuro (espejo de `mobile/src/contexts/ThemeContext.tsx`, misma interfaz).
 * En la web el color lo pintan las variables de `app/tokens.css`: aquí solo se decide el modo y se marca `<html>`
 * con `data-theme` cuando el usuario fija claro u oscuro (con `system` manda `prefers-color-scheme`).
 * La preferencia y el esquema del sistema se leen con `useSyncExternalStore`: en el servidor valen `system`/`light`.
 */
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { readPref, savePref } from "@/lib/prefs";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorScheme: "light" | "dark";
}

const STORAGE_KEY = "theme_mode";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isMode = (v: unknown): v is ThemeMode => v === "light" || v === "dark" || v === "system";

// Preferencia guardada: pequeña tienda con oyentes para que todos los que la usan se enteren del cambio.
const modeListeners = new Set<() => void>();
const subscribeMode = (cb: () => void) => {
  modeListeners.add(cb);
  return () => modeListeners.delete(cb);
};
const readMode = (): ThemeMode => {
  const saved = readPref(STORAGE_KEY);
  return isMode(saved) ? saved : "system";
};

const DARK_QUERY = "(prefers-color-scheme: dark)";
const subscribeSystem = (cb: () => void) => {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};
const readSystem = (): "light" | "dark" => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSyncExternalStore(subscribeMode, readMode, () => "system" as ThemeMode);
  const system = useSyncExternalStore(subscribeSystem, readSystem, () => "light" as const);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    savePref(STORAGE_KEY, mode);
    modeListeners.forEach((cb) => cb());
  }, []);

  const colorScheme = themeMode === "system" ? system : themeMode;

  return <ThemeContext.Provider value={{ themeMode, setThemeMode, colorScheme }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error("useThemeContext must be used within a ThemeProvider");
  return context;
}
