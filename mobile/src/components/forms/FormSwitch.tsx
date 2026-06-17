/**
 * FormSwitch — Themed switch/toggle with label
 * Replaces inline switch and health checkbox patterns
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface FormSwitchProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    /** Optional description text */
    description?: string;
    /** Visual variant */
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

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: value ? theme.primaryLight : theme.inputBg,
                    borderColor: value ? theme.primary : theme.inputBorder,
                },
            ]}
            onPress={() => onChange(!value)}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Text style={[styles.label, { color: value ? theme.primary : theme.text }]}>
                    {label}
                </Text>
                {description ? (
                    <Text style={[styles.description, { color: theme.textMuted }]}>
                        {description}
                    </Text>
                ) : null}
            </View>
            <View
                style={[
                    styles.checkBox,
                    {
                        backgroundColor: value ? theme.primary : 'transparent',
                        borderColor: value ? theme.primary : theme.inputBorder,
                    },
                ]}
            >
                {value ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        marginBottom: 10,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
    },
    description: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
