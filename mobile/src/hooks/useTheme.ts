import { useThemeContext } from '@/src/contexts/ThemeContext';
import Colors from '@/constants/Colors';

/** Único acceso al tema: colores del modo activo (`theme`), si es oscuro y la preferencia del usuario. */
export function useTheme() {
    const { colorScheme, themeMode, setThemeMode } = useThemeContext();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    return { colorScheme, themeMode, setThemeMode, theme, isDark };
}
