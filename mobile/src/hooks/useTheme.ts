import { useTheme as useThemeContext } from '@/src/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export function useTheme() {
    const { colorScheme, themeMode, setThemeMode } = useThemeContext();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    return { colorScheme, themeMode, setThemeMode, theme, isDark };
}
