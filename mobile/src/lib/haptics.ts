/**
 * haptics — Micro-feedback nativo para mutaciones (guardar, borrar, toggle, añadir al carrito…).
 * En web es no-op: la API existe pero no vibra, y además se corta antes para evitar warnings.
 *
 * Uso (solo en mutaciones, nunca en navegación):
 *   hapticSuccess();   // éxito al guardar / crear / añadir
 *   hapticWarning();   // acción destructiva confirmada
 *   hapticToggle();    // activar/desactivar un interruptor
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';

/** Impacto medio: confirmación de una acción positiva (guardar, añadir al carrito). */
export function hapticSuccess() {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Notificación de advertencia: acción destructiva ya confirmada (borrar, desactivar). */
export function hapticWarning() {
    if (!enabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Impacto ligero: cambio de estado reversible (toggle, marcar como leída). */
export function hapticToggle() {
    if (!enabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
