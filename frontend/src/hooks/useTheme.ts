import { useThemeContext } from "@/contexts/ThemeContext";
import { getPalette } from "@/constants/palettes";

/**
 * Único acceso al tema (espejo de `mobile/src/hooks/useTheme.ts`): colores del modo activo (`theme`), si es oscuro y
 * la preferencia. En la web, para estilos usa las variables CSS (`var(--color-*)`); `theme` sirve para lógica o
 * para pasar un color como dato (p. ej. el `color` de un `Badge`).
 */
export function useTheme() {
  const { colorScheme, themeMode, setThemeMode } = useThemeContext();
  const theme = getPalette()[colorScheme];
  const isDark = colorScheme === "dark";
  return { colorScheme, themeMode, setThemeMode, theme, isDark };
}
