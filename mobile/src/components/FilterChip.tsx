import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius, type, layout } from '@/constants/design';

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
    /** Color del chip activo (por defecto `theme.primary`). */
    color?: string;
    /** Icono opcional (nodo) a la izquierda */
    icon?: React.ReactNode;
    /** Contador opcional */
    count?: number;
}

export default function FilterChip({ label, active, onPress, color, icon, count }: FilterChipProps) {
    const { theme } = useTheme();
    const accentColor = color || theme.primary;

    return (
        <TouchableOpacity
            style={[
                styles.chip,
                active
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={typeof count === 'number' ? `${label}, ${count}` : label}
            accessibilityState={{ selected: active }}
        >
            {icon}
            <Text style={[type.labelSentence, { color: active ? theme.onPrimary : theme.text }]}>
                {label}{typeof count === 'number' ? `  ${count}` : ''}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + spacing.xxs,
        minHeight: layout.minTouch,
    },
});
