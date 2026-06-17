import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface FilterChipProps {
    label: string;
    active: boolean;
    onPress: () => void;
    color?: string;
}

export default function FilterChip({ label, active, onPress, color }: FilterChipProps) {
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
        >
            <Text
                style={[
                    styles.label,
                    { color: active ? '#fff' : theme.text },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
    },
});
