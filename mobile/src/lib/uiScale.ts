/**
 * Escala de la interfaz elegida por el usuario (Perfil › Apariencia › Tamaño del contenido).
 *
 * Los tokens de `constants/design.ts` se calculan UNA vez al cargar la app multiplicados por este factor; por eso se
 * lee de forma síncrona (`src/lib/prefs.ts`) y, al cambiarla, la app se recarga.
 */
import { DevSettings, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { readPref, savePref } from '@/src/lib/prefs';

export type UiScale = 'compact' | 'normal' | 'large';

export const UI_SCALE_FACTORS: Record<UiScale, number> = {
    compact: 0.9,
    normal: 1,
    large: 1.12,
};

const STORAGE_KEY = 'ui_scale';

const isUiScale = (v: unknown): v is UiScale => typeof v === 'string' && v in UI_SCALE_FACTORS;

/** Escala guardada (síncrono). Si no hay o falla la lectura, `normal`. */
export function readUiScale(): UiScale {
    const v = readPref(STORAGE_KEY);
    return isUiScale(v) ? v : 'normal';
}

export function saveUiScale(scale: UiScale): void {
    savePref(STORAGE_KEY, scale);
}

/** Reinicia la app para que los tokens se recalculen con la escala nueva. */
export function reloadApp(): void {
    if (Platform.OS === 'web') {
        globalThis.location?.reload();
        return;
    }
    // En desarrollo (sin expo-updates activo) se recarga el bundle con DevSettings
    Updates.reloadAsync().catch(() => DevSettings.reload());
}
