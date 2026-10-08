import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
    const { theme, colorScheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={18} color={theme.textMuted} strokeWidth={2} />
            <TextInput
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || 'Buscar...'}
                placeholderTextColor={theme.textMuted}
                returnKeyType="search"
                accessibilityLabel={placeholder || 'Buscar'}
                autoCorrect={false}
                clearButtonMode="while-editing"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        padding: 0,
    },
});
