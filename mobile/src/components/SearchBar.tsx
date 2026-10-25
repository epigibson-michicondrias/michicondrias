import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius, type, layout, press } from '@/constants/design';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    /** Modo acceso: se ve igual pero solo abre otra pantalla de búsqueda (sin teclado aquí). */
    onPress?: () => void;
    /** Enfoca el campo al montar (pantallas de búsqueda). */
    autoFocus?: boolean;
}

export default function SearchBar({ value = '', onChangeText, placeholder, onPress, autoFocus }: SearchBarProps) {
    const { theme } = useTheme();

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={press.normal}
                accessibilityRole="search"
                accessibilityLabel={placeholder || 'Buscar'}
                style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
                <Search size={layout.icon.sm} color={theme.textMuted} strokeWidth={2} />
                {/* Text y no TextInput: un input de solo lectura se queda con el clic en web */}
                <Text style={[type.body, styles.input, { color: theme.textMuted }]} numberOfLines={1}>{placeholder || 'Buscar…'}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={layout.icon.sm} color={theme.textMuted} strokeWidth={2} />
            <TextInput
                style={[type.body, styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || 'Buscar…'}
                placeholderTextColor={theme.textMuted}
                returnKeyType="search"
                accessibilityLabel={placeholder || 'Buscar'}
                autoCorrect={false}
                autoFocus={autoFocus}
            />
            {value.length > 0 ? (
                <TouchableOpacity
                    onPress={() => onChangeText?.('')}
                    style={styles.clear}
                    accessibilityRole="button"
                    accessibilityLabel="Borrar búsqueda"
                >
                    <X size={layout.icon.sm} color={theme.textMuted} />
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
        gap: spacing.sm,
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
