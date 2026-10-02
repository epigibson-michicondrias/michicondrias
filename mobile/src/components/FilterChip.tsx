import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
    color?: string;
    /** Icono opcional (nodo) a la izquierda */
    icon?: React.ReactNode;
    /** Contador opcional */
    count?: number;
}

export default function FilterChip({ label, active, onPress, color, icon, count }: FilterChipProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const accentColor = color || theme.primary;

    return (
        <TouchableOpacity
            style={[
                styles.chip,
                active
                    ? { backgroundColor: accentColor }
                    : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
        >
            {icon}
            <Text
                style={[
                    styles.label,
                    { color: active ? '#fff' : theme.text },
                ]}
            >
                {label}{typeof count === 'number' ? `  ${count}` : ''}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 40,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
    },
});
