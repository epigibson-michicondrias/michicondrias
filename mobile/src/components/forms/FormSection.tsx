/**
 * FormSection — Groups form fields with an optional title
 */
import React, { createContext, useContext } from 'react';
import { spacing, type } from '@/constants/design';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';

/** Dentro de una sección el espacio entre campos lo pone la sección (`gap`), no cada campo. */
const InFormSection = createContext(false);
export const useInFormSection = () => useContext(InFormSection);

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
            <InFormSection.Provider value={true}>
                <View style={styles.body}>{children}</View>
            </InFormSection.Provider>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: spacing.xxl,
    },
    title: {
        ...type.title,
        marginBottom: spacing.md,
    },
    body: {
        gap: spacing.md,
    },
});
