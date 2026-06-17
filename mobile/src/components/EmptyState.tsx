import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.overlay }]}>
                {icon}
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {subtitle && (
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
            )}
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={[styles.action, { backgroundColor: theme.primary }]}
                    onPress={onAction}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    action: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 14,
    },
    actionText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
