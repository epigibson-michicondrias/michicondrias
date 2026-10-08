import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius, type, tint } from '@/constants/design';

interface BadgeProps {
    label: string;
    color?: string;
    icon?: React.ReactNode;
    variant?: 'filled' | 'outlined';
    size?: 'sm' | 'md';
}

export default function Badge({ label, color, icon, variant = 'filled', size = 'md' }: BadgeProps) {
    const { theme } = useTheme();
    const badgeColor = color || theme.primary;
    const isFilled = variant === 'filled';

    return (
        <View
            style={[
                styles.badge,
                size === 'sm' && styles.badgeSm,
                isFilled
                    ? { backgroundColor: badgeColor + tint.medium }
                    : { borderColor: badgeColor, borderWidth: 1 },
            ]}
        >
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[type.caption, styles.label, { color: badgeColor }]}>{label}</Text>
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
        borderRadius: radius.xs,
    },
    icon: { marginLeft: -spacing.xxs },
    label: { fontWeight: '700' },
});
