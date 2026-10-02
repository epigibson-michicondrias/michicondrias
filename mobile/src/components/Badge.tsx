import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface BadgeProps {
    label: string;
    color?: string;
    icon?: React.ReactNode;
    variant?: 'filled' | 'outlined';
    size?: 'sm' | 'md';
}

export default function Badge({ label, color, icon, variant = 'filled', size = 'md' }: BadgeProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const badgeColor = color || theme.primary;

    const isFilled = variant === 'filled';

    return (
        <View
            style={[
                styles.badge,
                size === 'sm' && styles.badgeSm,
                isFilled
                    ? { backgroundColor: badgeColor + '20' }
                    : { backgroundColor: 'transparent', borderColor: badgeColor, borderWidth: 1 },
            ]}
        >
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
                style={[
                    styles.label,
                    { color: badgeColor },
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        alignSelf: 'flex-start',
        gap: 6,
    },
    badgeSm: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    icon: {
        marginLeft: -2,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
    },
});
