import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'michi_theme_mode';
const isMode = (v: unknown): v is ThemeMode => v === 'light' || v === 'dark' || v === 'system';

/**
 * Preferencia de tema guardada en AsyncStorage (U1): funciona también en web, donde SecureStore no existe.
 * Las versiones anteriores la guardaban en SecureStore; si no hay valor nuevo se lee de ahí una vez (solo nativo).
 */
async function loadSavedMode(): Promise<ThemeMode | null> {
    try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMode(saved)) return saved;
        if (Platform.OS !== 'web') {
            const legacy = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
            if (isMode(legacy)) {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, legacy);
                return legacy;
            }
        }
    } catch {
        // Sin almacenamiento disponible: se queda en "system"
    }
    return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        loadSavedMode().then((mode) => {
            if (mode) setThemeModeState(mode);
        });
    }, []);

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
    }, []);

    const colorScheme: 'light' | 'dark' = themeMode === 'system'
        ? (deviceColorScheme === 'light' ? 'light' : 'dark')
        : themeMode;

    const value = useMemo(() => ({ themeMode, setThemeMode, colorScheme }), [themeMode, setThemeMode, colorScheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Uso interno: en pantallas y componentes usa `useTheme` de `@/src/hooks/useTheme`. */
export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
