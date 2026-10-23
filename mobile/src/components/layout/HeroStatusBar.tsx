/**
 * HeroStatusBar — Barra del sistema clara mientras la pantalla con cabecera hero (oscura) tiene el foco.
 *
 * Se monta un `<StatusBar style="light" />` solo con la pantalla enfocada: la pila de `StatusBar` aplica siempre el
 * último montado y, al desmontarse, vuelve al de `app/_layout.tsx` (el del tema). Así no depende del orden de los
 * eventos de foco/desenfoque entre dos pantallas hero.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

export default function HeroStatusBar() {
    const isFocused = useIsFocused();
    return isFocused ? <StatusBar style="light" /> : null;
}
