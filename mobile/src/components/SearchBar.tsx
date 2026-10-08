import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius, type, layout } from '@/constants/design';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={layout.icon.sm + 2} color={theme.textMuted} strokeWidth={2} />
            <TextInput
                style={[type.body, styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || 'Buscar…'}
                placeholderTextColor={theme.textMuted}
                returnKeyType="search"
                accessibilityLabel={placeholder || 'Buscar'}
                autoCorrect={false}
            />
            {value.length > 0 ? (
                <TouchableOpacity
                    onPress={() => onChangeText('')}
                    style={styles.clear}
                    accessibilityRole="button"
                    accessibilityLabel="Borrar búsqueda"
                >
                    <X size={layout.icon.sm + 2} color={theme.textMuted} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: layout.inputHeight - 2,
        borderRadius: radius.lg,
        borderWidth: 1,
        paddingLeft: spacing.lg,
        gap: spacing.sm + 2,
    },
    input: {
        flex: 1,
        padding: 0,
        paddingVertical: spacing.md,
    },
    clear: {
        width: layout.minTouch,
        height: layout.minTouch,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
