/**
 * FormSelect — Themed toggle selector for options like species, gender, size
 * Replaces repeated choiceBtn/genderBtn patterns across form screens
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface SelectOption {
    label: string;
    value: string;
    icon?: string; // Emoji or text icon
}

interface FormSelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    /** If true, options scroll horizontally */
    horizontal?: boolean;
}

export default function FormSelect({ label, options, value, onChange, horizontal }: FormSelectProps) {
    const { theme } = useTheme();

    const renderOptions = () => (
        <>
            {options.map((option) => {
                const isActive = value === option.value;
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
                        activeOpacity={0.7}
                    >
                        {option.icon ? (
                            <Text style={styles.optionIcon}>{option.icon}</Text>
                        ) : null}
                        <Text
                            style={[
                                styles.optionLabel,
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
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
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
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    scrollRow: {
        flexDirection: 'row',
        gap: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 8,
    },
    optionIcon: {
        fontSize: 18,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
});
