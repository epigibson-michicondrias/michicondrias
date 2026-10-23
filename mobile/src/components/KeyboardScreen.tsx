import React from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface KeyboardScreenProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    horizontal?: boolean;
    /** Barra fija bajo el contenido (p. ej. el botón de pagar); sube junto con el teclado. */
    footer?: React.ReactNode;
}

export default function KeyboardScreen({
    children,
    style,
    contentContainerStyle,
    horizontal = false,
    footer,
}: KeyboardScreenProps) {
    return (
        <KeyboardAvoidingView
            style={[styles.container, style]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, contentContainerStyle]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                horizontal={horizontal}
                bounces={false}
            >
                {children}
            </ScrollView>
            {footer}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
    },
});
