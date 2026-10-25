/**
 * FormSelect — selector de opciones temático (especie, género, tamaño, etc.).
 * Reemplaza los patrones repetidos de choiceBtn/genderBtn en las pantallas de formulario.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInFormSection } from '@/src/components/forms/FormSection';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, spacing, radius, type, press } from '@/constants/design';

interface SelectOption {
    label: string;
    value: string;
    /** Icono de lucide (no emoji). */
    icon?: IconComponent;
}

interface FormSelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    /** Si es true, las opciones scrollean horizontalmente. */
    horizontal?: boolean;
}

export default function FormSelect({ label, options, value, onChange, horizontal }: FormSelectProps) {
    const { theme } = useTheme();
    const inSection = useInFormSection();

    const renderOptions = () => (
        <>
            {options.map((option) => {
                const isActive = value === option.value;
                const Icon = option.icon;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.option,
                            {
                                backgroundColor: isActive ? theme.primaryLight : theme.inputBg,
                                borderColor: isActive ? theme.primary : theme.inputBorder,
                            },
                        ]}
                        onPress={() => onChange(option.value)}
                        activeOpacity={press.subtle}
                        accessibilityRole="button"
                        accessibilityLabel={option.label}
                        accessibilityState={{ selected: isActive }}
                    >
                        {Icon ? (
                            <Icon size={layout.icon.md} color={isActive ? theme.primary : theme.textMuted} />
                        ) : null}
                        <Text
                            style={[
                                type.bodyStrong,
                                { color: isActive ? theme.primary : theme.textMuted },
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </>
    );

    return (
        <View style={[styles.container, inSection && styles.inSection]}>
            <Text style={[type.labelSentence, styles.label, { color: theme.textMuted }]}>{label}</Text>
            {horizontal ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollRow}
                >
                    {renderOptions()}
                </ScrollView>
            ) : (
                <View style={styles.row}>{renderOptions()}</View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    inSection: { marginBottom: 0 },
    label: {
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    scrollRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
});
