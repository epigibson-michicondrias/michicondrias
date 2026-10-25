import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { families, radius, spacing, tint, type } from '@/constants/design';

interface BadgeProps {
    label: string;
    color?: string;
    icon?: React.ReactNode;
    /** `filled`: tinte suave · `outlined`: solo borde · `solid`: fondo pleno (sobre fotos). */
    variant?: 'filled' | 'outlined' | 'solid';
    size?: 'sm' | 'md';
    /** Para lectores de pantalla cuando el ícono agrega significado (p. ej. sí/no). */
    accessibilityLabel?: string;
}

export default function Badge({ label, color, icon, variant = 'filled', size = 'md', accessibilityLabel }: BadgeProps) {
    const { theme } = useTheme();
    const badgeColor = color || theme.primary;
    const isFilled = variant === 'filled';
    const isSolid = variant === 'solid';

    return (
        <View
            accessible={!!accessibilityLabel}
            accessibilityLabel={accessibilityLabel}
            style={[
                styles.badge,
                size === 'sm' && styles.badgeSm,
                isSolid
                    ? { backgroundColor: badgeColor }
                    : isFilled
                        ? { backgroundColor: badgeColor + tint.medium }
                        : { borderColor: badgeColor, borderWidth: 1 },
            ]}
        >
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[type.caption, styles.label, { color: isSolid ? theme.onPrimary : badgeColor }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs + spacing.xxs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
        gap: spacing.xs + spacing.xxs,
    },
    badgeSm: {
        paddingVertical: spacing.xxs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
    },
    icon: { marginLeft: -spacing.xxs },
    label: { fontFamily: families.bold },
});
