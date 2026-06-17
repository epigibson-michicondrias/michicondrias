import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface LoadingOverlayProps {
    message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
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
