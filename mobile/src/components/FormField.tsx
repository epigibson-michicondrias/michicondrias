/**
 * FormField — campo de formulario estándar: etiqueta, input, ayuda y error inline.
 * Acepta cualquier prop de TextInput (keyboardType, maxLength, autoComplete, editable, returnKeyType…).
 *
 *   <FormField label="Nombre" value={name} onChangeText={setName} error={errors.name} />
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, spacing, type } from '@/constants/design';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    /** Mensaje de error del campo; pinta el borde en rojo. */
    error?: string | null;
    /** Texto de ayuda bajo el campo (se oculta si hay error). */
    hint?: string;
    rightElement?: React.ReactNode;
}

export default function FormField({
    label,
    error,
    hint,
    rightElement,
    multiline,
    numberOfLines,
    editable = true,
    ...inputProps
}: FormFieldProps) {
    const { theme } = useTheme();
    const isMultiline = multiline || (numberOfLines != null && numberOfLines > 1);
    const lines = numberOfLines || (isMultiline ? 3 : 1);

    return (
        <View style={styles.container}>
            <Text style={[type.bodyStrong, styles.label, { color: theme.text }]}>{label}</Text>
            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: editable ? theme.inputBg : theme.backgroundSecondary,
                        borderColor: error ? theme.error : theme.inputBorder,
                    },
                    isMultiline ? styles.multilineWrapper : { height: layout.inputHeight },
                ]}
            >
                <TextInput
                    {...inputProps}
                    editable={editable}
                    accessibilityLabel={inputProps.accessibilityLabel ?? label}
                    style={[
                        type.body,
                        styles.input,
                        { color: editable ? theme.text : theme.textMuted },
                        isMultiline && { minHeight: 20 * lines, textAlignVertical: 'top' as const },
                    ]}
                    placeholderTextColor={theme.textMuted}
                    multiline={isMultiline}
                    numberOfLines={isMultiline ? lines : undefined}
                />
                {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
            </View>
            {error ? (
                <Text style={[type.caption, styles.helper, { color: theme.error }]} accessibilityLiveRegion="polite">{error}</Text>
            ) : hint ? (
                <Text style={[type.caption, styles.helper, { color: theme.textMuted }]}>{hint}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
    },
    label: {
        marginLeft: spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.md,
        borderWidth: 1,
        paddingHorizontal: spacing.lg,
    },
    multilineWrapper: {
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
    },
    input: {
        flex: 1,
        padding: 0,
    },
    rightElement: {
        marginLeft: spacing.sm,
    },
    helper: {
        marginLeft: spacing.xs,
    },
});
