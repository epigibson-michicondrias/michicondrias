/**
 * useUiScale — Tamaño del contenido (Compacto / Normal / Grande). Al cambiarlo se guarda y se recarga la app, porque
 * los tokens de diseño se calculan al arrancar con la escala guardada (ver `src/lib/uiScale.ts`).
 */
import { useState } from 'react';
import { showAlert } from '@/src/components/AppAlert';
import { readUiScale, reloadApp, saveUiScale, type UiScale } from '@/src/lib/uiScale';

export function useUiScale() {
    // La escala vigente es la del arranque; la elegida se aplica tras recargar
    const [uiScale, setUiScaleState] = useState<UiScale>(() => readUiScale());

    const setUiScale = (next: UiScale) => {
        if (next === uiScale) return;
        setUiScaleState(next);
        saveUiScale(next);
        showAlert({
            type: 'info',
            title: 'Aplicando tamaño',
            message: 'La app se reiniciará un momento para ajustar el tamaño del contenido.',
        });
        setTimeout(reloadApp, 900);
    };

    return { uiScale, setUiScale };
}
