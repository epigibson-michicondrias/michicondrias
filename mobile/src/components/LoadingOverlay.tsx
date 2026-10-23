import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/src/components/Skeleton';
import { layout, radius, spacing } from '@/constants/design';

interface LoadingOverlayProps {
    /** Solo para lectores de pantalla. */
    message?: string;
}

/**
 * Carga genérica de una pantalla: esqueleto de lista a todo el ancho (aunque el contenedor esté centrado).
 * Si la pantalla tiene una forma propia (detalle con foto, formulario…), mejor un `Skeleton` con esa forma.
 */
export default function LoadingOverlay({ message }: LoadingOverlayProps) {
    return (
        <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message || 'Cargando'}>
            <Skeleton height={56} borderRadius={radius.lg} />
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={84} borderRadius={radius.lg} />)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
});
