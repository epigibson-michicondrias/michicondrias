/**
 * FormSection — Groups form fields with an optional title
 */
import React from 'react';
import { spacing, radius, type } from '@/constants/design';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface FormSectionProps {
    title?: string;
    children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.section}>
            {title ? (
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            ) : null}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: spacing.xxl,
    },
    title: {
        ...type.title,
        marginBottom: spacing.lg,
    },
});
