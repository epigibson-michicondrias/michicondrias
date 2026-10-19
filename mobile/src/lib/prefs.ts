/**
 * Preferencias locales del usuario (escala, forma de ver listas, …). Lectura y escritura síncronas:
 * SecureStore.getItem/setItem en nativo y localStorage en web, para poder usarlas al arrancar sin parpadeos.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Valor guardado o `null` si no hay o falla la lectura. */
export function readPref(key: string): string | null {
    try {
        return Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItem(key);
    } catch {
        return null;
    }
}

export function savePref(key: string, value: string): void {
    try {
        if (Platform.OS === 'web') globalThis.localStorage?.setItem(key, value);
        else SecureStore.setItem(key, value);
    } catch {
        // Sin almacenamiento disponible: se usa el valor por defecto en el próximo arranque
    }
}
