import { useCallback } from 'react';
import { setStatusBarStyle } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useThemeContext } from '@/src/contexts/ThemeContext';
import Colors from '@/constants/Colors';

/** Único acceso al tema: colores del modo activo (`theme`), si es oscuro y la preferencia del usuario. */
export function useTheme() {
    const { colorScheme, themeMode, setThemeMode } = useThemeContext();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    return { colorScheme, themeMode, setThemeMode, theme, isDark };
}

/**
 * Barra del sistema clara mientras la pantalla con hero azul medianoche está enfocada; al salir vuelve a la del tema.
 * Usar en pantallas cuya cabecera es `theme.heroGradient` (Inicio, Explorar, Tienda…).
 */
export function useHeroStatusBar() {
    const { theme } = useTheme();
    useFocusEffect(
        useCallback(() => {
            setStatusBarStyle('light');
            return () => setStatusBarStyle(theme.statusBar);
        }, [theme.statusBar]),
    );
}
