/**
 * useAppUpdate — buscar, descargar y aplicar actualizaciones OTA (expo-updates).
 * En web no hay OTA: `available` queda en false y `check` avisa.
 */
import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { showAlert } from '@/src/components/AppAlert';

export type UpdateCheckState = 'idle' | 'checking' | 'downloading' | 'done' | 'up-to-date' | 'error' | 'web';

export function useAppUpdate() {
    const [state, setState] = useState<UpdateCheckState>('idle');

    const checkAndApply = useCallback(async () => {
        if (Platform.OS === 'web') {
            setState('web');
            showAlert({
                type: 'info',
                title: 'Actualizaciones',
                message: 'Las actualizaciones automáticas solo están disponibles en la app instalada.',
            });
            return;
        }
        try {
            setState('checking');
            const check = await Updates.checkForUpdateAsync();
            if (!check.isAvailable) {
                setState('up-to-date');
                showAlert({ type: 'success', title: 'Todo al día', message: 'Ya tienes la última versión de la app.' });
                return;
            }
            setState('downloading');
            await Updates.fetchUpdateAsync();
            setState('done');
            showAlert({
                type: 'success',
                title: 'Actualización lista',
                message: 'Se aplicará ahora. La app se reiniciará en unos segundos.',
            });
            setTimeout(() => { Updates.reloadAsync().catch(() => {}); }, 1200);
        } catch {
            setState('error');
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: 'Revisa tu conexión e inténtalo de nuevo.' });
        }
    }, []);

    return { state, checkAndApply, isBusy: state === 'checking' || state === 'downloading' };
}
