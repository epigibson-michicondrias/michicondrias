/**
 * useViewMode — Forma de ver una lista (cuadrícula, lista, tarjetas…) recordada por pantalla.
 *
 *   const [mode, setMode] = useViewMode('mascotas', ['grid', 'list', 'cards'] as const, 'grid');
 *   const columns = useGridColumns(); // 2 en teléfono, 3 en pantallas anchas
 */
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { readPref, savePref } from '@/src/lib/prefs';

export function useViewMode<T extends string>(screenKey: string, modes: readonly T[], fallback: T) {
    const storageKey = `view_mode_${screenKey}`;
    const [mode, setModeState] = useState<T>(() => {
        const saved = readPref(storageKey);
        return modes.includes(saved as T) ? (saved as T) : fallback;
    });

    const setMode = (next: T) => {
        setModeState(next);
        savePref(storageKey, next);
    };

    return [mode, setMode] as const;
}

/** Ancho a partir del cual la cuadrícula pasa de 2 a 3 columnas (tabletas, teléfonos en horizontal). */
const WIDE_SCREEN = 600;

export function useGridColumns(): 2 | 3 {
    const { width } = useWindowDimensions();
    return width >= WIDE_SCREEN ? 3 : 2;
}
