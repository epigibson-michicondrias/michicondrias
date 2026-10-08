import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, type } from '@/constants/design';

interface LoadingOverlayProps {
    message?: string;
}

/**
 * Indicador de espera para acciones en curso (subir, procesar un pago…). Para cargar el contenido de una pantalla
 * usa `Skeleton`/`SkeletonList` con la forma del contenido (CLAUDE.md §4), no este componente.
 */
export default function LoadingOverlay({ message }: LoadingOverlayProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message || 'Cargando'}>
            <ActivityIndicator size="large" color={theme.primary} />
            {message ? <Text style={[type.body, { color: theme.textMuted }]}>{message}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
    },
});
