/**
 * FormSwitch — toggle/checkbox temático con etiqueta. Reemplaza los patrones inline de switch y checkbox.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInFormSection } from '@/src/components/forms/FormSection';
import { layout, radius, spacing, type, press } from '@/constants/design';

interface FormSwitchProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    /** Texto de descripción opcional. */
    description?: string;
    /** Variante visual: `checkbox` (por defecto) o `switch`. */
    variant?: 'switch' | 'checkbox';
}

export default function FormSwitch({
    label,
    value,
    onChange,
    description,
    variant = 'checkbox',
}: FormSwitchProps) {
    const { theme } = useTheme();
    const inSection = useInFormSection();
    const isSwitch = variant === 'switch';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                inSection && styles.inSection,
                {
                    backgroundColor: value ? theme.primaryLight : theme.inputBg,
                    borderColor: value ? theme.primary : theme.inputBorder,
                },
            ]}
            onPress={() => onChange(!value)}
            activeOpacity={press.normal}
            accessibilityRole={isSwitch ? 'switch' : 'checkbox'}
            accessibilityLabel={label}
            accessibilityState={{ checked: value }}
            accessibilityHint={description}
        >
            <View style={styles.content}>
                <Text style={[type.bodyStrong, { color: value ? theme.primary : theme.text }]}>
                    {label}
                </Text>
                {description ? (
                    <Text style={[type.caption, styles.description, { color: theme.textMuted }]}>
                        {description}
                    </Text>
                ) : null}
            </View>
            {isSwitch ? (
                <View style={[styles.track, { backgroundColor: value ? theme.primary : theme.inputBorder }]}>
                    <View style={[styles.thumb, { backgroundColor: theme.surface, transform: [{ translateX: value ? 18 : 2 }] }]} />
                </View>
            ) : (
                <View
                    style={[
                        styles.checkBox,
                        {
                            backgroundColor: value ? theme.primary : 'transparent',
                            borderColor: value ? theme.primary : theme.inputBorder,
                        },
                    ]}
                >
                    {value ? <Check size={layout.icon.sm} color={theme.onPrimary} strokeWidth={3} /> : null}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.md,
        minHeight: layout.minTouch,
    },
    inSection: { marginBottom: 0 },
    content: {
        flex: 1,
        marginRight: spacing.md,
    },
    description: {
        marginTop: spacing.xxs,
    },
    checkBox: {
        width: layout.icon.lg,
        height: layout.icon.lg,
        borderRadius: radius.xs,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    track: {
        width: 44,
        height: 26,
        borderRadius: radius.pill,
        justifyContent: 'center',
    },
    thumb: {
        width: 22,
        height: 22,
        borderRadius: radius.pill,
    },
});
