/**
 * AuthField — campo de las pantallas de `(auth)`: etiqueta, input tipo pill con ícono a la izquierda,
 * ayuda y error inline. Es el mismo look de AuthShell; las 4 pantallas lo comparten en vez de copiar estilos.
 *
 *   <AuthField label="Correo electrónico" icon={Mail} value={email} onChangeText={setEmail} error={errors.email} />
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { families, layout, radius, spacing, type } from '@/constants/design';

interface AuthFieldProps extends Omit<TextInputProps, 'style'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    /** Ícono lucide a la izquierda. */
    icon: LucideIcon;
    /** Color del ícono; por defecto el acento que pase la pantalla. */
    iconColor?: string;
    /** Mensaje de error del campo; pinta el borde en rojo y el texto debajo. */
    error?: string | null;
    /** Texto de ayuda bajo el campo (se oculta si hay error). */
    hint?: string;
    rightElement?: React.ReactNode;
}

export default function AuthField({
    label,
    value,
    onChangeText,
    icon: Icon,
    iconColor,
    error,
    hint,
    rightElement,
    editable = true,
    ...inputProps
}: AuthFieldProps) {
    const { theme } = useTheme();
    const accent = iconColor ?? theme.primary;

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
            <View
                style={[
                    styles.inputRow,
                    {
                        backgroundColor: theme.background,
                        borderColor: error ? theme.error : theme.border,
                    },
                ]}
            >
                <Icon size={18} color={error ? theme.error : accent} />
                <TextInput
                    {...inputProps}
                    editable={editable}
                    value={value}
                    onChangeText={onChangeText}
                    accessibilityLabel={inputProps.accessibilityLabel ?? label}
                    style={[styles.input, { color: theme.text }]}
                    placeholderTextColor={theme.textMuted}
                />
                {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
            </View>
            {error ? (
                <Text style={[styles.helper, { color: theme.error }]} accessibilityLiveRegion="polite">
                    {error}
                </Text>
            ) : hint ? (
                <Text style={[styles.helper, { color: theme.textMuted }]}>{hint}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: type.caption.fontSize,
        fontFamily: families.semibold,
        marginLeft: spacing.xs,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        minHeight: layout.minTouch + 4,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: type.body.fontSize,
        paddingVertical: spacing.md,
    },
    rightElement: {
        marginLeft: spacing.sm,
    },
    helper: {
        fontSize: type.caption.fontSize,
        marginLeft: spacing.xs,
    },
});
