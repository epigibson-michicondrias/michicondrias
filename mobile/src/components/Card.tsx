/**
 * Card — tarjeta estándar (superficie + borde + sombra suave). Si recibe onPress es tocable.
 */
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, shadow, spacing } from '@/constants/design';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    /** Quita el padding interno (para imágenes a sangre). */
    flush?: boolean;
    /** Sombra más marcada para tarjetas destacadas. */
    elevated?: boolean;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

export default function Card({ children, onPress, flush, elevated, style, accessibilityLabel }: CardProps) {
    const { theme } = useTheme();
    const base = [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        elevated ? shadow.raised : shadow.card,
        !flush && { padding: spacing.lg },
        style,
    ];
    if (onPress) {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                style={base}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </TouchableOpacity>
        );
    }
    return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
    card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
});
