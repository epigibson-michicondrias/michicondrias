import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'michi_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        // Load saved theme mode
        const loadTheme = async () => {
            try {
                const savedMode = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
                if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
                    setThemeModeState(savedMode);
                }
            } catch (e) {
                console.error('Failed to load theme mode', e);
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
        } catch (e) {
            console.error('Failed to save theme mode', e);
        }
    };

    const colorScheme = themeMode === 'system'
        ? ((deviceColorScheme === 'light' ? 'light' : 'dark') as 'light' | 'dark')
        : (themeMode as 'light' | 'dark');

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, colorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
