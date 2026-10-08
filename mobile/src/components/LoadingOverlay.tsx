import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface LoadingOverlayProps {
    message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
    const { theme, colorScheme } = useTheme();

    return (
        <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message || 'Cargando'}>
            <ActivityIndicator size="large" color={theme.primary} />
            {message && (
                <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
    },
});
