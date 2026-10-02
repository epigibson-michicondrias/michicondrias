/**
 * StatusBadge — badge de estado unificado para solicitudes/citas/inscripciones.
 * Dos usos: por estado de solicitud (`status`, normaliza pending/accepted/in_progress/completed/cancelled)
 * o con color y etiqueta propios (`label` + `color`, p. ej. estados de grooming o entrenadores).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, spacing } from '@/constants/design';
import { getStatusColors, normalizeStatus, STATUS_LABELS } from '@/src/hooks/servicios-pro/requestStatus';

interface Props {
    /** Estado de solicitud; se normaliza y colorea con los tokens del tema. */
    status?: string | null;
    /** Etiqueta personalizada (sobrescribe la del estado). */
    label?: string;
    /** Color de texto/punto personalizado; el fondo será ese color con transparencia. */
    color?: string;
    /** Muestra un punto de color antes del texto. */
    dot?: boolean;
}

export default function StatusBadge({ status, label, color, dot }: Props) {
    const { theme } = useTheme();
    const normalized = normalizeStatus(status);
    const base = getStatusColors(normalized, theme);
    const fg = color ?? base.color;
    const bg = color ? color + '1F' : base.bg;
    const text = label ?? STATUS_LABELS[normalized];
    return (
        <View style={[styles.badge, { backgroundColor: bg }]} accessible accessibilityLabel={`Estado: ${text}`}>
            {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
            <Text style={[styles.text, { color: fg }]} numberOfLines={1}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, paddingHorizontal: spacing.md - 2, paddingVertical: spacing.xs + 1, borderRadius: radius.pill, alignSelf: 'flex-start' },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { fontSize: 11, fontWeight: '800' },
});
