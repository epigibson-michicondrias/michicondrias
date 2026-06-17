import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface FormFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    rightElement?: React.ReactNode;
}

export default function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    multiline,
    numberOfLines,
    rightElement,
}: FormFieldProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isMultiline = multiline || (numberOfLines != null && numberOfLines > 1);
    const lines = numberOfLines || 1;

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        height: isMultiline ? undefined : 54,
                    },
                    isMultiline ? { minHeight: 54, height: undefined } : undefined,
                ]}
            >
                <TextInput
                    style={[
                        styles.input,
                        { color: theme.text },
                        isMultiline ? { height: 16 * lines + 28, textAlignVertical: 'top' as const, paddingTop: 14 } : undefined,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={secureTextEntry}
                    multiline={isMultiline}
                    numberOfLines={isMultiline ? lines : undefined}
                />
                {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        height: 54,
        padding: 0,
    },
    rightElement: {
        marginLeft: 8,
    },
});
